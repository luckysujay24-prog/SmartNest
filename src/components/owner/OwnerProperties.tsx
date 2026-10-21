import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { StatusBadge } from '../ui/Badge';
import { useAuth } from '../../services/authContext';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { EnrichedFlat, User } from '../../types';
import {
  Building,
  Phone,
  Mail,
  User as UserIcon,
  Layers,
  UserCheck,
  UserMinus,
  Receipt,
  MessageSquare,
  Plus,
  KeyRound,
  DollarSign,
  Calendar,
} from 'lucide-react';

export const OwnerProperties: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();
  const [flats, setFlats] = useState<EnrichedFlat[]>([]);
  const [allTenants, setAllTenants] = useState<User[]>([]);

  // Assign Tenant Modal
  const [assignModalFlat, setAssignModalFlat] = useState<EnrichedFlat | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [leaseRentAmount, setLeaseRentAmount] = useState<number>(30000);
  const [isNewTenantMode, setIsNewTenantMode] = useState<boolean>(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');

  // Rent Bill Modal
  const [billModalFlat, setBillModalFlat] = useState<EnrichedFlat | null>(null);
  const [billTitle, setBillTitle] = useState('Monthly House Rent - October 2026');
  const [billAmount, setBillAmount] = useState(30000);
  const [billDueDate, setBillDueDate] = useState('2026-10-10');

  const refresh = () => {
    if (!currentUser) return;
    const allFlats = storage.getEnrichedFlats();
    setFlats(allFlats.filter((f) => f.owner_id === currentUser.id || f.owner?.id === currentUser.id));
    setAllTenants(storage.getUsers().filter((u) => u.role === 'TENANT'));
  };

  useEffect(() => {
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, [currentUser]);

  const handleOpenAssign = (flat: EnrichedFlat) => {
    setAssignModalFlat(flat);
    setLeaseRentAmount(flat.rent_amount || 30000);
    setIsNewTenantMode(false);
    setSelectedTenantId(allTenants[0]?.id || '');
    setNewTenantName('');
    setNewTenantEmail('');
    setNewTenantPhone('');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalFlat) return;

    let tenantToAssignId = selectedTenantId;

    if (isNewTenantMode) {
      if (!newTenantName || !newTenantEmail || !newTenantPhone) {
        error('Missing Information', 'Please fill in the new tenant’s full name, email, and phone number.');
        return;
      }

      const createdTenant = storage.createUser({
        name: newTenantName.trim(),
        email: newTenantEmail.trim().toLowerCase(),
        phone: newTenantPhone.trim(),
        role: 'TENANT',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newTenantName)}`,
        is_active: true,
        apartment_name: assignModalFlat.building_name,
        community_id: assignModalFlat.building_id ? 'comm-101' : undefined,
      });

      tenantToAssignId = createdTenant.id;
    }

    if (!tenantToAssignId) {
      error('Selection Required', 'Please select or register a tenant.');
      return;
    }

    // Update agreed rent amount in flat record
    storage.updateFlat(assignModalFlat.id, {
      rent_amount: Number(leaseRentAmount),
      occupancy_status: 'OCCUPIED',
    });

    // Assign tenant to flat
    storage.assignTenant(assignModalFlat.id, tenantToAssignId);

    success('Tenant Assigned!', `Successfully assigned leaseholder to Flat ${assignModalFlat.flat_number}.`);
    setAssignModalFlat(null);
  };

  const handleVacateFlat = (flat: EnrichedFlat) => {
    if (confirm(`Are you sure you want to vacate tenant ${flat.tenant?.name || ''} from Flat ${flat.flat_number}?`)) {
      storage.removeTenant(flat.id);
      success('Flat Vacated', `Flat ${flat.flat_number} is now marked as vacant and available for lease.`);
    }
  };

  const handleOpenIssueBill = (flat: EnrichedFlat) => {
    setBillModalFlat(flat);
    setBillTitle(`Monthly House Rent - October 2026 (Flat ${flat.flat_number})`);
    setBillAmount(flat.rent_amount || 30000);
    setBillDueDate('2026-10-10');
  };

  const handleConfirmIssueBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billModalFlat || !billModalFlat.tenant) return;

    storage.createBill({
      community_id: 'comm-101',
      flat_id: billModalFlat.id,
      bill_type: 'RENT',
      title: billTitle,
      description: `Monthly rental lease invoice issued directly by property owner ${currentUser?.name || ''}.`,
      billing_period_start: '2026-10-01',
      billing_period_end: '2026-10-31',
      amount: Number(billAmount),
      due_date: billDueDate,
      status: 'PENDING',
      created_by: currentUser?.id || 'usr-owner',
    });

    // Also send an automated private message notice to the tenant
    storage.sendPrivateMessage(
      currentUser?.id || '',
      billModalFlat.tenant.id,
      `Hello ${billModalFlat.tenant.name}, I have generated your rent invoice for Flat ${billModalFlat.flat_number}: ₹${Number(billAmount).toLocaleString('en-IN')}, due on ${billDueDate}. You can clear it via the Rent & Bills portal.`,
      'Owner Rent Invoice'
    );

    success('Rent Invoice Issued!', `Rent bill of ₹${billAmount.toLocaleString('en-IN')} sent to ${billModalFlat.tenant.name}.`);
    setBillModalFlat(null);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Properties & Units</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full ownership control: onboard & assign your tenants, manage rent yield, and issue private rent invoices.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
          👑 {flats.length} Properties Registered to You
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flats.map((flat) => (
          <Card key={flat.id} className="p-5 flex flex-col justify-between border-slate-200 shadow-xs">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-lg font-extrabold text-slate-900 block">
                    Flat {flat.flat_number}
                  </span>
                  <span className="text-xs text-slate-500">
                    {flat.building_name} • Floor {flat.floor_number}
                  </span>
                </div>
                <StatusBadge status={flat.occupancy_status} />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Apartment Type</span>
                  <span className="font-semibold text-slate-900">{flat.flat_type}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Super Built-up Area</span>
                  <span className="font-semibold text-slate-900">{flat.area_sqft} sq.ft</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Agreed Monthly Rent</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₹{flat.rent_amount.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Society Maintenance</span>
                  <span className="font-semibold text-slate-700">
                    ₹{flat.maintenance_amount.toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>

              {/* Tenant Section */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Tenant (Managed by You)
                  </span>
                  {flat.tenant && (
                    <button
                      onClick={() => handleVacateFlat(flat)}
                      className="text-[11px] text-rose-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Vacate Tenant
                    </button>
                  )}
                </div>

                {flat.tenant ? (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          flat.tenant.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${flat.tenant.name}`
                        }
                        alt={flat.tenant.name}
                        className="w-10 h-10 rounded-full border border-blue-200 object-cover bg-white shrink-0"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{flat.tenant.name}</span>
                        <span className="text-slate-500 text-[11px]">{flat.tenant.phone} • {flat.tenant.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Unit is Currently Vacant</span>
                      <span className="text-[11px] text-amber-700">You have exclusive right to assign your tenant.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              {flat.tenant ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    leftIcon={<Receipt className="w-3.5 h-3.5 text-blue-600" />}
                    onClick={() => handleOpenIssueBill(flat)}
                  >
                    Issue Rent Invoice
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    leftIcon={<UserCheck className="w-3.5 h-3.5 text-purple-600" />}
                    onClick={() => handleOpenAssign(flat)}
                  >
                    Change Tenant
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => handleOpenAssign(flat)}
                >
                  Assign & Onboard Tenant
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Assign Tenant Modal */}
      {assignModalFlat && (
        <Modal
          isOpen={!!assignModalFlat}
          onClose={() => setAssignModalFlat(null)}
          title={`Assign Tenant to Flat ${assignModalFlat.flat_number}`}
          subtitle="As the legal owner, you select who resides in your apartment and set the lease rent."
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAssignment} className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsNewTenantMode(false)}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  !isNewTenantMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Choose Registered Tenant
              </button>
              <button
                type="button"
                onClick={() => setIsNewTenantMode(true)}
                className={`py-1.5 rounded-md transition-all cursor-pointer ${
                  isNewTenantMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Register New Tenant
              </button>
            </div>

            {!isNewTenantMode ? (
              <div>
                <Select
                  label="Select Tenant Profile"
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                >
                  {allTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.phone} ({t.email})
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Tenant Full Name"
                  required
                  placeholder="e.g. Ananya Deshmukh"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    placeholder="tenant@smartnest.in"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                  />
                  <Input
                    label="Phone Number"
                    required
                    placeholder="+91 98765 43210"
                    value={newTenantPhone}
                    onChange={(e) => setNewTenantPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <Input
                label="Agreed Monthly Rent Amount (₹)"
                type="number"
                min={1000}
                step={500}
                required
                value={leaseRentAmount}
                onChange={(e) => setLeaseRentAmount(Number(e.target.value))}
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                This is strictly between you and your tenant. Society admin cannot view or modify your lease payments.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setAssignModalFlat(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm & Lease Unit
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Issue Rent Bill Modal */}
      {billModalFlat && (
        <Modal
          isOpen={!!billModalFlat}
          onClose={() => setBillModalFlat(null)}
          title={`Generate Rent Invoice for Flat ${billModalFlat.flat_number}`}
          subtitle={`Issued directly to tenant ${billModalFlat.tenant?.name || ''}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmIssueBill} className="space-y-4 text-left">
            <Input
              label="Invoice Title"
              required
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rent Amount (₹)"
                type="number"
                min={1}
                required
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
              />
              <Input
                label="Due Date"
                type="date"
                required
                value={billDueDate}
                onChange={(e) => setBillDueDate(e.target.value)}
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
              <span className="font-bold block">🔒 Private Settlement Notice</span>
              <span className="text-[11px] text-purple-700 mt-0.5 block leading-relaxed">
                When you generate this bill, the invoice is published directly to your tenant's portal and an automated notification is sent via private chat. Society admin will have no access to this rent transaction.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setBillModalFlat(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Send Rent Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
