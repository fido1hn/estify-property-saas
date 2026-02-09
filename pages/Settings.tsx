

import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, CreditCard, Building, Globe, Moon, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization, useUpdateOrganization } from '../hooks/useOrganization';

export const Settings: React.FC = () => {
  const { authUser, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const { organization, isPending: isOrgLoading } = useOrganization();

  const TABS = [
    { id: 'profile', label: 'My Profile', icon: <User size={18}/> },
    { id: 'company', label: 'Company Settings', icon: <Building size={18}/> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18}/> },
    { id: 'security', label: 'Security', icon: <Shield size={18}/> },
    { id: 'billing', label: 'Plan & Billing', icon: <CreditCard size={18}/> },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your account and application preferences.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Settings Sidebar / Tabs */}
        <aside className="w-full lg:w-64 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-2 lg:pb-0 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs md:text-sm font-medium whitespace-nowrap shrink-0 lg:shrink ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-lg shadow-black/20' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 bg-white/50 lg:bg-transparent'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <main className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-5 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}`} alt="Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover" />
                <div className="text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">{profile?.full_name || 'User'}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{profile?.email} • Since {new Date(authUser?.created_at || Date.now()).toLocaleDateString()}</p>
                  <div className="flex justify-center sm:justify-start gap-2 mt-4">
                    <button className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold rounded-xl hover:bg-gray-100 transition-colors">Change Photo</button>
                    {/* <button className="px-3 py-1.5 text-red-500 text-[10px] font-bold hover:bg-red-50 rounded-xl transition-colors">Remove</button> */}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <InputGroup label="Full Name" value={profile?.full_name || ''} />
                <InputGroup label="Email Address" value={profile?.email || ''} />
                <InputGroup label="User ID" value={authUser?.id || ''} />
              </div>

              <div className="pt-6 border-t border-gray-50">
                <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Preferences</h4>
                <div className="space-y-4">
                  <ToggleItem label="Public Profile" description="Allow others to see your manager profile" defaultChecked={true} />
                  <ToggleItem label="Dark Mode" description="Switch the interface to dark colors" defaultChecked={false} />
                  <ToggleItem label="Developer Mode" description="Enable API features and log visibility" defaultChecked={true} />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
                <button className="px-6 py-2.5 text-xs md:text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                <button className="px-8 py-2.5 bg-black text-white text-xs md:text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <CompanySettings organization={organization} isPending={isOrgLoading} />
          )}

          {activeTab !== 'profile' && activeTab !== 'company' && (
            <div className="flex flex-col items-center justify-center min-h-[300px] md:h-96 text-gray-400 p-8 text-center">
              <div className="p-4 md:p-6 bg-gray-50 rounded-full mb-4">
                {TABS.find(t => t.id === activeTab)?.icon}
              </div>
              <h3 className="text-gray-900 font-bold mb-1 text-sm md:text-base">{TABS.find(t => t.id === activeTab)?.label} Module</h3>
              <p className="text-xs md:text-sm max-w-xs">This module is part of the Enterprise plan. Please contact support to enable advanced configuration.</p>
              <button className="mt-6 px-6 py-3 bg-orange-500 text-white text-xs md:text-sm font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">Upgrade Now</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{label: string, value: string}> = ({label, value}) => (
  <div className="space-y-1 md:space-y-2">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      defaultValue={value} 
      className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-xs md:text-sm font-medium text-gray-900" 
    />
  </div>
);

const ToggleItem: React.FC<{label: string, description: string, defaultChecked: boolean}> = ({label, description, defaultChecked}) => (
  <div className="flex items-center justify-between group cursor-pointer p-1 rounded-2xl hover:bg-gray-50 transition-colors">
    <div className="pr-4">
      <p className="text-xs md:text-sm font-bold text-gray-900">{label}</p>
      <p className="text-[10px] md:text-xs text-gray-500">{description}</p>
    </div>
    <div className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative shrink-0 ${defaultChecked ? 'bg-orange-500' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${defaultChecked ? 'right-0.5 md:right-1' : 'left-0.5 md:left-1'}`}></div>
    </div>
  </div>
);
const CompanySettings: React.FC<{organization: any, isPending: boolean}> = ({ organization, isPending }) => {
  const { updateOrg, isUpdating } = useUpdateOrganization();
  const [name, setName] = useState(organization?.name || '');
  
  useEffect(() => {
    if (organization) setName(organization.name);
  }, [organization]);

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrg({ name });
  };

  if (isPending) return <div className="p-8 flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="p-5 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">
            {name?.charAt(0) || 'E'}
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{name || 'Estify Property'}</h3>
          <p className="text-xs md:text-sm text-gray-500">Enterprise Asset Management Portal</p>
        </div>
      </div>

      <form onSubmit={handleOrgSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1 md:space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organization Name</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-xs md:text-sm font-medium text-gray-900" 
                />
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
            <button type="submit" disabled={isUpdating} className="px-8 py-2.5 bg-black text-white text-xs md:text-sm font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2">
                {isUpdating && <Loader2 size={14} className="animate-spin" />}
                Update Organization
            </button>
        </div>
      </form>
    </div>
  );
};
