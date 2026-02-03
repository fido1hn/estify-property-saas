
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
    
    // Cast to any[] and map to Invoice type (which mirrors DB)
    const formattedData: Invoice[] = (data as any[] || []).map((inv: any) => ({
        ...inv
        // Invokes structured data matching InvoiceRow + profiles
    }));

    return { data: formattedData, count };
}

export async function updateInvoice(id: string, updates: any) {
    const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
    if (error) throw new Error("Could not update invoice");
    return data;
}
