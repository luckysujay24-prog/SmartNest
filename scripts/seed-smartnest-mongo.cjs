/**
 * SmartNest MongoDB Compass Database Initialization & Data Seeder
 * Connects directly to MongoDB Compass at mongodb://127.0.0.1:27017
 * Database: smartnest
 *
 * Populates 12 collections with multi-apartment residential data:
 * 1. communities (Grand Palms, Shanti Niketan, Surya Emerald)
 * 2. buildings (Wing A, Wing B, Orchid Wing, etc.)
 * 3. flats (21+ flats with realistic areas, rent & maintenance)
 * 4. users (Super Admin, Admins, Owners, Tenants, Watchmen, Technicians)
 * 5. bills (Society maintenance, shared utilities, private rent)
 * 6. payments (Audited escrow transactions)
 * 7. complaints (Resolved and in-progress tickets)
 * 8. announcements (Society notices)
 * 9. visitor_logs (Outsider gate register: Zomato, Swiggy, cabs, guests)
 * 10. incident_reports (Facility & security problems logged by watchman)
 * 11. service_bookings (Electrician, plumber, AC service slot bookings)
 * 12. private_messages (Encrypted 1-on-1 chats)
 *
 * Also exports clean JSON files to ./mongo-data/ directory for easy manual import in Compass GUI.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'smartnest';
const EXPORT_DIR = path.join(__dirname, '..', 'mongo-data');

// 1. Communities (3 Distinct Indian Apartment Societies)
const COMMUNITIES = [
  {
    _id: 'comm-101',
    name: 'Grand Palms Residency',
    address: '452 Palm Boulevard, Silver Oak Enclave, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560066',
    created_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    _id: 'comm-102',
    name: 'Shanti Niketan Haven',
    address: '78 Gandhi Road, Shivaji Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '411005',
    created_at: new Date('2026-01-02T00:00:00Z'),
  },
  {
    _id: 'comm-103',
    name: 'Surya Emerald Heights',
    address: '12 Banjara Hills Main Rd, Road No. 10',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postal_code: '500034',
    created_at: new Date('2026-01-03T00:00:00Z'),
  },
];

// 2. Buildings / Wings
const BUILDINGS = [
  { _id: 'bld-01', community_id: 'comm-101', name: 'Sunflower Wing A', total_floors: 10 },
  { _id: 'bld-02', community_id: 'comm-101', name: 'Lotus Wing B', total_floors: 8 },
  { _id: 'bld-03', community_id: 'comm-101', name: 'Orchid Wing C', total_floors: 6 },
  { _id: 'bld-04', community_id: 'comm-102', name: 'Gulmohar Wing', total_floors: 9 },
  { _id: 'bld-05', community_id: 'comm-102', name: 'Parijat Wing', total_floors: 7 },
  { _id: 'bld-06', community_id: 'comm-103', name: 'Emerald Tower', total_floors: 12 },
  { _id: 'bld-07', community_id: 'comm-103', name: 'Ruby Tower', total_floors: 11 },
];

// 3. Users across all roles
const USERS = [
  // Super Admin
  {
    _id: 'usr-superadmin-1',
    email: 'karthik@smartnest.in',
    name: 'Karthik Sriram (Platform Super Admin)',
    phone: '+91 99000 11111',
    role: 'SUPER_ADMIN',
    apartment_name: 'All Apartments (Central HQ)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Society Admins
  {
    _id: 'usr-admin-1',
    email: 'sunita.admin@grandpalms.in',
    name: 'Sunita Deshmukh (Society Admin)',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-admin-2',
    email: 'vikram.admin@shantiniketan.in',
    name: 'Vikram Gokhale (Society Admin)',
    phone: '+91 98230 44551',
    role: 'ADMIN',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Haven',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-admin-3',
    email: 'srinivas.admin@suryaemerald.in',
    name: 'Srinivas Rao (Society Admin)',
    phone: '+91 98480 33221',
    role: 'ADMIN',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Heights',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Security Watchmen
  {
    _id: 'usr-security-1',
    email: 'suresh.security@grandpalms.in',
    name: 'Suresh Reddy (Gate Watchman)',
    phone: '+91 98455 77889',
    role: 'SECURITY',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-security-2',
    email: 'tukaram.security@shantiniketan.in',
    name: 'Tukaram Patil (Gate Watchman)',
    phone: '+91 98221 55667',
    role: 'SECURITY',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Haven',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-security-3',
    email: 'mallikarjun.security@suryaemerald.in',
    name: 'Mallikarjun Rao (Gate Watchman)',
    phone: '+91 98491 66778',
    role: 'SECURITY',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Heights',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Property Owners
  {
    _id: 'usr-owner-1',
    email: 'rajesh.owner@gmail.com',
    name: 'Rajesh Kumar (Owner)',
    phone: '+91 98450 11223',
    role: 'OWNER',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-owner-2',
    email: 'priya.owner@gmail.com',
    name: 'Priya Sharma (Owner)',
    phone: '+91 99123 44556',
    role: 'OWNER',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-owner-3',
    email: 'nilesh.owner@gmail.com',
    name: 'Nilesh Kulkarni (Owner)',
    phone: '+91 98224 66778',
    role: 'OWNER',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Haven',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-owner-5',
    email: 'venkat.owner@gmail.com',
    name: 'Venkat Ramana (Owner)',
    phone: '+91 98492 55667',
    role: 'OWNER',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Heights',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Resident Tenants
  {
    _id: 'usr-tenant-1',
    email: 'ananya.tenant@gmail.com',
    name: 'Ananya Iyer (Tenant)',
    phone: '+91 97400 98765',
    role: 'TENANT',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    flat_id: 'flat-a-301',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-tenant-2',
    email: 'rohan.tenant@gmail.com',
    name: 'Rohan Mehta (Tenant)',
    phone: '+91 98200 12345',
    role: 'TENANT',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    flat_id: 'flat-a-101',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-tenant-3',
    email: 'aditya.tenant@gmail.com',
    name: 'Aditya Joshi (Tenant)',
    phone: '+91 98233 77889',
    role: 'TENANT',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Haven',
    flat_id: 'flat-sn-101',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-tenant-4',
    email: 'harish.tenant@gmail.com',
    name: 'Harish Reddy (Tenant)',
    phone: '+91 98490 88990',
    role: 'TENANT',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Heights',
    flat_id: 'flat-se-201',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Staff Technicians
  {
    _id: 'usr-worker-1',
    email: 'ramesh.electrician@smartnest.in',
    name: 'Ramesh Verma (Electrician)',
    phone: '+91 98711 22334',
    role: 'WORKER',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-worker-2',
    email: 'ravi.plumber@smartnest.in',
    name: 'Ravi Kumar (Plumber)',
    phone: '+91 98722 33445',
    role: 'WORKER',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-worker-3',
    email: 'manoj.actech@smartnest.in',
    name: 'Manoj Pandey (HVAC & AC Tech)',
    phone: '+91 98733 44556',
    role: 'WORKER',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Haven',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

// 4. Flats across all 3 apartment communities
const FLATS = [
  // Grand Palms - Wing A
  { _id: 'flat-a-101', building_id: 'bld-01', flat_number: 'A-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1200, rent_amount: 32000, maintenance_amount: 3800, occupancy_status: 'OCCUPIED', owner_id: 'usr-owner-1', tenant_id: 'usr-tenant-2' },
  { _id: 'flat-a-102', building_id: 'bld-01', flat_number: 'A-102', floor_number: 1, flat_type: '2BHK', area_sqft: 1250, rent_amount: 33000, maintenance_amount: 3900, occupancy_status: 'VACANT', owner_id: 'usr-owner-1' },
  { _id: 'flat-a-201', building_id: 'bld-01', flat_number: 'A-201', floor_number: 2, flat_type: '3BHK', area_sqft: 1650, rent_amount: 45000, maintenance_amount: 4800, occupancy_status: 'VACANT', owner_id: 'usr-owner-2' },
  { _id: 'flat-a-301', building_id: 'bld-01', flat_number: 'A-301', floor_number: 3, flat_type: '3BHK', area_sqft: 1700, rent_amount: 46000, maintenance_amount: 5000, occupancy_status: 'OCCUPIED', owner_id: 'usr-owner-2', tenant_id: 'usr-tenant-1' },
  { _id: 'flat-a-401', building_id: 'bld-01', flat_number: 'A-401', floor_number: 4, flat_type: 'Penthouse', area_sqft: 2800, rent_amount: 85000, maintenance_amount: 8500, occupancy_status: 'VACANT', owner_id: 'usr-owner-2' },

  // Grand Palms - Wing B
  { _id: 'flat-b-101', building_id: 'bld-02', flat_number: 'B-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1180, rent_amount: 30000, maintenance_amount: 3600, occupancy_status: 'VACANT', owner_id: 'usr-owner-1' },
  { _id: 'flat-b-201', building_id: 'bld-02', flat_number: 'B-201', floor_number: 2, flat_type: '2BHK', area_sqft: 1220, rent_amount: 31000, maintenance_amount: 3700, occupancy_status: 'VACANT', owner_id: 'usr-owner-1' },
  { _id: 'flat-b-301', building_id: 'bld-02', flat_number: 'B-301', floor_number: 3, flat_type: '3BHK', area_sqft: 1550, rent_amount: 42000, maintenance_amount: 4500, occupancy_status: 'VACANT', owner_id: 'usr-owner-2' },

  // Shanti Niketan - Gulmohar Wing
  { _id: 'flat-sn-101', building_id: 'bld-04', flat_number: 'G-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1100, rent_amount: 28000, maintenance_amount: 3200, occupancy_status: 'OCCUPIED', owner_id: 'usr-owner-3', tenant_id: 'usr-tenant-3' },
  { _id: 'flat-sn-102', building_id: 'bld-04', flat_number: 'G-102', floor_number: 1, flat_type: '2BHK', area_sqft: 1150, rent_amount: 29000, maintenance_amount: 3300, occupancy_status: 'VACANT', owner_id: 'usr-owner-3' },
  { _id: 'flat-sn-201', building_id: 'bld-04', flat_number: 'G-201', floor_number: 2, flat_type: '3BHK', area_sqft: 1500, rent_amount: 38000, maintenance_amount: 4200, occupancy_status: 'VACANT', owner_id: 'usr-owner-3' },

  // Surya Emerald - Emerald Tower
  { _id: 'flat-se-101', building_id: 'bld-06', flat_number: 'E-101', floor_number: 1, flat_type: '3BHK', area_sqft: 1800, rent_amount: 50000, maintenance_amount: 5500, occupancy_status: 'VACANT', owner_id: 'usr-owner-5' },
  { _id: 'flat-se-201', building_id: 'bld-06', flat_number: 'E-201', floor_number: 2, flat_type: '3BHK', area_sqft: 1850, rent_amount: 52000, maintenance_amount: 5600, occupancy_status: 'OCCUPIED', owner_id: 'usr-owner-5', tenant_id: 'usr-tenant-4' },
  { _id: 'flat-se-301', building_id: 'bld-06', flat_number: 'E-301', floor_number: 3, flat_type: '4BHK', area_sqft: 2400, rent_amount: 72000, maintenance_amount: 7200, occupancy_status: 'VACANT', owner_id: 'usr-owner-5' },
];

// 5. Bills (Society Maintenance & Private Rent separated)
const BILLS = [
  // Society Maintenance (Admin monitors)
  {
    _id: 'bill-maint-01',
    community_id: 'comm-101',
    flat_id: 'flat-a-301',
    bill_type: 'MAINTENANCE',
    title: 'Monthly Society Maintenance - September 2026',
    description: 'Society security, lift upkeep, landscaping & common lighting share',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount: 5000,
    due_date: '2026-09-15',
    status: 'PAID',
    created_by: 'usr-admin-1',
    created_at: new Date('2026-09-01T10:00:00Z'),
  },
  {
    _id: 'bill-maint-02',
    community_id: 'comm-101',
    flat_id: 'flat-a-101',
    bill_type: 'MAINTENANCE',
    title: 'Monthly Society Maintenance - September 2026',
    description: 'Society security, lift upkeep & common lighting share',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount: 3800,
    due_date: '2026-09-15',
    status: 'PAID',
    created_by: 'usr-admin-1',
    created_at: new Date('2026-09-01T10:00:00Z'),
  },
  {
    _id: 'bill-elec-01',
    community_id: 'comm-101',
    flat_id: 'flat-a-301',
    bill_type: 'ELECTRICITY',
    title: 'Power Sub-Meter Reading - September 2026',
    description: '390 units consumed @ ₹7.50 / kWh + fixed charge',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount: 2925,
    due_date: '2026-10-05',
    status: 'PENDING',
    created_by: 'usr-admin-1',
    created_at: new Date('2026-10-01T10:00:00Z'),
  },
  // Private Lease Rent (Strictly between Owner Priya Sharma and Tenant Ananya Iyer)
  {
    _id: 'bill-rent-01',
    community_id: 'comm-101',
    flat_id: 'flat-a-301',
    bill_type: 'RENT',
    title: 'Monthly House Rent - September 2026',
    description: 'Private lease rental invoice issued by property owner Priya Sharma',
    billing_period_start: '2026-09-01',
    billing_period_end: '2026-09-30',
    amount: 46000,
    due_date: '2026-09-05',
    status: 'PAID',
    created_by: 'usr-owner-2',
    created_at: new Date('2026-09-01T08:00:00Z'),
  },
];

// 6. Payments Ledger
const PAYMENTS = [
  {
    _id: 'pay-01',
    bill_id: 'bill-maint-01',
    user_id: 'usr-tenant-1',
    amount: 5000,
    payment_method: 'UPI',
    payment_method_title: 'UPI Transfer (GooglePay)',
    payment_provider: 'UPI',
    transaction_id: 'UPI-GPAY-983421045',
    status: 'SUCCESS',
    payment_date: new Date('2026-09-04T11:20:00Z'),
    created_at: new Date('2026-09-04T11:20:00Z'),
  },
  {
    _id: 'pay-02',
    bill_id: 'bill-rent-01',
    user_id: 'usr-tenant-1',
    amount: 46000,
    payment_method: 'NET_BANKING',
    payment_method_title: 'IMPS Direct Owner Account Transfer',
    payment_provider: 'HDFC Direct',
    transaction_id: 'HDFC-IMPS-774910321',
    status: 'SUCCESS',
    payment_date: new Date('2026-09-03T15:45:00Z'),
    created_at: new Date('2026-09-03T15:45:00Z'),
  },
];

// 7. Complaints
const COMPLAINTS = [
  {
    _id: 'cmp-01',
    community_id: 'comm-101',
    flat_id: 'flat-a-301',
    user_id: 'usr-tenant-1',
    category: 'ELECTRICAL',
    title: 'Ceiling Fan Regulator Malfunction',
    description: 'Master bedroom fan regulator sparks when changing speeds from 2 to 3.',
    priority: 'HIGH',
    status: 'In Progress',
    assigned_worker_id: 'usr-worker-1',
    created_at: new Date('2026-10-06T09:30:00Z'),
  },
  {
    _id: 'cmp-02',
    community_id: 'comm-101',
    flat_id: 'flat-a-101',
    user_id: 'usr-tenant-2',
    category: 'PLUMBING',
    title: 'Kitchen Sink Drain Clogged',
    description: 'Slow drainage and minor leakage under the sink cabinet.',
    priority: 'MEDIUM',
    status: 'Resolved',
    assigned_worker_id: 'usr-worker-2',
    created_at: new Date('2026-10-04T14:15:00Z'),
  },
];

// 8. Society Announcements
const ANNOUNCEMENTS = [
  {
    _id: 'ann-01',
    community_id: 'comm-101',
    title: 'Elevator Maintenance & Sensor Calibration - Block A',
    description: 'High-speed elevator in Sunflower Wing A will undergo bi-monthly sensor calibration on Thursday between 2 PM and 4 PM.',
    category: 'MAINTENANCE',
    priority: 'HIGH',
    author_name: 'Sunita Deshmukh (Admin)',
    published_at: new Date('2026-10-05T10:00:00Z'),
  },
  {
    _id: 'ann-02',
    community_id: 'comm-101',
    title: 'Diwali Festive Illumination & Club House Get-Together',
    description: 'Grand Palms RWA invites all residents, owners and children for the community Diwali lantern lighting evening.',
    category: 'EVENT',
    priority: 'LOW',
    author_name: 'Sunita Deshmukh (Admin)',
    published_at: new Date('2026-10-06T18:00:00Z'),
  },
];

// 9. Visitor Logs (Outsider Gate Entry Register)
const VISITOR_LOGS = [
  {
    _id: 'vlog-01',
    community_id: 'comm-101',
    visitor_name: 'Ramesh Swiggy Delivery',
    visitor_phone: '+91 98451 90123',
    purpose: 'DELIVERY',
    destination_flat: 'A-301',
    vehicle_number: 'KA-04-EK-9912',
    entry_time: '2026-10-07 12:45 PM',
    status: 'ALLOWED',
    recorded_by: 'Suresh Reddy (Gate Watchman)',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    created_at: new Date('2026-10-07T12:45:00Z'),
  },
  {
    _id: 'vlog-02',
    community_id: 'comm-101',
    visitor_name: 'Manish Kumar (Zomato)',
    visitor_phone: '+91 98220 44112',
    purpose: 'DELIVERY',
    destination_flat: 'A-101',
    vehicle_number: 'KA-03-MR-1204',
    entry_time: '2026-10-07 01:10 PM',
    status: 'ALLOWED',
    recorded_by: 'Suresh Reddy (Gate Watchman)',
    created_at: new Date('2026-10-07T13:10:00Z'),
  },
  {
    _id: 'vlog-03',
    community_id: 'comm-101',
    visitor_name: 'Unverified Sales Vendor',
    visitor_phone: '+91 99000 88776',
    purpose: 'COMMERCIAL',
    destination_flat: 'None (Door to Door)',
    vehicle_number: 'None',
    entry_time: '2026-10-07 10:15 AM',
    status: 'DENIED',
    recorded_by: 'Suresh Reddy (Gate Watchman)',
    remarks: 'Unauthorized commercial canvassing prohibited in society.',
    created_at: new Date('2026-10-07T10:15:00Z'),
  },
];

// 10. Incident Reports (Watchman Facility Problem Log)
const INCIDENT_REPORTS = [
  {
    _id: 'inc-01',
    community_id: 'comm-101',
    title: 'Lift No. 2 Emergency Alarm Buzzer Stuck',
    description: 'Sunflower Wing elevator 2 emergency alarm began ringing intermittently. Security switched to manual power.',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    affected_area: 'Sunflower Wing A Ground Floor Lift Lobby',
    reported_by: 'Suresh Reddy (Gate Watchman)',
    created_at: new Date('2026-10-07T08:00:00Z'),
  },
  {
    _id: 'inc-02',
    community_id: 'comm-101',
    title: 'Basement -1 Water Sprinkler Valve Weeping',
    description: 'Minor drip noticed near Parking Bay 14 fire suppression pipe.',
    severity: 'LOW',
    status: 'REPORTED',
    affected_area: 'Basement -1 Parking Bay 14',
    reported_by: 'Suresh Reddy (Gate Watchman)',
    created_at: new Date('2026-10-07T11:00:00Z'),
  },
];

// 11. Service Bookings
const SERVICE_BOOKINGS = [
  {
    _id: 'bk-01',
    worker_id: 'usr-worker-1',
    user_id: 'usr-tenant-1',
    user_name: 'Ananya Iyer',
    flat_number: 'A-301',
    service_name: 'Apex Electrical Solutions',
    worker_name: 'Ramesh Verma',
    booking_date: '2026-10-08',
    time_slot: '10:00 AM - 11:00 AM',
    issue_description: 'Living room chandelier switch flickering and fan regulator replacement.',
    status: 'CONFIRMED',
    created_at: new Date('2026-10-07T09:00:00Z'),
  },
  {
    _id: 'bk-02',
    worker_id: 'usr-worker-2',
    user_id: 'usr-tenant-2',
    user_name: 'Rohan Mehta',
    flat_number: 'A-101',
    service_name: 'Premier Plumbing Works',
    worker_name: 'Ravi Kumar',
    booking_date: '2026-10-08',
    time_slot: '02:00 PM - 03:00 PM',
    issue_description: 'Kitchen drain pipe inspection and gasket replacement.',
    status: 'CONFIRMED',
    created_at: new Date('2026-10-07T10:30:00Z'),
  },
];

// 12. Private Messages
const PRIVATE_MESSAGES = [
  {
    _id: 'msg-01',
    sender_id: 'usr-owner-2',
    recipient_id: 'usr-tenant-1',
    sender_name: 'Priya Sharma (Owner)',
    recipient_name: 'Ananya Iyer (Tenant)',
    message: 'Hello Ananya, hope you are comfortable at Flat A-301. I have issued your September rent invoice.',
    tag: 'Owner Lease Update',
    is_read: true,
    created_at: new Date('2026-09-01T08:05:00Z'),
  },
  {
    _id: 'msg-02',
    sender_id: 'usr-tenant-1',
    recipient_id: 'usr-owner-2',
    sender_name: 'Ananya Iyer (Tenant)',
    recipient_name: 'Priya Sharma (Owner)',
    message: 'Thank you Priya ji, I have completed the rent transfer via IMPS and attached the receipt.',
    tag: 'Rent Cleared',
    is_read: true,
    created_at: new Date('2026-09-03T15:46:00Z'),
  },
  {
    _id: 'msg-03',
    sender_id: 'usr-tenant-1',
    recipient_id: 'usr-worker-1',
    sender_name: 'Ananya Iyer',
    recipient_name: 'Ramesh Verma',
    message: 'Hello Ramesh Verma, I have booked a slot with you for Apex Electrical Solutions on 2026-10-08 (10:00 AM - 11:00 AM).',
    tag: 'Service Slot Booking',
    is_read: true,
    created_at: new Date('2026-10-07T09:02:00Z'),
  },
];

async function seedSmartNest() {
  console.log('===============================================================');
  console.log('🌱 SMARTNEST: INITIALIZING MONGODB COMPASS DATABASE & COLLECTIONS');
  console.log(`Connecting to: ${MONGO_URI}/${DB_NAME}`);
  console.log('===============================================================');

  // Ensure export directory exists
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    console.log(`✓ Created folder for Compass export files: ${EXPORT_DIR}`);
  }

  const collectionsData = [
    { name: 'communities', data: COMMUNITIES },
    { name: 'buildings', data: BUILDINGS },
    { name: 'users', data: USERS },
    { name: 'flats', data: FLATS },
    { name: 'bills', data: BILLS },
    { name: 'payments', data: PAYMENTS },
    { name: 'complaints', data: COMPLAINTS },
    { name: 'announcements', data: ANNOUNCEMENTS },
    { name: 'visitor_logs', data: VISITOR_LOGS },
    { name: 'incident_reports', data: INCIDENT_REPORTS },
    { name: 'service_bookings', data: SERVICE_BOOKINGS },
    { name: 'private_messages', data: PRIVATE_MESSAGES },
  ];

  // 1. Export clean JSON files to ./mongo-data/
  for (const item of collectionsData) {
    const filePath = path.join(EXPORT_DIR, `${item.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(item.data, null, 2), 'utf-8');
    console.log(`📁 Exported [${item.name}.json] (${item.data.length} records) to mongo-data/`);
  }

  // 2. Connect to MongoDB and seed
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('\n✓ Successfully connected to MongoDB server on port 27017!');

    const db = client.db(DB_NAME);

    for (const item of collectionsData) {
      const col = db.collection(item.name);
      await col.deleteMany({});
      const res = await col.insertMany(item.data);
      console.log(`✓ Populated collection [${item.name}] with ${res.insertedCount} documents.`);
    }

    // Build indexes for instant lookups
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('communities').createIndex({ name: 1 });
    await db.collection('flats').createIndex({ flat_number: 1 });
    await db.collection('bills').createIndex({ flat_id: 1, bill_type: 1 });
    await db.collection('visitor_logs').createIndex({ community_id: 1, status: 1 });
    await db.collection('incident_reports').createIndex({ community_id: 1 });
    await db.collection('service_bookings').createIndex({ worker_id: 1, booking_date: 1 });
    await db.collection('private_messages').createIndex({ sender_id: 1, recipient_id: 1 });

    console.log('\n===============================================================');
    console.log('🎉 SMARTNEST DATABASE CREATED & READY IN MONGODB COMPASS!');
    console.log(`Database Name: "${DB_NAME}"`);
    console.log(`Total Collections: ${collectionsData.length}`);
    console.log('MongoDB Connection URI: mongodb://127.0.0.1:27017');
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  } finally {
    await client.close();
  }
}

seedSmartNest();
