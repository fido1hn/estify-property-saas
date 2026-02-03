
import { supabase } from "./supabaseClient";

export async function getSummaryMetrics() {
    // These could be parallelized
    const { count: activeProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true });
    
    // New leads - mock or check tenants created recently?
    // Let's just mock "New Leads" for now as we don't have a 'leads' table.
    // Or we could count tenants added in last 30 days.
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const { count: newTenants } = await supabase.from('tenants')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', last30Days.toISOString());

    // Total sales - maybe sum of paid invoices?
    const { data: paidInvoices } = await supabase.from('invoices')
        .select('amount_kobo')
        .eq('status', 'paid');
    
    const totalRevenueCents = paidInvoices?.reduce((sum, inv) => sum + inv.amount_kobo, 0) || 0;
    const totalSales = `$${(totalRevenueCents / 100).toLocaleString()}`;

    // Overdue rent
    const { data: overdueInvoices } = await supabase.from('invoices')
        .select('amount_kobo')
        .eq('status', 'overdue');
    const overdueCents = overdueInvoices?.reduce((sum, inv) => sum + inv.amount_kobo, 0) || 0;
    const overdueRent = `$${(overdueCents / 100).toLocaleString()}`;

    // Other metrics for Analytics page
    // Net Yield, Churn Rate etc. - Mocking for complexity reduction
    const netYield = "5.2%";
    const churnRate = "2.4%";
    const avgRent = "$1,250";
    const maintenanceCost = "$4,200";

    // Maintenance stats
    const { data: maintenanceStats } = await supabase.from('maintenance_requests').select('status');
    const maintenanceCounts = {
        open: maintenanceStats?.filter(r => r.status === 'open').length || 0,
        in_progress: maintenanceStats?.filter(r => r.status === 'in_progress').length || 0,
        resolved: maintenanceStats?.filter(r => r.status === 'resolved').length || 0,
        total: maintenanceStats?.length || 0
    };

    return {
        activeProperties: activeProperties || 0,
        newLeads: newTenants || 0, 
        totalSales,
        overdueRent,
        netYield,
        churnRate,
        avgRent,
        maintenanceCost,
        maintenanceCounts
    };
}

export async function getFeaturedProperty() {
    // We get the first property and try to get its occupancy
    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
            *,
            units (id)
        `)
        .limit(1);
    
    if (error || !properties || properties.length === 0) return null;
    
    const prop = properties[0];
    const unitIds = prop.units?.map((u: any) => u.id) || [];
    
    let occupiedUnits = 0;
    if (unitIds.length > 0) {
        const { count } = await supabase
            .from('tenants')
            .select('*', { count: 'exact', head: true })
            .in('unit_id', unitIds)
            .eq('status', 'active');
        occupiedUnits = count || 0;
    }
    
    const totalUnits = prop.total_units || unitIds.length || 0;
    const occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    
    return {
        ...prop,
        occupancy
    };
}

export async function getMonthlyRevenue() {
    // In a real app, use a proper SQL group by. 
    // Supabase JS doesn't support complex group by easily without RPC.
    // Fetching last 6 months invoices and aggregating in JS.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data } = await supabase.from('invoices')
        .select('amount_kobo, paid_at')
        .eq('status', 'paid')
        .gte('paid_at', sixMonthsAgo.toISOString());
    
    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Initialize last 6 months data structure
    const result = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        result.push({
            month: months[d.getMonth()],
            revenue: 0,
            expenses: Math.floor(Math.random() * 5000) + 2000 // Mock expenses
        });
    }

    data?.forEach(inv => {
        if (!inv.paid_at) return;
        const date = new Date(inv.paid_at);
        const monthName = months[date.getMonth()];
        const entry = result.find(r => r.month === monthName);
        if (entry) {
            entry.revenue += (inv.amount_kobo / 100);
        }
    });

    return result;
}

export async function getOccupancyTrend() {
    // Mock data for trend
    return [
        { month: 'Jan', rate: 82 },
        { month: 'Feb', rate: 85 },
        { month: 'Mar', rate: 84 },
        { month: 'Apr', rate: 88 },
        { month: 'May', rate: 92 },
        { month: 'Jun', rate: 94 },
    ];
}

export async function getRevenueDistribution() {
    // Mock distribution based on property types
    // Or we could fetch properties and count types? 
    // Let's count properties by type for roughly aligned distribution
    const { data } = await supabase.from('properties').select('type');
    
    const distribution = {
        Residential: 0,
        Commercial: 0,
        Industrial: 0
    };

    data?.forEach((p: any) => {
        if (distribution[p.type as keyof typeof distribution] !== undefined) {
             distribution[p.type as keyof typeof distribution]++;
        }
    });

    // Convert to pie chart format
    return Object.keys(distribution).map(key => ({
        name: key,
        value: distribution[key as keyof typeof distribution]
    })).filter(d => d.value > 0);
}
