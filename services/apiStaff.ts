
import { supabase } from "./supabaseClient";
import { Staff } from "../types";
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

    const formattedData: Staff[] = (data as any[] || []).map((s: any) => ({
        ...s,
        // Ensure id is mapped if needed by UI, but DB uses user_id as PK for staff?
        // Actually staff table has (user_id) as PK? 
        // Checking schema: staff PK is user_id? 
        // DB Schema in view_file showed: staff: { Row: { user_id, ... } }. No separate 'id' column on staff table?
        // Wait, looking at database.types.ts: 
        // staff: { Row: { created_at: string, phone_number: string, role: ..., status: ..., user_id: string } }
        // THERE IS NO 'id' COLUMN in staff table. Just 'user_id' which is likely PK.
        // My extended Staff type extends StaffRow.
        // So it has user_id, no id.
        // The UI likely expects 'id'.
        // If I want to match DB types, I should use 'user_id'. 
        // But React lists often need `id`.
        // However, "should any part of our program not agree... be changes to reflect ... db".
        // So I will return `user_id` inside the object, and if UI needs key, it should use user_id.
    }));

    return { data: formattedData, count };
}
