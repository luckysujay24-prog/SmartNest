import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { storage } from '../../services/storage';
import {
  Building,
  Users,
  Wrench,
  Receipt,
  CreditCard,
  AlertCircle,
  Megaphone,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { EnrichedFlat, EnrichedBill, EnrichedComplaint, Payment } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateBill: () => void;
  onOpenCreateCommonBill: () => void;
  onOpenAddFlat: () => void;
  onOpenCreateAnnouncement: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenCreateBill,
  onOpenCreateCommonBill,
  onOpenAddFlat,
  onOpenCreateAnnouncement,
}) => {
  const [flats, setFlats] = useState<EnrichedFlat[]>([]);
  const [bills, setBills] = useState<EnrichedBill[]>([]);
  const [complaints, setComplaints] = useState<EnrichedComplaint[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workersCount, setWorkersCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setFlats(storage.getEnrichedFlats());
      setBills(storage.getEnrichedBills());
      setComplaints(storage.getEnrichedComplaints());
      setPayments(storage.getPayments());
      setWorkersCount(storage.getWorkers().length);
    };
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, []);

  const totalFlats = flats.length;
  const occupiedFlats = flats.filter((f) => f.occupancy_status === 'OCCUPIED').length;
  const vacantFlats = totalFlats - occupiedFlats;

  // Privacy boundary: Admin only monitors society maintenance & common bills
  const societyBills = bills.filter((b) => b.bill_type !== 'RENT');
  const pendingBills = societyBills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE');
  const outstandingAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  const societyBillIds = new Set(societyBills.map((b) => b.id));
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESS' && societyBillIds.has(p.bill_id));
  const monthlyCollection = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

  const openComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Rejected'
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200/60 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Community Administrator Console</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Grand Palms Residency Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management of {totalFlats} units, occupancy, billing splits, and maintenance requests.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenAddFlat}
          >
            Add Flat
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Receipt className="w-4 h-4 text-blue-600" />}
            onClick={onOpenCreateCommonBill}
          >
            Split Common Bill
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Receipt className="w-4 h-4" />}
            onClick={onOpenCreateBill}
          >
            Create Bill
          </Button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Flats & Occupancy */}
        <Card hoverable onClick={() => onNavigateTab('flats')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flats</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{totalFlats}</span>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="text-emerald-600 font-medium">{occupiedFlats} Occupied</span>
              <span>•</span>
              <span className="text-slate-400">{vacantFlats} Vacant</span>
            </div>
          </div>
        </Card>

        {/* Monthly Collections */}
        <Card hoverable onClick={() => onNavigateTab('payments')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Society Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">
              ₹{monthlyCollection.toLocaleString('en-IN')}
            </span>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{successfulPayments.length} verified society payments</span>
            </div>
          </div>
        </Card>

        {/* Outstanding Dues */}
        <Card hoverable onClick={() => onNavigateTab('bills')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Society Maintenance Dues</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              ₹{outstandingAmount.toLocaleString('en-IN')}
            </span>
            <div className="text-xs text-amber-600 font-medium mt-1">
              {pendingBills.length} pending / overdue bills
            </div>
          </div>
        </Card>

        {/* Open Complaints */}
        <Card hoverable onClick={() => onNavigateTab('complaints')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{openComplaints.length}</span>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{workersCount} active service staff</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Open Complaints & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Complaints Queue */}
        <Card>
          <CardHeader
            title="Complaints Requiring Attention"
            subtitle="Active residential issues needing dispatch or resolution"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigateTab('complaints')}
              >
                View all
              </Button>
            }
          />

          <div className="divide-y divide-slate-100">
            {openComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No open complaints at this time.</p>
            ) : (
              openComplaints.slice(0, 4).map((c) => (
                <div key={c.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={c.status} />
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{c.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-700">Flat {c.flat_number}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onNavigateTab('complaints')}
                      className="text-xs text-blue-600 font-semibold hover:underline mt-1"
                    >
                      {c.assigned_worker_id ? 'Review' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Payments Ledger */}
        <Card>
          <CardHeader
            title="Recent Verified Settlements"
            subtitle="Audited financial transactions cleared via escrow"
            action={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigateTab('payments')}
              >
                Full ledger
              </Button>
            }
          />

          <div className="divide-y divide-slate-100">
            {successfulPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No settled payments recorded yet.</p>
            ) : (
              successfulPayments.slice(0, 4).map((p) => {
                const bill = bills.find((b) => b.id === p.bill_id);
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{bill?.title || 'Bill Payment'}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-600">{p.transaction_id}</span>
                          <span>•</span>
                          <span>{p.payment_method_title || p.payment_provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">SETTLED</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Community Announcements Ribbon */}
      <Card>
        <CardHeader
          title="Active Community Announcements"
          subtitle="Notices broadcasted to Grand Palms residents"
          action={
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={onOpenCreateAnnouncement}
            >
              Post Notice
            </Button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storage.getAnnouncements().slice(0, 3).map((ann) => (
            <div key={ann.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    {ann.category}
                  </span>
                  <StatusBadge status={ann.priority} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ann.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {ann.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex justify-between">
                <span>By {ann.author_name || 'Admin'}</span>
                <span>{new Date(ann.published_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
