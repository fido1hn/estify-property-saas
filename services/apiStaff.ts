
import { supabase } from "./supabaseClient";
import { Staff } from "../types";
import { PAGE_SIZE } from "../utils/constants";

export async function getStaffList({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
    let query: any = supabase
    .from("staff")
    .select(`
        user_id,
        phone_number,
        role,
        status,
        created_at,
        profiles:user_id (full_name, email, avatar_url)
    `, { count: 'exact' });

    if (filter && filter.value) {
        query = query.eq(filter.field, filter.value);
    }

    if (sortBy) {
        query = query.order(sortBy.field, { ascending: sortBy.direction === "asc" });
    }

    if (page) {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error(error);
        throw new Error("Staff list could not be loaded");
    }

    const formattedData: Staff[] = (data as any[] || []).map((s: any) => ({
        ...s,
    }));

    return { data: formattedData, count };
}

export async function getStaff(id: string) {
    const { data, error } = await supabase
    .from("staff")
    .select(`
        user_id,
        phone_number,
        role,
        status,
        created_at,
        profiles:user_id (full_name, email, avatar_url)
    `)
    .eq('user_id', id)
    .single();

    if (error) {
        console.error(error);
        throw new Error("Staff member not found");
    }

    return data as any as Staff;
}

export async function updateStaff(id: string, updates: any) {
    const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('user_id', id)
        .select()
        .single();
    if (error) throw new Error("Could not update staff");
    return data;
}

export async function deleteStaff(id: string) {
    const { error } = await supabase.from('staff').delete().eq('user_id', id);
    if (error) throw new Error("Could not delete staff");
}

export async function createStaff(newStaff: any) {
    // In a real application, this would trigger an Invite User flow via Supabase Admin API / Edge Function.
    // Client-side code cannot create auth.users directly.
    // For this demo/refactor, we will mock the response.
    console.warn("Mocking staff creation as client cannot create Auth users directly.");
    
    return {
        user_id: `mock-${Date.now()}`,
        ...newStaff,
        created_at: new Date().toISOString()
    };
}
