import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { User, UserRole, Flat, Worker } from '../../types';
import {
  Users,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Shield,
  KeyRound,
  Home,
  Wrench,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface AllResidentsManagementProps {
  onOpenChatWithUser?: (targetUserId: string) => void;
}

export const AllResidentsManagement: React.FC<AllResidentsManagementProps> = ({
  onOpenChatWithUser,
}) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadData = () => {
    setUsers(storage.getUsers());
    setFlats(storage.getFlats());
    setWorkers(storage.getWorkers());
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(loadData);
    return unsub;
  }, []);

  const getFlatInfo = (user: User) => {
    if (user.role === 'TENANT') {
      const flatTenant = storage.getFlatTenants().find((ft) => ft.tenant_id === user.id && !ft.move_out_date);
      if (flatTenant) {
        const flat = flats.find((f) => f.id === flatTenant.flat_id);
        return flat ? flat.flat_number : 'Assigned Unit';
      }
      if (user.flat_id) {
        const flat = flats.find((f) => f.id === user.flat_id);
        return flat ? flat.flat_number : 'Unit ' + user.flat_id;
      }
    }

    if (user.role === 'OWNER') {
      const owned = storage.getFlatOwners().filter((fo) => fo.owner_id === user.id && !fo.ownership_end);
      if (owned.length > 0) {
        const flatNumbers = owned
          .map((fo) => flats.find((f) => f.id === fo.flat_id)?.flat_number)
          .filter(Boolean);
        return flatNumbers.join(', ');
      }
    }

    if (user.role === 'WORKER') {
      const worker = workers.find((w) => w.user_id === user.id || w.id === user.worker_id);
      return worker ? `${worker.worker_type} (${worker.availability})` : 'Staff Member';
    }

    if (user.role === 'SECURITY') {
      return 'Perimeter Security & Gate Watchman';
    }

    if (user.role === 'ADMIN') {
      return 'Head of Management Committee';
    }

    if (user.role === 'SUPER_ADMIN') {
      return 'Website Platform Administrator';
    }

    return 'Community Member';
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-rose-600" />;
      case 'SECURITY':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      case 'OWNER':
        return <KeyRound className="w-3.5 h-3.5 text-purple-600" />;
      case 'TENANT':
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
      case 'WORKER':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole): any => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'primary';
      case 'ADMIN':
        return 'danger';
      case 'SECURITY':
        return 'warning';
      case 'OWNER':
        return 'purple';
      case 'TENANT':
        return 'info';
      case 'WORKER':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Super Admin can see everyone across all apartments.
  // Society Admins only see residents of their own apartment!
  const accessibleUsers = users.filter((u) => {
    if (currentUser?.role === 'SUPER_ADMIN') return true;
    if (currentUser?.community_id) {
      return u.community_id === currentUser.community_id || !u.community_id;
    }
    return true;
  });

  const filteredUsers = accessibleUsers.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const flatInfo = getFlatInfo(u);
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase()) ||
      flatInfo.toLowerCase().includes(search.toLowerCase()) ||
      (u.apartment_name || '').toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const countByRole = {
    ALL: accessibleUsers.length,
    OWNER: accessibleUsers.filter((u) => u.role === 'OWNER').length,
    TENANT: accessibleUsers.filter((u) => u.role === 'TENANT').length,
    WORKER: accessibleUsers.filter((u) => u.role === 'WORKER').length,
    SECURITY: accessibleUsers.filter((u) => u.role === 'SECURITY').length,
    ADMIN: accessibleUsers.filter((u) => u.role === 'ADMIN').length,
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Community Directory & Residents
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Admin View All ({users.length})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unified directory for Grand Palms Residency. View, call, or start a private chat with any resident, owner, worker, or administrator.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {(
          [
            { id: 'ALL', label: 'All Users', count: countByRole.ALL, color: 'text-slate-900' },
            { id: 'OWNER', label: 'Owners', count: countByRole.OWNER, color: 'text-purple-600' },
            { id: 'TENANT', label: 'Tenants', count: countByRole.TENANT, color: 'text-blue-600' },
            { id: 'WORKER', label: 'Workers / Staff', count: countByRole.WORKER, color: 'text-amber-600' },
            { id: 'SECURITY', label: 'Watchmen', count: countByRole.SECURITY, color: 'text-yellow-700' },
            { id: 'ADMIN', label: 'Admins', count: countByRole.ADMIN, color: 'text-rose-600' },
          ] as const
        ).map((stat) => (
          <div
            key={stat.id}
            onClick={() => setRoleFilter(stat.id as any)}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
              roleFilter === stat.id
                ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-500">{stat.label}</div>
            <div className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Search by name, flat, apartment, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['ALL', 'OWNER', 'TENANT', 'WORKER', 'SECURITY', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const flatInfo = getFlatInfo(user);
          const workerObj = workers.find((w) => w.user_id === user.id || w.id === user.worker_id);

          return (
            <Card
              key={user.id}
              className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200/90"
            >
              <div>
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-slate-100 object-cover bg-slate-50 shadow-xs"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{user.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{flatInfo}</span>
                  </div>

                  {user.apartment_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded truncate">
                        🏢 {user.apartment_name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${user.phone}`}
                      className="text-blue-600 hover:underline font-mono truncate"
                    >
                      {user.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-600 truncate">{user.email}</span>
                  </div>

                  {workerObj && (
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Rating: ⭐ {workerObj.rating}</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          workerObj.availability === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : workerObj.availability === 'BUSY'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {workerObj.availability}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setSelectedUser(user)}
                >
                  Details
                </Button>

                {onOpenChatWithUser && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onOpenChatWithUser(user.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" />
                    Private Chat
                  </Button>
                )}

                <a
                  href={`tel:${user.phone}`}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                  title="Call user"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center text-slate-500">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold">No residents found matching your search</p>
          <p className="text-xs text-slate-400 mt-1">Try searching by a different name, role, or phone number.</p>
        </Card>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Resident Profile: ${selectedUser.name}`}
          subtitle={`Community ID: ${selectedUser.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                  <span className="text-xs text-slate-500">{getFlatInfo(selectedUser)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-semibold text-slate-800 break-all">{selectedUser.email}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                <span className="font-semibold text-slate-800 font-mono">{selectedUser.phone}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Member Since</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedUser.created_at).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              {onOpenChatWithUser && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const uid = selectedUser.id;
                    setSelectedUser(null);
                    onOpenChatWithUser(uid);
                  }}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  Start Private Chat
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
