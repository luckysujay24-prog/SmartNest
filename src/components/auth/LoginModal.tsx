import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../services/authContext';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { Mail, Lock, ShieldAlert, Building2, MapPin } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const { login, loginAsRole, allUsers, switchUser } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  // Find user by current typed email to show apartment badge preview
  const matchedUser = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Email required', 'Please enter your account email.');
      return;
    }
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      success('Welcome back!', `Signed in successfully.`);
      onClose();
    } else {
      error('Login failed', res.error || 'Invalid credentials');
    }
  };

  const handleRoleQuickLogin = (role: UserRole) => {
    loginAsRole(role);
    success('Logged in!', `Signed in as ${role.replace('_', ' ').toLowerCase()}.`);
    onClose();
  };

  const handleSelectQuickUser = (userId: string) => {
    switchUser(userId);
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      success('Logged In!', `Switched to ${user.name} (${user.role}).`);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign in to SmartNest"
      subtitle="Access your apartment portal, gate passes & society services"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* 1-Click Role Quick Access */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            1-Click Persona Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('SUPER_ADMIN')}
              className="px-2 py-1.5 text-xs font-bold rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 transition-colors text-center"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('ADMIN')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 transition-colors text-center"
            >
              Society Admin
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('SECURITY')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors text-center"
            >
              🛡️ Security / Gate
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('TENANT')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 transition-colors text-center"
            >
              Tenant (Resident)
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('OWNER')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200 transition-colors text-center"
            >
              Property Owner
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickLogin('WORKER')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 border border-teal-200 transition-colors text-center"
            >
              Technician / Staff
            </button>
          </div>
        </div>

        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400">or sign in with credentials</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Quick User Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Pick Any Registered Account:
          </label>
          <select
            className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-700 font-medium"
            onChange={(e) => {
              if (e.target.value) {
                setEmail(e.target.value);
              }
            }}
            value={email}
          >
            <option value="">-- Select from 3 Apartments --</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.email}>
                {u.name} [{u.role}] — {u.apartment_name || 'Society Member'}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="e.g. ananya.tenant@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        {/* Dynamic Apartment Preview Banner */}
        {matchedUser && (
          <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{matchedUser.apartment_name || 'Grand Palms Residency'}</span>
              <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono ml-auto">
                {matchedUser.role}
              </span>
            </div>
            {matchedUser.apartment_address && (
              <div className="flex items-start gap-1 text-slate-600 text-[11px]">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                <span className="truncate">{matchedUser.apartment_address}</span>
              </div>
            )}
          </div>
        )}

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="flex justify-between items-center text-xs">
          <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
            <span>Remember session</span>
          </label>
          <span className="text-slate-400 font-mono text-[11px]">Default: password123</span>
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>

        <p className="text-center text-xs text-slate-500 pt-1">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Register new resident & apartment
          </button>
        </p>
      </form>
    </Modal>
  );
};
