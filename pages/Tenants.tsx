
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tenant } from '../types';
import { Search, Filter, Mail, Phone, MoreHorizontal, User } from 'lucide-react';
import { useTenants } from '../hooks/useTenants';

export const Tenants: React.FC = () => {
  const navigate = useNavigate();
  const { tenants = [], isPending } = useTenants();
  const [filter, setFilter] = useState('');

  const filteredTenants = tenants.filter(t => 
    (t.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (t.units?.properties?.name || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage lease agreements and resident information.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tenants..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100"><Filter size={20}/></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Property</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Lease End</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenants.map((tenant) => {
                const name = tenant.profiles?.full_name || 'Unknown';
                return (
                <tr 
                  key={tenant.user_id} 
                  onClick={() => navigate(`/tenants/${tenant.user_id}`)}
                  className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${!filteredTenants.includes(tenant) ? 'hidden' : ''}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-500">{tenant.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm md:text-base text-gray-600 font-medium">
                    {tenant.units?.properties?.name || 'Unassigned'}
                    <span className="block text-xs text-gray-400 font-normal">Unit {tenant.unit_id || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-5">
                     <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                       {tenant.lease_end}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tenant.status === 'active' ? 'bg-green-50 text-green-600' : 
                      tenant.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button className="float-right p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
