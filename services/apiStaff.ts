
import { supabase } from "./supabaseClient";
import { Staff, StaffRole } from "../types";
import { PAGE_SIZE } from "../utils/constants";

export async function getStaffList({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
    let query = supabase
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

    const formattedData: Staff[] = (data || []).map((s: any) => ({
        id: s.user_id,
        name: s.profiles?.full_name || 'Unknown',
        email: s.profiles?.email || '',
        phone: s.phone_number,
        role: (s.role.charAt(0).toUpperCase() + s.role.slice(1)) as StaffRole,
        assignedPropertyIds: [], // TODO: implementations for assignments
        status: (s.status === 'active' ? 'Active' : 'Inactive') as any,
        avatar: s.profiles?.avatar_url
    }));

    return { data: formattedData, count };
}
