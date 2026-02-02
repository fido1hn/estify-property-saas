
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Mail, Lock, User, Building, Loader2, CheckCircle, Briefcase, Key } from 'lucide-react';
import { Database } from '../../types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'owner' as UserRole,
    organizationName: '',
    organizationId: '', // For joining existing orgs
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const selectRole = (role: UserRole) => {
    setFormData({ ...formData, role });
    setStep(3);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign Up User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('No user data returned');

      let orgId = formData.organizationId;

      // 2. Create Organization (if Owner)
      if (formData.role === 'owner') {
         const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.organizationName,
          })
          .select()
          .single();
          
         if (orgError) throw orgError;
         orgId = orgData.id;
      } else {
        // Validation: Verify Org ID exists
        if (!orgId) throw new Error("Organization ID is required");
        // Optional: Check if org exists
      }

      // 3. Create Profile
      // Note: Triggers might handle this, but explicit creation ensures data integrity if triggers aren't set up
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          organization_id: orgId,
        });
        
      if (profileError) {
         // If a trigger already created the profile, this might fail with duplicate key. 
         // We can try to update instead if that happens, or ignore if specific error.
         // For now, assume we need to create it.
         console.warn("Profile creation error (might be handled by trigger):", profileError);
      }

      // 4. Assign Role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          user_role: formData.role,
        });

      if (roleError) throw roleError;

      // Success
      navigate('/');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }
      // Simple email validation
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Please enter a valid email");
        return;
      }
      setStep(2);
      setError(null);
    }
  };

  return (
    <AuthLayout 
      title="Create an account" 
      subtitle={step === 1 ? "Enter your details to get started" : step === 2 ? "Select your account type" : "Finalize your setup"}
    >
      <div className="space-y-6">
         {/* Progress Steps */}
         <div className="flex justify-center mb-6">
           <div className="flex items-center space-x-2">
             <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
             <div className={`w-8 h-1 rounded ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
             <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
             <div className={`w-8 h-1 rounded ${step >= 3 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
             <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
           </div>
         </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => selectRole('owner')}
                className="group relative flex flex-col items-center p-6 border-2 border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-900/50 transition-all"
              >
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-3 transition-colors">
                  <Building className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Property Owner</h3>
                <p className="text-sm text-slate-400 text-center mt-1">I own properties and want to manage tenants and maintenance.</p>
              </button>

              <button
                type="button"
                onClick={() => selectRole('tenant')}
                className="group relative flex flex-col items-center p-6 border-2 border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-900/50 transition-all"
              >
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-3 transition-colors">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Tenant</h3>
                <p className="text-sm text-slate-400 text-center mt-1">I rent a property and want to pay bills and request repairs.</p>
              </button>
              
               <button
                type="button"
                onClick={() => selectRole('staff')}
                className="group relative flex flex-col items-center p-6 border-2 border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-900/50 transition-all"
              >
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-3 transition-colors">
                  <Briefcase className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Staff</h3>
                <p className="text-sm text-slate-400 text-center mt-1">I work for a property management company.</p>
              </button>
            </div>
            <button
               type="button"
               onClick={() => setStep(1)}
               className="w-full text-slate-400 hover:text-white mt-4"
            >
               Back
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {formData.role === 'owner' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Organization Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="organizationName"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="My Property Management Co."
                    value={formData.organizationName}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-xs text-slate-500">This will be the name of your management workspace.</p>
              </div>
            ) : (
               <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Organization / Invite ID</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="organizationId"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="e.g. 123e4567-e89b..."
                    value={formData.organizationId}
                    onChange={handleChange}
                  />
                </div>
                 <p className="text-xs text-slate-500">Enter the ID provided by your property manager.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
            <button
               type="button"
               onClick={() => setStep(2)}
               className="w-full text-slate-400 hover:text-white mt-2"
            >
               Back
            </button>
          </form>
        )}

        {step === 1 && (
            <div className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
            </Link>
            </div>
        )}
      </div>
    </AuthLayout>
  );
}
