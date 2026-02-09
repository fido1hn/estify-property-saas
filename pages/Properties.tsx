import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Property } from "../types";
import { Plus, Filter, MapPin, X, Trash2, Edit2, Eye } from "lucide-react";
import {
  useProperties,
  useCreateProperty,
  useEditProperty,
  useDeleteProperty,
} from "../hooks/useProperties";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { useAuth } from "../contexts/AuthContext";
import { useOutsideClick } from "../hooks/useOutsideClick";

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { properties = [], isPending } = useProperties();
  const { createProperty } = useCreateProperty();
  const { editProperty } = useEditProperty();
  const { deleteProp } = useDeleteProperty();

  const organizationId = profile?.organization_id || null;
  const [filter, setFilter] = useState<"all" | "residential" | "commercial">(
    "all",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(modalRef, () => setIsModalOpen(false), isModalOpen);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{
    name: string;
    address: string;
    type: "residential" | "commercial";
    total_units: number;
    image_url: string;
  }>({
    defaultValues: {
      name: "",
      address: "",
      type: "residential",
      total_units: 0,
      image_url:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
    },
  });

  const propertyTypes = [
    { label: "All", value: "all" as const },
    { label: "Residential", value: "residential" as const },
    { label: "Commercial", value: "commercial" as const },
  ];

  const handleOpenModal = (property?: Property) => {
    setFormError(null);
    if (property) {
      setEditingProperty(property);
      reset({
        name: property.name,
        address: property.address,
        type: property.type,
        total_units: property.total_units,
        image_url:
          property.image_url ||
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
      });
    } else {
      setEditingProperty(null);
      reset({
        name: "",
        address: "",
        type: "residential",
        total_units: 0,
        image_url:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (values: {
    name: string;
    address: string;
    type: "residential" | "commercial";
    total_units: number;
    image_url: string;
  }) => {
    if (!organizationId) {
      setFormError("You need an organization before creating properties.");
      return;
    }

    if (editingProperty) {
      editProperty(
        { data: values, id: editingProperty.id, organizationId },
        {
          onSuccess: () => setIsModalOpen(false),
        },
      );
      return;
    }

    createProperty(
      { data: values, organizationId },
      {
        onSuccess: () => setIsModalOpen(false),
      },
    );
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
        },
      });
    }
  };

  if (isPending) return null; // Or a loader

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">
            Manage your buildings and real estate assets.
          </p>
          {!organizationId && (
            <p className="mt-2 text-sm text-red-500">
              Create your organization first to add properties.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter size={18} /> Filters
          </button>
          <button
            onClick={() => handleOpenModal()}
            disabled={!organizationId}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed">
            <Plus size={18} /> New Property
          </button>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {propertyTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === t.value ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white border border-gray-100 text-gray-500 hover:border-gray-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties
          .filter((p) => filter === "all" || p.type === filter)
          .map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    property.image_url ||
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"
                  }
                  alt={property.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900">
                  {property.type}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-orange-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenModal(property)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-orange-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(property.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                  <MapPin size={14} />
                  <span className="truncate">{property.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Total Units
                    </p>
                    <p className="font-bold text-gray-900">
                      {property.total_units}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Occupancy
                    </p>
                    <p className="font-bold text-orange-500">
                      {property.occupancy}%
                    </p>
                  </div>
                </div>

                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${property.occupancy}%` }}></div>
                </div>

                <button
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="w-full mt-5 py-3 bg-gray-50 hover:bg-black hover:text-white text-gray-900 font-bold rounded-2xl transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}

        <button
          onClick={() => handleOpenModal()}
          disabled={!organizationId}
          className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all gap-4 disabled:opacity-60 disabled:cursor-not-allowed">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <Plus size={32} />
          </div>
          <span className="font-bold">Add New Property</span>
        </button>
      </div>

      {/* Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProperty ? "Edit Property" : "Add Property"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Property Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register("name", {
                    required: "Property name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register("address", { required: "Address is required" })}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Type
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    {...register("type")}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Total Units
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                    {...register("total_units", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Total units must be 0 or more",
                      },
                    })}
                  />
                  {errors.total_units && (
                    <p className="text-sm text-red-500">
                      {errors.total_units.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register("image_url")}
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70">
                  {editingProperty ? "Save Changes" : "Create Property"}
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
