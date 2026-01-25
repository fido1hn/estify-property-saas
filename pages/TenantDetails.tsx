
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { Tenant } from '../types';
import { ChevronLeft, Mail, Phone, Calendar, Building2, CreditCard, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const TenantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    const t = await db.tenants.get(id!);
    if (t) setTenant(t);
    else navigate('/tenants');
  };

  const handleDelete = async () => {
    if (id) {
      await db.tenants.delete(id);
      navigate('/tenants');
    }
  };

  if (!tenant) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/tenants')} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500">{tenant.propertyName} • {tenant.unitId}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500"><Edit2 size={18} /></button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-[32px] bg-orange-100 text-orange-600 flex items-center justify-center text-4xl font-bold shrink-0">
                {tenant.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="flex items-center gap-3 text-gray-600">
                     <Mail size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">{tenant.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600">
                     <Phone size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">+1 (555) 123-4567</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600">
                     <Building2 size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">{tenant.propertyName} - {tenant.unitId}</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600">
                     <Calendar size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">Lease ends {new Date(tenant.leaseEnd).toLocaleDateString()}</span>
                   </div>
                </div>
                <div className="pt-6 border-t border-gray-50">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    tenant.status === 'Active' ? 'bg-green-50 text-green-600' : 
                    tenant.status === 'Notice' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                  }`}>
                    Status: {tenant.status}
                  </span>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>
             <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Rent Payment - Oct 2023</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Processed on Oct 01, 2023</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">$1,250.00</span>
                  </div>
                ))}
             </div>
           </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900 text-white p-8 rounded-[40px] space-y-6">
            <h3 className="font-bold text-lg">Quick Actions</h3>
            <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all">Send Message</button>
            <button className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">Request Documents</button>
            <button className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all">Renew Lease</button>
          </div>

          <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 space-y-4">
             <div className="flex items-center gap-2 text-orange-600">
               <AlertCircle size={20} />
               <h3 className="font-bold">Administrative Note</h3>
             </div>
             <p className="text-sm text-orange-700 leading-relaxed">
               Tenant has requested a move-out inspection for late November. Ensure the maintenance team is notified.
             </p>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Tenant"
        message="Are you sure you want to remove this tenant from the system? Their lease history will be archived."
      />
    </div>
  );
};
