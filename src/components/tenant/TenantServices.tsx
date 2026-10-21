import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { ServiceProvider, ServiceBooking, Worker } from '../../types';
import { ServiceBookingModal } from '../services/ServiceBookingModal';
import {
  Store,
  Phone,
  Star,
  CheckCircle,
  Search,
  MapPin,
  Calendar,
  Clock,
  CalendarCheck,
  AlertCircle,
  Wrench,
  User,
  XCircle,
} from 'lucide-react';

export const TenantServices: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'BOOKINGS'>('DIRECTORY');
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [myBookings, setMyBookings] = useState<ServiceBooking[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceProvider | null>(null);

  const loadData = () => {
    setServices(storage.getServices());
    setWorkers(storage.getWorkers());
    if (currentUser) {
      setMyBookings(storage.getUserBookings(currentUser.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(loadData);
    return unsub;
  }, [currentUser]);

  const getWorkerForService = (s: ServiceProvider) => {
    return workers.find(
      (w) =>
        w.worker_type.toLowerCase() === s.category.toLowerCase() ||
        s.name.toLowerCase().includes(w.worker_type.toLowerCase())
    );
  };

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.provider_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || s.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      storage.updateBookingStatus(bookingId, 'CANCELLED');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header and Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Community Services & Technician Booking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Call verified electricians, plumbers, and water vendors directly or book their free time slots when busy.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'DIRECTORY'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services & Technicians
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BOOKINGS'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>My Bookings ({myBookings.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'DIRECTORY' ? (
        <>
          {/* Search & Filter Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Search vendor name, electrician, plumber..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
              <Select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Water service">Water Tankers</option>
                <option value="Maid">Housekeeping / Maid</option>
                <option value="Chef">Chef / Cook</option>
                <option value="Laundry">Laundry Service</option>
                <option value="AC technician">AC & Appliance Care</option>
              </Select>
            </div>
          </Card>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => {
              const matchedWorker = getWorkerForService(s);
              const availability = matchedWorker ? matchedWorker.availability : 'AVAILABLE';
              const isBusy = availability === 'BUSY';

              return (
                <Card
                  key={s.id}
                  className="p-5 flex flex-col justify-between border-slate-200/90 hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Category & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-md">
                        {s.category}
                      </span>

                      {/* Real-time Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isBusy
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBusy ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        {isBusy ? 'Busy Now' : 'Available Now'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">{s.name}</h3>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      Professional: <strong>{s.provider_name}</strong>
                    </p>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {s.description}
                    </p>

                    {/* Busy explanation note */}
                    {isBusy && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Currently servicing another flat. Call directly or reserve a free slot.</span>
                      </div>
                    )}

                    {s.address && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row: Call + Book Slot */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{s.rating}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${s.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                        title="Direct Call"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>

                      <Button
                        variant={isBusy ? 'primary' : 'outline'}
                        size="sm"
                        className="text-xs font-semibold"
                        onClick={() => setSelectedServiceForBooking(s)}
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {isBusy ? 'Book Slot' : 'Schedule'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        /* My Bookings View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Your Scheduled Appointments ({myBookings.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('DIRECTORY')}
            >
              + Book New Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map((b) => (
              <Card key={b.id} className="p-4 border-slate-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Ref: {b.id}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{b.service_name}</h4>
                  </div>
                  <Badge
                    variant={
                      b.status === 'CONFIRMED'
                        ? 'success'
                        : b.status === 'IN_PROGRESS'
                        ? 'warning'
                        : b.status === 'COMPLETED'
                        ? 'default'
                        : 'danger'
                    }
                  >
                    {b.status}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {b.booking_date} • {b.time_slot}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Worker:</span>
                    <span className="font-semibold text-slate-800">{b.worker_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <a href={`tel:${b.worker_phone}`} className="font-bold text-blue-600 font-mono">
                      {b.worker_phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Flat:</span>
                    <span className="font-medium text-slate-800">{b.flat_number}</span>
                  </div>
                  {b.issue_description && (
                    <div className="pt-1.5 border-t border-slate-200 text-slate-600 text-[11px]">
                      <strong>Task:</strong> {b.issue_description}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${b.worker_phone}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call {b.worker_name}
                  </a>

                  {b.status === 'CONFIRMED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 text-xs"
                      onClick={() => handleCancelBooking(b.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Cancel Slot
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {myBookings.length === 0 && (
            <Card className="p-8 text-center text-slate-500">
              <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No active service appointments</p>
              <p className="text-xs text-slate-400 mt-1">
                You can select an electrician, plumber, or cleaning specialist from the directory to book an upcoming slot.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedServiceForBooking && (
        <ServiceBookingModal
          isOpen={!!selectedServiceForBooking}
          onClose={() => setSelectedServiceForBooking(null)}
          service={selectedServiceForBooking}
          onBookingSuccess={() => {
            loadData();
            setActiveTab('BOOKINGS');
          }}
        />
      )}
    </div>
  );
};
