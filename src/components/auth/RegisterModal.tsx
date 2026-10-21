import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useAuth } from '../../services/authContext';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { UserRole, Community } from '../../types';
import { Building2, MapPin, ShieldCheck, Home } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const { register } = useAuth();
  const { success, error } = useToast();

  const communities = storage.getCommunities();
  const flats = storage.getFlats();

  // Mode: existing vs new apartment
  const [aptMode, setAptMode] = useState<'existing' | 'new'>('existing');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(communities[0]?.id || '');
  
  // New apartment fields (compulsory if new)
  const [newAptName, setNewAptName] = useState('');
  const [newAptAddress, setNewAptAddress] = useState('');

  // Resident details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('TENANT');
  const [flatNumber, setFlatNumber] = useState('');
  const [flatId, setFlatId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active selected community info
  const selectedCommunity = communities.find((c) => c.id === selectedCommunityId) || communities[0];
  const buildingsInComm = storage.getBuildings().filter((b) => b.community_id === selectedCommunityId);
  const buildingIds = new Set(buildingsInComm.map((b) => b.id));
  const availableFlats = flats.filter((f) => buildingIds.has(f.building_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      error('Missing fields', 'Please provide full name, email, and contact number.');
      return;
    }

    let aptName = '';
    let aptAddress = '';
    let commId: string | undefined = undefined;

    if (aptMode === 'existing') {
      if (!selectedCommunity) {
        error('Apartment Required', 'Please select a valid registered apartment.');
        return;
      }
      aptName = selectedCommunity.name;
      aptAddress = `${selectedCommunity.address}, ${selectedCommunity.city}, ${selectedCommunity.state} - ${selectedCommunity.postal_code}`;
      commId = selectedCommunity.id;
    } else {
      if (!newAptName.trim() || !newAptAddress.trim()) {
        error('Apartment Required', 'Apartment Name and Full Street Address are strictly compulsory.');
        return;
      }
      aptName = newAptName.trim();
      aptAddress = newAptAddress.trim();
    }

    setIsLoading(true);
    const res = await register({
      name,
      email,
      phone,
      role,
      community_id: commId,
      apartment_name: aptName,
      apartment_address: aptAddress,
      flat_id: flatId || undefined,
      flat_number: flatNumber || (flatId ? flats.find((f) => f.id === flatId)?.flat_number : 'Unit 101'),
    });
    setIsLoading(false);

    if (res.success) {
      success('Registration Complete!', `Welcome to CommunityHub at ${aptName}.`);
      onClose();
    } else {
      error('Registration failed', res.error || 'Unable to register account.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register on SmartNest"
      subtitle="Apartment & address registration is mandatory for all members"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[80vh] overflow-y-auto px-1">
        {/* Mandatory Apartment Registration Card */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Mandatory Apartment Registration</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
              Compulsory
            </span>
          </div>

          {/* Toggle existing vs new */}
          <div className="grid grid-cols-2 gap-2 bg-blue-100/60 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAptMode('existing')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                aptMode === 'existing'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Select Existing Apartment ({communities.length})
            </button>
            <button
              type="button"
              onClick={() => setAptMode('new')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                aptMode === 'new'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Register New Apartment
            </button>
          </div>

          {aptMode === 'existing' ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Choose Your Apartment Complex:
              </label>
              <select
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.city}, {c.state}
                  </option>
                ))}
              </select>

              {selectedCommunity && (
                <div className="p-2.5 bg-white border border-blue-200/80 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">{selectedCommunity.name}</strong>
                    <span>{selectedCommunity.address}, {selectedCommunity.city}, {selectedCommunity.state} - {selectedCommunity.postal_code}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="New Apartment / Society Name"
                required
                placeholder="e.g. Prestige Lakeview Residences"
                value={newAptName}
                onChange={(e) => setNewAptName(e.target.value)}
              />
              <Input
                label="Full Official Address (Street, City, State, Pincode)"
                required
                placeholder="e.g. 104 Bannerghatta Road, Arekere, Bengaluru, Karnataka 560076"
                value={newAptAddress}
                onChange={(e) => setNewAptAddress(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Rohan Verma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="e.g. +91 98765 00000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Input
          label="Email Address (Login Credential)"
          type="email"
          required
          placeholder="e.g. rohan@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Role & Flat Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Account Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="TENANT">Tenant / Resident</option>
            <option value="OWNER">Property Owner</option>
            <option value="SECURITY">Security Guard / Watchman</option>
            <option value="ADMIN">Apartment Society Admin</option>
          </Select>

          {aptMode === 'existing' && availableFlats.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Flat / Unit:
              </label>
              <select
                className="w-full text-xs rounded-lg border border-slate-300 bg-white p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                value={flatId}
                onChange={(e) => {
                  setFlatId(e.target.value);
                  const f = availableFlats.find((fl) => fl.id === e.target.value);
                  if (f) setFlatNumber(f.flat_number);
                }}
              >
                <option value="">-- Choose Unit --</option>
                {availableFlats.map((f) => (
                  <option key={f.id} value={f.id}>
                    Flat {f.flat_number} ({f.flat_type} - {f.occupancy_status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="Flat / Unit Number"
              placeholder="e.g. Flat A-302"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
            />
          )}
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Your account will be securely linked to the designated apartment register and MongoDB Compass database.
          </span>
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading}>
          Complete Registration & Sign In
        </Button>

        <p className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in here
          </button>
        </p>
      </form>
    </Modal>
  );
};
