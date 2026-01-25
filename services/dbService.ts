
import { supabase } from './supabaseClient';
import { Property, Tenant, MaintenanceRequest, Invoice, Staff } from '../types';

export const db = {
  properties: {
    list: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
    get: async (id: string): Promise<Property | null> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as Property;
    },
    create: async (payload: Omit<Property, 'id'>): Promise<Property> => {
      const { data, error } = await supabase
        .from('properties')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as Property;
    },
    update: async (id: string, payload: Partial<Property>): Promise<Property> => {
      const { data, error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Property;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  tenants: {
    list: async (): Promise<Tenant[]> => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, properties(name)')
        .order('name');
      if (error) throw error;
      return data.map(t => ({
        ...t,
        propertyName: (t as any).properties?.name || 'Unassigned'
      })) as Tenant[];
    },
    get: async (id: string): Promise<Tenant | null> => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, properties(name)')
        .eq('id', id)
        .single();
      if (error) return null;
      return { 
        ...data, 
        propertyName: (data as any).properties?.name || 'Unassigned' 
      } as Tenant;
    },
    create: async (payload: any): Promise<Tenant> => {
      const { data, error } = await supabase
        .from('tenants')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as Tenant;
    },
    update: async (id: string, payload: Partial<Tenant>): Promise<Tenant> => {
      const { data, error } = await supabase
        .from('tenants')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Tenant;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  staff: {
    list: async (): Promise<Staff[]> => {
      const { data, error } = await supabase
        .from('staff')
        .select('*, staff_properties(property_id)');
      if (error) throw error;
      return data.map(s => ({
        ...s,
        assignedPropertyIds: (s as any).staff_properties.map((sp: any) => sp.property_id)
      })) as Staff[];
    },
    get: async (id: string): Promise<Staff | null> => {
      const { data, error } = await supabase
        .from('staff')
        .select('*, staff_properties(property_id)')
        .eq('id', id)
        .single();
      if (error) return null;
      return {
        ...data,
        assignedPropertyIds: (data as any).staff_properties.map((sp: any) => sp.property_id)
      } as Staff;
    },
    create: async (payload: any): Promise<Staff> => {
      const { assignedPropertyIds, ...staffData } = payload;
      const { data, error } = await supabase.from('staff').insert([staffData]).select().single();
      if (error) throw error;
      
      if (assignedPropertyIds?.length) {
        const junctions = assignedPropertyIds.map((pid: string) => ({ 
          staff_id: data.id, 
          property_id: pid 
        }));
        await supabase.from('staff_properties').insert(junctions);
      }
      return data as Staff;
    },
    update: async (id: string, payload: any): Promise<Staff> => {
      const { assignedPropertyIds, ...staffData } = payload;
      const { data, error } = await supabase.from('staff').update(staffData).eq('id', id).select().single();
      if (error) throw error;

      if (assignedPropertyIds !== undefined) {
        // Sync assignments: remove old and add new
        await supabase.from('staff_properties').delete().eq('staff_id', id);
        if (assignedPropertyIds.length) {
          const junctions = assignedPropertyIds.map((pid: string) => ({ 
            staff_id: id, 
            property_id: pid 
          }));
          await supabase.from('staff_properties').insert(junctions);
        }
      }
      return data as Staff;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  maintenance: {
    list: async (): Promise<MaintenanceRequest[]> => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MaintenanceRequest[];
    },
    get: async (id: string): Promise<MaintenanceRequest | null> => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as MaintenanceRequest;
    },
    create: async (payload: any): Promise<MaintenanceRequest> => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as MaintenanceRequest;
    },
    update: async (id: string, payload: any): Promise<MaintenanceRequest> => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as MaintenanceRequest;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  billing: {
    list: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, tenants(name)');
      if (error) throw error;
      return data.map(inv => ({
        ...inv,
        tenantName: (inv as any).tenants?.name || 'Unknown'
      })) as Invoice[];
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  analytics: {
    getSummaryMetrics: async () => {
      // Aggregates for dashboard
      const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      const { data: invData } = await supabase.from('invoices').select('amount').eq('status', 'Overdue');
      
      const overdueTotal = invData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      return {
        netYield: '7.2%',
        churnRate: '2.1%',
        avgRent: '$2,450',
        maintenanceCost: '$14,200',
        portfolioHealth: 92,
        activeProperties: propCount || 0,
        newLeads: 124,
        totalSales: '$720,000',
        overdueRent: `$${overdueTotal.toLocaleString()}`
      };
    },
    getMonthlyRevenue: async () => {
      // Mocked historical data for charts
      return [
        { month: 'Jan', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Apr', revenue: 61000 },
        { month: 'May', revenue: 55000 },
        { month: 'Jun', revenue: 67000 },
      ];
    },
    getOccupancyTrend: async () => {
      return [
        { month: 'Jan', rate: 94 },
        { month: 'Feb', rate: 92 },
        { month: 'Mar', rate: 95 },
        { month: 'Apr', rate: 93 },
        { month: 'May', rate: 96 },
        { month: 'Jun', rate: 92 },
      ];
    },
    getRevenueDistribution: async () => {
      return [
        { name: 'Residential', value: 65 },
        { name: 'Commercial', value: 25 },
        { name: 'Industrial', value: 10 },
      ];
    }
  },

  messages: {
    getContacts: async () => {
      return [
        { 
          id: '00000000-0000-0000-0000-000000000000', 
          name: 'System Support', 
          role: 'Admin', 
          lastMsg: 'Welcome to Estify.', 
          time: '12:00 PM', 
          avatar: 'https://picsum.photos/seed/sys/100', 
          online: true 
        },
      ];
    },
    getChatHistory: async (contactId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
        .order('created_at', { ascending: true });
      if (error) return [];
      return data;
    },
    sendMessage: async (receiverId: string, content: string) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ 
          sender_id: '11111111-1111-1111-1111-111111111111', // Dummy sender ID
          receiver_id: receiverId, 
          content 
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
};
