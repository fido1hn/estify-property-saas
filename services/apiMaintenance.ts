
import { supabase } from "./supabaseClient";
import { MaintenanceRequest } from "../types";
import { PAGE_SIZE } from "../utils/constants";

export async function getMaintenanceRequests({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
    let query = supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact' });

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

export async function updateMaintenanceRequest(id: string, updates: any) {
    const { data, error } = await supabase.from('maintenance_requests').update(updates).eq('id', id).select().single();
    if (error) throw new Error("Could not update request");
    return data;
}

export async function deleteMaintenanceRequest(id: string) {
    const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
    if (error) throw new Error("Could not delete request");
}
