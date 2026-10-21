// ==========================================
// CommunityHub In-Browser Relational Data Store
// Reactive, durable in localStorage, with complete audit trail
// ==========================================

import {
  User,
  Community,
  Building,
  Flat,
  FlatOwner,
  FlatTenant,
  Worker,
  Bill,
  CommonBillAllocation,
  Payment,
  Complaint,
  ComplaintUpdate,
  Announcement,
  ServiceProvider,
  Notification,
  AuditLog,
  EnrichedFlat,
  EnrichedBill,
  EnrichedComplaint,
  AllocationMethod,
  ComplaintStatus,
  WorkerAvailability,
  ServiceBooking,
  PrivateMessage,
  VisitorLog,
  VisitorStatus,
  WatchmanIncidentReport,
  IncidentStatus,
} from '../types';

import {
  SEED_COMMUNITIES,
  SEED_COMMUNITY,
  SEED_BUILDINGS,
  SEED_USERS,
  SEED_FLATS,
  SEED_FLAT_OWNERS,
  SEED_FLAT_TENANTS,
  SEED_WORKERS,
  SEED_BILLS,
  SEED_COMMON_BILL_ALLOCATIONS,
  SEED_PAYMENTS,
  SEED_COMPLAINTS,
  SEED_COMPLAINT_UPDATES,
  SEED_ANNOUNCEMENTS,
  SEED_SERVICES,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_BOOKINGS,
  SEED_PRIVATE_MESSAGES,
  SEED_VISITOR_LOGS,
  SEED_INCIDENT_REPORTS,
} from './seedData';

const STORAGE_VERSION_KEY = 'communityhub_schema_version';
const CURRENT_STORAGE_VERSION = 'v3_multi_apt_security';

