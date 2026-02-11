
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search, Filter, MoreHorizontal, Plus, X } from 'lucide-react';
import { useTenants } from '../hooks/useTenants';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { useCreateTenantInvite } from '../hooks/useTenantInvites';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../hooks/useOrganization';

export const Tenants: React.FC = () => {
  const navigate = useNavigate();
  const { tenants = [] } = useTenants();
  const { organization } = useOrganization();
  const { profile } = useAuth();
  const { createInvite, isCreating } = useCreateTenantInvite();
  const [filter, setFilter] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement | null>(null);

  const filteredTenants = tenants.filter(t => 
    (t.profiles?.full_name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (t.active_unit?.property_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  useOutsideClick(modalRef, () => setIsInviteOpen(false), isInviteOpen);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{
    expires_at: string;
  }>({
    defaultValues: {
      expires_at: '',
    },
  });

  const generateInviteCode = () =>
    Math.random().toString(36).slice(2, 10).toUpperCase();

  const onInviteSubmit = async (values: { expires_at: string }) => {
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
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null,
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
    reset({ expires_at: '' });
    setIsInviteOpen(true);
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
  };

  return (
    <div>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
            <p className="text-gray-500 mt-1">Manage residents and their occupancy.</p>
          </div>
          <button
            onClick={openInviteModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
            <Plus size={18} /> Invite Tenant
          </button>
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
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Unit</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map((tenant) => {
                  const name = tenant.profiles?.full_name || 'Unknown';
                  const activeUnit = tenant.active_unit;
                  return (
                  <tr 
                    key={tenant.id} 
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
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
                      {activeUnit?.property_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-5 text-sm md:text-base text-gray-600 font-medium">
                      {activeUnit?.unit_number ? `Unit ${activeUnit.unit_number}` : 'N/A'}
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

      {isInviteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div ref={modalRef} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Invite Tenant</h2>
              <button onClick={() => setIsInviteOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit(onInviteSubmit)} className="p-8 space-y-4">
              {inviteError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {inviteError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiry (optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  {...register('expires_at')}
                />
                {errors.expires_at && <p className="text-sm text-red-500">{errors.expires_at.message}</p>}
              </div>

              {generatedCode && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center justify-between">
                  <span>Invite code: <strong>{generatedCode}</strong></span>
                  <button type="button" onClick={handleCopy} className="text-green-700 font-bold">Copy</button>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isCreating}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70">
                  {isCreating ? "Creating..." : "Generate Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
