
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { Property, Tenant, Staff } from '../types';
import { ChevronLeft, MapPin, Building2, Users, ArrowUpRight, Plus, Mail, Edit2, Trash2, X, ShieldCheck } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'Residential' as any,
    units: 0,
    occupancy: 0,
    image: ''
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const [p, allTenants, allStaff] = await Promise.all([
      db.properties.get(id!),
      db.tenants.list(),
      db.staff.list()
    ]);
    
    if (p) {
      setProperty(p);
      setFormData({
        name: p.name,
        address: p.address,
        type: p.type,
        units: p.units,
        occupancy: p.occupancy,
        image: p.image
      });
      setTenants(allTenants.filter(t => t.propertyName === p.name));
      setStaff(allStaff.filter(s => s.assignedPropertyIds.includes(p.id)));
    } else {
      navigate('/properties');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await db.properties.update(id, formData);
      setIsEditModalOpen(false);
      loadData();
    }
  };

  const handleDelete = async () => {
    if (id) {
      await db.properties.delete(id);
      navigate('/properties');
    }
  };

  if (!property) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/properties')}
          className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-500"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <MapPin size={14} /> {property.address}
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-500"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-96 rounded-[40px] overflow-hidden shadow-xl">
            <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm">
              {property.type} Portfolio
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenants Section */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Active Tenants</h3>
                <button 
                  onClick={() => navigate('/tenants')}
                  className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              {tenants.length > 0 ? (
                <div className="space-y-4">
                  {tenants.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => navigate(`/tenants/${t.id}`)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">{t.unitId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">No tenants.</div>
              )}
            </div>

            {/* Staff Section */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Assigned Team</h3>
                <button 
                  onClick={() => navigate('/staff')}
                  className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  <ShieldCheck size={16} /> Manage
                </button>
              </div>
              {staff.length > 0 ? (
                <div className="space-y-4">
                  {staff.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => navigate(`/staff/${s.id}`)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={s.avatar || `https://picsum.photos/seed/${s.id}/100`} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">{s.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">No staff assigned.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-black text-white p-8 rounded-[40px] space-y-8">
            <h3 className="font-bold text-lg">Portfolio Health</h3>
            <div className="grid grid-cols-2 gap-8">
               <div>
                 <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Occupancy</p>
                 <p className="text-3xl font-bold">{property.occupancy}%</p>
               </div>
               <div>
                 <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Units</p>
                 <p className="text-3xl font-bold">{property.units}</p>
               </div>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-orange-500" style={{width: `${property.occupancy}%`}}></div>
            </div>
            <button 
              onClick={() => alert('Opening vacancy manager...')}
              className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all"
            >
              Manage Vacancies
            </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900">Asset Location</h3>
            <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center text-gray-300">
               <div className="text-center">
                 <MapPin size={48} className="mx-auto mb-2 opacity-50" />
                 <p className="text-xs">Map View Unavailable</p>
               </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900">Address Line</p>
              <p className="text-sm text-gray-500 leading-relaxed">{property.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Name</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} >
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm" value={formData.units} onChange={e => setFormData({...formData, units: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  Save Changes
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
        title="Delete Asset"
        message="Are you sure you want to delete this property asset? This cannot be reversed."
      />
    </div>
  );
};
