
import { supabase } from "./supabaseClient";

export async function getContacts() {
    // 'role' column does not exist on profiles. 
    // If we need the role, we would need to join with 'staff' or 'user_roles' tables.
    // For now, we will fetch basic profile info to avoid the error.
    const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url') 
    .limit(50); // Pagination could be added

    if (error) {
        console.error(error);
        throw new Error("Contacts could not be loaded");
    }
  
    return (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name,
        role: 'User', // Placeholder as we removed the invalid 'role' column selection
        lastMsg: 'Hello there!', // Mock for now, requires joins with messages
        time: '10:30 AM', 
        avatar: p.avatar_url || 'https://ui-avatars.com/api/?name=' + p.full_name,
        online: Math.random() > 0.5 // Mock
    }));
}

export async function getChatHistory(contactId: string) {
    // In a real app, we would query the messages table where sender/receiver is current user or contact
    // For now returning the mock data from original service or implementing query
    // Let's implement the query assuming a 'messages' table exists
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

    if (error) {
        // Fallback to mock if table doesn't exist
        console.warn("Messages table query failed, returning mock", error);
        return [
            { id: '1', sender_id: contactId, receiver_id: user.id, content: 'Hi, is the unit still available?', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: true },
            { id: '2', sender_id: user.id, receiver_id: contactId, content: 'Yes it is.', created_at: new Date().toISOString(), is_read: true }
        ];
    }
    return data;
}

export async function sendMessage(receiverId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('messages')
        .insert([{ sender_id: user.id, receiver_id: receiverId, content, is_read: false }])
        .select()
        .single();
    
    if (error) throw new Error("Message could not be sent");
    return data;
}
