import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.error('Error: VITE_SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create admin client for auth operations
const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create regular client for data operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration
const NUM_PROPERTIES = 10;
const NUM_UNITS_PER_PROPERTY = 5;
const NUM_PROFILES = 50;
const NUM_STAFF = 10;
const NUM_TENANTS = 30;
const NUM_MAINTENANCE_REQUESTS = 40;
const NUM_INVOICES = 50;
const NUM_MESSAGES = 100;

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  image_url: string;
  total_units: number;
}

interface Unit {
  id: string;
  property_id: number;
}

interface Staff {
  id: string;
  phone_number: number;
  specialization: string;
  status: string;
}

interface Tenant {
  id: string;
  unit_id: string;
  lease_start: string;
  lease_end: string;
  status: string;
}

interface MaintenanceRequest {
  property_id: number;
  unit_id: string;
  created_by: string;
  assigned_staff_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

interface Invoice {
  tenant_id: string;
  amount: number;
  due_data: string;
  status: string;
  type: string;
}

interface Message {
  sender_id: string;
  receiver_id: string;
  is_read: string;
}

// Delete all data in correct order (respecting foreign key constraints)
async function deleteAllData() {
  console.log('🗑️  Deleting all existing data...');
  
  try {
    // Delete in reverse dependency order (children first, then parents)
    const { error: messagesError } = await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (messagesError) console.warn('Warning deleting messages:', messagesError.message);
    
    const { error: invoicesError } = await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (invoicesError) console.warn('Warning deleting invoices:', invoicesError.message);
    
    const { error: maintenanceError } = await supabase.from('maintainance_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (maintenanceError) console.warn('Warning deleting maintenance requests:', maintenanceError.message);
    
    const { error: tenantsError } = await supabase.from('tenants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (tenantsError) console.warn('Warning deleting tenants:', tenantsError.message);
    
    const { error: staffError } = await supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (staffError) console.warn('Warning deleting staff:', staffError.message);
    
    const { error: unitsError } = await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (unitsError) console.warn('Warning deleting units:', unitsError.message);
    
    const { error: propertiesError } = await supabase.from('properties').delete().neq('id', 0);
    if (propertiesError) console.warn('Warning deleting properties:', propertiesError.message);
    
    const { error: profilesError } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (profilesError) console.warn('Warning deleting profiles:', profilesError.message);
    
    // Delete auth users
    const { data: users, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (!listError && users) {
      for (const user of users.users) {
        await adminSupabase.auth.admin.deleteUser(user.id);
      }
      console.log(`✅ Deleted ${users.users.length} auth users`);
    }
    
    console.log('✅ All data deleted successfully');
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
}

// Create auth users first (required for profiles foreign key)
async function createAuthUsers(count: number): Promise<string[]> {
  console.log(`🔐 Creating ${count} auth users...`);
  const userIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Use unique emails to avoid conflicts
    const email = `seed_${Date.now()}_${i}_${faker.internet.email()}`;
    const password = faker.internet.password({ length: 12 });
    
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email for seed data
    });
    
    if (error) {
      console.error(`Error creating auth user ${i + 1}:`, error);
      throw error;
    }
    
    if (data?.user) {
      userIds.push(data.user.id);
    }
  }
  
  console.log(`✅ Created ${userIds.length} auth users`);
  return userIds;
}

// Generate and insert profiles
async function seedProfiles(userIds: string[]): Promise<Profile[]> {
  console.log(`👥 Creating ${userIds.length} profiles...`);
  const profiles: Profile[] = [];
  
  for (let i = 0; i < userIds.length; i++) {
    const role = faker.helpers.arrayElement(['tenant', 'staff', 'admin', 'manager']);
    profiles.push({
      id: userIds[i], // Use the auth user ID
      full_name: faker.person.fullName(),
      email: faker.internet.email(),
      role: role,
      avatar_url: faker.image.avatar(),
    });
  }
  
  const { data, error } = await supabase.from('profiles').insert(profiles).select();
  
  if (error) {
    console.error('Error inserting profiles:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} profiles`);
  return profiles;
}

// Generate and insert properties
async function seedProperties(): Promise<Property[]> {
  console.log(`🏢 Creating ${NUM_PROPERTIES} properties...`);
  const properties: Property[] = [];
  
  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const propertyType = faker.helpers.arrayElement(['apartment', 'condo', 'house', 'townhouse']);
    const totalUnits = NUM_UNITS_PER_PROPERTY;
    
    properties.push({
      name: `${faker.location.buildingNumber()} ${faker.location.street()} ${propertyType}`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      type: propertyType,
      image_url: faker.image.urlLoremFlickr({ category: 'building' }),
      total_units: totalUnits,
    });
  }
  
  const { data, error } = await supabase.from('properties').insert(properties).select();
  
  if (error) {
    console.error('Error inserting properties:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} properties`);
  return data || [];
}

// Generate and insert units
async function seedUnits(properties: Property[]): Promise<Unit[]> {
  console.log(`🏠 Creating units for properties...`);
  const units: Unit[] = [];
  
  for (const property of properties) {
    for (let i = 0; i < property.total_units; i++) {
      units.push({
        id: faker.string.uuid(),
        property_id: property.id,
      });
    }
  }
  
  const { data, error } = await supabase.from('units').insert(units).select();
  
  if (error) {
    console.error('Error inserting units:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} units`);
  return data || [];
}

// Generate and insert staff
async function seedStaff(profiles: Profile[]): Promise<Staff[]> {
  console.log(`👨‍💼 Creating ${NUM_STAFF} staff members...`);
  const staffProfiles = profiles.filter(p => p.role === 'staff' || p.role === 'admin' || p.role === 'manager').slice(0, NUM_STAFF);
  const staff: Staff[] = [];
  
  for (const profile of staffProfiles) {
    staff.push({
      id: profile.id,
      phone_number: parseInt(faker.phone.number('##########').replace(/\D/g, '').slice(0, 10)),
      specialization: faker.helpers.arrayElement(['plumbing', 'electrical', 'hvac', 'general', 'carpentry', 'painting']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'on_leave']),
    });
  }
  
  const { data, error } = await supabase.from('staff').insert(staff).select();
  
  if (error) {
    console.error('Error inserting staff:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} staff members`);
  return data || [];
}

// Generate and insert tenants
async function seedTenants(profiles: Profile[], units: Unit[]): Promise<Tenant[]> {
  console.log(`🏘️  Creating ${NUM_TENANTS} tenants...`);
  const tenantProfiles = profiles.filter(p => p.role === 'tenant').slice(0, NUM_TENANTS);
  const tenants: Tenant[] = [];
  
  // unit_id references units(id) which is uuid
  const availableUnitIds = units.map(u => u.id);
  
  for (const profile of tenantProfiles) {
    const leaseStart = faker.date.past({ years: 2 });
    const leaseEnd = faker.date.future({ years: 1, refDate: leaseStart });
    
    tenants.push({
      id: profile.id,
      unit_id: faker.helpers.arrayElement(availableUnitIds),
      lease_start: leaseStart.toISOString().split('T')[0],
      lease_end: leaseEnd.toISOString().split('T')[0],
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    });
  }
  
  const { data, error } = await supabase.from('tenants').insert(tenants).select();
  
  if (error) {
    console.error('Error inserting tenants:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} tenants`);
  return data || [];
}

// Generate and insert maintenance requests
async function seedMaintenanceRequests(
  properties: Property[],
  units: Unit[],
  profiles: Profile[],
  staff: Staff[]
): Promise<void> {
  console.log(`🔧 Creating ${NUM_MAINTENANCE_REQUESTS} maintenance requests...`);
  const requests: MaintenanceRequest[] = [];
  
  const tenantProfiles = profiles.filter(p => p.role === 'tenant');
  
  for (let i = 0; i < NUM_MAINTENANCE_REQUESTS; i++) {
    const property = faker.helpers.arrayElement(properties);
    const propertyUnits = units.filter(u => u.property_id === property.id);
    const unit = propertyUnits.length > 0 ? faker.helpers.arrayElement(propertyUnits) : faker.helpers.arrayElement(units);
    
    requests.push({
      property_id: property.id,
      unit_id: unit.id,
      created_by: faker.helpers.arrayElement(tenantProfiles).id,
      assigned_staff_id: faker.helpers.arrayElement(staff).id,
      title: faker.helpers.arrayElement([
        'Leaky faucet',
        'Broken AC unit',
        'Electrical outlet not working',
        'Door lock malfunction',
        'Water heater issue',
        'Window repair needed',
        'Plumbing backup',
        'Heating system problem',
      ]),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed', 'cancelled']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
    });
  }
  
  const { data, error } = await supabase.from('maintainance_requests').insert(requests).select();
  
  if (error) {
    console.error('Error inserting maintenance requests:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} maintenance requests`);
}

// Generate and insert invoices
async function seedInvoices(profiles: Profile[]): Promise<void> {
  console.log(`💰 Creating ${NUM_INVOICES} invoices...`);
  const invoices: Invoice[] = [];
  
  const tenantProfiles = profiles.filter(p => p.role === 'tenant');
  
  for (let i = 0; i < NUM_INVOICES; i++) {
    invoices.push({
      tenant_id: faker.helpers.arrayElement(tenantProfiles).id,
      amount: faker.number.int({ min: 500, max: 5000 }) * 100, // in cents
      due_data: faker.date.future({ years: 1 }).toISOString().split('T')[0],
      status: faker.helpers.arrayElement(['pending', 'paid', 'overdue', 'cancelled']),
      type: faker.helpers.arrayElement(['rent', 'utilities', 'maintenance', 'late_fee', 'deposit']),
    });
  }
  
  const { data, error } = await supabase.from('invoices').insert(invoices).select();
  
  if (error) {
    console.error('Error inserting invoices:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} invoices`);
}

// Generate and insert messages
async function seedMessages(profiles: Profile[]): Promise<void> {
  console.log(`💬 Creating ${NUM_MESSAGES} messages...`);
  const messages: Message[] = [];
  
  for (let i = 0; i < NUM_MESSAGES; i++) {
    const sender = faker.helpers.arrayElement(profiles);
    const receiver = faker.helpers.arrayElement(profiles.filter(p => p.id !== sender.id));
    
    messages.push({
      sender_id: sender.id,
      receiver_id: receiver.id,
      is_read: faker.helpers.arrayElement(['true', 'false']),
    });
  }
  
  const { data, error } = await supabase.from('messages').insert(messages).select();
  
  if (error) {
    console.error('Error inserting messages:', error);
    throw error;
  }
  
  console.log(`✅ Created ${data?.length || 0} messages`);
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Delete all existing data
    await deleteAllData();
    console.log('');
    
    // Seed in dependency order
    // First create auth users (required for profiles foreign key)
    const userIds = await createAuthUsers(NUM_PROFILES);
    console.log('');
    
    // Then create profiles with those user IDs
    const profiles = await seedProfiles(userIds);
    console.log('');
    
    const properties = await seedProperties();
    console.log('');
    
    const units = await seedUnits(properties);
    console.log('');
    
    const staff = await seedStaff(profiles);
    console.log('');
    
    const tenants = await seedTenants(profiles, units);
    console.log('');
    
    await seedMaintenanceRequests(properties, units, profiles, staff);
    console.log('');
    
    await seedInvoices(profiles);
    console.log('');
    
    await seedMessages(profiles);
    console.log('');
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
