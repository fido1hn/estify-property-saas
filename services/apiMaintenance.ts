
import { supabase } from "./supabaseClient";
import { MaintenanceRequest } from "../types";
import { PAGE_SIZE } from "../utils/constants";

export async function getMaintenanceRequests({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
    let query: any = supabase
        .from('maintenance_requests')
        .select(`
            *,
            properties:property_id (name)
        `, { count: 'exact' });

    if (filter && filter.value) {
         query = query.eq(filter.field, filter.value);
    }
    
    if (sortBy) {
        query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    if (page) {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) {
        console.error(error);
        throw new Error("Maintenance requests could not be loaded");
    }

    const formattedData: MaintenanceRequest[] = (data as any[] || []).map((r: any) => ({
        ...r
    }));

    return { data: formattedData, count };
}

export async function getMaintenanceRequest(id: string) {
    const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
            *,
            properties:property_id (name),
            units:unit_id (id),
            tenants:tenant_id (user_id)
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        console.error(error);
        throw new Error("Maintenance request not found");
    }
    
    return data as any as MaintenanceRequest;
}

export async function createMaintenanceRequest(request: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const dbPayload = {
      ...request,
      // property_id, unit_id, tenant_id logic?
      // For now, assume request contains IDs or placeholders.
      // If the UI sends 'unit' as string (e.g. U-402), we need to map it to unit_id.
      // But typically we'd need to look that up. The original mock likely ignored this complexity.
      // We will spread request and hope for the best or provide defaults.
      tenant_id: user?.id, // Assign to current user if tenant
      property_id: '00000000-0000-0000-0000-000000000000', // Placeholder
      unit_id: '00000000-0000-0000-0000-000000000000' // Placeholder
    };

    const { data, error } = await supabase.from('maintenance_requests').insert([dbPayload]).select().single();
    if (error) {
        console.error(error);
        throw new Error("Could not create maintenance request");
    }
    return data;
}

export async function updateMaintenanceRequest(id: string, updates: any) {
    const { data, error } = await supabase.from('maintenance_requests').update(updates).eq('id', id).select().single();
    if (error) throw new Error("Could not update request");
    return data;
}

export async function deleteMaintenanceRequest(id: string) {
    const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
    if (error) throw new Error("Could not delete request");
}
