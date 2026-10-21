import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/authContext';
import { User, PrivateMessage, UserRole } from '../../types';
import {
  MessageSquare,
  Search,
  Send,
  Shield,
  KeyRound,
  Home,
  Wrench,
  Lock,
  Phone,
  CheckCheck,
  Check,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PrivateChatViewProps {
  initialPartnerId?: string;
  onClose?: () => void;
}

export const PrivateChatView: React.FC<PrivateChatViewProps> = ({
  initialPartnerId,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(initialPartnerId || '');
  const [searchContact, setSearchContact] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | UserRole>('ALL');
  const [messageText, setMessageText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('General');
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    if (!currentUser) return;
    const allUsers = storage.getUsers().filter((u) => u.id !== currentUser.id);
    setUsers(allUsers);

    if (selectedPartnerId) {
      const conv = storage.getConversation(currentUser.id, selectedPartnerId);
      setMessages(conv);
      storage.markConversationAsRead(selectedPartnerId, currentUser.id);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(loadData);
    return unsub;
  }, [currentUser, selectedPartnerId]);

  useEffect(() => {
    if (!selectedPartnerId && users.length > 0 && !initialPartnerId) {
      // Default to first contact
      setSelectedPartnerId(users[0].id);
    }
  }, [users, initialPartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser) return null;

  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    storage.markConversationAsRead(partnerId, currentUser.id);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedPartnerId) return;

    storage.sendPrivateMessage(
      currentUser.id,
      selectedPartnerId,
      messageText.trim(),
      selectedTag
    );

    setMessageText('');
    setSelectedTag('General');
  };

  const selectedPartner = users.find((u) => u.id === selectedPartnerId);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3 h-3 text-rose-600" />;
      case 'OWNER':
        return <KeyRound className="w-3 h-3 text-purple-600" />;
      case 'TENANT':
        return <Home className="w-3 h-3 text-blue-600" />;
      case 'WORKER':
        return <Wrench className="w-3 h-3 text-amber-600" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole): any => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'OWNER':
        return 'purple';
      case 'TENANT':
        return 'info';
      case 'WORKER':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Filter contacts
  const filteredContacts = users.filter((u) => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchContact.toLowerCase()) ||
      u.email.toLowerCase().includes(searchContact.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const QUICK_PROMPTS = [
    'Regarding Society Maintenance',
    'Rent & Utilities Receipt Query',
    'Service Booking Confirmation',
    'Urgent Maintenance Issue',
    'Visitor Gate Verification',
  ];

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] flex flex-col text-left">
      {/* Title Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Private 1-on-1 Messenger
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" /> Strictly Confidential
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Encrypted direct channel between residents, owners, workers, and administration. Outsiders cannot view your conversations.
          </p>
        </div>

        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Back to Dashboard
          </Button>
        )}
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Left: Contacts Sidebar */}
        <div className="w-72 sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search Contacts */}
          <div className="p-3 border-b border-slate-200 space-y-2">
            <Input
              placeholder="Search contacts..."
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="text-xs"
            />

            {/* Quick Role Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['ALL', 'ADMIN', 'OWNER', 'TENANT', 'WORKER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    filterRole === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredContacts.map((contact) => {
              const isSelected = contact.id === selectedPartnerId;
              const conv = storage.getConversation(currentUser.id, contact.id);
              const lastMsg = conv[conv.length - 1];
              const unreadCount = conv.filter(
                (m) => m.sender_id === contact.id && m.recipient_id === currentUser.id && !m.is_read
              ).length;

              return (
                <div
                  key={contact.id}
                  onClick={() => handleSelectPartner(contact.id)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors text-left ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-white"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{contact.name}</h4>
                      {unreadCount > 0 && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        {getRoleIcon(contact.role)}
                        {contact.role}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {lastMsg ? lastMsg.message : 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredContacts.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching contacts found
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Conversation Window */}
        {selectedPartner ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-3.5 px-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedPartner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPartner.name}`}
                    alt={selectedPartner.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {selectedPartner.name}
                    <Badge variant={getRoleBadgeVariant(selectedPartner.role)}>
                      {selectedPartner.role}
                    </Badge>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{selectedPartner.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active in Residency
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedPartner.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call {selectedPartner.phone}</span>
                </a>
              </div>
            </div>

            {/* Privacy Notice Banner */}
            <div className="bg-slate-100/70 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>
                <strong>Confidential Channel:</strong> Only you and {selectedPartner.name} have access to this conversation.
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Start a Private Conversation</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Send a message directly to {selectedPartner.name}. No other residents or outsiders can read this chat.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-3 px-4 shadow-2xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        {msg.tag && msg.tag !== 'General' && (
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mb-1 uppercase tracking-wider ${
                              isMe ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {msg.tag}
                          </span>
                        )}

                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>

                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                            isMe ? 'text-blue-100/80' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-200" title="Read" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-blue-300" title="Sent" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Topic Chips */}
            <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Topic:
              </span>
              {['General', 'Maintenance', 'Rent & Bills', 'Gate & Security', 'Booking'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(t)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedTag === t
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder={`Type a private message to ${selectedPartner.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="px-4 py-2.5 h-auto rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
                disabled={!messageText.trim()}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Send
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <h3 className="text-base font-bold text-slate-700">Select a Resident or Staff to Chat</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Choose from the contacts list on the left to start a strictly private 1-on-1 conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
