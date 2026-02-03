
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Staff as StaffType, StaffRole, Property } from '../types';
import { Search, Plus, Filter, Mail, Phone, X, Trash2, Edit2, ShieldCheck } from 'lucide-react';
import { useStaff, useCreateStaff, useEditStaff, useDeleteStaff } from '../hooks/useStaff';
import { useProperties } from '../hooks/useProperties';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const Staff: React.FC = () => {
  const navigate = useNavigate();
  const { staff: staffList = [], isPending: isStaffLoading } = useStaff();
  const { properties = [], isPending: isPropertiesLoading } = useProperties();
  
  const { createStf } = useCreateStaff();
  const { editStf } = useEditStaff();
  const { deleteStf } = useDeleteStaff();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'security' as StaffRole,
    assignedPropertyIds: [] as string[],
    status: 'active' as any
  });

  const handleOpenModal = (staff?: StaffType) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.profiles?.full_name || '',
        email: staff.profiles?.email || '',
        phone: staff.phone_number, // DB field name
        role: staff.role, 
        assignedPropertyIds: [], // TODO: Assignments not in basic staff type yet
        status: staff.status
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'security',
        assignedPropertyIds: [],
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      editStf({
        id: editingStaff.user_id,
        updates: {
          phone_number: formData.phone,
          role: formData.role,
          status: formData.status
        }
      }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createStf(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      deleteStf(itemToDelete, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }
      });
    }
  };

  if (isStaffLoading) return null;

  const filteredStaff = staffList.filter(s => 
    (s.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage personnel supporting your properties.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus size={18} /> New Staff Member
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, role..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100"><Filter size={20}/></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Assignments</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStaff.map((staff) => (
                <tr 
                  key={staff.user_id} 
                  onClick={() => navigate(`/staff/${staff.user_id}`)}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <img src={staff.profiles?.avatar_url || `https://picsum.photos/seed/${staff.user_id}/100`} className="w-10 h-10 rounded-xl object-cover" alt={staff.profiles?.full_name} />
                      <div>
                        <p className="font-bold text-gray-900">{staff.profiles?.full_name}</p>
                        <p className="text-xs text-gray-500">{staff.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600"><ShieldCheck size={14}/></div>
                       <span className="text-sm font-medium text-gray-900 capitalize">{staff.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex -space-x-2">
                      {/* Assignments logic missing in DB Staff type, leaving empty/mock */}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      staff.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(staff); }} 
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-orange-500"
                      >
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={(e) => confirmDelete(e, staff.user_id)} 
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

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{editingStaff ? 'Edit Profile' : 'Add New Staff'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                  <input required type="email" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                  <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} >
                     <option value="security">Security</option>
                     <option value="cleaning">Cleaning</option>
                     <option value="electrical">Electrical</option>
                     <option value="manager">Manager</option>
                     <option value="plumbing">Plumbing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/20">
                  {editingStaff ? 'Update Profile' : 'Register Staff'}
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
        title="Remove Staff Member"
        message="Are you sure you want to remove this personnel from the database?"
      />
    </div>
  );
};
