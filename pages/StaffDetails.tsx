
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffMember, useDeleteStaff } from '../hooks/useStaff';
import { useProperties } from '../hooks/useProperties';
import { Staff, Property } from '../types';
import { ChevronLeft, Mail, Phone, Calendar, Building2, Trash2, Edit2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const StaffDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { staffMember: staff, isPending: isStaffLoading } = useStaffMember(id!);
  const { properties: allProperties = [], isPending: isPropertiesLoading } = useProperties();
  const { deleteStf, isDeleting } = useDeleteStaff();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    if (id) {
      deleteStf(id, {
        onSuccess: () => navigate('/staff')
      });
    }
  };

  if (isStaffLoading) return null;
  if (!staff) return null;

  const properties = allProperties.filter(p => false); // Assignments mock logic


  const name = staff.profiles?.full_name || 'Unknown';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/staff')} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500">{staff.role} • Employee ID: {staff.user_id}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-500"><Edit2 size={18} /></button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
              <img src={staff.profiles?.avatar_url || `https://picsum.photos/seed/${staff.user_id}/200`} className="w-32 h-32 rounded-[32px] object-cover shrink-0" />
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="flex items-center gap-3 text-gray-600">
                     <Mail size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">{staff.profiles?.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600">
                     <Phone size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">{staff.phone_number}</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600">
                     <ShieldCheck size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">{staff.role} Specialization</span>
                   </div>
                   <div className="flex items-center gap-3 text-gray-600">
                     <CheckCircle2 size={18} className="text-orange-500" />
                     <span className="text-sm font-medium">Background Verified</span>
                   </div>
                </div>
                <div className="pt-6 border-t border-gray-50">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    staff.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    Current Status: {staff.status}
                  </span>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6">Assigned Properties</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {properties.map(p => (
                  <div key={p.id} onClick={() => navigate(`/properties/${p.id}`)} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors cursor-pointer group">
                    <img src={p.image_url || ''} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.address}</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>

        <div className="space-y-8">
          <div className="bg-black text-white p-8 rounded-[40px] space-y-6">
            <h3 className="font-bold text-lg">Staff Actions</h3>
            <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all">Assign New Task</button>
            <button className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">Download Contract</button>
            <button className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all">Contact Staff</button>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
             <h3 className="font-bold text-gray-900">Performance Rating</h3>
             <div className="flex gap-1">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className={`w-8 h-2 rounded-full ${i <= 4 ? 'bg-orange-500' : 'bg-gray-100'}`}></div>
               ))}
             </div>
             <p className="text-xs text-gray-500">Based on 12 tenant feedback responses this month.</p>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Staff"
        message="Are you sure you want to terminate this staff profile? This won't affect past payroll records."
      />
    </div>
  );
};
