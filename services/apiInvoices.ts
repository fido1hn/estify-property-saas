
import { supabase } from "./supabaseClient";
import { Invoice } from "../types";
import { PAGE_SIZE } from "../utils/constants";

export async function getInvoices({ filter, sortBy, page }: { filter?: any, sortBy?: any, page?: number } = {}) {
    let query = supabase
        .from('invoices')
        .select(`
            *,
            profiles:tenant_id (full_name)
        `, { count: 'exact' });

    if (filter && filter.value) {
         query = query.eq(filter.field, filter.value);
    }
    
    if (sortBy) {
        query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' });
    } else {
        query = query.order('due_date', { ascending: true });
    }

    if (page) {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) {
        console.error(error);
        throw new Error("Invoices could not be loaded");
    }
    
    const formattedData: Invoice[] = (data || []).map((inv: any) => ({
        id: inv.id,
        tenantName: inv.profiles?.full_name || 'Unknown',
        amount: inv.amount_kobo / 100,
        dueDate: inv.due_date,
        status: (inv.status === 'paid' ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Unpaid') as any
    }));

    return { data: formattedData, count };
}

export async function updateInvoice(id: string, updates: any) {
    const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
    if (error) throw new Error("Could not update invoice");
    return data;
}
