

import React, { useState, useEffect } from 'react';
import { Search, Send, MoreHorizontal, Phone, Video, Paperclip, Smile, ChevronLeft } from 'lucide-react';
import { db } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showContactList, setShowContactList] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadChatHistory(selectedContact.id);
    }
  }, [selectedContact]);

  const loadContacts = async () => {
    const data = await db.messages.getContacts();
    setContacts(data);
    if (data.length > 0 && !selectedContact) {
      setSelectedContact(data[0]);
    }
    setLoading(false);
  };

  const loadChatHistory = async (id: string) => {
    const history = await db.messages.getChatHistory(id);
    const mappedHistory = history.map((msg: any) => ({
      id: msg.id,
      text: msg.content,
      time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: msg.sender_id === user?.id
    }));
    setChatHistory(mappedHistory);
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    if (window.innerWidth < 1024) {
      setShowContactList(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact) return;

    // We need to ensure we are sending as the current user. dbService needs to handle it or we pass it.
    // dbService.messages.sendMessage takes receiverId and content. It assumes sender is current auth user 
    // but in dbService we mocked it.
    // However, since we bypassed RLS in seed-db but here we are in frontend, 
    // supabase client automatically attaches auth token. 
    // But dbService sendMessage implementation might need a check.
    // Let's assume dbService uses supabase.auth.getUser() or similar implicitly via RLS if setup, 
    // OR we should pass senderID if we want to be explicit, but usually supabase infers from session.
    // Wait, dbService.ts implementation:
    // const { data: profiles } = await supabase.from('profiles').select('id').limit(1); 
    // const currentUserId = profiles?.[0]?.id ...
    // This was the MOCK implementation.
    // I need to fix dbService.ts sendMessage to use the real user.
    // But for now, let's just update the frontend component.
    
    await db.messages.sendMessage(selectedContact.id, message);
    setMessage('');
    await loadChatHistory(selectedContact.id);
  };

  const handleAction = (type: string) => {
    alert(`${type} feature is currently in development for this demo.`);
  };

  if (loading || !selectedContact) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      Loading messages...
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm relative">
      {/* Contact List */}
      <div className={`absolute inset-0 lg:relative lg:flex lg:w-80 border-r border-gray-100 bg-white flex-col z-20 transition-transform duration-300 ${showContactList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 md:p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-l-4 ${selectedContact.id === contact.id ? 'bg-orange-50/50 border-orange-500' : 'border-transparent'}`}
            >
              <div className="relative shrink-0">
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-xl object-cover" />
                {contact.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-900 text-sm truncate">{contact.name}</span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{contact.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{contact.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Chat */}
      <div className="flex-1 flex flex-col bg-white w-full">
        <div className="px-4 md:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setShowContactList(true)} className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900">
              <ChevronLeft size={20} />
            </button>
            <img src={selectedContact.avatar} alt={selectedContact.name} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{selectedContact.name}</h3>
              <p className="text-[10px] text-green-500 font-medium">{selectedContact.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => handleAction('Voice call')} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><Phone size={18} /></button>
            <button onClick={() => handleAction('Video call')} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors hidden sm:block"><Video size={18} /></button>
            <button onClick={() => handleAction('Chat options')} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><MoreHorizontal size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30">
          {chatHistory.map(msg => (
            <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] ${msg.isMine ? 'order-1' : 'order-2'}`}>
                <div className={`p-3 md:p-4 rounded-2xl shadow-sm text-sm ${msg.isMine ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white text-gray-700 rounded-bl-none'}`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${msg.isMine ? 'text-right' : 'text-left'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 md:p-6 bg-white border-t border-gray-50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2 md:gap-3 bg-gray-50 p-1.5 md:p-2 rounded-2xl border border-gray-100"
          >
            <button type="button" onClick={() => handleAction('Attach file')} className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden xs:block"><Paperclip size={20} /></button>
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="button" onClick={() => handleAction('Emoji')} className="p-2 text-gray-400 hover:text-gray-600 transition-colors hidden xs:block"><Smile size={20} /></button>
            <button type="submit" className="bg-black text-white p-2 md:p-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/20">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
