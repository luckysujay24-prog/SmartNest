import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { useToast } from '../ui/Toast';
import { Community, User, Flat, Building } from '../../types';
import {
  Building2,
  Users,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Plus,
  Home,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SuperAdminPortalProps {
  onOpenChatWithAdmin?: (adminUserId: string) => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  onOpenChatWithAdmin,
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { success, error } = useToast();

  const communities = storage.getCommunities();
  const buildings = storage.getBuildings();
  const flats = storage.getFlats();
  const visitorLogs = storage.getVisitorLogs();
  const incidentReports = storage.getIncidentReports();

  const [selectedCommId, setSelectedCommId] = useState<string>('ALL');
  const [isAddAptModalOpen, setIsAddAptModalOpen] = useState(false);

  // New Apartment Form state
  const [aptName, setAptName] = useState('');
  const [aptAddress, setAptAddress] = useState('');
  const [aptCity, setAptCity] = useState('Bengaluru');
  const [aptState, setAptState] = useState('Karnataka');
  const [aptPincode, setAptPincode] = useState('560001');

  // Verify access
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-xl m-6">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-900">Access Restricted: Super Admin Only</h3>
        <p className="text-sm text-rose-700 mt-1 max-w-md mx-auto">
          Only the real website platform administrator can view all multi-apartment complexes, their respective society administrators, and site-wide operations.
        </p>
      </div>
    );
  }

  const handleCreateApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptName.trim() || !aptAddress.trim()) {
      error('Missing Information', 'Please provide apartment name and complete address.');
      return;
    }

    const newComm = storage.createCommunity({
      name: aptName.trim(),
      address: aptAddress.trim(),
      city: aptCity.trim(),
      state: aptState.trim(),
      country: 'India',
      postal_code: aptPincode.trim(),
    });

    // Also create initial building wing
    storage.createBuilding({
      community_id: newComm.id,
      name: 'Tower 1 (Main Wing)',
      description: 'Primary residential wing',
      total_floors: 8,
    });

    success('Apartment Registered!', `"${newComm.name}" added to SmartNest network.`);
    setIsAddAptModalOpen(false);
    setAptName('');
    setAptAddress('');
  };

  // Compile detailed metrics for each apartment
  const apartmentProfiles = communities.map((comm) => {
    const commBuildings = buildings.filter((b) => b.community_id === comm.id);
    const commBuildingIds = new Set(commBuildings.map((b) => b.id));
    const commFlats = flats.filter((f) => commBuildingIds.has(f.building_id));
    const occupiedFlats = commFlats.filter((f) => f.occupancy_status === 'OCCUPIED');

    // Society Admin for this apartment
    const societyAdmin = allUsers.find(
      (u) => u.role === 'ADMIN' && (u.community_id === comm.id || u.apartment_name?.includes(comm.name))
    );

    // Dedicated Watchman / Security Guard for this apartment
    const watchman = allUsers.find(
      (u) => u.role === 'SECURITY' && (u.community_id === comm.id || u.apartment_name?.includes(comm.name))
    );

    // Residents count
    const residents = allUsers.filter(
      (u) =>
        (u.role === 'TENANT' || u.role === 'OWNER') &&
        (u.community_id === comm.id || u.apartment_name?.includes(comm.name))
    );

    // Outsider visitor logs count
    const visitors = visitorLogs.filter((v) => v.community_id === comm.id);

    // Incidents reported
    const incidents = incidentReports.filter((inc) => inc.community_id === comm.id);
    const activeIncidents = incidents.filter((inc) => inc.status !== 'RESOLVED');

    return {
      comm,
      buildings: commBuildings,
      flats: commFlats,
      occupiedCount: occupiedFlats.length,
      occupancyRate: commFlats.length ? Math.round((occupiedFlats.length / commFlats.length) * 100) : 0,
      societyAdmin,
      watchman,
      residentsCount: residents.length,
      visitorCount: visitors.length,
      incidentsCount: incidents.length,
      activeIncidentsCount: activeIncidents.length,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 text-left">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
              👑 Platform Super Admin Console
            </span>
            <span className="text-xs text-slate-500 font-mono">Restricted Oversight View</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Central Apartment Network & Society Administrators
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full authority view across all 3+ registered apartment complexes, society admins, security personnel & occupancy.
          </p>
        </div>

        <button
          onClick={() => setIsAddAptModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Apartment</span>
        </button>
      </div>

      {/* High Level Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Apartments</span>
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{communities.length} Societies</div>
          <span className="text-[11px] text-emerald-600 font-medium">Bengaluru, Pune, Hyderabad</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Flats</span>
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{flats.length} Flats</div>
          <span className="text-[11px] text-blue-600 font-medium">
            {flats.filter((f) => f.occupancy_status === 'OCCUPIED').length} Occupied ·{' '}
            {flats.filter((f) => f.occupancy_status === 'VACANT').length} Vacant
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">All Residents</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {allUsers.filter((u) => u.role === 'TENANT' || u.role === 'OWNER').length} People
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Verified Flat Owners & Tenants</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gate Activity</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{visitorLogs.length} Entries</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {visitorLogs.filter((v) => v.status === 'ALLOWED').length} Allowed ·{' '}
            {visitorLogs.filter((v) => v.status === 'DENIED').length} Denied
          </span>
        </div>
      </div>

      {/* Apartment Detailed Directory */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Registered Apartment Societies & Administration</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Only Super Admin is authorized to view society admins & addresses
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {apartmentProfiles.map((p) => {
            const { comm, societyAdmin, watchman, flats, occupiedCount, occupancyRate } = p;
            return (
              <div
                key={comm.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                {/* Header Card */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      ID: {comm.id}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active
                    </span>
                  </div>
                  <h3 className="text-base font-black tracking-tight">{comm.name}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-slate-300 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {comm.address}, {comm.city}, {comm.state} - {comm.postal_code}
                    </span>
                  </div>
                </div>

                {/* Society Metrics */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70 text-center py-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Flats</span>
                    <span className="text-xs font-black text-slate-800">{flats.length} Units</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupied</span>
                    <span className="text-xs font-black text-blue-600">{occupancyRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Gate Logs</span>
                    <span className="text-xs font-black text-emerald-600">{p.visitorCount}</span>
                  </div>
                </div>

                {/* Key Society Staff */}
                <div className="p-5 space-y-4 flex-1 text-xs">
                  {/* Society Admin */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Designated Society Admin:
                    </span>
                    {societyAdmin ? (
                      <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={societyAdmin.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                            alt={societyAdmin.name}
                            className="w-9 h-9 rounded-full object-cover border border-rose-300"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{societyAdmin.name}</span>
                            <span className="text-[11px] text-slate-500 block truncate">{societyAdmin.email}</span>
                            <span className="text-[10px] text-slate-500 block">{societyAdmin.phone}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            switchUser(societyAdmin.id);
                            success('Switched Session', `Signed in as Society Admin: ${societyAdmin.name}`);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          Login As Admin
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 italic">
                        No admin assigned yet
                      </div>
                    )}
                  </div>

                  {/* Dedicated Watchman */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Dedicated Security / Gate Watchman:
                    </span>
                    {watchman ? (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={watchman.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                            alt={watchman.name}
                            className="w-9 h-9 rounded-full object-cover border border-amber-300"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{watchman.name}</span>
                            <span className="text-[11px] text-slate-600 block">{watchman.phone}</span>
                            <span className="text-[10px] text-amber-700 font-semibold block">Gate 1 Entry Guard</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            switchUser(watchman.id);
                            success('Switched Session', `Signed in as Watchman: ${watchman.name}`);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          Login As Watchman
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 italic">
                        No dedicated watchman assigned
                      </div>
                    )}
                  </div>

                  {/* Operational Incidents */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                    <span>Reported Service Issues:</span>
                    <span className={`font-bold ${p.activeIncidentsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {p.activeIncidentsCount} Active ({p.incidentsCount} Total)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Website Health & Architecture (Website Care) */}
        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🛡️</span>
                <span>SmartNest Platform Health & Website Infrastructure</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central system operations, database synchronization, and security protocols managed by Super Admin.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ● All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Database Engine</span>
              <span className="font-bold text-slate-900 text-sm block mt-1">MongoDB Compass</span>
              <span className="text-[11px] text-emerald-600 font-mono mt-0.5 block truncate">
                mongodb://127.0.0.1:27017/smartnest
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Backend API Service</span>
              <span className="font-bold text-slate-900 text-sm block mt-1">Express REST API</span>
              <span className="text-[11px] text-blue-600 font-mono mt-0.5 block">
                Port 5000 (Live Sync Active)
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Frontend Client</span>
              <span className="font-bold text-slate-900 text-sm block mt-1">Vite + React 19 + Tailwind</span>
              <span className="text-[11px] text-purple-600 font-mono mt-0.5 block">
                Port 3000 (Responsive OS)
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Privacy & Security</span>
              <span className="font-bold text-slate-900 text-sm block mt-1">Role-Isolated Storage</span>
              <span className="text-[11px] text-slate-600 mt-0.5 block">
                Private Rent & Chats Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Apartment Modal */}
      <Modal
        isOpen={isAddAptModalOpen}
        onClose={() => setIsAddAptModalOpen(false)}
        title="Register New Apartment Community"
        subtitle="Expand platform coverage to a new residential society"
        maxWidth="md"
      >
        <form onSubmit={handleCreateApartment} className="space-y-4 text-left">
          <Input
            label="Apartment / Society Name"
            required
            placeholder="e.g. Prestige Lakeview Residences"
            value={aptName}
            onChange={(e) => setAptName(e.target.value)}
          />

          <Input
            label="Official Street Address"
            required
            placeholder="e.g. 104 Bannerghatta Road, Arekere"
            value={aptAddress}
            onChange={(e) => setAptAddress(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City"
              required
              value={aptCity}
              onChange={(e) => setAptCity(e.target.value)}
            />
            <Input
              label="State"
              required
              value={aptState}
              onChange={(e) => setAptState(e.target.value)}
            />
            <Input
              label="Postal Pincode"
              required
              value={aptPincode}
              onChange={(e) => setAptPincode(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full mt-2">
            Register Apartment Society
          </Button>
        </form>
      </Modal>
    </div>
  );
};
