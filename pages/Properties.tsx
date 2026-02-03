
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { Plus, Filter, MoreHorizontal, MapPin, X, Trash2, Edit2, Eye } from 'lucide-react';
import { useProperties, useCreateProperty, useEditProperty, useDeleteProperty } from '../hooks/useProperties';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { properties = [], isPending } = useProperties();
  const { createProperty } = useCreateProperty();
  const { editProperty } = useEditProperty();
  const { deleteProp } = useDeleteProperty();

  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'Residential' as any,
    units: 0,
    occupancy: 0,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
  });

  const handleOpenModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        address: property.address,
        type: property.type,
        units: property.total_units,
        occupancy: property.occupancy,
        image: property.image_url || ''
      });
    } else {
      setEditingProperty(null);
      setFormData({
        name: '',
        address: '',
        type: 'Residential',
        units: 0,
        occupancy: 0,
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      editProperty({ newPropertyData: formData, id: editingProperty.id }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createProperty(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      deleteProp(itemToDelete, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }
      });
    }
  };

  if (isPending) return null; // Or a loader

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your buildings and real estate assets.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter size={18} /> Filters
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <Plus size={18} /> New Property
          </button>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Residential', 'Commercial', 'Industrial'].map(t => (
          <button 
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white border border-gray-100 text-gray-500 hover:border-gray-300'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.filter(p => filter === 'All' || p.type === filter).map(property => (
          <div key={property.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <img src={property.image_url} alt={property.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900">
                {property.type}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-orange-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => handleOpenModal(property)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-orange-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => confirmDelete(property.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{property.name}</h3>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                <MapPin size={14} />
                <span className="truncate">{property.address}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Units</p>
                  <p className="font-bold text-gray-900">{property.total_units}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Occupancy</p>
                  <p className="font-bold text-orange-500">{property.occupancy}%</p>
                </div>
              </div>

              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{width: `${property.occupancy}%`}}></div>
              </div>

              <button 
                onClick={() => navigate(`/properties/${property.id}`)}
                className="w-full mt-5 py-3 bg-gray-50 hover:bg-black hover:text-white text-gray-900 font-bold rounded-2xl transition-all"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => handleOpenModal()}
          className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <Plus size={32} />
          </div>
          <span className="font-bold">Add New Property</span>
        </button>
      </div>

      {/* Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">{editingProperty ? 'Edit Property' : 'Add Property'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    value={formData.units}
                    onChange={e => setFormData({...formData, units: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image URL</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  {editingProperty ? 'Save Changes' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
      />
    </div>
  );
};
