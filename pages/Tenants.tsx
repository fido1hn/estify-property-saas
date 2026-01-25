
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tenant } from '../types';
import { Search, Filter, Mail, Phone, Calendar, Download, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { db } from '../services/dbService';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const Tenants: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    unitId: '',
    propertyName: '',
    leaseEnd: '',
    status: 'Active' as any
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    const data = await db.tenants.list();
    setTenants(data);
  };

  const handleOpenModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        email: tenant.email,
        unitId: tenant.unitId,
        propertyName: tenant.propertyName,
        leaseEnd: tenant.leaseEnd,
        status: tenant.status
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        email: '',
        unitId: '',
        propertyName: '',
        leaseEnd: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTenant) {
      await db.tenants.update(editingTenant.id, formData);
    } else {
      await db.tenants.create(formData);
    }
    setIsModalOpen(false);
    loadTenants();
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await db.tenants.delete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      loadTenants();
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage tenant profiles and lease agreements.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Exporting tenant list to CSV...')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <Plus size={18} /> New Tenant
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, property, unit..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100"><Filter size={20}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tenant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Property & Unit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Lease Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTenants.map((tenant) => (
                <tr 
                  key={tenant.id} 
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-medium text-gray-900">{tenant.propertyName}</p>
                    <p className="text-xs text-gray-500 font-bold">{tenant.unitId}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {new Date(tenant.leaseEnd).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tenant.status === 'Active' ? 'bg-green-50 text-green-600' : 
                      tenant.status === 'Notice' ? 'bg-orange-50 text-orange-600' : 
                      'bg-red-50 text-red-600'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(tenant); }} 
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-orange-500"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={(e) => confirmDelete(e, tenant.id)} 
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <input required type="email" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.propertyName} onChange={e => setFormData({...formData, propertyName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit ID</label>
                  <input required type="text" placeholder="e.g. U-101" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.unitId} onChange={e => setFormData({...formData, unitId: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lease Expiry</label>
                  <input required type="date" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.leaseEnd} onChange={e => setFormData({...formData, leaseEnd: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} >
                    <option>Active</option>
                    <option>Notice</option>
                    <option>Delinquent</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  {editingTenant ? 'Update Tenant' : 'Register Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Tenant"
        message="Are you sure you want to remove this tenant? Their access will be revoked immediately."
      />
    </div>
  );
};
