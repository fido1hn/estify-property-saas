import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Staff as StaffType } from "../types";
import {
  Search,
  Plus,
  Filter,
  X,
  Trash2,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import { useStaff, useEditStaff, useDeleteStaff } from "../hooks/useStaff";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useCreateStaffInvite } from "../hooks/useStaffInvites";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";

export const Staff: React.FC = () => {
  const navigate = useNavigate();
  const { staff: staffList = [], isPending: isStaffLoading } = useStaff();

  const { editStf } = useEditStaff();
  const { deleteStf } = useDeleteStaff();
  const { createInvite, isCreating } = useCreateStaffInvite();
  const { organization } = useOrganization();
  const { profile } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const inviteModalRef = useRef<HTMLDivElement | null>(null);
  const editModalRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    status: "active" as any,
  });

  const handleOpenModal = (staff?: StaffType) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        status: staff.status,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        status: "active",
      });
    }
    setIsEditModalOpen(true);
  };

  const {
    register,
    handleSubmit: handleInviteSubmit,
    reset,
    formState: { errors: inviteErrors, isSubmitting: isInviteSubmitting },
  } = useForm<{ expires_at: string }>({
    defaultValues: { expires_at: "" },
  });

  useOutsideClick(inviteModalRef, () => setIsInviteOpen(false), isInviteOpen);
  useOutsideClick(
    editModalRef,
    () => setIsEditModalOpen(false),
    isEditModalOpen,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      editStf(
        {
          id: editingStaff.id,
          updates: {
            status: formData.status,
          },
        },
        {
          onSuccess: () => setIsEditModalOpen(false),
        },
      );
    }
  };

  const generateInviteCode = () =>
    Math.random().toString(36).slice(2, 10).toUpperCase();

  const handleInviteCreate = async (values: { expires_at: string }) => {
    setInviteError(null);
    if (!organization?.id) {
      setInviteError("Create an organization first.");
      return;
    }
    if (!profile?.id) {
      setInviteError("Missing user profile.");
      return;
    }
    const code = generateInviteCode();
    createInvite(
      {
        text_code: code,
        organization_id: organization.id,
        created_by: profile.id,
        status: "pending",
        expires_at: values.expires_at
          ? new Date(values.expires_at).toISOString()
          : null,
      },
      {
        onSuccess: (data) => {
          setGeneratedCode(data.text_code);
        },
        onError: (err: any) => {
          setInviteError(err?.message || "Could not create invite");
        },
      },
    );
  };

  const openInviteModal = () => {
    setGeneratedCode(null);
    setInviteError(null);
    reset({ expires_at: "" });
    setIsInviteOpen(true);
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
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
        },
      });
    }
  };

  if (isStaffLoading) return null;

  const filteredStaff = staffList.filter(
    (s) =>
      (s.profiles?.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      s.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage personnel supporting your properties.
            </p>
          </div>
          <button
            onClick={openInviteModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
            <Plus size={18} /> Invite Staff
          </button>
        </header>

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, role..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100">
              <Filter size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Personnel
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Assignments
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    onClick={() => navigate(`/staff/${staff.id}`)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            staff.profiles?.avatar_url ||
                            `https://picsum.photos/seed/${staff.id}/100`
                          }
                          className="w-10 h-10 rounded-xl object-cover"
                          alt={staff.profiles?.full_name}
                        />
                        <div>
                          <p className="font-bold text-gray-900">
                            {staff.profiles?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {staff.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                          <ShieldCheck size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          Staff
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-2">
                        {/* Assignments logic missing in DB Staff type, leaving empty/mock */}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          staff.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-400"
                        }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(staff);
                          }}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-orange-500">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => confirmDelete(e, staff.id)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={editModalRef}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Edit Staff</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  Update Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={inviteModalRef}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Invite Staff</h2>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleInviteSubmit(handleInviteCreate)}
              className="p-8 space-y-4">
              {inviteError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {inviteError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Expiry (optional)
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register("expires_at")}
                />
                {inviteErrors.expires_at && (
                  <p className="text-sm text-red-500">
                    {inviteErrors.expires_at.message}
                  </p>
                )}
              </div>

              {generatedCode && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center justify-between">
                  <span>
                    Invite code: <strong>{generatedCode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-green-700 font-bold">
                    Copy
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isInviteSubmitting || isCreating}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70">
                  {isCreating ? "Creating..." : "Generate Code"}
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
