import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { NotificationBell } from '../common/NotificationBell';
import { storage } from '../../services/storage';
import { Building2, LogOut, Menu, X, Shield, KeyRound, Wrench, Home, MessageSquare, Database } from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onNavigateHome?: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
  onNavigateHome,
  onOpenChat,
}) => {
  const { currentUser, logout } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    const updateCount = () => {
      setUnreadChatCount(storage.getUnreadMessageCount(currentUser.id));
    };
    updateCount();
    const unsub = storage.subscribe(updateCount);
    return unsub;
  }, [currentUser]);

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'SECURITY':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-rose-600" />;
      case 'OWNER':
        return <KeyRound className="w-3.5 h-3.5 text-purple-600" />;
      case 'TENANT':
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
      case 'WORKER':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeClasses = (role?: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'SECURITY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'OWNER':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TENANT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WORKER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none block">
                Smart<span className="text-blue-600">Nest</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-none block mt-0.5 truncate max-w-[200px]">
                {currentUser?.role === 'SUPER_ADMIN'
                  ? 'All Apartments (Central)'
                  : currentUser?.apartment_name || 'Grand Palms Residency'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: MongoDB Compass Badge, Private Chat, Notifications, User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* MongoDB Compass Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold">MongoDB Compass Active</span>
          </div>

          {/* 1-on-1 Private Chat Button */}
          {currentUser && onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              title="Open Private 1-on-1 Messages (Strictly Private)"
              className="relative p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}

          <NotificationBell />

          {/* Active User Avatar & Role */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                  {currentUser.name}
                </div>
                <div
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeClasses(
                    currentUser.role
                  )}`}
                >
                  {getRoleIcon(currentUser.role)}
                  <span>{currentUser.role}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
