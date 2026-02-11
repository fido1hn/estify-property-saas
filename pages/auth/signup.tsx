import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import {
  Mail,
  Lock,
  User,
  Building,
  Loader2,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { Database } from "../../types/database.types";
import { useSignUp } from "../../hooks/useSignUp";

type UserRole = Database["public"]["Enums"]["user_role"];

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signUp, completeOwnerSetup, redeemTenantInvite, redeemStaffInvite, loading, error, clearError } = useSignUp();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: "",
    organizationName: "",
    inviteCode: "",
  });

  useEffect(() => {
    const onboarding = searchParams.get("onboarding") === "1";
    const stepParam = Number(searchParams.get("step") || "1");
    if (onboarding && stepParam >= 2) {
      setStep(stepParam);
      if (!userId) {
        const storedUserId = sessionStorage.getItem("signup_user_id");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      }
    }
  }, [searchParams, userId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    fullName: string;
    email: string;
    password: string;
  }>();

  const selectRole = (role: UserRole) => {
    if (!userId) return;
    setFormData({ ...formData, role });
    setSearchParams({ onboarding: "1", step: "3" }, { replace: true });
    setStep(3);
  };

  const onSubmitStepOne = async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    clearError();
    sessionStorage.setItem("signup_onboarding", "1");
    const { error, userId } = await signUp({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });

    if (!error && userId) {
      setUserId(userId);
      sessionStorage.setItem("signup_user_id", userId);
      setSearchParams({ onboarding: "1", step: "2" }, { replace: true });
      setStep(2);
    } else {
      sessionStorage.removeItem("signup_onboarding");
    }
  };

  const handleOrgSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (formData.role === "owner") {
      const { error } = await completeOwnerSetup({
        userId,
        role: formData.role as UserRole,
        organizationName: formData.organizationName,
      });

      if (!error) {
        sessionStorage.removeItem("signup_user_id");
        sessionStorage.removeItem("signup_onboarding");
        navigate("/");
      }
      return;
    }

    if (formData.role === "tenant") {
      const { error } = await redeemTenantInvite({
        userId,
        inviteCode: formData.inviteCode.trim(),
      });

      if (!error) {
        sessionStorage.removeItem("signup_user_id");
        sessionStorage.removeItem("signup_onboarding");
        navigate("/");
      }
    }

    if (formData.role === "staff") {
      const { error } = await redeemStaffInvite({
        userId,
        inviteCode: formData.inviteCode.trim(),
      });

      if (!error) {
        sessionStorage.removeItem("signup_user_id");
        sessionStorage.removeItem("signup_onboarding");
        navigate("/");
      }
    }
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, organizationName: e.target.value });
    clearError();
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, inviteCode: e.target.value });
    clearError();
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle={
        step === 1
          ? "Enter your details to get started"
          : step === 2
            ? "Select your account type"
            : "Finalize your setup"
      }>
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-indigo-500" : "bg-slate-700"}`}></div>
            <div
              className={`w-8 h-1 rounded ${step >= 2 ? "bg-indigo-500" : "bg-slate-700"}`}></div>
            <div
              className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-indigo-500" : "bg-slate-700"}`}></div>
            <div
              className={`w-8 h-1 rounded ${step >= 3 ? "bg-indigo-500" : "bg-slate-700"}`}></div>
            <div
              className={`w-3 h-3 rounded-full ${step >= 3 ? "bg-indigo-500" : "bg-slate-700"}`}></div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form
            onSubmit={handleSubmit(onSubmitStepOne)}
            className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="John Doe"
                  {...register("fullName", {
                    required: "Full name is required",
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="name@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
              {loading ? "Saving..." : "Next Step"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => selectRole("owner")}
                className="group relative flex flex-col items-center p-6 border-2 border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-900/50 transition-all">
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-3 transition-colors">
                  <Building className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Property Owner
                </h3>
                <p className="text-sm text-slate-400 text-center mt-1">
                  I own properties and want to manage tenants and maintenance.
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectRole("tenant")}
                className="group relative flex flex-col items-center p-6 border-2 border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-900/50 transition-all">
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-3 transition-colors">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Tenant</h3>
                <p className="text-sm text-slate-400 text-center mt-1">
                  I have an invite code from a property owner.
                </p>
              </button>

              <button
                type="button"
                onClick={() => selectRole("staff")}
                className="group relative flex flex-col items-center p-6 border-2 border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-900/50 transition-all">
                <div className="p-3 rounded-full bg-slate-900 group-hover:bg-indigo-500/10 mb-3 transition-colors">
                  <Briefcase className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Staff</h3>
                <p className="text-sm text-slate-400 text-center mt-1">
                  I have an invite code from a property owner.
                </p>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchParams({ onboarding: "1", step: "1" }, { replace: true });
                setStep(1);
              }}
              className="w-full text-slate-400 hover:text-white mt-4">
              Back
            </button>
          </div>
        )}

        {step === 3 && (
          <form
            onSubmit={handleOrgSetup}
            className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {formData.role === "owner" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Organization Name
                </label>
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
                    onChange={handleOrgNameChange}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  This will be the name of your management workspace.
                </p>
              </div>
            )}

            {(formData.role === "tenant" || formData.role === "staff") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Invite Code
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="inviteCode"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    placeholder="Enter invite code"
                    value={formData.inviteCode}
                    onChange={handleInviteCodeChange}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Your property owner should have provided this code.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
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
              onClick={() => {
                setSearchParams({ onboarding: "1", step: "2" }, { replace: true });
                setStep(2);
              }}
              className="w-full text-slate-400 hover:text-white mt-2">
              Back
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
