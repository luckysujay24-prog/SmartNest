import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { useToast } from '../ui/Toast';
import {
  VisitorLog,
  VisitorStatus,
  VisitorPurpose,
  WatchmanIncidentReport,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  Truck,
  Car,
  Users,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Building2,
  Phone,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

export const SecurityGuardPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'visitors' | 'incidents'>('visitors');
  const [visitorFilter, setVisitorFilter] = useState<'ALL' | 'ALLOWED' | 'DENIED' | 'ACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // New Visitor Form State
  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vPurpose, setVPurpose] = useState<VisitorPurpose>('DELIVERY');
  const [vCompany, setVCompany] = useState('Zomato');
  const [vFlat, setVFlat] = useState('');
  const [vResident, setVResident] = useState('');
  const [vVehicle, setVVehicle] = useState('');
  const [vNotes, setVNotes] = useState('');
  const [vInitialStatus, setVInitialStatus] = useState<VisitorStatus>('ALLOWED');

  // New Incident Form State
  const [incTitle, setIncTitle] = useState('');
  const [incDescription, setIncDescription] = useState('');
  const [incCategory, setIncCategory] = useState<IncidentCategory>('LIFT');
  const [incSeverity, setIncSeverity] = useState<IncidentSeverity>('HIGH');
  const [incArea, setIncArea] = useState('');

  // Watchman Apartment Context
  const communityId = currentUser?.community_id || 'comm-101';
  const communities = storage.getCommunities();
  const currentComm = communities.find((c) => c.id === communityId) || communities[0];
  const flats = storage.getFlats();

  // Load live data
  const visitorLogs = storage.getVisitorLogs(communityId);
  const incidentReports = storage.getIncidentReports(communityId);

  // Handlers for Visitor Entry
  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vFlat.trim()) {
      error('Missing Details', 'Visitor name and visiting flat are required.');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const passCode = `${currentComm.name.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    storage.createVisitorEntry({
      community_id: communityId,
      apartment_name: currentComm.name,
      visitor_name: vName.trim(),
      phone: vPhone.trim() || 'N/A',
      purpose: vPurpose,
      company_or_service: vCompany.trim(),
      visiting_flat: vFlat.trim(),
      visiting_resident_name: vResident.trim() || undefined,
      vehicle_number: vVehicle.trim() || undefined,
      entry_time: timeStr,
      status: vInitialStatus,
      logged_by_watchman_id: currentUser?.id || 'usr-security-1',
      logged_by_watchman_name: currentUser?.name || 'Gate Watchman',
      pass_code: passCode,
      notes: vNotes.trim() || undefined,
    });

    success('Entry Recorded!', `${vName} has been logged at the gate.`);
    setIsVisitorModalOpen(false);
    // Reset
    setVName('');
    setVPhone('');
    setVVehicle('');
    setVResident('');
    setVNotes('');
  };

  const handleUpdateVisitorStatus = (id: string, newStatus: VisitorStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = storage.updateVisitorStatus(
      id,
      newStatus,
      newStatus === 'CHECKED_OUT' ? timeStr : undefined,
      newStatus === 'DENIED' ? 'Entry denied by security protocol.' : undefined
    );
    if (updated) {
      success('Status Updated', `Visitor status set to ${newStatus}.`);
    }
  };

  // Handlers for Incidents
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim() || !incDescription.trim()) {
      error('Missing Details', 'Title and problem description are required.');
      return;
    }

    storage.createIncidentReport({
      community_id: communityId,
      apartment_name: currentComm.name,
      watchman_id: currentUser?.id || 'usr-security-1',
      watchman_name: currentUser?.name || 'Gate Watchman',
      watchman_phone: currentUser?.phone || '+91 98455 77889',
      title: incTitle.trim(),
      description: incDescription.trim(),
      category: incCategory,
      severity: incSeverity,
      status: 'REPORTED',
      affected_area: incArea.trim() || 'Society Common Area',
    });

    success('Incident Reported!', 'Problem alert dispatched to Society Admin.');
    setIsIncidentModalOpen(false);
    setIncTitle('');
    setIncDescription('');
    setIncArea('');
  };

  const handleResolveIncident = (id: string) => {
    storage.updateIncidentStatus(id, 'RESOLVED', new Date().toISOString());
    success('Problem Resolved', 'Incident marked as fixed.');
  };

  // Filtered visitor list
  const filteredVisitors = visitorLogs.filter((v) => {
    if (visitorFilter === 'ALLOWED' && v.status !== 'ALLOWED') return false;
    if (visitorFilter === 'DENIED' && v.status !== 'DENIED') return false;
    if (visitorFilter === 'ACTIVE' && (v.status !== 'ALLOWED' || v.exit_time)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = v.visitor_name.toLowerCase().includes(q);
      const matchFlat = v.visiting_flat.toLowerCase().includes(q);
      const matchCompany = (v.company_or_service || '').toLowerCase().includes(q);
      const matchVehicle = (v.vehicle_number || '').toLowerCase().includes(q);
      return matchName || matchFlat || matchCompany || matchVehicle;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              🛡️ Security & Watchman Desk
            </span>
            <span className="text-xs text-slate-500 font-semibold">{currentComm.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gate Entry Register & Facility Incident Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong>{currentUser?.name || 'Suresh Reddy'}</strong> (Main Gate Officer) · Control outsider entry permissions and log society service problems.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsVisitorModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Outsider Entry</span>
          </button>
          <button
            onClick={() => setIsIncidentModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Problem</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveSubTab('visitors')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'visitors'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Outsider Entry Register ({visitorLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'incidents'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Facility & Service Problems ({incidentReports.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: VISITOR REGISTER */}
      {activeSubTab === 'visitors' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search visitor, flat (e.g. A-301), company, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] uppercase mr-1">Filter:</span>
              <button
                onClick={() => setVisitorFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  visitorFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({visitorLogs.length})
              </button>
              <button
                onClick={() => setVisitorFilter('ALLOWED')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  visitorFilter === 'ALLOWED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Allowed ({visitorLogs.filter((v) => v.status === 'ALLOWED').length})
              </button>
              <button
                onClick={() => setVisitorFilter('DENIED')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  visitorFilter === 'DENIED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Denied ({visitorLogs.filter((v) => v.status === 'DENIED').length})
              </button>
              <button
                onClick={() => setVisitorFilter('ACTIVE')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  visitorFilter === 'ACTIVE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                On Premises
              </button>
            </div>
          </div>

          {/* Visitors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Visitor & Delivery Service</th>
                    <th className="py-3 px-4">Visiting Flat</th>
                    <th className="py-3 px-4">Time & Vehicle</th>
                    <th className="py-3 px-4">Pass Code</th>
                    <th className="py-3 px-4">Gate Status</th>
                    <th className="py-3 px-4 text-right">Watchman Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No visitor logs match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((v) => {
                      const isAllowed = v.status === 'ALLOWED';
                      const isDenied = v.status === 'DENIED';
                      const isCheckedOut = v.status === 'CHECKED_OUT';

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  v.purpose === 'DELIVERY'
                                    ? 'bg-orange-100 text-orange-700'
                                    : v.purpose === 'CAB'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : v.purpose === 'SERVICE'
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {v.purpose === 'DELIVERY' ? (
                                  <Truck className="w-4 h-4" />
                                ) : v.purpose === 'CAB' ? (
                                  <Car className="w-4 h-4" />
                                ) : (
                                  <Users className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">{v.visitor_name}</span>
                                <span className="text-[11px] text-slate-500">
                                  {v.company_or_service || v.purpose} · {v.phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                              Flat {v.visiting_flat}
                            </span>
                            {v.visiting_resident_name && (
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                {v.visiting_resident_name}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{v.entry_time}</span>
                              {v.exit_time && (
                                <span className="text-slate-400 text-[11px]">→ Out: {v.exit_time}</span>
                              )}
                            </div>
                            {v.vehicle_number && (
                              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                🚗 {v.vehicle_number}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {v.pass_code || 'GP-GATE'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {isAllowed && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle className="w-3.5 h-3.5" /> Allowed In
                              </span>
                            )}
                            {isDenied && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <UserX className="w-3.5 h-3.5" /> Denied Entry
                              </span>
                            )}
                            {isCheckedOut && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                Checked Out
                              </span>
                            )}
                            {v.notes && (
                              <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1 italic">
                                Note: {v.notes}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isDenied ? (
                                <button
                                  onClick={() => handleUpdateVisitorStatus(v.id, 'ALLOWED')}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                                >
                                  Allow In
                                </button>
                              ) : isAllowed && !v.exit_time ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateVisitorStatus(v.id, 'CHECKED_OUT')}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    Check Out
                                  </button>
                                  <button
                                    onClick={() => handleUpdateVisitorStatus(v.id, 'DENIED')}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                  >
                                    Deny
                                  </button>
                                </>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Logged</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FACILITY PROBLEMS & INCIDENTS */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Service & Infrastructure Issues Logged by Watchmen
              </h2>
              <p className="text-xs text-slate-500">
                Informs society management of lift halts, water motor trips, gate sensor failures and leaks.
              </p>
            </div>
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Report New Problem
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidentReports.map((inc) => {
              const isResolved = inc.status === 'RESOLVED';
              return (
                <div
                  key={inc.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isResolved
                      ? 'bg-white border-slate-200'
                      : inc.severity === 'CRITICAL'
                      ? 'bg-rose-50/60 border-rose-300'
                      : 'bg-amber-50/60 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : inc.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.severity} SEVERITY · {inc.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        isResolved ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{inc.title}</h3>
                  <p className="text-xs text-slate-600 mb-3">{inc.description}</p>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <span>Area: <strong>{inc.affected_area || 'Main Facility'}</strong></span>
                      <span className="block text-[10px]">Reported by: {inc.watchman_name}</span>
                    </div>

                    {!isResolved && (
                      <button
                        onClick={() => handleResolveIncident(inc.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Mark As Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER NEW VISITOR */}
      <Modal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        title="Log Outsider / Visitor Gate Entry"
        subtitle={`Security gate register for ${currentComm.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateVisitor} className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Visit Purpose"
              value={vPurpose}
              onChange={(e) => {
                const val = e.target.value as VisitorPurpose;
                setVPurpose(val);
                if (val === 'DELIVERY') setVCompany('Zomato');
                else if (val === 'CAB') setVCompany('Uber');
                else if (val === 'SERVICE') setVCompany('Urban Company');
                else setVCompany('');
              }}
            >
              <option value="DELIVERY">Delivery (Food/Parcel)</option>
              <option value="CAB">Cab / Taxi (Uber/Ola)</option>
              <option value="GUEST">Personal Guest</option>
              <option value="SERVICE">Service Worker (Urban Company)</option>
              <option value="OTHER">Other Outsider</option>
            </Select>

            <Input
              label="Company / Brand"
              placeholder="e.g. Zomato, Swiggy, Amazon"
              value={vCompany}
              onChange={(e) => setVCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Visitor Name"
              required
              placeholder="e.g. Raju Kumar"
              value={vName}
              onChange={(e) => setVName(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 98765 11223"
              value={vPhone}
              onChange={(e) => setVPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Visiting Flat Number"
              required
              placeholder="e.g. A-301 or B-502"
              value={vFlat}
              onChange={(e) => setVFlat(e.target.value)}
            />
            <Input
              label="Resident Name (Optional)"
              placeholder="e.g. Ananya Iyer"
              value={vResident}
              onChange={(e) => setVResident(e.target.value)}
            />
          </div>

          <Input
            label="Vehicle Registration Plate (Optional)"
            placeholder="e.g. KA-01-ET-3421"
            value={vVehicle}
            onChange={(e) => setVVehicle(e.target.value)}
          />

          <Select
            label="Security Gate Decision"
            value={vInitialStatus}
            onChange={(e) => setVInitialStatus(e.target.value as VisitorStatus)}
          >
            <option value="ALLOWED">✅ Allow In (Issue Digital Gate Pass)</option>
            <option value="DENIED">⛔ Deny Entry (Block / Restrict)</option>
          </Select>

          <Input
            label="Security Officer Notes"
            placeholder="e.g. Verified with resident over intercom"
            value={vNotes}
            onChange={(e) => setVNotes(e.target.value)}
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2">
            Record in Gate Register
          </Button>
        </form>
      </Modal>

      {/* MODAL 2: REPORT FACILITY PROBLEM */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Report Society Service / Facility Problem"
        subtitle="Dispatches urgent alert to society admin & technicians"
        maxWidth="md"
      >
        <form onSubmit={handleCreateIncident} className="space-y-3.5 text-left">
          <Input
            label="Problem Headline"
            required
            placeholder="e.g. Block A Passenger Lift 1 stuck on 4th floor"
            value={incTitle}
            onChange={(e) => setIncTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={incCategory}
              onChange={(e) => setIncCategory(e.target.value as IncidentCategory)}
            >
              <option value="LIFT">Elevator / Lift</option>
              <option value="WATER_PUMP">Water Pump / Sump</option>
              <option value="SECURITY_GATE">Boom Barrier / Gate</option>
              <option value="ELECTRICAL">Common Electricity / DG</option>
              <option value="PARKING">Parking Seepage / Lights</option>
              <option value="OTHER">Other Maintenance</option>
            </Select>

            <Select
              label="Severity Level"
              value={incSeverity}
              onChange={(e) => setIncSeverity(e.target.value as IncidentSeverity)}
            >
              <option value="CRITICAL">🔴 Critical (Immediate Action)</option>
              <option value="HIGH">🟠 High Priority</option>
              <option value="MEDIUM">🟡 Medium Priority</option>
              <option value="LOW">🟢 Low / Minor</option>
            </Select>
          </div>

          <Input
            label="Exact Location / Affected Area"
            placeholder="e.g. Sunflower Tower (Block A) Lift Shaft #1"
            value={incArea}
            onChange={(e) => setIncArea(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem Description & Initial Action Taken:
            </label>
            <textarea
              required
              rows={3}
              value={incDescription}
              onChange={(e) => setIncDescription(e.target.value)}
              placeholder="Describe symptoms, whether helpline was phoned, and if any residents were affected..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <Button type="submit" variant="danger" size="md" className="w-full mt-2">
            Dispatch Problem Alert
          </Button>
        </form>
      </Modal>
    </div>
  );
};
