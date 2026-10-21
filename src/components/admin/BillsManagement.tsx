import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { StatusBadge } from '../ui/Badge';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import {
  Bill,
  BillType,
  AllocationMethod,
  EnrichedBill,
  EnrichedFlat,
} from '../../types';
import {
  Receipt,
  Plus,
  Divide,
  Search,
  CheckCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface BillsManagementProps {
  initialOpenCommonBill?: boolean;
}

export const BillsManagement: React.FC<BillsManagementProps> = ({
  initialOpenCommonBill = false,
}) => {
  const { success, error } = useToast();
  const [bills, setBills] = useState<EnrichedBill[]>([]);
  const [flats, setFlats] = useState<EnrichedFlat[]>([]);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Single Bill Modal
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [singleFlatId, setSingleFlatId] = useState('');
  const [singleBillType, setSingleBillType] = useState<BillType>('MAINTENANCE');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleDescription, setSingleDescription] = useState('');
  const [singleAmount, setSingleAmount] = useState(4000);
  const [singlePeriodStart, setSinglePeriodStart] = useState('2026-09-01');
  const [singlePeriodEnd, setSinglePeriodEnd] = useState('2026-09-30');
  const [singleDueDate, setSingleDueDate] = useState('2026-09-15');

  // Common Bill Modal
  const [isCommonModalOpen, setIsCommonModalOpen] = useState(initialOpenCommonBill);
  const [commonBillType, setCommonBillType] = useState<BillType>('COMMON_WATER');
  const [commonTitle, setCommonTitle] = useState('Central Potable Water Tankers');
  const [commonDescription, setCommonDescription] = useState('Society water procurement for domestic use');
  const [commonTotalAmount, setCommonTotalAmount] = useState(36000);
  const [commonAllocationMethod, setCommonAllocationMethod] = useState<AllocationMethod>('EQUAL');
  const [commonPeriodStart, setCommonPeriodStart] = useState('2026-09-01');
  const [commonPeriodEnd, setCommonPeriodEnd] = useState('2026-09-30');
  const [commonDueDate, setCommonDueDate] = useState('2026-09-18');

  const refresh = () => {
    setBills(storage.getEnrichedBills());
    setFlats(storage.getEnrichedFlats());
  };

  useEffect(() => {
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, []);

  const filteredBills = bills.filter((b) => {
    // Privacy boundary: Admins manage society dues only, not private owner-tenant rent
    if (b.bill_type === 'RENT') return false;

    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.flat_number && b.flat_number.toLowerCase().includes(search.toLowerCase())) ||
      (b.recipient_name && b.recipient_name.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'ALL' || b.bill_type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateSingleBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFlatId || !singleTitle || singleAmount <= 0) {
      error('Invalid bill', 'Please select a flat, enter a valid title and positive amount.');
      return;
    }

    storage.createBill({
      community_id: 'comm-101',
      flat_id: singleFlatId,
      bill_type: singleBillType,
      title: singleTitle,
      description: singleDescription,
      billing_period_start: singlePeriodStart,
      billing_period_end: singlePeriodEnd,
      amount: Number(singleAmount),
      due_date: singleDueDate,
      status: 'PENDING',
      created_by: 'usr-admin-1',
    });

    success('Bill Created', `Bill created for Flat ${flats.find((f) => f.id === singleFlatId)?.flat_number}.`);
    setIsSingleModalOpen(false);
    setSingleTitle('');
    setSingleDescription('');
  };

  const handleCreateCommonBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonTitle || commonTotalAmount <= 0) {
      error('Invalid bill', 'Please enter a valid common bill title and amount.');
      return;
    }

    const { childBills } = storage.createCommonBillWithAllocation(
      {
        community_id: 'comm-101',
        bill_type: commonBillType,
        title: commonTitle,
        description: commonDescription,
        billing_period_start: commonPeriodStart,
        billing_period_end: commonPeriodEnd,
        amount: Number(commonTotalAmount),
        due_date: commonDueDate,
        status: 'PENDING',
        created_by: 'usr-admin-1',
      },
      commonAllocationMethod
    );

    success(
      'Common Bill Allocated',
      `Allocated ₹${commonTotalAmount.toLocaleString('en-IN')} across ${childBills.length} residential flats via ${commonAllocationMethod}.`
    );
    setIsCommonModalOpen(false);
  };

  // Preview calculations for Common Bill allocation
  const occupiedFlats = flats.filter((f) => f.occupancy_status === 'OCCUPIED');
  const targetFlats = occupiedFlats.length > 0 ? occupiedFlats : flats;
  const totalSqft = targetFlats.reduce((sum, f) => sum + f.area_sqft, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Society Maintenance & Common Funds</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage society maintenance charges, utility sub-meters, and split common society expenses. (Private lease rent is managed exclusively between property owners and tenants).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Divide className="w-4 h-4 text-blue-600" />}
            onClick={() => setIsCommonModalOpen(true)}
          >
            Split Common Expense
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSingleFlatId(flats[0]?.id || '');
              setIsSingleModalOpen(true);
            }}
          >
            Create Individual Bill
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by title, flat, or resident name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="ALL">All Society Bill Types</option>
            <option value="MAINTENANCE">Maintenance Only</option>
            <option value="ELECTRICITY">Electricity Only</option>
            <option value="COMMON_WATER">Common Water Share</option>
            <option value="COMMON_ELECTRICITY">Common Power</option>
            <option value="SECURITY">Security Expenses</option>
          </Select>
          <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PAID">Paid / Cleared</option>
            <option value="OVERDUE">Overdue Only</option>
          </Select>
        </div>
      </Card>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Bill Details</th>
                <th className="px-4 py-3">Assigned Unit / Target</th>
                <th className="px-4 py-3">Billing Period</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Bill Details */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 text-sm block">{b.title}</span>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        {b.bill_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">
                        {b.flat_number === 'All Flats / Common' ? 'Community Master' : `Flat ${b.flat_number}`}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{b.recipient_name}</span>
                    </td>

                    {/* Period */}
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {b.billing_period_start} to {b.billing_period_end}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {b.due_date}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{b.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      {b.status !== 'PAID' ? (
                        <button
                          onClick={() => {
                            storage.updateFlat(b.flat_id || '', {});
                            // Admin manual reconcile
                            const admin = storage.getUsers().find((u) => u.role === 'ADMIN');
                            storage.processPayment(b.id, admin?.id || 'usr-admin-1', 'Manual/Cash', 'Admin Direct Clearance');
                            success('Payment Reconciled', `Bill "${b.title}" marked as PAID.`);
                          }}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Individual Bill */}
      <Modal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        title="Generate Individual Flat Bill"
        subtitle="Issue rent, sub-meter electric, or specific maintenance fee"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSingleBill} className="space-y-4 text-left">
          <Select
            label="Target Flat"
            required
            value={singleFlatId}
            onChange={(e) => {
              setSingleFlatId(e.target.value);
              const flat = flats.find((f) => f.id === e.target.value);
              if (flat && singleBillType === 'RENT') {
                setSingleAmount(flat.rent_amount);
              }
            }}
          >
            {flats.map((f) => (
              <option key={f.id} value={f.id}>
                Flat {f.flat_number} ({f.building_name}) - {f.tenant ? f.tenant.name : 'Vacant'}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Bill Category"
              value={singleBillType}
              onChange={(e) => {
                const val = e.target.value as BillType;
                setSingleBillType(val);
                const flat = flats.find((f) => f.id === singleFlatId);
                if (val === 'MAINTENANCE' && flat) {
                  setSingleTitle(`Society Maintenance - Flat ${flat.flat_number}`);
                  setSingleAmount(flat.maintenance_amount);
                } else if (val === 'ELECTRICITY') {
                  setSingleTitle(`Electricity Sub-Meter Charges`);
                  setSingleAmount(2400);
                }
              }}
            >
              <option value="MAINTENANCE">Society Maintenance</option>
              <option value="ELECTRICITY">Electricity Sub-Meter</option>
              <option value="WATER">Water Meter Charges</option>
              <option value="GAS">Piped Gas Supply</option>
              <option value="INTERNET">Broadband Infrastructure</option>
              <option value="OTHER">Other Society Assessment</option>
            </Select>

            <Input
              label="Amount (₹)"
              type="number"
              min={1}
              required
              value={singleAmount}
              onChange={(e) => setSingleAmount(Number(e.target.value))}
            />
          </div>

          <Input
            label="Bill Title"
            required
            placeholder="e.g. Monthly Rent - September 2026"
            value={singleTitle}
            onChange={(e) => setSingleTitle(e.target.value)}
          />

          <Input
            label="Description / Meter Reading"
            placeholder="e.g. Sub-meter reading 410 kWh @ ₹7.50 + Fixed charge"
            value={singleDescription}
            onChange={(e) => setSingleDescription(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Period Start"
              type="date"
              required
              value={singlePeriodStart}
              onChange={(e) => setSinglePeriodStart(e.target.value)}
            />
            <Input
              label="Period End"
              type="date"
              required
              value={singlePeriodEnd}
              onChange={(e) => setSinglePeriodEnd(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              required
              value={singleDueDate}
              onChange={(e) => setSingleDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSingleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish Bill
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Common Bill & Allocation Engine */}
      <Modal
        isOpen={isCommonModalOpen}
        onClose={() => setIsCommonModalOpen(false)}
        title="Create & Split Common Community Expense"
        subtitle="Automatically calculates and creates individual flat payment obligations"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCommonBill} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Common Expense Type"
              value={commonBillType}
              onChange={(e) => setCommonBillType(e.target.value as BillType)}
            >
              <option value="COMMON_WATER">Common Water Tankers</option>
              <option value="COMMON_ELECTRICITY">Common Area Lighting / Lifts</option>
              <option value="SECURITY">Security Agency Monthly Fee</option>
              <option value="CLEANING">Sanitization & Deep Cleaning</option>
              <option value="MAINTENANCE">Central Lift / DG Generator AMC</option>
              <option value="OTHER">Other Community Expense</option>
            </Select>

            <Input
              label="Total Master Expense (₹)"
              type="number"
              min={1}
              required
              value={commonTotalAmount}
              onChange={(e) => setCommonTotalAmount(Number(e.target.value))}
            />
          </div>

          <Input
            label="Expense Title"
            required
            placeholder="e.g. Society Central Water Tankers - September 2026"
            value={commonTitle}
            onChange={(e) => setCommonTitle(e.target.value)}
          />

          <Input
            label="Details & Vendor Invoice Reference"
            placeholder="e.g. 6 Tankers procured from Crystal Clean Water Service (Inv #442)"
            value={commonDescription}
            onChange={(e) => setCommonDescription(e.target.value)}
          />

          {/* Allocation Method Selector */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Allocation Model:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCommonAllocationMethod('EQUAL')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  commonAllocationMethod === 'EQUAL'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold text-xs block">Equal Split per Flat</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Divide equally across {targetFlats.length} flats (≈ ₹
                  {Math.round(commonTotalAmount / targetFlats.length).toLocaleString('en-IN')}/flat)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCommonAllocationMethod('AREA_BASED')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  commonAllocationMethod === 'AREA_BASED'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="font-bold text-xs block">Area-Based (Sq.Ft Proportional)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Proportionate share calculated by flat square footage (Total {totalSqft} sq.ft)
                </span>
              </button>
            </div>
          </div>

          {/* Real-time Allocation Preview Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 border-b border-slate-200">
              Live Allocation Preview ({targetFlats.length} flats):
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
              {targetFlats.map((f) => {
                const share =
                  commonAllocationMethod === 'EQUAL'
                    ? Math.round(commonTotalAmount / targetFlats.length)
                    : Math.round((f.area_sqft / totalSqft) * commonTotalAmount);

                return (
                  <div key={f.id} className="px-3 py-1.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800">Flat {f.flat_number}</span>
                      <span className="text-slate-400 text-[10px] ml-1.5">({f.area_sqft} sq.ft)</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{share.toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Period Start"
              type="date"
              required
              value={commonPeriodStart}
              onChange={(e) => setCommonPeriodStart(e.target.value)}
            />
            <Input
              label="Period End"
              type="date"
              required
              value={commonPeriodEnd}
              onChange={(e) => setCommonPeriodEnd(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              required
              value={commonDueDate}
              onChange={(e) => setCommonDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCommonModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Publish & Allocate ({targetFlats.length} Bills)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
