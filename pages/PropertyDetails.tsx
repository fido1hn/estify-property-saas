
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Property, UnitRow } from '../types';
import { ChevronLeft, MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useProperty, useEditProperty, useDeleteProperty } from '../hooks/useProperties';
import { useUnitsByProperty, useCreateUnit, useUpdateUnit, useDeleteUnit } from '../hooks/useUnits';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { useOutsideClick } from '../hooks/useOutsideClick';

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { property, isPending: isPropertyLoading } = useProperty(id!);
  const { units = [], isPending: isUnitsLoading } = useUnitsByProperty(id);
  
  const { editProperty } = useEditProperty();
  const { deleteProp } = useDeleteProperty();
  const { createUnit, isCreating: isUnitCreating } = useCreateUnit();
  const { updateUnit, isUpdating: isUnitUpdating } = useUpdateUnit();
  const { deleteUnit } = useDeleteUnit();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isUnitDeleteModalOpen, setIsUnitDeleteModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<UnitRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const unitModalRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{
    name: string;
    address: string;
    type: 'residential' | 'commercial';
    total_units: number;
    image_url: string;
  }>({
    defaultValues: {
      name: '',
      address: '',
      type: 'residential',
      total_units: 0,
      image_url: '',
    },
  });

  const {
    register: registerUnit,
    handleSubmit: handleSubmitUnit,
    reset: resetUnit,
    formState: { errors: unitErrors, isSubmitting: isUnitSubmitting },
  } = useForm<{
    unit_number: number;
    unit_description: string;
  }>({
    defaultValues: {
      unit_number: 1,
      unit_description: '',
    },
  });

  useEffect(() => {
    if (property) {
      reset({
        name: property.name,
        address: property.address,
        type: property.type,
        total_units: property.total_units,
        image_url: property.image_url || '',
      });
    }
  }, [property, reset]);

  useOutsideClick(modalRef, () => setIsEditModalOpen(false), isEditModalOpen);
  useOutsideClick(unitModalRef, () => setIsUnitModalOpen(false), isUnitModalOpen);

  const handleUpdate = async (values: {
    name: string;
    address: string;
    type: 'residential' | 'commercial';
    total_units: number;
    image_url: string;
  }) => {
    if (!id) return;
    if (!property?.organization_id) {
      setFormError("You need an organization before editing properties.");
      return;
    }
    editProperty(
      { data: values, id, organizationId: property.organization_id },
      {
        onSuccess: () => setIsEditModalOpen(false),
      },
    );
  };

  const handleDelete = async () => {
    if (id) {
      deleteProp(id, {
        onSuccess: () => navigate('/properties')
      });
    }
  };

  const handleOpenUnitModal = (unit?: UnitRow) => {
    if (unit) {
      setEditingUnit(unit);
      resetUnit({
        unit_number: unit.unit_number,
        unit_description: unit.unit_description || '',
      });
    } else {
      setEditingUnit(null);
      resetUnit({
        unit_number: 1,
        unit_description: '',
      });
    }
    setIsUnitModalOpen(true);
  };

  const handleUnitSubmit = async (values: {
    unit_number: number;
    unit_description: string;
  }) => {
    if (!property) return;

    if (editingUnit) {
      updateUnit(
        {
          id: editingUnit.id,
          updates: {
            unit_number: values.unit_number,
            unit_description: values.unit_description || null,
          },
        },
        {
          onSuccess: () => setIsUnitModalOpen(false),
        },
      );
      return;
    }

    createUnit(
      {
        property_id: property.id,
        unit_number: values.unit_number,
        unit_description: values.unit_description || null,
      },
      {
        onSuccess: () => setIsUnitModalOpen(false),
      },
    );
  };

  const confirmDeleteUnit = (unit: UnitRow) => {
    setUnitToDelete(unit);
    setIsUnitDeleteModalOpen(true);
  };

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;
    deleteUnit(unitToDelete.id, {
      onSuccess: () => {
        setIsUnitDeleteModalOpen(false);
        setUnitToDelete(null);
      },
    });
  };

  if (isPropertyLoading) return null;
  if (!property) return null;
  const unitCount = units?.length ?? property.total_units;

  return (
    <div>
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
            <img src={property.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} alt={property.name} className="w-full h-full object-cover" />
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm">
              {property.type} Portfolio
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Units</h3>
              <button 
                onClick={() => handleOpenUnitModal()}
                className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline"
              >
                <Plus size={16} /> Add Unit
              </button>
            </div>
            {isUnitsLoading ? (
              <div className="text-center py-6 text-gray-400 text-sm">Loading units...</div>
            ) : units.length > 0 ? (
              <div className="space-y-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Unit {unit.unit_number}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {unit.unit_description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenUnitModal(unit)}
                        className="p-2 bg-white rounded-xl text-gray-600 hover:text-orange-500 shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDeleteUnit(unit)}
                        className="p-2 bg-white rounded-xl text-gray-600 hover:text-red-500 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">No units yet.</div>
            )}
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
                 <p className="text-3xl font-bold">{unitCount}</p>
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
          <div ref={modalRef} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit(handleUpdate)} className="p-8 space-y-4">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register('name', { required: 'Property name is required' })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    {...register('type')}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    {...register('total_units', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Total units must be 0 or more' },
                    })}
                  />
                  {errors.total_units && (
                    <p className="text-sm text-red-500">{errors.total_units.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image URL</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register('image_url')}
                />
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message="Are you sure you want to delete this property asset? This cannot be reversed."
      />

      {/* Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div ref={unitModalRef} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUnit ? "Edit Unit" : "Add Unit"}
              </h2>
              <button onClick={() => setIsUnitModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitUnit(handleUnitSubmit)} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Number</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...registerUnit('unit_number', {
                    valueAsNumber: true,
                    required: 'Unit number is required',
                    min: { value: 1, message: 'Unit number must be 1 or more' },
                  })}
                />
                {unitErrors.unit_number && <p className="text-sm text-red-500">{unitErrors.unit_number.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...registerUnit('unit_description')}
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUnitSubmitting || isUnitCreating || isUnitUpdating}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70">
                  {editingUnit ? "Save Unit" : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isUnitDeleteModalOpen}
        onClose={() => setIsUnitDeleteModalOpen(false)}
        onConfirm={handleDeleteUnit}
        title="Delete Unit"
        message="Are you sure you want to delete this unit? This action cannot be undone."
      />
    </div>
  );
};