const STORAGE_KEYS = {
  COMMUNITIES: 'communityhub_communities',
  COMMUNITY: 'communityhub_community',
  BUILDINGS: 'communityhub_buildings',
  USERS: 'communityhub_users',
  FLATS: 'communityhub_flats',
  FLAT_OWNERS: 'communityhub_flat_owners',
  FLAT_TENANTS: 'communityhub_flat_tenants',
  WORKERS: 'communityhub_workers',
  BILLS: 'communityhub_bills',
  COMMON_BILL_ALLOCATIONS: 'communityhub_common_bill_allocations',
  PAYMENTS: 'communityhub_payments',
  COMPLAINTS: 'communityhub_complaints',
  COMPLAINT_UPDATES: 'communityhub_complaint_updates',
  ANNOUNCEMENTS: 'communityhub_announcements',
  SERVICES: 'communityhub_services',
  NOTIFICATIONS: 'communityhub_notifications',
  AUDIT_LOGS: 'communityhub_audit_logs',
  BOOKINGS: 'communityhub_service_bookings',
  PRIVATE_MESSAGES: 'communityhub_private_messages',
  VISITOR_LOGS: 'communityhub_visitor_logs',
  INCIDENT_REPORTS: 'communityhub_incident_reports',
};

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initIfEmpty();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }

  public initIfEmpty(forceReset = false): void {
    const existingVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    const needsMigration = existingVersion !== CURRENT_STORAGE_VERSION;

    if (forceReset || needsMigration || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
      localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(SEED_COMMUNITIES));
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(SEED_COMMUNITY));
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(SEED_BUILDINGS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(STORAGE_KEYS.FLATS, JSON.stringify(SEED_FLATS));
      localStorage.setItem(STORAGE_KEYS.FLAT_OWNERS, JSON.stringify(SEED_FLAT_OWNERS));
      localStorage.setItem(STORAGE_KEYS.FLAT_TENANTS, JSON.stringify(SEED_FLAT_TENANTS));
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(SEED_WORKERS));
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(SEED_BILLS));
      localStorage.setItem(STORAGE_KEYS.COMMON_BILL_ALLOCATIONS, JSON.stringify(SEED_COMMON_BILL_ALLOCATIONS));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(SEED_COMPLAINTS));
      localStorage.setItem(STORAGE_KEYS.COMPLAINT_UPDATES, JSON.stringify(SEED_COMPLAINT_UPDATES));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
      localStorage.setItem(STORAGE_KEYS.PRIVATE_MESSAGES, JSON.stringify(SEED_PRIVATE_MESSAGES));
      localStorage.setItem(STORAGE_KEYS.VISITOR_LOGS, JSON.stringify(SEED_VISITOR_LOGS));
      localStorage.setItem(STORAGE_KEYS.INCIDENT_REPORTS, JSON.stringify(SEED_INCIDENT_REPORTS));
      this.notify();
    }
  }

  public resetAllData(): void {
    this.initIfEmpty(true);
  }

  // ==================== USERS ====================
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  public getUser(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog('SYSTEM', 'CREATE_USER', 'users', newUser.id, null, newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const old = users[index];
    users[index] = {
      ...old,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  // ==================== COMMUNITIES & APARTMENTS ====================
  public getCommunities(): Community[] {
    return this.getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, SEED_COMMUNITIES);
  }

  public getCommunity(id?: string): Community {
    const list = this.getCommunities();
    if (id) {
      const found = list.find((c) => c.id === id);
      if (found) return found;
    }
    return this.getItem<Community>(STORAGE_KEYS.COMMUNITY, list[0] || SEED_COMMUNITY);
  }

  public createCommunity(data: Omit<Community, 'id' | 'created_at' | 'updated_at'>): Community {
    const communities = this.getCommunities();
    const newComm: Community = {
      ...data,
      id: `comm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    communities.push(newComm);
    this.setItem(STORAGE_KEYS.COMMUNITIES, communities);
    this.syncDocToMongo('communities', newComm);
    return newComm;
  }

  public updateCommunity(data: Partial<Community>): Community {
    const current = this.getCommunity();
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.COMMUNITY, updated);
    return updated;
  }

  public getBuildings(): Building[] {
    return this.getItem<Building[]>(STORAGE_KEYS.BUILDINGS, []);
  }

  public createBuilding(buildingData: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Building {
    const buildings = this.getBuildings();
    const newBld: Building = {
      ...buildingData,
      id: `bld-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    buildings.push(newBld);
    this.setItem(STORAGE_KEYS.BUILDINGS, buildings);
    return newBld;
  }

  // ==================== FLATS ====================
  public getFlats(): Flat[] {
    return this.getItem<Flat[]>(STORAGE_KEYS.FLATS, []);
  }

  public getFlatOwners(): FlatOwner[] {
    return this.getItem<FlatOwner[]>(STORAGE_KEYS.FLAT_OWNERS, []);
  }

  public getFlatTenants(): FlatTenant[] {
    return this.getItem<FlatTenant[]>(STORAGE_KEYS.FLAT_TENANTS, []);
  }

  public getEnrichedFlats(): EnrichedFlat[] {
    const flats = this.getFlats();
    const buildings = this.getBuildings();
    const users = this.getUsers();
    const flatOwners = this.getFlatOwners();
    const flatTenants = this.getFlatTenants();
    const bills = this.getBills();

    return flats.map((flat) => {
      const bld = buildings.find((b) => b.id === flat.building_id);
      const fo = flatOwners.find((o) => o.flat_id === flat.id && !o.ownership_end);
      const owner = fo ? users.find((u) => u.id === fo.owner_id) : null;

      const ft = flatTenants.find((t) => t.flat_id === flat.id && !t.move_out_date);
      const tenant = ft ? users.find((u) => u.id === ft.tenant_id) : null;

      const pendingBills = bills.filter(
        (b) => b.flat_id === flat.id && (b.status === 'PENDING' || b.status === 'OVERDUE')
      );
      const totalDue = pendingBills.reduce((sum, b) => sum + b.amount, 0);

      return {
        ...flat,
        building_name: bld?.name || 'Main Wing',
        owner,
        tenant,
        owner_id: owner?.id || null,
        tenant_id: tenant?.id || null,
        pending_bills_count: pendingBills.length,
        total_due_amount: totalDue,
      };
    });
  }

  public createFlat(
    flatData: Omit<Flat, 'id' | 'created_at' | 'updated_at'>,
    ownerId?: string,
    tenantId?: string,
    adminId = 'usr-admin-1'
  ): Flat {
    const flats = this.getFlats();
    const newFlat: Flat = {
      ...flatData,
      id: `flat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    flats.push(newFlat);
    this.setItem(STORAGE_KEYS.FLATS, flats);

    if (ownerId) {
      this.assignOwner(newFlat.id, ownerId);
    }
    if (tenantId) {
      this.assignTenant(newFlat.id, tenantId);
    }

    this.addAuditLog(adminId, 'CREATE_FLAT', 'flats', newFlat.id, null, newFlat);
    return newFlat;
  }

  public updateFlat(id: string, updates: Partial<Flat>, adminId = 'usr-admin-1'): Flat | null {
    const flats = this.getFlats();
    const index = flats.findIndex((f) => f.id === id);
    if (index === -1) return null;
    const old = flats[index];
    flats[index] = { ...old, ...updates, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.FLATS, flats);
    this.addAuditLog(adminId, 'UPDATE_FLAT', 'flats', id, old, flats[index]);
    return flats[index];
  }

  public assignOwner(flatId: string, ownerId: string): void {
    const flatOwners = this.getFlatOwners();
    // End previous primary ownership
    const updated = flatOwners.map((fo) =>
      fo.flat_id === flatId && !fo.ownership_end
        ? { ...fo, ownership_end: new Date().toISOString().slice(0, 10) }
        : fo
    );
    const newRecord: FlatOwner = {
      id: `fo-${Date.now()}`,
      flat_id: flatId,
      owner_id: ownerId,
      ownership_start: new Date().toISOString().slice(0, 10),
      ownership_end: null,
      is_primary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updated.push(newRecord);
    this.setItem(STORAGE_KEYS.FLAT_OWNERS, updated);
  }

  public assignTenant(flatId: string, tenantId: string): void {
    const flatTenants = this.getFlatTenants();
    const updated = flatTenants.map((ft) =>
      ft.flat_id === flatId && !ft.move_out_date
        ? { ...ft, move_out_date: new Date().toISOString().slice(0, 10) }
        : ft
    );
    const newRecord: FlatTenant = {
      id: `ft-${Date.now()}`,
      flat_id: flatId,
      tenant_id: tenantId,
      move_in_date: new Date().toISOString().slice(0, 10),
      move_out_date: null,
      is_primary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updated.push(newRecord);
    this.setItem(STORAGE_KEYS.FLAT_TENANTS, updated);

    // Update flat occupancy
    this.updateFlat(flatId, { occupancy_status: 'OCCUPIED' });
    // Update user link
    this.updateUser(tenantId, { flat_id: flatId });
  }

  public removeTenant(flatId: string): void {
    const flatTenants = this.getFlatTenants();
    let currentTenantId: string | null = null;
    const updated = flatTenants.map((ft) => {
      if (ft.flat_id === flatId && !ft.move_out_date) {
        currentTenantId = ft.tenant_id;
        return { ...ft, move_out_date: new Date().toISOString().slice(0, 10) };
      }
      return ft;
    });
    this.setItem(STORAGE_KEYS.FLAT_TENANTS, updated);
    this.updateFlat(flatId, { occupancy_status: 'VACANT' });
    if (currentTenantId) {
      this.updateUser(currentTenantId, { flat_id: undefined });
    }
  }

  // ==================== BILLS ====================
  public getBills(): Bill[] {
    return this.getItem<Bill[]>(STORAGE_KEYS.BILLS, []);
  }

  public getEnrichedBills(): EnrichedBill[] {
    const bills = this.getBills();
    const flats = this.getFlats();
    const buildings = this.getBuildings();
    const flatTenants = this.getFlatTenants();
    const users = this.getUsers();

    return bills.map((bill) => {
      let flatNumber = 'All Flats / Common';
      let buildingName = 'Community-Wide';
      let recipientName = 'Residents';

      if (bill.flat_id) {
        const flat = flats.find((f) => f.id === bill.flat_id);
        if (flat) {
          flatNumber = flat.flat_number;
          const bld = buildings.find((b) => b.id === flat.building_id);
          buildingName = bld?.name || 'Main Wing';
          const ft = flatTenants.find((t) => t.flat_id === flat.id && !t.move_out_date);
          const tenant = ft ? users.find((u) => u.id === ft.tenant_id) : null;
          recipientName = tenant ? tenant.name : 'Flat Occupant';
        }
      }

      return {
        ...bill,
        flat_number: flatNumber,
        building_name: buildingName,
        recipient_name: recipientName,
      };
    });
  }

  public createBill(billData: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Bill {
    const bills = this.getBills();
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    bills.unshift(newBill);
    this.setItem(STORAGE_KEYS.BILLS, bills);

    // Notify resident if flat_id is present
    if (newBill.flat_id) {
      const ft = this.getFlatTenants().find((t) => t.flat_id === newBill.flat_id && !t.move_out_date);
      if (ft) {
        this.addNotification({
          user_id: ft.tenant_id,
          title: `New Bill Generated: ${newBill.title}`,
          message: `Amount ₹${newBill.amount.toLocaleString()} is due on ${newBill.due_date}.`,
          type: 'BILL',
          reference_id: newBill.id,
        });
      }
    }

    this.addAuditLog(billData.created_by, 'CREATE_BILL', 'bills', newBill.id, null, newBill);
    return newBill;
  }

  public createCommonBillWithAllocation(
    masterBill: Omit<Bill, 'id' | 'flat_id' | 'created_at' | 'updated_at'>,
    method: AllocationMethod,
    adminId = 'usr-admin-1'
  ): { masterBill: Bill; childBills: Bill[] } {
    const flats = this.getFlats();
    const occupiedFlats = flats.filter((f) => f.occupancy_status === 'OCCUPIED');
    const targetFlats = occupiedFlats.length > 0 ? occupiedFlats : flats;

    // 1. Create master common bill
    const master: Bill = {
      ...masterBill,
      id: `bill-common-${Date.now()}`,
      flat_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const bills = this.getBills();
    bills.unshift(master);

    const allocations: CommonBillAllocation[] = [];
    const childBills: Bill[] = [];
    const totalSqft = targetFlats.reduce((sum, f) => sum + f.area_sqft, 0);

    targetFlats.forEach((flat) => {
      let flatShareAmount = 0;
      let allocValue = 0;

      if (method === 'EQUAL') {
        flatShareAmount = Math.round(master.amount / targetFlats.length);
        allocValue = 1 / targetFlats.length;
      } else if (method === 'AREA_BASED') {
        allocValue = flat.area_sqft;
        flatShareAmount = Math.round((flat.area_sqft / totalSqft) * master.amount);
      } else {
        flatShareAmount = Math.round(master.amount / targetFlats.length);
        allocValue = 1;
      }

      const childBill: Bill = {
        id: `bill-share-${Date.now()}-${flat.id}`,
        community_id: master.community_id,
        flat_id: flat.id,
        bill_type: master.bill_type,
        title: `${master.title} (Flat ${flat.flat_number} Share)`,
        description: `Common expense share allocated via ${method}. ${master.description}`,
        billing_period_start: master.billing_period_start,
        billing_period_end: master.billing_period_end,
        amount: flatShareAmount,
        due_date: master.due_date,
        status: 'PENDING',
        created_by: adminId,
        common_bill_parent_id: master.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      childBills.push(childBill);
      bills.unshift(childBill);

      allocations.push({
        id: `cba-${Date.now()}-${flat.id}`,
        bill_id: master.id,
        flat_id: flat.id,
        allocation_method: method,
        allocation_value: allocValue,
        amount: flatShareAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Notify resident
      const ft = this.getFlatTenants().find((t) => t.flat_id === flat.id && !t.move_out_date);
      if (ft) {
        this.addNotification({
          user_id: ft.tenant_id,
          title: `Common Bill Allocated: ${master.title}`,
          message: `Your flat's allocated share is ₹${flatShareAmount.toLocaleString()}, due on ${master.due_date}.`,
          type: 'BILL',
          reference_id: childBill.id,
        });
      }
    });

    this.setItem(STORAGE_KEYS.BILLS, bills);

    const existingAllocs = this.getItem<CommonBillAllocation[]>(STORAGE_KEYS.COMMON_BILL_ALLOCATIONS, []);
    this.setItem(STORAGE_KEYS.COMMON_BILL_ALLOCATIONS, [...existingAllocs, ...allocations]);

    this.addAuditLog(adminId, 'CREATE_COMMON_BILL', 'bills', master.id, null, {
      master,
      allocation_count: childBills.length,
      method,
    });

    return { masterBill: master, childBills };
  }

  // ==================== PAYMENTS ====================
  public getPayments(): Payment[] {
    return this.getItem<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  public processPayment(
    billId: string,
    userId: string,
    provider: string,
    methodTitle: string
  ): { success: boolean; payment: Payment; message?: string } {
    const bills = this.getBills();
    const billIndex = bills.findIndex((b) => b.id === billId);
    if (billIndex === -1) {
      return { success: false, payment: null as any, message: 'Bill record not found' };
    }

    const bill = bills[billIndex];
    if (bill.status === 'PAID') {
      return { success: false, payment: null as any, message: 'This bill is already fully settled.' };
    }

    // Server-side verification simulation
    const timestamp = Date.now();
    const transactionId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: `pay-${timestamp}`,
      bill_id: bill.id,
      user_id: userId,
      amount: bill.amount,
      currency: 'INR',
      payment_provider: provider,
      provider_reference: `ref_${Math.random().toString(36).slice(2, 12)}`,
      transaction_id: transactionId,
      status: 'SUCCESS',
      payment_date: new Date().toISOString(),
      payment_method_title: methodTitle,
      receipt_url: `/receipts/${transactionId}.pdf`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const payments = this.getPayments();
    payments.unshift(newPayment);
    this.setItem(STORAGE_KEYS.PAYMENTS, payments);

    // Mark bill as PAID
    bills[billIndex] = {
      ...bill,
      status: 'PAID',
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.BILLS, bills);

    // Notify user & admin
    this.addNotification({
      user_id: userId,
      title: 'Payment Successful',
      message: `Your payment of ₹${bill.amount.toLocaleString()} for ${bill.title} was completed. Ref: ${transactionId}`,
      type: 'PAYMENT',
      reference_id: newPayment.id,
    });

    const admin = this.getUsers().find((u) => u.role === 'ADMIN');
    if (admin) {
      this.addNotification({
        user_id: admin.id,
        title: 'Payment Received',
        message: `₹${bill.amount.toLocaleString()} received for ${bill.title} (${transactionId}).`,
        type: 'PAYMENT',
        reference_id: newPayment.id,
      });
    }

    this.addAuditLog(userId, 'PROCESS_PAYMENT_SUCCESS', 'payments', newPayment.id, null, {
      bill_id: bill.id,
      amount: bill.amount,
      transactionId,
    });

    return { success: true, payment: newPayment };
  }

  // ==================== COMPLAINTS ====================
  public getComplaints(): Complaint[] {
    return this.getItem<Complaint[]>(STORAGE_KEYS.COMPLAINTS, []);
  }

  public getComplaintUpdates(): ComplaintUpdate[] {
    return this.getItem<ComplaintUpdate[]>(STORAGE_KEYS.COMPLAINT_UPDATES, []);
  }

  public getEnrichedComplaints(): EnrichedComplaint[] {
    const complaints = this.getComplaints();
    const flats = this.getFlats();
    const buildings = this.getBuildings();
    const users = this.getUsers();
    const workers = this.getWorkers();
    const allUpdates = this.getComplaintUpdates();

    return complaints.map((c) => {
      const flat = flats.find((f) => f.id === c.flat_id);
      const bld = flat ? buildings.find((b) => b.id === flat.building_id) : null;
      const creator = users.find((u) => u.id === c.user_id);
      const worker = c.assigned_worker_id ? workers.find((w) => w.id === c.assigned_worker_id) : null;
      const workerUser = worker ? users.find((u) => u.id === worker.user_id) : null;
      const updates = allUpdates.filter((u) => u.complaint_id === c.id);

      return {
        ...c,
        flat_number: flat?.flat_number || 'Common Area',
        building_name: bld?.name || 'Main Compound',
        creator_name: creator?.name || 'Resident',
        worker_name: workerUser?.name,
        worker_type: worker?.worker_type,
        worker_phone: worker?.phone,
        updates: updates.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      };
    });
  }

  public createComplaint(data: Omit<Complaint, 'id' | 'status' | 'created_at' | 'updated_at'>): Complaint {
    const complaints = this.getComplaints();
    const newComplaint: Complaint = {
      ...data,
      id: `comp-${Date.now()}`,
      status: 'Submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    complaints.unshift(newComplaint);
    this.setItem(STORAGE_KEYS.COMPLAINTS, complaints);

    // Add initial complaint update
    const updates = this.getComplaintUpdates();
    updates.push({
      id: `cu-${Date.now()}`,
      complaint_id: newComplaint.id,
      updated_by: data.user_id,
      old_status: null,
      new_status: 'Submitted',
      comment: 'Complaint registered by resident.',
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.COMPLAINT_UPDATES, updates);

    // Notify admins
    const admins = this.getUsers().filter((u) => u.role === 'ADMIN');
    admins.forEach((admin) => {
      this.addNotification({
        user_id: admin.id,
        title: `New Maintenance Ticket: ${newComplaint.title}`,
        message: `Priority: ${newComplaint.priority} | Category: ${newComplaint.category}`,
        type: 'COMPLAINT',
        reference_id: newComplaint.id,
      });
    });

    this.addAuditLog(data.user_id, 'CREATE_COMPLAINT', 'complaints', newComplaint.id, null, newComplaint);
    return newComplaint;
  }

  public assignWorker(complaintId: string, workerId: string, adminId = 'usr-admin-1'): void {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return;

    const old = complaints[index];
    complaints[index] = {
      ...old,
      assigned_worker_id: workerId,
      status: 'Assigned',
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.COMPLAINTS, complaints);

    const worker = this.getWorkers().find((w) => w.id === workerId);
    const workerUser = worker ? this.getUser(worker.user_id) : null;

    const updates = this.getComplaintUpdates();
    updates.push({
      id: `cu-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: adminId,
      old_status: old.status,
      new_status: 'Assigned',
      comment: `Assigned to ${workerUser?.name || 'Service Worker'} (${worker?.worker_type}).`,
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.COMPLAINT_UPDATES, updates);

    // Notify Worker
    if (worker) {
      this.addNotification({
        user_id: worker.user_id,
        title: 'New Service Task Assigned',
        message: `You were assigned task: "${old.title}". Please review details and start work.`,
        type: 'TASK',
        reference_id: complaintId,
      });
    }

    // Notify Resident
    this.addNotification({
      user_id: old.user_id,
      title: 'Worker Assigned to Complaint',
      message: `${workerUser?.name} (${worker?.worker_type}) has been assigned to your ticket.`,
      type: 'COMPLAINT',
      reference_id: complaintId,
    });

    this.addAuditLog(adminId, 'ASSIGN_WORKER', 'complaints', complaintId, old, complaints[index]);
  }

  public updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    userId: string,
    comment?: string,
    resolutionNotes?: string
  ): void {
    const complaints = this.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return;

    const old = complaints[index];
    const isResolved = newStatus === 'Resolved' || newStatus === 'Closed';

    complaints[index] = {
      ...old,
      status: newStatus,
      resolution_notes: resolutionNotes || old.resolution_notes,
      resolved_at: isResolved ? new Date().toISOString() : old.resolved_at,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.COMPLAINTS, complaints);

    // Record timeline update
    const updates = this.getComplaintUpdates();
    updates.push({
      id: `cu-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: userId,
      old_status: old.status,
      new_status: newStatus,
      comment: comment || `Status changed from ${old.status} to ${newStatus}`,
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.COMPLAINT_UPDATES, updates);

    // If resolved, increment worker completed task count
    if (newStatus === 'Resolved' && old.assigned_worker_id) {
      const workers = this.getWorkers();
      const wIdx = workers.findIndex((w) => w.id === old.assigned_worker_id);
      if (wIdx !== -1) {
        workers[wIdx] = {
          ...workers[wIdx],
          completed_tasks_count: (workers[wIdx].completed_tasks_count || 0) + 1,
        };
        this.setItem(STORAGE_KEYS.WORKERS, workers);
      }
    }

    // Notify resident
    this.addNotification({
      user_id: old.user_id,
      title: `Complaint Status: ${newStatus}`,
      message: `Your complaint "${old.title}" is now marked as ${newStatus}.`,
      type: 'COMPLAINT',
      reference_id: complaintId,
    });

    this.addAuditLog(userId, 'UPDATE_COMPLAINT_STATUS', 'complaints', complaintId, old, complaints[index]);
  }

  // ==================== WORKERS ====================
  public getWorkers(): Worker[] {
    return this.getItem<Worker[]>(STORAGE_KEYS.WORKERS, []);
  }

  public updateWorkerAvailability(workerId: string, availability: WorkerAvailability): void {
    const workers = this.getWorkers();
    const index = workers.findIndex((w) => w.id === workerId);
    if (index === -1) return;
    workers[index] = {
      ...workers[index],
      availability,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.WORKERS, workers);
  }

  public createWorker(
    userData: Omit<User, 'id' | 'role' | 'created_at' | 'updated_at'>,
    workerData: Omit<Worker, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_tasks_count'>,
    adminId = 'usr-admin-1'
  ): { user: User; worker: Worker } {
    const newUser = this.createUser({
      ...userData,
      role: 'WORKER',
    });

    const workers = this.getWorkers();
    const newWorker: Worker = {
      ...workerData,
      id: `wrk-${Date.now()}`,
      user_id: newUser.id,
      completed_tasks_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    workers.push(newWorker);
    this.setItem(STORAGE_KEYS.WORKERS, workers);

    // Link user to worker
    this.updateUser(newUser.id, { worker_id: newWorker.id });

    this.addAuditLog(adminId, 'CREATE_WORKER', 'workers', newWorker.id, null, newWorker);
    return { user: newUser, worker: newWorker };
  }

  // ==================== ANNOUNCEMENTS ====================
  public getAnnouncements(): Announcement[] {
    return this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  }

  public createAnnouncement(
    data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>,
    adminId = 'usr-admin-1'
  ): Announcement {
    const announcements = this.getAnnouncements();
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    announcements.unshift(newAnn);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    // Notify residents
    const users = this.getUsers();
    users.forEach((u) => {
      if (u.id !== adminId && (newAnn.target_role === 'ALL' || u.role === newAnn.target_role)) {
        this.addNotification({
          user_id: u.id,
          title: `Announcement: ${newAnn.title}`,
          message: newAnn.description.slice(0, 100) + '...',
          type: 'ANNOUNCEMENT',
          reference_id: newAnn.id,
        });
      }
    });

    this.addAuditLog(adminId, 'CREATE_ANNOUNCEMENT', 'announcements', newAnn.id, null, newAnn);
    return newAnn;
  }

  public deleteAnnouncement(id: string, adminId = 'usr-admin-1'): void {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter((a) => a.id !== id);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, filtered);
    this.addAuditLog(adminId, 'DELETE_ANNOUNCEMENT', 'announcements', id, null, null);
  }

  // ==================== SERVICES ====================
  public getServices(): ServiceProvider[] {
    return this.getItem<ServiceProvider[]>(STORAGE_KEYS.SERVICES, []);
  }

  public createService(
    data: Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'>,
    adminId = 'usr-admin-1'
  ): ServiceProvider {
    const services = this.getServices();
    const newSrv: ServiceProvider = {
      ...data,
      id: `srv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    services.unshift(newSrv);
    this.setItem(STORAGE_KEYS.SERVICES, services);
    this.addAuditLog(adminId, 'CREATE_SERVICE', 'services', newSrv.id, null, newSrv);
    return newSrv;
  }

  public toggleServiceApproval(id: string, adminId = 'usr-admin-1'): void {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return;
    services[index] = {
      ...services[index],
      is_approved: !services[index].is_approved,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.SERVICES, services);
    this.addAuditLog(adminId, 'TOGGLE_SERVICE_APPROVAL', 'services', id, null, services[index]);
  }

  public updateService(id: string, data: Partial<ServiceProvider>, adminId = 'usr-admin-1'): ServiceProvider | null {
    const services = this.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const old = services[index];
    services[index] = {
      ...old,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.SERVICES, services);
    this.addAuditLog(adminId, 'UPDATE_SERVICE', 'services', id, old, services[index]);
    return services[index];
  }

  // ==================== NOTIFICATIONS ====================
  public getNotifications(userId: string): Notification[] {
    const all = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.user_id === userId);
  }

  public addNotification(data: Omit<Notification, 'id' | 'is_read' | 'created_at'>): Notification {
    const all = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const all = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = all.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public markAllNotificationsAsRead(userId: string): void {
    const all = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = all.map((n) => (n.user_id === userId ? { ...n, is_read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // ==================== AUDIT LOGS ====================
  public getAuditLogs(): AuditLog[] {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addAuditLog(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues: any,
    newValues: any
  ): void {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const user = this.getUser(userId);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      user_name: user ? `${user.name} (${user.role})` : 'System',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 150 entries
    if (logs.length > 150) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // ==================== SERVICE BOOKINGS (TIME SLOTS) ====================
  public getBookings(): ServiceBooking[] {
    return this.getItem<ServiceBooking[]>(STORAGE_KEYS.BOOKINGS, []);
  }

  public getUserBookings(userId: string): ServiceBooking[] {
    return this.getBookings().filter((b) => b.user_id === userId);
  }

  public getWorkerBookings(workerId: string): ServiceBooking[] {
    return this.getBookings().filter((b) => b.worker_id === workerId);
  }

  public createBooking(
    data: Omit<ServiceBooking, 'id' | 'created_at'>
  ): ServiceBooking {
    const bookings = this.getBookings();
    const newBooking: ServiceBooking = {
      ...data,
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);

    // Notify user
    this.addNotification({
      user_id: data.user_id,
      title: 'Service Appointment Confirmed',
      message: `Your booking with ${data.worker_name} for ${data.time_slot} on ${data.booking_date} is scheduled.`,
      type: 'TASK',
      reference_id: newBooking.id,
    });

    // Notify worker if user_id exists for worker
    if (data.worker_id) {
      const worker = this.getWorkers().find((w) => w.id === data.worker_id);
      if (worker) {
        this.addNotification({
          user_id: worker.user_id,
          title: 'New Service Slot Booked',
          message: `${data.user_name} (Flat ${data.flat_number}) booked slot: ${data.time_slot} on ${data.booking_date}.`,
          type: 'TASK',
          reference_id: newBooking.id,
        });

        // Automatically dispatch 1-on-1 private chat message straight to the technician
        if (worker.user_id) {
          const autoChatMessage = `Hello ${data.worker_name}, I have confirmed an appointment for "${data.service_name}" on ${data.booking_date} (${data.time_slot}) for Flat ${data.flat_number}.\n\nProblem details: "${data.issue_description}".\nPlease let me know if you need any additional access details.`;
          this.sendPrivateMessage(data.user_id, worker.user_id, autoChatMessage, 'Service Booking Dispatch');
        }
      }
    }

    this.addAuditLog(data.user_id, 'BOOK_SERVICE_SLOT', 'service_bookings', newBooking.id, null, newBooking);

    // Sync to MongoDB server if running
    this.syncDocToMongo('service_bookings', newBooking);

    return newBooking;
  }

  public updateBookingStatus(id: string, status: ServiceBooking['status']): boolean {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    bookings[idx].status = status;
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return true;
  }

  public setWorkerAvailability(workerId: string, availability: WorkerAvailability): boolean {
    const workers = this.getWorkers();
    const idx = workers.findIndex((w) => w.id === workerId);
    if (idx === -1) return false;
    workers[idx].availability = availability;
    workers[idx].updated_at = new Date().toISOString();
    this.setItem(STORAGE_KEYS.WORKERS, workers);
    return true;
  }

  // ==================== 1-ON-1 PRIVATE CHAT ====================
  // Strictly private between the two participants. Outsiders cannot read each other's messages.
  public getPrivateMessages(): PrivateMessage[] {
    return this.getItem<PrivateMessage[]>(STORAGE_KEYS.PRIVATE_MESSAGES, []);
  }

  public getUserConversations(userId: string): { partnerId: string; lastMessage: PrivateMessage; unreadCount: number }[] {
    const all = this.getPrivateMessages();
    const partnerMap = new Map<string, { lastMessage: PrivateMessage; unreadCount: number }>();

    all.forEach((msg) => {
      const isSender = msg.sender_id === userId;
      const isRecipient = msg.recipient_id === userId;
      if (!isSender && !isRecipient) return;

      const partnerId = isSender ? msg.recipient_id : msg.sender_id;
      const current = partnerMap.get(partnerId);

      const unreadDelta = isRecipient && !msg.is_read ? 1 : 0;

      if (!current) {
        partnerMap.set(partnerId, { lastMessage: msg, unreadCount: unreadDelta });
      } else {
        if (new Date(msg.created_at) > new Date(current.lastMessage.created_at)) {
          current.lastMessage = msg;
        }
        current.unreadCount += unreadDelta;
      }
    });

    return Array.from(partnerMap.entries()).map(([partnerId, data]) => ({
      partnerId,
      lastMessage: data.lastMessage,
      unreadCount: data.unreadCount,
    }));
  }

  public getConversation(user1Id: string, user2Id: string): PrivateMessage[] {
    const all = this.getPrivateMessages();
    return all
      .filter(
        (m) =>
          (m.sender_id === user1Id && m.recipient_id === user2Id) ||
          (m.sender_id === user2Id && m.recipient_id === user1Id)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public sendPrivateMessage(
    senderId: string,
    recipientId: string,
    message: string,
    tag = 'General'
  ): PrivateMessage {
    const all = this.getPrivateMessages();
    const sender = this.getUser(senderId);
    const recipient = this.getUser(recipientId);

    const newMsg: PrivateMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender_id: senderId,
      recipient_id: recipientId,
      sender_name: sender ? sender.name : 'Resident',
      recipient_name: recipient ? recipient.name : 'Resident',
      sender_avatar: sender?.avatar_url,
      message,
      tag,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    all.push(newMsg);
    this.setItem(STORAGE_KEYS.PRIVATE_MESSAGES, all);

    // Notify recipient
    this.addNotification({
      user_id: recipientId,
      title: `Private Message from ${sender ? sender.name : 'Resident'}`,
      message: message.length > 60 ? `${message.slice(0, 57)}...` : message,
      type: 'SYSTEM',
      reference_id: newMsg.id,
    });

    // Sync to MongoDB server
    this.syncDocToMongo('private_messages', newMsg);

    return newMsg;
  }

  public markConversationAsRead(senderPartnerId: string, currentUserId: string): void {
    const all = this.getPrivateMessages();
    let changed = false;
    const updated = all.map((m) => {
      if (m.sender_id === senderPartnerId && m.recipient_id === currentUserId && !m.is_read) {
        changed = true;
        return { ...m, is_read: true };
      }
      return m;
    });

    if (changed) {
      this.setItem(STORAGE_KEYS.PRIVATE_MESSAGES, updated);
    }
  }

  public getUnreadMessageCount(userId: string): number {
    const all = this.getPrivateMessages();
    return all.filter((m) => m.recipient_id === userId && !m.is_read).length;
  }

  // ==================== VISITOR ENTRY REGISTER (OUTSIDERS / SECURITY) ====================
  public getVisitorLogs(communityId?: string): VisitorLog[] {
    const list = this.getItem<VisitorLog[]>(STORAGE_KEYS.VISITOR_LOGS, SEED_VISITOR_LOGS);
    if (!communityId) return list;
    return list.filter((v) => v.community_id === communityId);
  }

  public createVisitorEntry(data: Omit<VisitorLog, 'id' | 'created_at'>): VisitorLog {
    const logs = this.getItem<VisitorLog[]>(STORAGE_KEYS.VISITOR_LOGS, SEED_VISITOR_LOGS);
    const newLog: VisitorLog = {
      ...data,
      id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.VISITOR_LOGS, logs);
    this.addAuditLog(data.logged_by_watchman_id, 'REGISTER_VISITOR', 'visitor_logs', newLog.id, null, newLog);
    this.syncDocToMongo('visitor_logs', newLog);
    return newLog;
  }

  public updateVisitorStatus(
    id: string,
    status: VisitorStatus,
    exitTime?: string,
    notes?: string
  ): VisitorLog | null {
    const logs = this.getItem<VisitorLog[]>(STORAGE_KEYS.VISITOR_LOGS, SEED_VISITOR_LOGS);
    const idx = logs.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    logs[idx].status = status;
    if (exitTime) logs[idx].exit_time = exitTime;
    if (notes) logs[idx].notes = notes;
    this.setItem(STORAGE_KEYS.VISITOR_LOGS, logs);
    return logs[idx];
  }

  // ==================== WATCHMAN INCIDENT & SERVICE PROBLEMS LOG ====================
  public getIncidentReports(communityId?: string): WatchmanIncidentReport[] {
    const list = this.getItem<WatchmanIncidentReport[]>(STORAGE_KEYS.INCIDENT_REPORTS, SEED_INCIDENT_REPORTS);
    if (!communityId) return list;
    return list.filter((r) => r.community_id === communityId);
  }

  public createIncidentReport(data: Omit<WatchmanIncidentReport, 'id' | 'created_at'>): WatchmanIncidentReport {
    const reports = this.getItem<WatchmanIncidentReport[]>(STORAGE_KEYS.INCIDENT_REPORTS, SEED_INCIDENT_REPORTS);
    const newReport: WatchmanIncidentReport = {
      ...data,
      id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    reports.unshift(newReport);
    this.setItem(STORAGE_KEYS.INCIDENT_REPORTS, reports);
    this.addAuditLog(data.watchman_id, 'LOG_INCIDENT', 'incident_reports', newReport.id, null, newReport);
    this.syncDocToMongo('incident_reports', newReport);
    return newReport;
  }

  public updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    resolvedAt?: string
  ): WatchmanIncidentReport | null {
    const reports = this.getItem<WatchmanIncidentReport[]>(STORAGE_KEYS.INCIDENT_REPORTS, SEED_INCIDENT_REPORTS);
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    reports[idx].status = status;
    if (resolvedAt) reports[idx].resolved_at = resolvedAt;
    this.setItem(STORAGE_KEYS.INCIDENT_REPORTS, reports);
    return reports[idx];
  }

  // ==================== MONGODB COMPASS BACKGROUND SYNC ====================
  private async syncDocToMongo(collection: string, doc: any) {
    try {
      await fetch(`http://localhost:5000/api/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
    } catch {
      // Local server might not be running or offline, silently ignore
    }
  }

  public async checkMongoStatus(): Promise<{ connected: boolean; database: string; count?: number }> {
    try {
      const res = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { connected: true, database: data.database || 'community_hub', count: data.collectionsCount };
      }
    } catch {
      // Fallback
    }
    return { connected: false, database: 'community_hub' };
  }
}

export const storage = new StorageService();
