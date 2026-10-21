import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { useToast } from '../ui/Toast';
import { ServiceProvider, Worker, ServiceBooking } from '../../types';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Wrench,
  User,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceProvider | null;
  onBookingSuccess?: (booking: ServiceBooking) => void;
}

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:30 AM - 11:30 AM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM',
  '06:30 PM - 07:30 PM',
];

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  onBookingSuccess,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const getNextDays = () => {
    const dates: { dateStr: string; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      dates.push({ dateStr, label });
    }
    return dates;
  };

  const availableDays = getNextDays();
  const [selectedDate, setSelectedDate] = useState(availableDays[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [issueDescription, setIssueDescription] = useState('');
  const [flatNumber, setFlatNumber] = useState('A-301');
  const [confirmedBooking, setConfirmedBooking] = useState<ServiceBooking | null>(null);

  if (!service) return null;

  // Match corresponding worker
  const allWorkers = storage.getWorkers();
  const matchedWorker = allWorkers.find(
    (w) =>
      w.worker_type.toLowerCase() === service.category.toLowerCase() ||
      service.name.toLowerCase().includes(w.worker_type.toLowerCase())
  );

  const workerAvailability = matchedWorker ? matchedWorker.availability : 'AVAILABLE';
  const existingBookings = storage.getBookings();

  // Check which slots are already booked for this worker & date
  const isSlotBooked = (slot: string) => {
    return existingBookings.some(
      (b) =>
        b.booking_date === selectedDate &&
        b.time_slot === slot &&
        (b.service_id === service.id || (matchedWorker && b.worker_id === matchedWorker.id)) &&
        b.status !== 'CANCELLED'
    );
  };

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      error('Authentication Required', 'Please sign in to book an appointment.');
      return;
    }

    if (isSlotBooked(selectedSlot)) {
      error('Slot Unavailable', 'This time slot was just taken. Please choose another free slot.');
      return;
    }

    const booking = storage.createBooking({
      service_id: service.id,
      worker_id: matchedWorker?.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_phone: currentUser.phone,
      flat_number: flatNumber,
      service_name: service.name,
      worker_name: matchedWorker ? service.provider_name : service.provider_name,
      worker_phone: service.phone,
      booking_date: selectedDate,
      time_slot: selectedSlot,
      issue_description: issueDescription || `Request for ${service.category} service at Flat ${flatNumber}`,
      status: 'CONFIRMED',
    });

    setConfirmedBooking(booking);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    success('Slot Booked Successfully!', `Worker scheduled for ${selectedSlot} on ${selectedDate}.`);
    if (onBookingSuccess) onBookingSuccess(booking);
  };

  const handleCloseAndReset = () => {
    setConfirmedBooking(null);
    setIssueDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAndReset}
      title={confirmedBooking ? 'Appointment Confirmed' : `Book Service Slot: ${service.name}`}
      subtitle={
        confirmedBooking
          ? 'Confirmed with official resident welfare slot allocation'
          : `Category: ${service.category} • Provider: ${service.provider_name}`
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {!confirmedBooking ? (
          <form onSubmit={handleBookSlot} className="space-y-4">
            {/* Worker Availability Header */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{service.provider_name}</h4>
                  <p className="text-xs text-slate-500">{service.description.slice(0, 55)}...</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    workerAvailability === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {workerAvailability === 'AVAILABLE' ? '🟢 Available Now' : '🟡 Currently Busy'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Rating: ⭐ {service.rating}</span>
              </div>
            </div>

            {/* Direct Call Banner if busy */}
            {workerAvailability === 'BUSY' && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Worker is currently engaged on an active resident job. You can call directly or reserve their next free slot below.
                  </span>
                </div>
                <a
                  href={`tel:${service.phone}`}
                  className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold text-xs whitespace-nowrap"
                >
                  Call Now
                </a>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Service Date
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {availableDays.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedDate === d.dateStr
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-2xs ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                      {d.label.slice(0, 3)}
                    </span>
                    <span className="block text-xs font-bold mt-0.5">
                      {new Date(d.dateStr).getDate()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Select Free Time Slot
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const booked = isSlotBooked(slot);
                  const isSelected = selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        booked
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-600 cursor-pointer shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Clock className="w-3.5 h-3.5" />
                        <span className={`text-[9px] font-bold uppercase ${booked ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {booked ? 'Booked' : 'Free'}
                        </span>
                      </div>
                      <span className="block mt-1 font-semibold">{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resident Flat & Problem Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Flat / Unit</label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. A-301"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue / Task Note</label>
                <input
                  type="text"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  placeholder="e.g. Switchboard sparking, AC leaking, etc."
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${service.phone}`}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                Call {service.phone}
              </a>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCloseAndReset}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <CalendarCheck className="w-4 h-4 mr-1.5" />
                  Confirm Slot Booking
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your service visit has been registered in the CommunityHub schedule.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Professional:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.worker_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Direct Contact:</span>
                <a href={`tel:${confirmedBooking.worker_phone}`} className="font-bold text-blue-600 font-mono">
                  {confirmedBooking.worker_phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {confirmedBooking.booking_date} • {confirmedBooking.time_slot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flat Assigned:</span>
                <span className="font-semibold text-slate-800">{confirmedBooking.flat_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono text-slate-600">{confirmedBooking.id}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={handleCloseAndReset}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
