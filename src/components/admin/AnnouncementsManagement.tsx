import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { StatusBadge } from '../ui/Badge';
import { storage } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { Announcement, AnnouncementCategory, Priority } from '../../types';
import { Megaphone, Plus, Trash2, Calendar, UserCheck } from 'lucide-react';

interface AnnouncementsManagementProps {
  initialOpenCreate?: boolean;
}

export const AnnouncementsManagement: React.FC<AnnouncementsManagementProps> = ({
  initialOpenCreate = false,
}) => {
  const { success, error } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Post Notice Modal
  const [isPostOpen, setIsPostOpen] = useState(initialOpenCreate);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('Notice');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [targetRole, setTargetRole] = useState<'ALL' | 'OWNERS' | 'TENANTS' | 'WORKERS'>('ALL');

  const refresh = () => {
    setAnnouncements(storage.getAnnouncements());
  };

  useEffect(() => {
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, []);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      error('Missing fields', 'Title and description are required.');
      return;
    }

    storage.createAnnouncement({
      community_id: 'comm-101',
      title,
      description,
      category,
      priority,
      target_role: targetRole,
      created_by: 'usr-admin-1',
      author_name: 'Sunita Deshmukh (Admin)',
      published_at: new Date().toISOString(),
    });

    success('Notice Published', `Broadcasted to ${targetRole.toLowerCase()} residents.`);
    setIsPostOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Delete this community announcement?')) {
      storage.deleteAnnouncement(id);
      success('Notice Removed', 'Announcement removed from active bulletin.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Community Bulletin & Notices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast official notices, maintenance shutdowns, security advisories, and social events.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsPostOpen(true)}
        >
          Post Announcement
        </Button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  {ann.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={ann.priority} />
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    title="Delete notice"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                {ann.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Audience: {ann.target_role || 'All Residents'}</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(ann.published_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Post Notice Modal */}
      <Modal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        title="Publish Community Notice"
        subtitle="Broadcast officially to Grand Palms Residency boards"
        maxWidth="md"
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-3.5 text-left">
          <Input
            label="Notice Title"
            required
            placeholder="e.g. Annual General Body Meeting (AGM)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
            >
              <option value="Notice">Notice</option>
              <option value="Event">Event</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Emergency">Emergency</option>
              <option value="General">General</option>
            </Select>

            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>

            <Select
              label="Target"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as any)}
            >
              <option value="ALL">All Residents</option>
              <option value="OWNERS">Owners Only</option>
              <option value="TENANTS">Tenants Only</option>
              <option value="WORKERS">Workers Only</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notice Description / Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide clear details, timings, action items, and contact persons..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPostOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
