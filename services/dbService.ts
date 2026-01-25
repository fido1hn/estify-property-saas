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
      
      // Transform database schema to app types
      return (data || []).map((p: any) => ({
        id: p.id.toString(), // Convert bigint to string
        name: p.name || '',
        address: p.address || '',
        type: (p.type || 'Residential') as 'Residential' | 'Commercial' | 'Industrial',
        units: p.total_units || 0,
        occupancy: 0, // Calculate from tenants/units if needed
        image: p.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
      }));
    },
    get: async (id: string): Promise<Property | null> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', parseInt(id))
        .single();
      if (error) return null;
      
      // Calculate occupancy from units and tenants
      const { data: units } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', parseInt(id));
      
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id')
        .in('unit_id', (units || []).map(u => u.id));
      
      const totalUnits = units?.length || 0;
      const occupiedUnits = tenants?.length || 0;
      const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      
      return {
        id: data.id.toString(),
        name: data.name || '',
        address: data.address || '',
        type: (data.type || 'Residential') as 'Residential' | 'Commercial' | 'Industrial',
        units: data.total_units || 0,
        occupancy,
        image: data.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
      };
    },
    create: async (payload: Omit<Property, 'id'>): Promise<Property> => {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          name: payload.name,
          address: payload.address,
          type: payload.type,
          image_url: payload.image,
          total_units: payload.units
        }])
        .select()
        .single();
      if (error) throw error;
      
      return {
        id: data.id.toString(),
        name: data.name || '',
        address: data.address || '',
        type: (data.type || 'Residential') as 'Residential' | 'Commercial' | 'Industrial',
        units: data.total_units || 0,
        occupancy: 0,
        image: data.image_url || ''
      };
    },
    update: async (id: string, payload: Partial<Property>): Promise<Property> => {
      const updateData: any = {};
      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.address !== undefined) updateData.address = payload.address;
      if (payload.type !== undefined) updateData.type = payload.type;
      if (payload.image !== undefined) updateData.image_url = payload.image;
      if (payload.units !== undefined) updateData.total_units = payload.units;
      
      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', parseInt(id))
        .select()
        .single();
      if (error) throw error;
      
      return {
        id: data.id.toString(),
        name: data.name || '',
        address: data.address || '',
        type: (data.type || 'Residential') as 'Residential' | 'Commercial' | 'Industrial',
        units: data.total_units || 0,
        occupancy: payload.occupancy || 0,
        image: data.image_url || ''
      };
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('properties').delete().eq('id', parseInt(id));
      if (error) throw error;
      return true;
    }
  },

  tenants: {
    list: async (): Promise<Tenant[]> => {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Fetch related data separately
      const tenantIds = (tenants || []).map(t => t.id);
      const unitIds = (tenants || []).map(t => t.unit_id).filter(Boolean);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', tenantIds);
      
      const { data: units } = await supabase
        .from('units')
        .select('id, property_id')
        .in('id', unitIds);
      
      const propertyIds = (units || []).map(u => u.property_id).filter(Boolean);
      const { data: properties } = await supabase
        .from('properties')
        .select('id, name')
        .in('id', propertyIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const unitMap = new Map((units || []).map(u => [u.id, u]));
      const propertyMap = new Map((properties || []).map(p => [p.id, p]));
      
      return (tenants || []).map((t: any) => {
        const profile = profileMap.get(t.id);
        const unit = unitMap.get(t.unit_id);
        const property = unit ? propertyMap.get(unit.property_id) : null;
        
        return {
          id: t.id,
          name: profile?.full_name || 'Unknown',
          email: profile?.email || '',
          unitId: t.unit_id || '',
          propertyName: property?.name || 'Unassigned',
          leaseEnd: t.lease_end || '',
          status: (t.status === 'active' ? 'Active' : t.status === 'pending' ? 'Notice' : 'Delinquent') as 'Active' | 'Delinquent' | 'Notice'
        };
      });
    },
    get: async (id: string): Promise<Tenant | null> => {
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      
      // Fetch related data
      const [profile, unit] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('id', id).single(),
        tenant.unit_id ? supabase.from('units').select('id, property_id').eq('id', tenant.unit_id).single() : Promise.resolve({ data: null })
      ]);
      
      let property = null;
      if (unit.data?.property_id) {
        const propResult = await supabase.from('properties').select('name').eq('id', unit.data.property_id).single();
        property = propResult.data;
      }
      
      return {
        id: tenant.id,
        name: profile.data?.full_name || 'Unknown',
        email: profile.data?.email || '',
        unitId: tenant.unit_id || '',
        propertyName: property?.name || 'Unassigned',
        leaseEnd: tenant.lease_end || '',
        status: (tenant.status === 'active' ? 'Active' : tenant.status === 'pending' ? 'Notice' : 'Delinquent') as 'Active' | 'Delinquent' | 'Notice'
      };
    },
    create: async (payload: any): Promise<Tenant> => {
      // First create or get profile
      let profileId = payload.profileId;
      if (!profileId && payload.name && payload.email) {
        // Create profile first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            full_name: payload.name,
            email: payload.email,
            role: 'tenant'
          }])
          .select()
          .single();
        if (profileError) throw profileError;
        profileId = profile.id;
      }
      
      // Create tenant
      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          id: profileId,
          unit_id: payload.unitId,
          lease_start: payload.leaseStart || new Date().toISOString().split('T')[0],
          lease_end: payload.leaseEnd,
          status: payload.status?.toLowerCase() || 'active'
        }])
        .select()
        .single();
      if (error) throw error;
      
      // Fetch full tenant data with joins
      return await db.tenants.get(data.id) || data as Tenant;
    },
    update: async (id: string, payload: Partial<Tenant>): Promise<Tenant> => {
      const updateData: any = {};
      if (payload.leaseEnd !== undefined) updateData.lease_end = payload.leaseEnd;
      if (payload.status !== undefined) updateData.status = payload.status.toLowerCase();
      if (payload.unitId !== undefined) updateData.unit_id = payload.unitId;
      
      // Update profile if name/email changed
      if (payload.name || payload.email) {
        const profileUpdate: any = {};
        if (payload.name) profileUpdate.full_name = payload.name;
        if (payload.email) profileUpdate.email = payload.email;
        await supabase.from('profiles').update(profileUpdate).eq('id', id);
      }
      
      const { data, error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      return await db.tenants.get(id) || data as Tenant;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  staff: {
    list: async (): Promise<Staff[]> => {
      const { data: staffList, error } = await supabase
        .from('staff')
        .select('*');
      if (error) throw error;
      
      const staffIds = (staffList || []).map(s => s.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', staffIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      
      return (staffList || []).map((s: any) => {
        const profile = profileMap.get(s.id);
        return {
          id: s.id,
          name: profile?.full_name || 'Unknown',
          email: profile?.email || '',
          phone: s.phone_number?.toString() || '',
          role: s.specialization as any,
          assignedPropertyIds: [],
          status: (s.status === 'active' ? 'Active' : s.status === 'on_leave' ? 'On Leave' : 'Inactive') as 'Active' | 'On Leave' | 'Inactive',
          avatar: profile?.avatar_url
        };
      });
    },
    get: async (id: string): Promise<Staff | null> => {
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', id)
        .single();
      
      return {
        id: staff.id,
        name: profile?.full_name || 'Unknown',
        email: profile?.email || '',
        phone: staff.phone_number?.toString() || '',
        role: staff.specialization as any,
        assignedPropertyIds: [],
        status: (staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Inactive') as 'Active' | 'On Leave' | 'Inactive',
        avatar: profile?.avatar_url
      };
    },
    create: async (payload: any): Promise<Staff> => {
      // Create profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          full_name: payload.name,
          email: payload.email,
          role: 'staff',
          avatar_url: payload.avatar
        }])
        .select()
        .single();
      if (profileError) throw profileError;
      
      // Create staff
      const { data, error } = await supabase
        .from('staff')
        .insert([{
          id: profile.id,
          phone_number: parseInt(payload.phone?.replace(/\D/g, '') || '0'),
          specialization: payload.role || 'general',
          status: payload.status?.toLowerCase() || 'active'
        }])
        .select()
        .single();
      if (error) throw error;
      
      return await db.staff.get(data.id) || data as Staff;
    },
    update: async (id: string, payload: any): Promise<Staff> => {
      const updateData: any = {};
      if (payload.phone !== undefined) updateData.phone_number = parseInt(payload.phone?.replace(/\D/g, '') || '0');
      if (payload.role !== undefined) updateData.specialization = payload.role;
      if (payload.status !== undefined) updateData.status = payload.status.toLowerCase();
      
      // Update profile if name/email changed
      if (payload.name || payload.email) {
        const profileUpdate: any = {};
        if (payload.name) profileUpdate.full_name = payload.name;
        if (payload.email) profileUpdate.email = payload.email;
        if (payload.avatar) profileUpdate.avatar_url = payload.avatar;
        await supabase.from('profiles').update(profileUpdate).eq('id', id);
      }
      
      const { data, error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      return await db.staff.get(id) || data as Staff;
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
        .from('maintainance_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title || '',
        description: r.description || '',
        status: (r.status === 'pending' ? 'Pending' : r.status === 'in_progress' ? 'In Progress' : 'Completed') as 'Pending' | 'In Progress' | 'Completed',
        priority: (r.priority || 'Medium') as 'Low' | 'Medium' | 'High',
        unit: r.unit_id || '',
        createdAt: r.created_at || new Date().toISOString()
      }));
    },
    get: async (id: string): Promise<MaintenanceRequest | null> => {
      const { data, error } = await supabase
        .from('maintainance_requests')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      
      return {
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        status: (data.status === 'pending' ? 'Pending' : data.status === 'in_progress' ? 'In Progress' : 'Completed') as 'Pending' | 'In Progress' | 'Completed',
        priority: (data.priority || 'Medium') as 'Low' | 'Medium' | 'High',
        unit: data.unit_id || '',
        createdAt: data.created_at || new Date().toISOString()
      };
    },
    create: async (payload: any): Promise<MaintenanceRequest> => {
      const { data, error } = await supabase
        .from('maintainance_requests')
        .insert([{
          property_id: payload.propertyId ? parseInt(payload.propertyId) : null,
          unit_id: payload.unitId || payload.unit || null,
          created_by: payload.createdBy || null,
          assigned_staff_id: payload.assignedStaffId || null,
          title: payload.title,
          description: payload.description,
          status: payload.status?.toLowerCase() || 'pending',
          priority: payload.priority?.toLowerCase() || 'medium'
        }])
        .select()
        .single();
      if (error) throw error;
      
      return await db.maintenance.get(data.id) || data as MaintenanceRequest;
    },
    update: async (id: string, payload: any): Promise<MaintenanceRequest> => {
      const updateData: any = {};
      if (payload.title !== undefined) updateData.title = payload.title;
      if (payload.description !== undefined) updateData.description = payload.description;
      if (payload.status !== undefined) updateData.status = payload.status.toLowerCase();
      if (payload.priority !== undefined) updateData.priority = payload.priority.toLowerCase();
      if (payload.assignedStaffId !== undefined) updateData.assigned_staff_id = payload.assignedStaffId;
      if (payload.propertyId !== undefined) updateData.property_id = parseInt(payload.propertyId);
      if (payload.unitId !== undefined) updateData.unit_id = payload.unitId;
      
      const { data, error } = await supabase
        .from('maintainance_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      return await db.maintenance.get(id) || data as MaintenanceRequest;
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('maintainance_requests').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  billing: {
    list: async (): Promise<Invoice[]> => {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('due_data', { ascending: true });
      if (error) throw error;
      
      const tenantIds = (invoices || []).map(inv => inv.tenant_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', tenantIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      
      return (invoices || []).map((inv: any) => ({
        id: inv.id,
        tenantName: profileMap.get(inv.tenant_id)?.full_name || 'Unknown',
        amount: Number(inv.amount) / 100, // Convert from cents
        dueDate: inv.due_data || '',
        status: (inv.status === 'paid' ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Unpaid') as 'Paid' | 'Unpaid' | 'Overdue'
      }));
    },
    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  analytics: {
    getSummaryMetrics: async () => {
      const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      const { data: invData } = await supabase.from('invoices').select('amount').eq('status', 'overdue');
      
      const overdueTotal = invData?.reduce((acc, curr) => acc + (Number(curr.amount) / 100), 0) || 0;
      
      // Get total revenue from paid invoices
      const { data: paidInvoices } = await supabase.from('invoices').select('amount').eq('status', 'paid');
      const totalRevenue = paidInvoices?.reduce((acc, curr) => acc + (Number(curr.amount) / 100), 0) || 0;

      return {
        netYield: '7.2%',
        churnRate: '2.1%',
        avgRent: '$2,450',
        maintenanceCost: '$14,200',
        portfolioHealth: 92,
        activeProperties: propCount || 0,
        newLeads: 124,
        totalSales: `$${totalRevenue.toLocaleString()}`,
        overdueRent: `$${overdueTotal.toLocaleString()}`
      };
    },
    getMonthlyRevenue: async () => {
      // Get actual revenue data from invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('amount, due_data, status')
        .eq('status', 'paid');
      
      // Group by month (simplified - would need proper date grouping in production)
      const monthlyData: { [key: string]: number } = {};
      invoices?.forEach(inv => {
        const date = new Date(inv.due_data);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (Number(inv.amount) / 100);
      });
      
      // Return last 6 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({
        month,
        revenue: monthlyData[month] || 0
      }));
    },
    getOccupancyTrend: async () => {
      // Calculate occupancy from tenants and units
      const { data: properties } = await supabase.from('properties').select('id, total_units');
      const occupancyData: { [key: string]: number } = {};
      
      if (properties) {
        for (const prop of properties) {
          const { data: units } = await supabase
            .from('units')
            .select('id')
            .eq('property_id', prop.id);
          
          const { data: tenants } = await supabase
            .from('tenants')
            .select('id')
            .in('unit_id', (units || []).map(u => u.id));
          
          const totalUnits = units?.length || 0;
          const occupied = tenants?.length || 0;
          const rate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
          
          // Simplified - would need proper date grouping
          occupancyData['Jan'] = rate;
        }
      }
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({
        month,
        rate: occupancyData[month] || 92
      }));
    },
    getRevenueDistribution: async () => {
      const { data: properties } = await supabase.from('properties').select('type');
      const distribution: { [key: string]: number } = {};
      
      properties?.forEach(p => {
        const type = p.type || 'Residential';
        distribution[type] = (distribution[type] || 0) + 1;
      });
      
      const total = properties?.length || 1;
      return [
        { name: 'Residential', value: Math.round(((distribution['Residential'] || 0) / total) * 100) },
        { name: 'Commercial', value: Math.round(((distribution['Commercial'] || 0) / total) * 100) },
        { name: 'Industrial', value: Math.round(((distribution['Industrial'] || 0) / total) * 100) }
      ];
    }
  },

  messages: {
    getContacts: async () => {
      // Get all profiles that have sent or received messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) return [];
      
      const uniqueProfileIds = new Set<string>();
      messages?.forEach(msg => {
        if (msg.sender_id) uniqueProfileIds.add(msg.sender_id);
        if (msg.receiver_id) uniqueProfileIds.add(msg.receiver_id);
      });
      
      if (uniqueProfileIds.size === 0) {
        // Return system support as default
        return [{
          id: '00000000-0000-0000-0000-000000000000',
          name: 'System Support',
          role: 'Admin',
          lastMsg: 'Welcome to Estify.',
          time: '12:00 PM',
          avatar: 'https://picsum.photos/seed/sys/100',
          online: true
        }];
      }
      
      // Get profile details
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .in('id', Array.from(uniqueProfileIds));
      
      return (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Unknown',
        role: p.role || 'User',
        lastMsg: 'Click to start conversation',
        time: '12:00 PM',
        avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'User')}`,
        online: false
      }));
    },
    getChatHistory: async (contactId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
        .order('created_at', { ascending: true });
      if (error) return [];
      
      // Fetch profile details for sender/receiver
      const messageIds = (data || []).map(m => m.id);
      const senderIds = [...new Set((data || []).map(m => m.sender_id).filter(Boolean))];
      const receiverIds = [...new Set((data || []).map(m => m.receiver_id).filter(Boolean))];
      const allProfileIds = [...new Set([...senderIds, ...receiverIds])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', allProfileIds);
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      
      return (data || []).map(msg => ({
        ...msg,
        sender: profileMap.get(msg.sender_id),
        receiver: profileMap.get(msg.receiver_id)
      }));
    },
    sendMessage: async (receiverId: string, content: string) => {
      // Get current user ID (would come from auth in production)
      // For now, use the first profile as sender (in production, use authenticated user)
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
      const currentUserId = profiles?.[0]?.id || '11111111-1111-1111-1111-111111111111';
      
      // Note: The messages table doesn't have a content field in the schema
      // This creates a message record, but content would need to be stored elsewhere
      // or the schema would need to be updated to include a content/text field
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: currentUserId,
          receiver_id: receiverId,
          is_read: 'false'
        }])
        .select()
        .single();
      if (error) throw error;
      return { ...data, content }; // Return with content for UI compatibility
    }
  }
};
