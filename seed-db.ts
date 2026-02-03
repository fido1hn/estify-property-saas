
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Database } from './types/database.types';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('Error: Required environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_SERVICE_ROLE_KEY) must be set in .env file');
  process.exit(1);
}

// Create admin client for auth and data operations (bypasses RLS)
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Alias for clarity if needed, but we'll just use supabase everywhere
const adminSupabase = supabase;

// Configuration
const CONFIG = {
  NUM_ORGS: 1,
  NUM_PROPERTIES: 5,
  NUM_UNITS_PER_PROPERTY: 8,
  NUM_ADMINS: 1,
  NUM_OWNERS: 1,
  NUM_MANAGERS: 1, // Staff with manager role
  NUM_MAINTENANCE_STAFF: 3,
  NUM_TENANTS: 20,
  NUM_REQUESTS: 15,
  NUM_INVOICES: 20,
  NUM_MESSAGES: 30
};

type UserRole = Database['public']['Enums']['user_role'];
type StaffRole = Database['public']['Enums']['staff_role'];

interface SeedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  staffRole?: StaffRole; // Only for staff
}

async function deleteAllData() {
  console.log('🗑️  Deleting all existing data...');
  
  try {
    // Delete in reverse dependency order
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('maintenance_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('maintenance_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('staff').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tenants').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_roles').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete auth users
    const { data: users, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (!listError && users) {
      for (const user of users.users) {
        // Only delete seed users to avoid wiping everything if running against a mixed env
        if (user.email?.startsWith('seed_')) {
             await adminSupabase.auth.admin.deleteUser(user.id);
        }
      }
      console.log(`✅ Cleaned up old seed auth users`);
    }
    
    console.log('✅ All data deleted successfully');
  } catch (error) {
    console.error('Error deleting data:', error);
    // Don't throw, just continue. Tables might not exist or be empty.
  }
}

async function createOrganization() {
    console.log('🏢 Creating Organization...');
    const { data, error } = await supabase.from('organizations').insert({
        name: faker.company.name() + " Properties",
    }).select().single();

    if (error) throw error;
    console.log(`✅ Created Organization: ${data.name}`);
    return data;
}

async function createAuthUser(role: UserRole, orgId: string, staffRole?: StaffRole): Promise<SeedUser> {
    const email = `seed_${role}_${Date.now()}_${faker.number.int(1000)}@example.com`;
    const password = 'password123';
    const fullName = faker.person.fullName();

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: role }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No user returned");

    return {
        id: authData.user.id,
        email,
        fullName,
        role,
        staffRole
    };
}

async function seedProfilesAndRoles(users: SeedUser[], orgId: string) {
    console.log(`👥 Seeding ${users.length} profiles and roles...`);
    
    // Create Profiles
    const profiles = users.map(u => ({
        id: u.id,
        organization_id: orgId,
        email: u.email,
        full_name: u.fullName,
        avatar_url: faker.image.avatar(),
    }));

    const { error: profileError } = await supabase.from('profiles').insert(profiles);
    if (profileError) {
        console.error("Profile Error", profileError);
        throw profileError;
    }

    // Create User Roles
    const userRoles = users.map(u => ({
        user_id: u.id,
        user_role: u.role
    }));
    
    const { error: roleError } = await supabase.from('user_roles').insert(userRoles);
    if (roleError) throw roleError;

    // Create Staff Entries
    const staffUsers = users.filter(u => u.role === 'staff');
    if (staffUsers.length > 0) {
        const staffEntries = staffUsers.map(u => ({
            user_id: u.id,
            role: u.staffRole || 'manager',
            status: 'active' as const,
            phone_number: faker.phone.number(),
        }));
        const { error: staffError } = await supabase.from('staff').insert(staffEntries);
        if (staffError) throw staffError;
    }

    console.log(`✅ Created profiles and roles`);
}

async function seedProperties(orgId: string) {
    console.log(`🏠 Creating ${CONFIG.NUM_PROPERTIES} properties...`);
    const properties = [];

    for(let i=0; i<CONFIG.NUM_PROPERTIES; i++) {
        properties.push({
            organization_id: orgId,
            name: `${faker.location.streetAddress()} Apartments`,
            address: faker.location.streetAddress({ useFullAddress: true }),
            type: faker.helpers.arrayElement(['residential', 'commercial'] as const),
            total_units: CONFIG.NUM_UNITS_PER_PROPERTY,
            image_url: faker.image.urlLoremFlickr({ category: 'apartment,building' })
        });
    }

    const { data, error } = await supabase.from('properties').insert(properties).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} properties`);
    return data;
}

async function seedUnits(properties: any[]) {
    console.log(`🚪 Creating units...`);
    const units = [];
    
    for (const prop of properties) {
        for(let i=1; i<=prop.total_units; i++) {
            units.push({
                property_id: prop.id,
                unit_number: i * 100 + faker.number.int({ min: 1, max: 20 })
            });
        }
    }

    const { data, error } = await supabase.from('units').insert(units).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} units`);
    return data;
}

