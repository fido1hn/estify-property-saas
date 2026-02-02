
import React from 'react';
import { Building2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#0f172a] text-white overflow-hidden">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
        
        {/* Abstract Shapes/Glassmorphism */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white mb-2">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            Estify
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed text-indigo-100">
              "The most intuitive property management platform I've ever used. It completely transformed how we handle our tenants and maintenance."
            </p>
            <footer className="text-sm text-indigo-300 font-medium">
              — Willie Ekom, Property Manager
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0f172a]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
            <p className="text-slate-400">{subtitle}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            {children}
          </div>
          
          <div className="text-center text-sm text-slate-500">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-indigo-400 transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-indigo-400 transition-colors">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
