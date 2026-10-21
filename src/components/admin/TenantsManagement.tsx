import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { User, EnrichedFlat } from '../../types';
import { Users, Plus, Phone, Mail, Home, Search, UserMinus } from 'lucide-react';

export const TenantsManagement: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [flats, setFlats] = useState<EnrichedFlat[]>([]);
  const [search, setSearch] = useState('');

  // Add Tenant Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetFlatId, setTargetFlatId] = useState('');

  const refresh = () => {
    setUsers(storage.getUsers());
    setFlats(storage.getEnrichedFlats());
  };

  useEffect(() => {
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, []);

  const tenants = users.filter((u) => u.role === 'TENANT');
  const vacantFlats = flats.filter((f) => f.occupancy_status === 'VACANT');

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search)
  );

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      error('Missing details', 'Please provide name, email, and phone.');
      return;
    }

    const newTenant = storage.createUser({
      name,
      email,
      phone,
      role: 'TENANT',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      is_active: true,
    });

    if (targetFlatId) {
      storage.assignTenant(targetFlatId, newTenant.id);
    }

    success('Tenant Registered', `${name} onboarded into residency.`);
    setIsAddOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setTargetFlatId('');
  };

  const handleVacateTenant = (tenant: User) => {
    const flat = flats.find((f) => f.tenant_id === tenant.id);
    if (!flat) return;

    if (confirm(`Vacate ${tenant.name} from Flat ${flat.flat_number}?`)) {
      storage.removeTenant(flat.id);
      success('Tenant Vacated', `Flat ${flat.flat_number} marked as vacant.`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Resident Tenants Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified resident leaseholders. (Flats are leased and assigned directly by respective Property Owners).
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setTargetFlatId(vacantFlats[0]?.id || flats[0]?.id || '');
            setIsAddOpen(true);
          }}
        >
          Add Tenant
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <Input
          placeholder="Search by tenant name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.map((tenant) => {
          const occupiedFlat = flats.find((f) => f.tenant_id === tenant.id);
          return (
            <Card key={tenant.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={tenant.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.name}`}
                    alt={tenant.name}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover bg-slate-100"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tenant.name}</h3>
                    <span className="text-xs text-blue-600 font-semibold">Active Tenant</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tenant.email}</span>
                  </div>
                </div>

                {/* Occupied Flat Badge */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Residence
                  </span>
                  {occupiedFlat ? (
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                        Flat {occupiedFlat.flat_number} ({occupiedFlat.building_name})
                      </span>
                      <button
                        onClick={() => handleVacateTenant(tenant)}
                        className="text-xs text-rose-600 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Vacate
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No flat currently linked</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Tenant Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Onboard Resident Tenant"
        subtitle="Register new tenant and assign designated apartment"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTenant} className="space-y-3.5 text-left">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Ananya Iyer"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. ananya.iyer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="e.g. +91 91234 56789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select
            label="Assign Flat Unit"
            value={targetFlatId}
            onChange={(e) => setTargetFlatId(e.target.value)}
            helperText="Vacant units listed with preference"
          >
            <option value="">-- Assign Later --</option>
            {flats.map((f) => (
              <option key={f.id} value={f.id}>
                Flat {f.flat_number} ({f.flat_type} - {f.occupancy_status})
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
