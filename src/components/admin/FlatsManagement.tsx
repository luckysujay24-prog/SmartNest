import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { StatusBadge } from '../ui/Badge';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { EnrichedFlat, OccupancyStatus, User } from '../../types';
import {
  Building,
  Plus,
  Search,
  KeyRound,
  Users,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Receipt,
} from 'lucide-react';

export const FlatsManagement: React.FC = () => {
  const { success, error } = useToast();
  const [flats, setFlats] = useState<EnrichedFlat[]>([]);
  const [buildings, setBuildings] = useState(storage.getBuildings());
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('ALL');

  // Add Flat Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [floorNumber, setFloorNumber] = useState(1);
  const [flatType, setFlatType] = useState('2BHK');
  const [areaSqft, setAreaSqft] = useState(1200);
  const [rentAmount, setRentAmount] = useState(30000);
  const [maintenanceAmount, setMaintenanceAmount] = useState(4000);
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>('VACANT');
  const [ownerId, setOwnerId] = useState('');
  const [tenantId, setTenantId] = useState('');

  // Assign Modal (Only for Owner assignment by Admin; Tenants are assigned by Owners)
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    type: 'OWNER';
    flat: EnrichedFlat | null;
    selectedUserId: string;
  }>({
    isOpen: false,
    type: 'OWNER',
    flat: null,
    selectedUserId: '',
  });

  const refreshData = () => {
    setFlats(storage.getEnrichedFlats());
    setBuildings(storage.getBuildings());
    setUsers(storage.getUsers());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return () => unsub();
  }, []);

  const ownersList = users.filter((u) => u.role === 'OWNER');
  const tenantsList = users.filter((u) => u.role === 'TENANT');

  const filteredFlats = flats.filter((f) => {
    const matchesSearch =
      f.flat_number.toLowerCase().includes(search.toLowerCase()) ||
      f.owner?.name.toLowerCase().includes(search.toLowerCase()) ||
      f.tenant?.name.toLowerCase().includes(search.toLowerCase()) ||
      f.building_name.toLowerCase().includes(search.toLowerCase());

    const matchesBuilding = selectedBuilding === 'ALL' || f.building_id === selectedBuilding;
    const matchesOccupancy = selectedOccupancy === 'ALL' || f.occupancy_status === selectedOccupancy;

    return matchesSearch && matchesBuilding && matchesOccupancy;
  });

  const handleCreateFlat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber || !buildingId) {
      error('Missing details', 'Please enter a flat number and select building.');
      return;
    }

    // Check duplicate
    if (flats.some((f) => f.building_id === buildingId && f.flat_number.toLowerCase() === flatNumber.toLowerCase())) {
      error('Duplicate flat', `Flat ${flatNumber} already exists in this building.`);
      return;
    }

    storage.createFlat(
      {
        building_id: buildingId,
        flat_number: flatNumber.trim().toUpperCase(),
        floor_number: Number(floorNumber),
        flat_type: flatType,
        area_sqft: Number(areaSqft),
        rent_amount: Number(rentAmount),
        maintenance_amount: Number(maintenanceAmount),
        occupancy_status: 'VACANT',
      },
      ownerId || undefined,
      undefined
    );

    success('Flat Created', `Unit ${flatNumber.toUpperCase()} added to inventory. Property Owner can assign tenants.`);
    setIsAddModalOpen(false);
    resetAddForm();
  };

  const resetAddForm = () => {
    setFlatNumber('');
    setFloorNumber(1);
    setFlatType('2BHK');
    setAreaSqft(1200);
    setRentAmount(30000);
    setMaintenanceAmount(4000);
    setOccupancyStatus('VACANT');
    setOwnerId('');
    setTenantId('');
  };

  const handleToggleOccupancy = (flat: EnrichedFlat) => {
    const newStatus = flat.occupancy_status === 'OCCUPIED' ? 'VACANT' : 'OCCUPIED';
    storage.updateFlat(flat.id, { occupancy_status: newStatus });
    success('Occupancy Updated', `Flat ${flat.flat_number} marked as ${newStatus}.`);
  };

  const handleSaveAssignment = () => {
    if (!assignModalData.flat || !assignModalData.selectedUserId) return;

    storage.assignOwner(assignModalData.flat.id, assignModalData.selectedUserId);
    success('Owner Assigned', `Updated owner for Flat ${assignModalData.flat.flat_number}.`);

    setAssignModalData({ isOpen: false, type: 'OWNER', flat: null, selectedUserId: '' });
  };

  const handleRemoveTenant = (flat: EnrichedFlat) => {
    if (confirm(`Remove tenant from Flat ${flat.flat_number} and mark as VACANT?`)) {
      storage.removeTenant(flat.id);
      success('Tenant Removed', `Flat ${flat.flat_number} is now vacant.`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Apartments & Flats Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage unit details, square footage, assigned owners, and tenant occupancy.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setBuildingId(buildings[0]?.id || '');
            setIsAddModalOpen(true);
          }}
        >
          Add New Flat
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search flat number, resident, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            <option value="ALL">All Wings & Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Select
            value={selectedOccupancy}
            onChange={(e) => setSelectedOccupancy(e.target.value)}
          >
            <option value="ALL">All Occupancy Statuses</option>
            <option value="OCCUPIED">Occupied Only</option>
            <option value="VACANT">Vacant Only</option>
          </Select>
        </div>
      </Card>

      {/* Flats Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Flat & Building</th>
                <th className="px-4 py-3">Type & Area</th>
                <th className="px-4 py-3">Occupancy</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Current Tenant</th>
                <th className="px-4 py-3">Rent / Maint</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFlats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No flats match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFlats.map((flat) => (
                  <tr key={flat.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Flat & Building */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 text-sm">{flat.flat_number}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {flat.building_name} • Floor {flat.floor_number}
                      </span>
                    </td>

                    {/* Type & Area */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{flat.flat_type}</span>
                      <span className="text-[11px] text-slate-500 block">{flat.area_sqft} sq.ft</span>
                    </td>

                    {/* Occupancy */}
                    <td className="px-4 py-3">
                      <StatusBadge status={flat.occupancy_status} />
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3">
                      {flat.owner ? (
                        <div>
                          <span className="font-medium text-slate-900">{flat.owner.name}</span>
                          <span className="text-[10px] text-slate-400 block">{flat.owner.phone}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setAssignModalData({
                              isOpen: true,
                              type: 'OWNER',
                              flat,
                              selectedUserId: ownersList[0]?.id || '',
                            })
                          }
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          + Assign Owner
                        </button>
                      )}
                    </td>

                    {/* Tenant */}
                    <td className="px-4 py-3">
                      {flat.tenant ? (
                        <div>
                          <span className="font-medium text-slate-900">{flat.tenant.name}</span>
                          <span className="text-[10px] text-slate-400 block">{flat.tenant.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Vacant (Assigned by Owner)
                        </span>
                      )}
                    </td>

                    {/* Rent / Maintenance */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 text-sm block">
                        Maint: ₹{flat.maintenance_amount.toLocaleString('en-IN')}/mo
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (Est. Rent: ₹{flat.rent_amount.toLocaleString('en-IN')})
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleOccupancy(flat)}
                          title={`Toggle occupancy to ${flat.occupancy_status === 'OCCUPIED' ? 'VACANT' : 'OCCUPIED'}`}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          {flat.occupancy_status === 'OCCUPIED' ? (
                            <XCircle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                        {flat.tenant && (
                          <button
                            onClick={() => handleRemoveTenant(flat)}
                            title="Vacate tenant"
                            className="text-[11px] text-rose-600 hover:underline px-1.5 py-0.5 rounded hover:bg-rose-50 font-medium"
                          >
                            Vacate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Flat Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Residential Apartment"
        subtitle="Record new unit into Grand Palms Residency master registry"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFlat} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Building / Wing"
              required
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>

            <Input
              label="Flat Number"
              required
              placeholder="e.g. A-402, B-701"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Floor Number"
              type="number"
              min={0}
              max={50}
              required
              value={floorNumber}
              onChange={(e) => setFloorNumber(Number(e.target.value))}
            />

            <Select
              label="Flat Type"
              value={flatType}
              onChange={(e) => setFlatType(e.target.value)}
            >
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="Penthouse">Duplex Penthouse</option>
            </Select>

            <Input
              label="Area (Sq.Ft)"
              type="number"
              min={300}
              max={10000}
              required
              value={areaSqft}
              onChange={(e) => setAreaSqft(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Standard Rent (₹/mo)"
              type="number"
              min={0}
              step={500}
              required
              value={rentAmount}
              onChange={(e) => setRentAmount(Number(e.target.value))}
            />

            <Input
              label="Society Maintenance (₹/mo)"
              type="number"
              min={0}
              step={100}
              required
              value={maintenanceAmount}
              onChange={(e) => setMaintenanceAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Select
              label="Assign Owner (Society Registry)"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">-- No Owner Assigned Yet --</option>
              {ownersList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </Select>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex flex-col justify-center">
              <span className="font-bold flex items-center gap-1">
                🔒 Tenant Lease Privacy
              </span>
              <span className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                Tenants are selected, leased, and onboarded directly by the registered Property Owner via their Owner Portal.
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Apartment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Owner Modal */}
      <Modal
        isOpen={assignModalData.isOpen}
        onClose={() => setAssignModalData({ ...assignModalData, isOpen: false })}
        title="Assign Property Owner"
        subtitle={`Record legal ownership for Flat ${assignModalData.flat?.flat_number}`}
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <Select
            label="Choose Registered Owner"
            value={assignModalData.selectedUserId}
            onChange={(e) => setAssignModalData({ ...assignModalData, selectedUserId: e.target.value })}
          >
            {ownersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email} ({u.phone})
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignModalData({ ...assignModalData, isOpen: false })}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAssignment}>
              Confirm Owner Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
