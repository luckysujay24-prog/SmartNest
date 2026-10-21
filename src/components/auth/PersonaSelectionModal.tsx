import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { UserRole, User, Community } from '../../types';
import {
  Building2,
  Shield,
  KeyRound,
  Home,
  Wrench,
  UserCheck,
  CheckCircle,
  Phone,
  Mail,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface PersonaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole | 'ALL';
  onUserSelected: (user: User) => void;
  onOpenCustomLogin: () => void;
  onOpenRegister: () => void;
}

export const PersonaSelectionModal: React.FC<PersonaSelectionModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onUserSelected,
  onOpenCustomLogin,
  onOpenRegister,
}) => {
  const { switchUser } = useAuth();
  const communities = storage.getCommunities();
  const allUsers = storage.getUsers();
  const flats = storage.getFlats();

  const [selectedApartmentId, setSelectedApartmentId] = useState<string>('ALL');

  // Filter users by role and apartment
  const usersForRole = allUsers.filter((u) => {
    if (targetRole !== 'ALL' && u.role !== targetRole) return false;
    if (selectedApartmentId !== 'ALL' && u.community_id && u.community_id !== selectedApartmentId) {
      return false;
    }
    return true;
  });

  const getRoleTitle = (role: UserRole | 'ALL') => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Website Super Admin (Platform Owner)';
      case 'ADMIN':
        return 'Apartment Society Administrator';
      case 'OWNER':
        return 'Property Owner';
      case 'TENANT':
        return 'Tenant / Resident';
      case 'SECURITY':
        return 'Security Guard / Gate Watchman';
      case 'WORKER':
        return 'Maintenance Technician / Staff';
      default:
        return 'Choose Resident Profile';
    }
  };

  const getRoleDescription = (role: UserRole | 'ALL') => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Platform administration, oversight of all 3 registered apartments & system health.';
      case 'ADMIN':
        return 'Oversee society maintenance, staff, facility complaints and gate activity.';
      case 'OWNER':
        return 'Manage your owned properties, set monthly rent & onboard/assign tenants.';
      case 'TENANT':
        return 'View lease rent, book technician time slots, chat privately and pay bills.';
      case 'SECURITY':
        return 'Manage outsider gate entry pass register and report facility problems.';
      case 'WORKER':
        return 'View service slot appointments, assigned repair tasks and private resident chat.';
      default:
        return 'Select which registered profile you would like to open.';
    }
  };

  const getFlatDisplay = (user: User) => {
    if (user.flat_id) {
      const flat = flats.find((f) => f.id === user.flat_id);
      return flat ? `Flat ${flat.flat_number} (${flat.flat_type})` : `Unit ${user.flat_id}`;
    }
    if (user.role === 'OWNER') {
      const owned = storage.getFlatOwners().filter((fo) => fo.owner_id === user.id && !fo.ownership_end);
      if (owned.length > 0) {
        const flatNumbers = owned
          .map((fo) => flats.find((f) => f.id === fo.flat_id)?.flat_number)
          .filter(Boolean);
        return `Owns: Flat ${flatNumbers.join(', ')}`;
      }
    }
    if (user.role === 'WORKER') {
      const worker = storage.getWorkers().find((w) => w.user_id === user.id || w.id === user.worker_id);
      return worker ? `${worker.worker_type} (${worker.availability})` : 'Service Technician';
    }
    if (user.role === 'SECURITY') {
      return 'Gate 1 Security Officer';
    }
    return user.role === 'SUPER_ADMIN' ? 'Central HQ' : 'Management Office';
  };

  const handleSelect = (user: User) => {
    switchUser(user.id);
    onUserSelected(user);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getRoleTitle(targetRole)}
      subtitle={getRoleDescription(targetRole)}
      maxWidth="lg"
    >
      <div className="space-y-4 text-left">
        {/* Apartment Filter Tabs */}
        {targetRole !== 'SUPER_ADMIN' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Apartment:</span>
            <button
              type="button"
              onClick={() => setSelectedApartmentId('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedApartmentId === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Societies
            </button>
            {communities.map((comm) => (
              <button
                key={comm.id}
                type="button"
                onClick={() => setSelectedApartmentId(comm.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedApartmentId === comm.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {comm.name.replace(' Residency', '').replace(' Heights', '').replace(' Towers', '')} ({comm.city})
              </button>
            ))}
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {usersForRole.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">
              No profiles found for this selection. Try choosing "All Societies".
            </div>
          ) : (
            usersForRole.map((u) => {
              const flatDisplay = getFlatDisplay(u);
              return (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {u.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-blue-700 block truncate">
                        {flatDisplay}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        🏢 {u.apartment_name || 'SmartNest Community'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomLogin();
            }}
            className="text-slate-600 hover:text-blue-600 font-semibold"
          >
            Sign in with email credentials →
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="text-blue-600 hover:underline font-bold"
          >
            + Register a new resident account
          </button>
        </div>
      </div>
    </Modal>
  );
};
