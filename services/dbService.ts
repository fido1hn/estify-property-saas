
import { supabase } from './supabaseClient';
import { Property, Tenant, MaintenanceRequest, Invoice, Staff, StaffRole } from '../types';

export const db = {
  properties: {
    list: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const { data: units } = await supabase.from('units').select('property_id');
      const unitCounts = new Map();
      units?.forEach(u => {
          unitCounts.set(u.property_id, (unitCounts.get(u.property_id) || 0) + 1);
      });

      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        type: (p.type === 'commercial' ? 'Commercial' : 'Residential'),
        units: p.total_units || unitCounts.get(p.id) || 0,
        occupancy: 0, // Pending implementation
        image: p.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
      }));
    },
    get: async (id: string): Promise<Property | null> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      
      const { data: units } = await supabase.from('units').select('id').eq('property_id', id);
      const unitIds = (units || []).map(u => u.id);
      
      let occupiedUnits = 0;
      if (unitIds.length > 0) {
          const { count } = await supabase
            .from('tenants')
            .select('*', { count: 'exact', head: true })
            .in('unit_id', unitIds)
            .eq('status', 'active');
          occupiedUnits = count || 0;
      }

      const totalUnits = data.total_units || units?.length || 0;
      const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        type: (data.type === 'commercial' ? 'Commercial' : 'Residential'),
        units: totalUnits,
        occupancy,
        image: data.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
      };
    }
  },

  tenants: {
    list: async (): Promise<Tenant[]> => {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select(`
            id,
            user_id,
            unit_id,
            lease_end,
            status,
            profiles:user_id (full_name, email),
            units:unit_id (
                properties:property_id (name)
            )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      return (tenants || []).map((t: any) => ({
          id: t.id, 
          name: t.profiles?.full_name || 'Unknown',
          email: t.profiles?.email || '',
          unitId: t.unit_id,
          propertyName: t.units?.properties?.name || 'Unassigned',
          leaseEnd: t.lease_end,
          status: (t.status === 'active' ? 'Active' : t.status === 'pending' ? 'Notice' : 'Delinquent') as any
      }));
    },
    get: async (id: string): Promise<Tenant | null> => {
      const { data: t, error } = await supabase
        .from('tenants')
        .select(`
            id,
            user_id,
            unit_id,
            lease_end,
            status,
            profiles:user_id (full_name, email),
            units:unit_id (
                properties:property_id (name)
            )
        `)
        .eq('id', id)
        .single();
      
      if (error) return null;
      const tenant = t as any;

      return {
        id: tenant.id,
        name: tenant.profiles?.full_name || 'Unknown',
        email: tenant.profiles?.email || '',
        unitId: tenant.unit_id,
        propertyName: tenant.units?.properties?.name || 'Unassigned',
        leaseEnd: tenant.lease_end,
        status: (tenant.status === 'active' ? 'Active' : tenant.status === 'pending' ? 'Notice' : 'Delinquent') as any
      };
    }
  },

  staff: {
      list: async (): Promise<Staff[]> => {
          const { data: staffList, error } = await supabase
            .from('staff')
            .select(`
                user_id,
                phone_number,
                role,
                status,
                profiles:user_id (full_name, email, avatar_url)
            `);
          if (error) throw error;

          return (staffList || []).map((s: any) => ({
              id: s.user_id,
              name: s.profiles?.full_name || 'Unknown',
              email: s.profiles?.email || '',
              phone: s.phone_number,
              role: (s.role.charAt(0).toUpperCase() + s.role.slice(1)) as StaffRole,
              assignedPropertyIds: [],
              status: (s.status === 'active' ? 'Active' : 'Inactive') as any,
              avatar: s.profiles?.avatar_url
          }));
      }
  },

  maintenance: {
    list: async (): Promise<MaintenanceRequest[]> => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: (r.status === 'pending' ? 'Pending' : r.status === 'in_progress' ? 'In Progress' : 'Completed') as any,
        priority: (r.priority.charAt(0).toUpperCase() + r.priority.slice(1)) as any,
        unit: r.unit_id,
        createdAt: r.created_at
      }));
    }
  },

  billing: {
    list: async (): Promise<Invoice[]> => {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
            *,
            profiles:tenant_id (full_name)
        `)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      
      return (invoices || []).map((inv: any) => ({
        id: inv.id,
        tenantName: inv.profiles?.full_name || 'Unknown',
        amount: inv.amount_kobo / 100,
        dueDate: inv.due_date,
        status: (inv.status === 'paid' ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Unpaid') as any
      }));
    }
  },
  
  analytics: {
      getSummaryMetrics: async () => {
        const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
        const { data: overdue } = await supabase.from('invoices').select('amount_kobo').eq('status', 'overdue');
        const overdueTotal = (overdue || []).reduce((acc, curr) => acc + curr.amount_kobo, 0) / 100;
        
        const { data: paid } = await supabase.from('invoices').select('amount_kobo').eq('status', 'paid');
        const revenue = (paid || []).reduce((acc, curr) => acc + curr.amount_kobo, 0) / 100;

        return {
          netYield: '8.2%', 
          churnRate: '1.5%',
          avgRent: '$1,250',
          maintenanceCost: '$3,800',
          portfolioHealth: 96,
          activeProperties: propCount || 0,
          newLeads: 24,
          totalSales: `$${revenue.toLocaleString()}`,
          overdueRent: `$${overdueTotal.toLocaleString()}`
        };
      },
      getMonthlyRevenue: async () => {
           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
           return months.map(m => ({ month: m, revenue: Math.floor(Math.random() * 40000) + 15000 }));
      },
      getOccupancyTrend: async () => {
           const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
           return months.map(m => ({ month: m, rate: Math.floor(Math.random() * 10) + 85 }));
      },
      getRevenueDistribution: async () => {
          return [
              { name: 'Residential', value: 65 },
              { name: 'Commercial', value: 35 },
              { name: 'Industrial', value: 0 }
          ];
      }
  },

  messages: {
    getContacts: async () => {
      // Fetch profiles that are NOT the current user (mock current user for now)
      // In real app, we filter out current user from AuthContext
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .limit(10);

      if (error) return [];
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.full_name,
        role: p.role,
        lastMsg: 'Hello there!', // Mock
        time: '10:30 AM', // Mock
        avatar: p.avatar_url || 'https://ui-avatars.com/api/?name=' + p.full_name,
        online: Math.random() > 0.5
      }));
    },
    getChatHistory: async (contactId: string) => {
        return [
            { id: '1', sender_id: contactId, receiver_id: 'me', content: 'Hi, is the unit still available?', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: true },
            { id: '2', sender_id: 'me', receiver_id: contactId, content: 'Yes it is.', created_at: new Date().toISOString(), is_read: true }
        ];
    },
    sendMessage: async (receiverId: string, content: string) => {
        return { id: 'temp', content, sender_id: 'me', receiver_id: receiverId, created_at: new Date().toISOString() };
    }
  }
};
