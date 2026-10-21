/**
 * CommunityHub: Migration from MySQL relational database to MongoDB Compass
 * Connects to local MongoDB instance: mongodb://127.0.0.1:27017/community_hub
 * Creates collections, indexes, and shifts all 3 apartment communities, flats, residents,
 * watchmen visitor logs, and incident problem logs directly into MongoDB Compass.
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'community_hub';

// 3 Distinct Communities / Apartments
const SEED_COMMUNITIES = [
  {
    _id: 'comm-101',
    name: 'Grand Palms Residency',
    address: '452 Palm Boulevard, Silver Oak Enclave',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postal_code: '560102',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    _id: 'comm-102',
    name: 'Shanti Niketan Heights',
    address: '78 Gandhi Road, Shivaji Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postal_code: '411005',
    created_at: new Date('2026-01-02T00:00:00.000Z'),
  },
  {
    _id: 'comm-103',
    name: 'Surya Emerald Towers',
    address: '12 Banjara Hills Main Rd, Road No. 10',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postal_code: '500034',
    created_at: new Date('2026-01-03T00:00:00.000Z'),
  },
];

const SEED_BUILDINGS = [
  // Grand Palms
  { _id: 'bld-01', community_id: 'comm-101', name: 'Block A (Sunflower Tower)', total_floors: 10 },
  { _id: 'bld-02', community_id: 'comm-101', name: 'Block B (Lotus Tower)', total_floors: 8 },
  { _id: 'bld-03', community_id: 'comm-101', name: 'Block C (Orchid Tower)', total_floors: 6 },
  // Shanti Niketan
  { _id: 'bld-04', community_id: 'comm-102', name: 'Tower 1 (Gulmohar Wing)', total_floors: 9 },
  { _id: 'bld-05', community_id: 'comm-102', name: 'Tower 2 (Parijat Wing)', total_floors: 7 },
  // Surya Emerald
  { _id: 'bld-06', community_id: 'comm-103', name: 'Emerald Wing A', total_floors: 12 },
  { _id: 'bld-07', community_id: 'comm-103', name: 'Ruby Wing B', total_floors: 11 },
];

const SEED_USERS = [
  // Platform Super Admin
  {
    _id: 'usr-superadmin-1',
    email: 'superadmin@communityhub.com',
    name: 'Karthik Sriram (Super Admin)',
    phone: '+91 99000 11111',
    role: 'SUPER_ADMIN',
    apartment_name: 'All Apartments (Central Controller)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // 3 Society Admins
  {
    _id: 'usr-admin-1',
    email: 'admin@communityhub.com',
    name: 'Sunita Deshmukh',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-admin-2',
    email: 'vikram.admin@shantiniketan.com',
    name: 'Vikram Gokhale',
    phone: '+91 98230 44551',
    role: 'ADMIN',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Heights',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-admin-3',
    email: 'srinivas.admin@suryaemerald.com',
    name: 'Srinivas Rao',
    phone: '+91 98480 33221',
    role: 'ADMIN',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Towers',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // 3 Dedicated Watchmen
  {
    _id: 'usr-security-1',
    email: 'suresh.security@communityhub.com',
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
    email: 'tukaram.security@shantiniketan.com',
    name: 'Tukaram Shinde (Gate Watchman)',
    phone: '+91 98221 55667',
    role: 'SECURITY',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Heights',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-security-3',
    email: 'mallikarjun.security@suryaemerald.com',
    name: 'Mallikarjun Naidu (Gate Watchman)',
    phone: '+91 98491 66778',
    role: 'SECURITY',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Towers',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Owners
  {
    _id: 'usr-owner-1',
    email: 'rajesh.owner@example.com',
    name: 'Rajesh Kumar',
    phone: '+91 98450 11223',
    role: 'OWNER',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-owner-2',
    email: 'priya.owner@example.com',
    name: 'Priya Sharma',
    phone: '+91 99123 44556',
    role: 'OWNER',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-owner-3',
    email: 'nilesh.owner@example.com',
    name: 'Nilesh Kulkarni',
    phone: '+91 98224 66778',
    role: 'OWNER',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Heights',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-owner-5',
    email: 'venkat.owner@example.com',
    name: 'Venkat Ramana',
    phone: '+91 98492 55667',
    role: 'OWNER',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Towers',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Tenants
  {
    _id: 'usr-tenant-1',
    email: 'ananya.tenant@example.com',
    name: 'Ananya Iyer',
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
    email: 'rohan.tenant@example.com',
    name: 'Rohan Verma',
    phone: '+91 96200 12345',
    role: 'TENANT',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    flat_id: 'flat-b-502',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-tenant-4',
    email: 'aditya.tenant@example.com',
    name: 'Aditya Chitale',
    phone: '+91 98233 11224',
    role: 'TENANT',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Heights',
    flat_id: 'flat-sn-102',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-tenant-7',
    email: 'harish.tenant@example.com',
    name: 'Harish Chandra',
    phone: '+91 98491 12345',
    role: 'TENANT',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Towers',
    flat_id: 'flat-se-101',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  // Staff Technicians
  {
    _id: 'usr-worker-1',
    email: 'ramesh.electrician@example.com',
    name: 'Ramesh Verma',
    phone: '+91 98800 33221',
    role: 'WORKER',
    worker_id: 'wrk-01',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    _id: 'usr-worker-2',
    email: 'ravi.plumber@example.com',
    name: 'Ravi Shankar',
    phone: '+91 97311 44556',
    role: 'WORKER',
    worker_id: 'wrk-02',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

// Expanded Flats (21 flats across 3 apartments)
const SEED_FLATS = [
  // Grand Palms
  { _id: 'flat-a-101', building_id: 'bld-01', flat_number: 'A-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1250, rent_amount: 28000, maintenance_amount: 3500, occupancy_status: 'VACANT' },
  { _id: 'flat-a-201', building_id: 'bld-01', flat_number: 'A-201', floor_number: 2, flat_type: '2BHK', area_sqft: 1300, rent_amount: 29000, maintenance_amount: 3500, occupancy_status: 'VACANT' },
  { _id: 'flat-a-301', building_id: 'bld-01', flat_number: 'A-301', floor_number: 3, flat_type: '3BHK', area_sqft: 1650, rent_amount: 36000, maintenance_amount: 4500, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-b-201', building_id: 'bld-02', flat_number: 'B-201', floor_number: 2, flat_type: '3BHK', area_sqft: 1800, rent_amount: 42000, maintenance_amount: 5000, occupancy_status: 'VACANT' },
  { _id: 'flat-b-502', building_id: 'bld-02', flat_number: 'B-502', floor_number: 5, flat_type: 'Penthouse', area_sqft: 2400, rent_amount: 65000, maintenance_amount: 6500, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-c-101', building_id: 'bld-03', flat_number: 'C-101', floor_number: 1, flat_type: '1BHK', area_sqft: 750, rent_amount: 18000, maintenance_amount: 2200, occupancy_status: 'VACANT' },
  { _id: 'flat-c-202', building_id: 'bld-03', flat_number: 'C-202', floor_number: 2, flat_type: '2BHK', area_sqft: 1100, rent_amount: 24000, maintenance_amount: 3000, occupancy_status: 'OCCUPIED' },

  // Shanti Niketan
  { _id: 'flat-sn-101', building_id: 'bld-04', flat_number: 'G-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1150, rent_amount: 26000, maintenance_amount: 3200, occupancy_status: 'VACANT' },
  { _id: 'flat-sn-102', building_id: 'bld-04', flat_number: 'G-202', floor_number: 2, flat_type: '3BHK', area_sqft: 1550, rent_amount: 34000, maintenance_amount: 4200, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-sn-201', building_id: 'bld-04', flat_number: 'G-301', floor_number: 3, flat_type: '2BHK', area_sqft: 1250, rent_amount: 27500, maintenance_amount: 3400, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-sn-301', building_id: 'bld-05', flat_number: 'P-101', floor_number: 1, flat_type: '1BHK', area_sqft: 800, rent_amount: 19000, maintenance_amount: 2300, occupancy_status: 'VACANT' },
  { _id: 'flat-sn-302', building_id: 'bld-05', flat_number: 'P-202', floor_number: 2, flat_type: '3BHK', area_sqft: 1700, rent_amount: 38000, maintenance_amount: 4600, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-sn-401', building_id: 'bld-05', flat_number: 'P-401', floor_number: 4, flat_type: 'Penthouse', area_sqft: 2300, rent_amount: 60000, maintenance_amount: 6000, occupancy_status: 'OCCUPIED' },

  // Surya Emerald
  { _id: 'flat-se-101', building_id: 'bld-06', flat_number: 'E-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1300, rent_amount: 32000, maintenance_amount: 4000, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-se-102', building_id: 'bld-06', flat_number: 'E-202', floor_number: 2, flat_type: '3BHK', area_sqft: 1750, rent_amount: 45000, maintenance_amount: 5500, occupancy_status: 'VACANT' },
  { _id: 'flat-se-201', building_id: 'bld-06', flat_number: 'E-401', floor_number: 4, flat_type: '4BHK', area_sqft: 2400, rent_amount: 68000, maintenance_amount: 7200, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-se-301', building_id: 'bld-07', flat_number: 'R-101', floor_number: 1, flat_type: '2BHK', area_sqft: 1250, rent_amount: 30000, maintenance_amount: 3800, occupancy_status: 'OCCUPIED' },
  { _id: 'flat-se-302', building_id: 'bld-07', flat_number: 'R-302', floor_number: 3, flat_type: '3BHK', area_sqft: 1800, rent_amount: 46000, maintenance_amount: 5600, occupancy_status: 'VACANT' },
  { _id: 'flat-se-401', building_id: 'bld-07', flat_number: 'R-501', floor_number: 5, flat_type: 'Penthouse', area_sqft: 2800, rent_amount: 85000, maintenance_amount: 8500, occupancy_status: 'OCCUPIED' },
];

const SEED_VISITOR_LOGS = [
  {
    _id: 'vis-01',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    visitor_name: 'Raju Kumar (Zomato Delivery)',
    phone: '+91 91234 56789',
    purpose: 'DELIVERY',
    company_or_service: 'Zomato Food Delivery',
    visiting_flat: 'A-301',
    visiting_resident_name: 'Ananya Iyer',
    vehicle_number: 'KA-01-ET-3421',
    entry_time: '12:45 PM',
    status: 'ALLOWED',
    pass_code: 'GP-8834',
    created_at: new Date(),
  },
  {
    _id: 'vis-02',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    visitor_name: 'Deepak Yadav (Amazon Express)',
    phone: '+91 98111 22334',
    purpose: 'DELIVERY',
    company_or_service: 'Amazon India',
    visiting_flat: 'B-502',
    visiting_resident_name: 'Rohan Verma',
    vehicle_number: 'KA-05-AB-7890',
    entry_time: '01:15 PM',
    status: 'ALLOWED',
    pass_code: 'GP-9122',
    created_at: new Date(),
  },
  {
    _id: 'vis-03',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    visitor_name: 'Vijay Tiwari (Door-to-door sales)',
    phone: '+91 98777 66554',
    purpose: 'OTHER',
    company_or_service: 'Unregistered Sales Agent',
    visiting_flat: 'C-101',
    visiting_resident_name: 'Unknown',
    entry_time: '01:40 PM',
    status: 'DENIED',
    notes: 'Unsolicited marketing door-to-door not permitted.',
    created_at: new Date(),
  },
  {
    _id: 'vis-04',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Heights',
    visitor_name: 'Ganesh Shinde (Swiggy Delivery)',
    phone: '+91 99223 34455',
    purpose: 'DELIVERY',
    company_or_service: 'Swiggy Instamart',
    visiting_flat: 'G-202',
    visiting_resident_name: 'Aditya Chitale',
    entry_time: '11:30 AM',
    status: 'ALLOWED',
    pass_code: 'SN-3310',
    created_at: new Date(),
  },
  {
    _id: 'vis-05',
    community_id: 'comm-103',
    apartment_name: 'Surya Emerald Towers',
    visitor_name: 'Naveen Kumar (Blinkit Grocery)',
    phone: '+91 98490 22334',
    purpose: 'DELIVERY',
    company_or_service: 'Blinkit',
    visiting_flat: 'E-101',
    visiting_resident_name: 'Harish Chandra',
    entry_time: '01:00 PM',
    status: 'ALLOWED',
    pass_code: 'SE-5529',
    created_at: new Date(),
  },
];

const SEED_INCIDENT_REPORTS = [
  {
    _id: 'inc-01',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    watchman_name: 'Suresh Reddy (Gate Watchman)',
    title: 'Block A Passenger Lift 1 stuck on 4th floor with audible alarm',
    description: 'At 11:30 AM, residents reported lift alarm ringing. Schindler emergency helpline contacted.',
    category: 'LIFT',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    affected_area: 'Sunflower Tower Lift Shaft #1',
    created_at: new Date(),
  },
  {
    _id: 'inc-02',
    community_id: 'comm-101',
    apartment_name: 'Grand Palms Residency',
    watchman_name: 'Suresh Reddy (Gate Watchman)',
    title: 'Overhead Water Tank 2 booster pump trip error code E-04',
    description: 'Underground sump pump #2 tripped due to thermal overload.',
    category: 'WATER_PUMP',
    severity: 'HIGH',
    status: 'REPORTED',
    affected_area: 'Pump Room Sump B',
    created_at: new Date(),
  },
  {
    _id: 'inc-03',
    community_id: 'comm-102',
    apartment_name: 'Shanti Niketan Heights',
    watchman_name: 'Tukaram Shinde (Gate Watchman)',
    title: 'Tower 1 Basement Parking Water Seepage near Pillar P-14',
    description: 'Minor groundwater seepage observed near storm drain pipe.',
    category: 'OTHER',
    severity: 'HIGH',
    status: 'REPORTED',
    affected_area: 'Basement -1 Parking Bay 14',
    created_at: new Date(),
  },
];

const SEED_BOOKINGS = [
  {
    _id: 'bk-01',
    service_id: 'srv-01',
    worker_id: 'wrk-01',
    user_id: 'usr-tenant-1',
    user_name: 'Ananya Iyer',
    flat_number: 'A-301',
    service_name: 'Apex Electrical Solutions',
    worker_name: 'Ramesh Verma',
    booking_date: '2026-10-07',
    time_slot: '10:00 AM - 11:00 AM',
    issue_description: 'Living room chandelier switch flickering and fan regulator replacement.',
    status: 'CONFIRMED',
    created_at: new Date(),
  },
];

const SEED_PRIVATE_MESSAGES = [
  {
    _id: 'msg-01',
    sender_id: 'usr-admin-1',
    recipient_id: 'usr-tenant-1',
    sender_name: 'Sunita Deshmukh',
    recipient_name: 'Ananya Iyer',
    message: 'Hello Ananya, the maintenance team will be inspecting Flat A-301 water meter tomorrow at 10 AM.',
    tag: 'Maintenance Notice',
    is_read: true,
    created_at: new Date(),
  },
  {
    _id: 'msg-02',
    sender_id: 'usr-tenant-1',
    recipient_id: 'usr-worker-1',
    sender_name: 'Ananya Iyer',
    recipient_name: 'Ramesh Verma',
    message: 'Hello Ramesh Verma, I have booked a slot with you for Apex Electrical Solutions on 2026-10-07 (10:00 AM - 11:00 AM). Problem: Living room chandelier switch flickering.',
    tag: 'Service Booking Dispatch',
    is_read: true,
    created_at: new Date(),
  },
];

async function migrateToMongoDB() {
  console.log('====================================================');
  console.log('MIGRATING MULTI-APARTMENT SYSTEM TO MONGODB COMPASS');
  console.log(`Connecting to: ${MONGO_URI}/${DB_NAME}`);
  console.log('====================================================');

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('✓ Successfully connected to MongoDB Compass instance on port 27017!');

    const db = client.db(DB_NAME);

    const collections = [
      { name: 'communities', data: SEED_COMMUNITIES },
      { name: 'buildings', data: SEED_BUILDINGS },
      { name: 'users', data: SEED_USERS },
      { name: 'flats', data: SEED_FLATS },
      { name: 'visitor_logs', data: SEED_VISITOR_LOGS },
      { name: 'incident_reports', data: SEED_INCIDENT_REPORTS },
      { name: 'service_bookings', data: SEED_BOOKINGS },
      { name: 'private_messages', data: SEED_PRIVATE_MESSAGES },
    ];

    for (const col of collections) {
      const collection = db.collection(col.name);
      await collection.deleteMany({});
      const result = await collection.insertMany(col.data);
      console.log(`✓ Collection [${col.name}] populated with ${result.insertedCount} documents.`);
    }

    // Indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('communities').createIndex({ name: 1 });
    await db.collection('flats').createIndex({ flat_number: 1 });
    await db.collection('visitor_logs').createIndex({ community_id: 1, status: 1 });
    await db.collection('incident_reports').createIndex({ community_id: 1, severity: 1 });
    await db.collection('service_bookings').createIndex({ worker_id: 1, booking_date: 1 });
    await db.collection('private_messages').createIndex({ sender_id: 1, recipient_id: 1 });

    console.log('====================================================');
    console.log('✓ MIGRATION COMPLETE!');
    console.log(`Open MongoDB Compass and refresh database: "${DB_NAME}"`);
    console.log('All 3 apartments, 21 flats, visitor logs & incident reports are live in MongoDB Compass.');
    console.log('====================================================');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.close();
  }
}

migrateToMongoDB();
