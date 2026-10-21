/**
 * SmartNest Express + MongoDB Compass Backend API
 * Connects directly to MongoDB Compass at mongodb://127.0.0.1:27017/smartnest
 * Resilient Architecture: Live MongoDB with zero-downtime JSON storage fallback
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'smartnest';
const DATA_DIR = path.join(__dirname, 'mongo-data');

app.use(cors());
app.use(express.json());

let client = null;
let db = null;
let isMongoConnected = false;

// Connect to MongoDB with fast timeout and retry
async function connectToMongo() {
  try {
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    await client.connect();
    db = client.db(DB_NAME);
    isMongoConnected = true;
    console.log(`✓ [SmartNest API] Connected to database "${DB_NAME}" at ${MONGO_URI}`);
  } catch (err) {
    isMongoConnected = false;
    db = null;
    console.log(`ℹ [SmartNest API] MongoDB offline (${err.message}). Using local JSON fallback in ./mongo-data/`);
  }
}

connectToMongo();

// Helper to read data (MongoDB -> Fallback to JSON file)
async function getCollectionData(collectionName) {
  if (db && isMongoConnected) {
    try {
      return await db.collection(collectionName).find({}).toArray();
    } catch (e) {
      console.warn(`[SmartNest API] Read error for ${collectionName}, falling back to file`);
    }
  }

  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Helper to insert data (MongoDB -> Fallback to JSON file)
async function insertCollectionData(collectionName, doc) {
  const newDoc = {
    ...doc,
    _id: doc._id || `${collectionName.slice(0, 3)}-${Date.now()}`,
    created_at: doc.created_at || new Date().toISOString(),
  };

  if (db && isMongoConnected) {
    try {
      const res = await db.collection(collectionName).insertOne(newDoc);
      return res.insertedId || newDoc._id;
    } catch (e) {
      console.warn(`[SmartNest API] Insert error in MongoDB, updating fallback file`);
    }
  }

  // File fallback
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  let list = [];
  if (fs.existsSync(filePath)) {
    try {
      list = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      list = [];
    }
  }
  list.unshift(newDoc);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
  return newDoc._id;
}

// Root Interactive Status Page
app.get('/', async (req, res) => {
  const collections = [
    'communities',
    'buildings',
    'users',
    'flats',
    'bills',
    'payments',
    'visitor_logs',
    'incident_reports',
    'service_bookings',
    'private_messages',
    'complaints',
    'announcements',
  ];

  const counts = {};
  for (const name of collections) {
    try {
      const data = await getCollectionData(name);
      counts[name] = data.length;
    } catch (e) {
      counts[name] = 0;
    }
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartNest - Backend API & MongoDB Engine</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: ${isMongoConnected ? '#064e3b' : '#3b2506'}; color: ${isMongoConnected ? '#34d399' : '#fbbf24'}; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; border: 1px solid ${isMongoConnected ? '#059669' : '#d97706'}; }
    .pulse { width: 8px; height: 8px; background: ${isMongoConnected ? '#34d399' : '#fbbf24'}; border-radius: 50%; box-shadow: 0 0 10px ${isMongoConnected ? '#34d399' : '#fbbf24'}; }
    h1 { margin: 16px 0 8px 0; font-size: 26px; color: #ffffff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 14px; }
    .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
    .card-value { font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 4px; word-break: break-all; }
    .endpoints { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-top: 20px; }
    .endpoints h3 { margin: 0 0 12px 0; font-size: 14px; color: #e2e8f0; }
    .links { display: flex; flex-wrap: wrap; gap: 10px; }
    .link-btn { display: inline-block; background: #334155; color: #f8fafc; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; transition: background 0.2s; border: 1px solid #475569; }
    .link-btn:hover { background: #2563eb; border-color: #3b82f6; }
    .primary-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; margin-top: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
    .primary-btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <span class="pulse"></span>
      ${isMongoConnected ? 'MongoDB Compass Connected & Operational' : 'API Running with JSON Local Fallback Engine'}
    </div>
    <h1>SmartNest Backend API Server</h1>
    <p>The backend REST API server is running on <strong>Port 5000</strong>. It manages apartment records, visitor logs, rent transactions, and technician bookings.</p>

    <div class="grid">
      <div class="card">
        <div class="card-title">Database</div>
        <div class="card-value">${DB_NAME}</div>
      </div>
      <div class="card">
        <div class="card-title">Storage Mode</div>
        <div class="card-value" style="color: ${isMongoConnected ? '#34d399' : '#fbbf24'};">${isMongoConnected ? 'MongoDB Live' : 'JSON Engine (Ready)'}</div>
      </div>
      <div class="card">
        <div class="card-title">Total Collections</div>
        <div class="card-value">${collections.length} Collections</div>
      </div>
      <div class="card">
        <div class="card-title">Server Status</div>
        <div class="card-value" style="color: #34d399;">HTTP 200 OK</div>
      </div>
    </div>

    <div class="endpoints">
      <h3>Explore Live API Endpoints:</h3>
      <div class="links">
        <a class="link-btn" href="/api/health" target="_blank">/api/health</a>
        <a class="link-btn" href="/api/communities" target="_blank">/api/communities (${counts['communities'] || 0})</a>
        <a class="link-btn" href="/api/flats" target="_blank">/api/flats (${counts['flats'] || 0})</a>
        <a class="link-btn" href="/api/users" target="_blank">/api/users (${counts['users'] || 0})</a>
        <a class="link-btn" href="/api/bills" target="_blank">/api/bills (${counts['bills'] || 0})</a>
        <a class="link-btn" href="/api/payments" target="_blank">/api/payments (${counts['payments'] || 0})</a>
        <a class="link-btn" href="/api/visitor_logs" target="_blank">/api/visitor_logs (${counts['visitor_logs'] || 0})</a>
        <a class="link-btn" href="/api/incident_reports" target="_blank">/api/incident_reports (${counts['incident_reports'] || 0})</a>
        <a class="link-btn" href="/api/bookings" target="_blank">/api/bookings (${counts['service_bookings'] || 0})</a>
        <a class="link-btn" href="/api/messages" target="_blank">/api/messages (${counts['private_messages'] || 0})</a>
      </div>
    </div>

    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;">
      <a href="http://localhost:3000" class="primary-btn">
        <span>→ Open SmartNest Web App (Port 3000)</span>
      </a>
      <span style="font-size: 12px; color: #64748b;">SmartNest v1.0</span>
    </div>
  </div>
</body>
</html>
  `);
});

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const collections = [
    'communities',
    'buildings',
    'users',
    'flats',
    'bills',
    'payments',
    'visitor_logs',
    'incident_reports',
    'service_bookings',
    'private_messages',
    'complaints',
    'announcements',
  ];

  res.json({
    status: 'OK',
    project: 'SmartNest',
    connected: isMongoConnected,
    mode: isMongoConnected ? 'MONGODB_COMPASS' : 'LOCAL_JSON_FALLBACK',
    database: DB_NAME,
    mongoUri: MONGO_URI,
    collectionsCount: collections.length,
    collections,
  });
});

// Communities / Apartments
app.get('/api/communities', async (req, res) => {
  try {
    const data = await getCollectionData('communities');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/communities', async (req, res) => {
  try {
    const id = await insertCollectionData('communities', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buildings / Wings
app.get('/api/buildings', async (req, res) => {
  try {
    const data = await getCollectionData('buildings');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const data = await getCollectionData('users');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const id = await insertCollectionData('users', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Flats / Units
app.get('/api/flats', async (req, res) => {
  try {
    const data = await getCollectionData('flats');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/flats', async (req, res) => {
  try {
    const id = await insertCollectionData('flats', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bills & Utilities
app.get('/api/bills', async (req, res) => {
  try {
    const data = await getCollectionData('bills');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const id = await insertCollectionData('bills', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments
app.get('/api/payments', async (req, res) => {
  try {
    const data = await getCollectionData('payments');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const id = await insertCollectionData('payments', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const data = await getCollectionData('complaints');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  try {
    const id = await insertCollectionData('complaints', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const data = await getCollectionData('announcements');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visitor Logs (Gate Entry Register)
app.get('/api/visitor_logs', async (req, res) => {
  try {
    const data = await getCollectionData('visitor_logs');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitor_logs', async (req, res) => {
  try {
    const id = await insertCollectionData('visitor_logs', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Incident Reports (Facility & Service Problems)
app.get('/api/incident_reports', async (req, res) => {
  try {
    const data = await getCollectionData('incident_reports');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incident_reports', async (req, res) => {
  try {
    const id = await insertCollectionData('incident_reports', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Service Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const data = await getCollectionData('service_bookings');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/service_bookings', async (req, res) => {
  try {
    const id = await insertCollectionData('service_bookings', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Private Messages (1-on-1 Resident/Staff Chats)
app.get('/api/messages', async (req, res) => {
  try {
    const data = await getCollectionData('private_messages');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/private_messages', async (req, res) => {
  try {
    const id = await insertCollectionData('private_messages', req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Fallback Error Handler
app.use((err, req, res, next) => {
  console.error('[SmartNest API Error]', err);
  res.status(500).json({ success: false, error: err.message });
});

// Start Server with Graceful Port Collision Handling
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[SmartNest API] Express Server listening on http://localhost:${PORT}`);
  console.log(`[SmartNest Compass] Target database: "${DB_NAME}"`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [SmartNest API Error] Port ${PORT} is ALREADY IN USE by another process!`);
    console.error(`👉 Solution: Run 'STOP_SMARTNEST.bat' or kill existing process on Port ${PORT}, then re-run.\n`);
  } else {
    console.error('[SmartNest API Error]', err.message);
  }
});
