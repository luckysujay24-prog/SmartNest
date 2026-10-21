import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { useToast } from '../ui/Toast';
import { ServiceProvider, Worker, ServiceBooking } from '../../types';
import {
  Store,
  CalendarCheck,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

interface ServiceBookingPortalProps {
  onOpenChatWithWorker?: (workerUserId: string) => void;
}

export const ServiceBookingPortal: React.FC<ServiceBookingPortalProps> = ({
  onOpenChatWithWorker,
}) => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const services = storage.getServices();
  const workers = storage.getWorkers();
  const allUsers = storage.getUsers();
  const allBookings = storage.getBookings();

  // Selected Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);

  // Form Fields
  const [bookingDate, setBookingDate] = useState('2026-10-08');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [flatNumber, setFlatNumber] = useState(
    currentUser?.flat_id ? storage.getFlats().find((f) => f.id === currentUser?.flat_id)?.flat_number || 'A-301' : 'A-301'
  );
  const [issueDescription, setIssueDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Post-Booking Success Modal
  const [justBookedData, setJustBookedData] = useState<{
    booking: ServiceBooking;
    workerUserId?: string;
  } | null>(null);

  // Filter Bookings for Current User
  const userBookings = currentUser
    ? allBookings.filter((b) => b.user_id === currentUser.id)
    : allBookings;

  const categories = ['ALL', 'Electrician', 'Plumber', 'Cleaner', 'AC technician', 'Carpenter', 'Maid', 'Water service'];

  const filteredServices = services.filter((srv) => {
    if (selectedCategory !== 'ALL' && srv.category !== selectedCategory) return false;
    return true;
  });

  const handleStartBooking = (service: ServiceProvider, worker?: Worker) => {
    setSelectedService(service);
    if (worker) {
      setSelectedWorker(worker);
    } else {
      // Find a worker matching category
      const matched = workers.find((w) => w.worker_type.toLowerCase() === service.category.toLowerCase()) || workers[0];
      setSelectedWorker(matched || null);
    }
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      error('Problem Details Required', 'Please explain what needs fixing.');
      return;
    }
    if (!currentUser) {
      error('Login Required', 'Please sign in to book a service appointment.');
      return;
    }

    setIsLoading(true);

    const workerUser = selectedWorker ? allUsers.find((u) => u.id === selectedWorker.user_id) : null;
    const workerName = workerUser ? workerUser.name : selectedService?.provider_name || 'Staff Technician';
    const workerPhone = workerUser?.phone || selectedService?.phone || '+91 98800 33221';

    const newBooking = storage.createBooking({
      service_id: selectedService?.id || 'srv-01',
      worker_id: selectedWorker?.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_phone: currentUser.phone,
      flat_number: flatNumber,
      service_name: selectedService?.name || 'Home Maintenance Service',
      worker_name: workerName,
      worker_phone: workerPhone,
      booking_date: bookingDate,
      time_slot: timeSlot,
      issue_description: issueDescription.trim(),
      status: 'CONFIRMED',
    });

    setIsLoading(false);
    setIsBookingModalOpen(false);

    // Save for direct chat modal trigger
    setJustBookedData({
      booking: newBooking,
      workerUserId: selectedWorker?.user_id || workerUser?.id,
    });

    success('Slot Booked & Dispatched!', `Appointment confirmed with ${workerName}. Message sent to private chat!`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-300">
              🛠️ Service Appointments & Private Dispatch
            </span>
            <span className="text-xs text-slate-500 font-medium">Direct 1-on-1 Chat Linked</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Doorstep Technician Services & Slot Booking Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book certified electricians, plumbers & cleaners by slot. All bookings auto-dispatch into private chat with the technician.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Providers & Available Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredServices.map((service) => {
          // Find matching worker
          const matchingWorker = workers.find(
            (w) => w.worker_type.toLowerCase() === service.category.toLowerCase()
          );
          const workerUser = matchingWorker
            ? allUsers.find((u) => u.id === matchingWorker.user_id)
            : null;

          const isBusy = matchingWorker?.availability === 'BUSY';

          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{service.rating}</span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 mb-1">{service.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{service.description}</p>

                {/* Worker Preview Badge */}
                {matchingWorker && workerUser && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={workerUser.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                        alt={workerUser.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{workerUser.name}</span>
                        <span className="text-[10px] text-slate-500 block">{workerUser.phone}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isBusy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isBusy ? 'Currently Busy' : 'Available Now'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {matchingWorker.completed_tasks_count} Jobs done
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleStartBooking(service, matchingWorker)}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Book Free Slot</span>
                </button>

                {workerUser && onOpenChatWithWorker && (
                  <button
                    onClick={() => onOpenChatWithWorker(workerUser.id)}
                    title="Direct Private Chat"
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booked Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Active Service Bookings & Chat Links ({userBookings.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Auto-synced with MongoDB Compass</span>
        </div>

        {userBookings.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No service appointments scheduled yet. Click "Book Free Slot" above to schedule a technician.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Service & Technician</th>
                  <th className="py-3 px-3">Resident / Flat</th>
                  <th className="py-3 px-3">Date & Slot</th>
                  <th className="py-3 px-3">Reported Problem</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Private Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userBookings.map((b) => {
                  const workerObj = workers.find((w) => w.id === b.worker_id);
                  const workerUserId = workerObj?.user_id;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{b.service_name}</span>
                        <span className="text-[11px] text-slate-500">
                          {b.worker_name} ({b.worker_phone})
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">Flat {b.flat_number}</span>
                        <span className="text-[11px] text-slate-500">{b.user_name}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-900 block">{b.booking_date}</span>
                        <span className="text-[11px] text-blue-600 font-semibold">{b.time_slot}</span>
                      </td>

                      <td className="py-3 px-3 max-w-xs truncate" title={b.issue_description}>
                        {b.issue_description}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {workerUserId && onOpenChatWithWorker ? (
                          <button
                            onClick={() => onOpenChatWithWorker(workerUserId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open Chat</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: BOOKING FORM */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Schedule Service Time Slot"
        subtitle={selectedService ? `${selectedService.name} · Direct private chat will be dispatched` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmBooking} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Appointment Date"
              type="date"
              required
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />

            <Select
              label="Preferred Time Slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            >
              <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
              <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
              <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM</option>
              <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
            </Select>
          </div>

          <Input
            label="Flat / House Number"
            required
            placeholder="e.g. A-301 or B-502"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe Problem / Work Requirement:
            </label>
            <textarea
              required
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g. Bathroom shower mixer cartridge replacement and drainage unclogging..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Upon clicking "Confirm", a 1-on-1 private message is automatically sent to the technician with these appointment details.
            </span>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
            Confirm Appointment & Dispatch Chat
          </Button>
        </form>
      </Modal>

      {/* MODAL 2: BOOKING CONFIRMATION & DIRECT CHAT JUMP */}
      {justBookedData && (
        <Modal
          isOpen={!!justBookedData}
          onClose={() => setJustBookedData(null)}
          title="Slot Confirmed & Message Sent!"
          subtitle="Your appointment is officially scheduled"
          maxWidth="sm"
        >
          <div className="space-y-4 text-left">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-emerald-900 block font-bold text-sm">
                  Booking ID: {justBookedData.booking.id}
                </strong>
                <span className="text-emerald-700 block mt-1">
                  Scheduled for {justBookedData.booking.booking_date} at {justBookedData.booking.time_slot}.
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Dispatched to Private Chat:
              </span>
              <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                "Hello {justBookedData.booking.worker_name}, I have confirmed an appointment for {justBookedData.booking.service_name} on {justBookedData.booking.booking_date} ({justBookedData.booking.time_slot}). Problem details: {justBookedData.booking.issue_description}"
              </p>
            </div>

            {justBookedData.workerUserId && onOpenChatWithWorker ? (
              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  const targetId = justBookedData.workerUserId;
                  setJustBookedData(null);
                  if (targetId) onOpenChatWithWorker(targetId);
                }}
              >
                <span>Open Private Chat with Technician</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setJustBookedData(null)}
              >
                Done
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
