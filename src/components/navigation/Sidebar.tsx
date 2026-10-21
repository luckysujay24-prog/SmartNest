import React from 'react';
import { useAuth } from '../../services/authContext';
import {
  LayoutDashboard,
  Building,
  KeyRound,
  Users,
  Wrench,
  Receipt,
  CreditCard,
  AlertCircle,
  Megaphone,
  Store,
  FileClock,
  User,
  Home,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  MessageSquare,
  CalendarCheck,
  UserCheck,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const role = currentUser.role;

  const handleNavClick = (tab: string) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavItems = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        { id: 'super-admin', label: 'All Apartments & Admins', icon: Building2 },
        { id: 'directory', label: 'All Residents & Staff', icon: Users },
        { id: 'security', label: 'Gate Visitor Registers', icon: ShieldCheck },
        { id: 'services', label: 'Service Bookings', icon: Store },
        { id: 'chat', label: 'Private Messages', icon: MessageSquare },
        { id: 'audit', label: 'Central Audit Trail', icon: FileClock },
      ];
    }

    if (role === 'SECURITY') {
      return [
        { id: 'security', label: 'Gate Register & Problems', icon: ShieldCheck },
        { id: 'chat', label: 'Private Messages', icon: MessageSquare },
        { id: 'announcements', label: 'Society Announcements', icon: Megaphone },
      ];
    }

    if (role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'directory', label: 'All Residents (See Anyone)', icon: Users },
        { id: 'security', label: 'Watchman Gate Register', icon: ShieldCheck },
        { id: 'chat', label: 'Private Messages', icon: MessageSquare },
        { id: 'flats', label: 'Flats & Units', icon: Building },
        { id: 'owners', label: 'Owners', icon: KeyRound },
        { id: 'tenants', label: 'Tenants', icon: UserCheck },
        { id: 'workers', label: 'Workers & Staff', icon: Wrench },
        { id: 'bills', label: 'Bills & Allocation', icon: Receipt },
        { id: 'payments', label: 'Payments & Ledger', icon: CreditCard },
        { id: 'complaints', label: 'Complaints & Work', icon: AlertCircle },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'services', label: 'Service Booking Portal', icon: Store },
        { id: 'audit', label: 'Audit Trail', icon: FileClock },
      ];
    }

    if (role === 'OWNER') {
      return [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'chat', label: 'Private Messages', icon: MessageSquare },
        { id: 'properties', label: 'My Properties', icon: Building },
        { id: 'tenants', label: 'Tenants', icon: Users },
        { id: 'bills', label: 'Rent & Bills', icon: Receipt },
        { id: 'payments', label: 'Collections History', icon: CreditCard },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'services', label: 'Services & Book Slots', icon: Store },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }

    if (role === 'TENANT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'chat', label: 'Private Messages', icon: MessageSquare },
        { id: 'services', label: 'Services & Book Slots', icon: Store },
        { id: 'my-flat', label: 'My Flat', icon: Home },
        { id: 'rent-bills', label: 'Rent & Bills', icon: Receipt },
        { id: 'payments', label: 'Payment History', icon: CreditCard },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }

    if (role === 'WORKER') {
      return [
        { id: 'dashboard', label: 'Task Center', icon: LayoutDashboard },
        { id: 'chat', label: 'Private Messages', icon: MessageSquare },
        { id: 'tasks', label: 'Assigned Tasks', icon: Wrench },
        { id: 'bookings', label: 'Booked Appointments', icon: CalendarCheck },
        { id: 'history', label: 'Task History', icon: CheckCircle },
        { id: 'profile', label: 'My Profile & Status', icon: User },
      ];
    }

    return [];
  };

  const navItems = renderNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full border-r border-slate-800 select-none">
      {/* Community Banner */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">
              {currentUser.role.replace('_', ' ')} CONSOLE
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser.role === 'SUPER_ADMIN'
                ? 'All Apartments (Central)'
                : currentUser.apartment_name || 'Grand Palms Residency'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <span>v2.0 Multi-Apartment</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
          </span>
        </div>
      </div>
    </aside>
  );
};
