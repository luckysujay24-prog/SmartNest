import React, { useState } from 'react';
import { useAuth } from '../../services/authContext';
import { Button } from '../ui/Button';
import {
  Building2,
  Shield,
  KeyRound,
  Home,
  Wrench,
  Receipt,
  CreditCard,
  AlertCircle,
  Megaphone,
  Store,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { UserRole } from '../../types';
import { PersonaSelectionModal } from '../auth/PersonaSelectionModal';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onSelectRole,
}) => {
  const [personaModalRole, setPersonaModalRole] = useState<UserRole | null>(null);

  const handleLaunchPersona = (role: UserRole) => {
    setPersonaModalRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none block">
                Smart<span className="text-blue-600">Nest</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5 tracking-wide">
                Residential OS & Multi-Apartment Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onOpenLogin}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenRegister}>
              Register Apartment / Flat
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-World Residential Management for Indian Apartments</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          SmartNest: Modern Living for Gated Societies & High-Rises
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Integrated platform connecting property owners, tenants, society admins, and gate watchmen.
          Private owner-tenant rent management, gate pass approvals, and on-demand technician bookings.
        </p>

        {/* Persona Launcher Sandbox */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-md max-w-5xl mx-auto text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Explore by Role (Choose Your Apartment & Profile)</h3>
              <p className="text-xs text-slate-500">
                Click any role below to view registered people across 3 apartments and open your workspace:
              </p>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full shrink-0">
              3 Societies Configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Super Admin */}
            <div
              onClick={() => handleLaunchPersona('SUPER_ADMIN')}
              className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  👑
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Website Super Admin</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Website controller view: all 3 apartments, society admins, server health & system logs.
              </p>
              <span className="text-[10px] font-bold text-indigo-700 block mt-2">
                Select Super Admin (Karthik Sriram) →
              </span>
            </div>

            {/* Society Admin */}
            <div
              onClick={() => handleLaunchPersona('ADMIN')}
              className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Apartment Society Admin</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Manage society maintenance bills, staff, complaints and gate entries for their apartment.
              </p>
              <span className="text-[10px] font-bold text-rose-700 block mt-2">
                Choose Admin (Grand Palms, Shanti Niketan, Surya Emerald) →
              </span>
            </div>

            {/* Property Owner */}
            <div
              onClick={() => handleLaunchPersona('OWNER')}
              className="p-4 rounded-xl border border-purple-200/80 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Property Owner</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Manage owned flats, assign/onboard your tenants, and track private rent collections.
              </p>
              <span className="text-[10px] font-bold text-purple-700 block mt-2">
                Choose Owner Profile (Rajesh, Priya, Nilesh, Venkat...) →
              </span>
            </div>

            {/* Tenant Resident */}
            <div
              onClick={() => handleLaunchPersona('TENANT')}
              className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Home className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Tenant / Resident</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Pay rent to owner, book technician slots, chat privately and track maintenance complaints.
              </p>
              <span className="text-[10px] font-bold text-blue-700 block mt-2">
                Choose Tenant Profile (Ananya, Rohan, Aditya, Harish...) →
              </span>
            </div>

            {/* Security Guard / Watchman */}
            <div
              onClick={() => handleLaunchPersona('SECURITY')}
              className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Security Guard / Watchman</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Outsider entry register for Zomato, Swiggy, cabs, and report facility problems.
              </p>
              <span className="text-[10px] font-bold text-amber-800 block mt-2">
                Choose Watchman (Suresh Reddy, Tukaram, Mallikarjun) →
              </span>
            </div>

            {/* Service Worker */}
            <div
              onClick={() => handleLaunchPersona('WORKER')}
              className="p-4 rounded-xl border border-teal-200/80 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Staff Technician</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Receive slot bookings, chat with residents directly and manage maintenance jobs.
              </p>
              <span className="text-[10px] font-bold text-teal-800 block mt-2">
                Choose Technician (Ramesh Electrician, Ravi Plumber...) →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Persona Selection Modal */}
      {personaModalRole && (
        <PersonaSelectionModal
          isOpen={!!personaModalRole}
          onClose={() => setPersonaModalRole(null)}
          targetRole={personaModalRole}
          onUserSelected={(user) => {
            onSelectRole(user.role);
          }}
          onOpenCustomLogin={() => {
            setPersonaModalRole(null);
            onOpenLogin();
          }}
          onOpenRegister={() => {
            setPersonaModalRole(null);
            onOpenRegister();
          }}
        />
      )}
    </div>
  );
};