async function seedTenants(tenantUsers: SeedUser[], units: any[]) {
    console.log(`🤝 Assigning tenants to units...`);
    const tenants = [];
    const availableUnits = [...units]; // copy

    for (const user of tenantUsers) {
        if (availableUnits.length === 0) break;
        const unitIndex = faker.number.int({ min: 0, max: availableUnits.length - 1 });
        const unit = availableUnits.splice(unitIndex, 1)[0];

        tenants.push({
            user_id: user.id,
            unit_id: unit.id,
            status: faker.helpers.arrayElement(['active', 'pending'] as const),
            lease_start: faker.date.past().toISOString(),
            lease_end: faker.date.future().toISOString()
        });
    }

    const { data, error } = await supabase.from('tenants').insert(tenants).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} tenants`);
    return data;
}

async function seedMaintenance(orgId: string, properties: any[], units: any[], tenantUsers: SeedUser[], staffUsers: SeedUser[]) {
    console.log(`🛠️ Creating maintenance requests...`);
    const requests = [];
    
    for(let i=0; i<CONFIG.NUM_REQUESTS; i++) {
        const prop = faker.helpers.arrayElement(properties);
        // Find a unit for this property
        const propUnits = units.filter(u => u.property_id === prop.id);
        const unit = faker.helpers.arrayElement(propUnits);
        const creator = faker.helpers.arrayElement(tenantUsers);
        const assignee = faker.helpers.arrayElement(staffUsers);

        if (!unit) continue;

        requests.push({
            organization_id: orgId,
            property_id: prop.id,
            unit_id: unit.id,
            created_by: creator.id,
            assigned_staff_id: assignee.id,
            title: faker.helpers.arrayElement(['Leaky Faucet', 'Broken AC', 'Power Outage', 'Internet Issues', 'Heater Broken']),
            description: faker.lorem.sentence(),
            status: faker.helpers.arrayElement(['open', 'in_progress', 'resolved', 'closed'] as const),
            priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent'] as const)
        });
    }

    const { data, error } = await supabase.from('maintenance_requests').insert(requests).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} maintenance requests`);
}

async function seedInvoices(orgId: string, tenants: any[], properties: any[], units: any[]) {
    console.log(`💰 Creating invoices...`);
    const invoices = [];

    for(let i=0; i<CONFIG.NUM_INVOICES; i++) {
        const tenant = faker.helpers.arrayElement(tenants);
        // We need property_id for this tenant's unit
        const unit = units.find(u => u.id === tenant.unit_id);
        if(!unit) continue;

        invoices.push({
            organization_id: orgId,
            tenant_id: tenant.user_id, // This is actually user_id in schema? No, tenants table has ID? Check schema.
            // Wait, database.types.ts says: invoices -> tenant_id references profiles(id).
            // tenants table: user_id references profiles(id).
            // So tenant_id in invoices should be the profile id (which is user_id).
            property_id: unit.property_id,
            unit_id: unit.id,
            amount_kobo: faker.number.int({ min: 100000, max: 500000 }), // 1000.00 to 5000.00
            status: faker.helpers.arrayElement(['draft', 'issued', 'paid', 'overdue'] as const),
            due_date: faker.date.future().toISOString()
        });
    }

     const { data, error } = await supabase.from('invoices').insert(invoices).select();
     if (error) {
         console.error("Invoice Error", error);
         throw error;
     } 
     console.log(`✅ Created ${data.length} invoices`);
}


// Main Execution
async function seed() {
    console.log('🌱 Starting Seed...');
    await deleteAllData();

    // 1. Create Organization
    const org = await createOrganization();
    
    // 2. Prepare Users
    const users: SeedUser[] = [];
    
    // Admin
    for(let i=0; i<CONFIG.NUM_ADMINS; i++) users.push(await createAuthUser('admin', org.id));
    // Owner
    for(let i=0; i<CONFIG.NUM_OWNERS; i++) users.push(await createAuthUser('owner', org.id));
    // Staff (Manager)
    for(let i=0; i<CONFIG.NUM_MANAGERS; i++) users.push(await createAuthUser('staff', org.id, 'manager'));
    // Staff (Maintenance)
    for(let i=0; i<CONFIG.NUM_MAINTENANCE_STAFF; i++) users.push(await createAuthUser('staff', org.id, faker.helpers.arrayElement(['plumbing', 'electrical', 'security'])));
    // Tenants
    for(let i=0; i<CONFIG.NUM_TENANTS; i++) users.push(await createAuthUser('tenant', org.id));

    // 3. Create Profiles and Roles
    await seedProfilesAndRoles(users, org.id);

    // 4. Create Properties
    const properties = await seedProperties(org.id);

    // 5. Create Units
    const units = await seedUnits(properties);

    // 6. Assign Tenants (Create Tenant Entries)
    const tenantUsers = users.filter(u => u.role === 'tenant');
    const tenants = await seedTenants(tenantUsers, units);

    // 7. Maintenance Requests
    const staffUsers = users.filter(u => u.role === 'staff');
    await seedMaintenance(org.id, properties, units, tenantUsers, staffUsers);

    // 8. Invoices
    await seedInvoices(org.id, tenants, properties, units);
    
    // Output login info
    console.log('\n✨ Seed Complete! Here are some test accounts you can use:');
    console.log('---------------------------------------------------------');
    console.log(`🏢 Owner:    ${users.find(u => u.role === 'owner')?.email} / password123`);
    console.log(`👨‍💼 Manager:  ${users.find(u => u.role === 'staff' && u.staffRole === 'manager')?.email} / password123`);
    console.log(`🔧 Staff:    ${users.find(u => u.role === 'staff' && u.staffRole !== 'manager')?.email} / password123`);
    console.log(`🏠 Tenant:   ${users.find(u => u.role === 'tenant')?.email} / password123`);
    console.log('---------------------------------------------------------');
}

seed().catch(err => {
    console.error("❌ Seed Failed:", err);
    process.exit(1);
});
