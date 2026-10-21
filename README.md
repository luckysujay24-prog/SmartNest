<div align="center">

# 🏢 SmartNest

### Residential Management OS for gated apartment societies

Role-isolated portals · Private owner–tenant rent · Gate register · On-demand technician booking · Private chat

**React 19 · TypeScript · Vite · Tailwind CSS · Express · MongoDB · Selenium**

</div>

---

## 📖 Table of Contents

1. [About](#-about)
2. [Features](#-features)
3. [Roles and Portals](#-roles-and-portals)
4. [Demo Accounts](#-demo-accounts)
5. [How It Works](#-how-it-works)
6. [Tech Stack](#-tech-stack)
7. [Architecture](#-architecture)
8. [Project Structure](#-project-structure)
9. [Getting Started](#-getting-started)
10. [Using MongoDB Compass](#-using-mongodb-compass)
11. [API Reference](#-api-reference)
12. [Data Model](#-data-model)
13. [Design Overview](#-design-overview)
14. [Automated Testing](#-automated-testing)
15. [Troubleshooting](#-troubleshooting)
16. [Known Limitations](#-known-limitations)
17. [Roadmap](#-roadmap)
18. [Author](#-author)

---

## 📌 About

Apartment societies often run on messaging groups, paper registers and spreadsheets. Rent receipts get lost, gate entries are not recorded, repairs are forgotten and nobody can see what is pending.

**SmartNest** puts the whole community on one platform. Each person signs in to a portal made for their role, and sees only what concerns them:

- A **Super Admin** oversees every apartment society.
- **Society Admins** manage their own society's flats, residents, bills, complaints and announcements.
- **Property Owners** lease flats, assign tenants and collect rent privately.
- **Tenants** pay rent and bills, raise complaints and book services.
- **Gate Watchmen** record visitors and report incidents.
- **Service Technicians** receive bookings and update their tasks.

The app ships with three pre-loaded societies (Bengaluru, Pune and Hyderabad) so you can explore every role immediately.

---

## ✨ Features

### 🔐 Role-based access
- Six role-isolated portals: Super Admin, Society Admin, Owner, Tenant, Worker and Security
- Persona launcher: choose an apartment, then open any registered profile directly
- Email sign-in, plus a registration form for new residents
- Account activation flag, so an administrator can deactivate a user

### 🏘 Multi-apartment management
- Three societies out of the box: Grand Palms Residency (Bengaluru), Shanti Niketan Haven (Pune) and Surya Emerald Heights (Hyderabad)
- Societies contain buildings and flats with flat type, floor, area, rent, maintenance amount and occupancy status
- Society Admins manage flats, owners, tenants and workers for their own society
- Super Admin portal for platform-wide oversight

### 💸 Private rent and bills
- Rent is private between the **owner and the tenant**; society admins only manage society maintenance and shared utilities
- Only the Property Owner can lease, assign, change or vacate a tenant for their unit
- Bill types: rent, electricity, gas, water, internet, maintenance, common water, common electricity, security, cleaning and other
- Bill statuses: pending, partially paid, paid, overdue, cancelled
- Shared bills can be allocated equally, by area or with a custom split
- Payment modal with printable **receipts** and a payment history for tenants

### 🛡 Security guard portal
- Outsider entry register for delivery agents, cabs and guests
- Each entry is marked `ALLOWED` or `DENIED`
- Facility incident reporting from the gate

### 🛠 Complaints and services
- Complaint categories: plumbing, electrical, cleaning, security, water, lift, common area, noise and other
- Priority levels from low to emergency
- Status flow: submitted → acknowledged → assigned → in progress → resolved → closed (or rejected)
- Book verified electricians, plumbers, AC technicians and more by date and time slot
- Technicians see their tasks and task history, and update their profile and availability

### 💬 Communication
- Private 1-to-1 chat between residents, owners, admins and technicians
- Bookings automatically start a private chat message
- Announcements by category: general, maintenance, emergency, event, payment, security and important
- Notification bell for bills, payments, announcements, complaints, tasks, visitors and incidents

### 🧾 Accountability
- Audit trail screen for administrators

### 🗄 Data and storage
- Express backend connected to **MongoDB** (Compass), with **automatic JSON fallback** when MongoDB is not running
- 12 collections seeded with realistic data, plus readable JSON backups in `mongo-data/`

---

## 👥 Roles and Portals

| Role | Portal | Main screens |
|---|---|---|
| `SUPER_ADMIN` | Super Admin Portal | All-society overview, directory, audit trail |
| `ADMIN` | Society Admin | Dashboard, flats, owners, tenants, workers, bills, payments, complaints, announcements, services, residents |
| `OWNER` | Property Owner | Dashboard, my properties, bills and collections, complaints, chat |
| `TENANT` | Tenant | Dashboard, rent and bills, payment history, services, complaints, profile, chat |
| `WORKER` | Technician | Dashboard, tasks, task history, profile |
| `SECURITY` | Gate Watchman | Visitor register, incident reports, announcements |

---

## 🔑 Demo Accounts

The seeded data includes ready-to-use accounts. Use the persona launcher on the sign-in screen, or type an email manually. The default password for every demo account is:

```
password123
```

| Role | Email | Society |
|---|---|---|
| Super Admin | `karthik@smartnest.in` | All societies |
| Society Admin | `sunita.admin@grandpalms.in` | Grand Palms Residency |
| Society Admin | `vikram.admin@shantiniketan.in` | Shanti Niketan Haven |
| Society Admin | `srinivas.admin@suryaemerald.in` | Surya Emerald Heights |
| Owner | `rajesh.owner@gmail.com`, `priya.owner@gmail.com` | Grand Palms Residency |
| Owner | `nilesh.owner@gmail.com` | Shanti Niketan Haven |
| Owner | `venkat.owner@gmail.com` | Surya Emerald Heights |
| Tenant | `ananya.tenant@gmail.com`, `rohan.tenant@gmail.com` | Grand Palms Residency |
| Tenant | `aditya.tenant@gmail.com` | Shanti Niketan Haven |
| Tenant | `harish.tenant@gmail.com` | Surya Emerald Heights |
| Security | `suresh.security@grandpalms.in` | Grand Palms Residency |
| Technician | `ramesh.electrician@smartnest.in`, `ravi.plumber@smartnest.in` | Grand Palms Residency |
| Technician | `manoj.actech@smartnest.in` | Shanti Niketan Haven |

> These are demo credentials for local use only.

---

## 🔄 How It Works

**Paying rent (owner and tenant)**
1. The owner leases a flat and assigns a tenant from the owner portal.
2. The owner issues a rent bill for the flat.
3. The tenant sees it under *Rent and Bills* and pays through the payment modal.
4. The payment is recorded, the bill status moves to paid and a receipt can be opened or printed.
5. Rent stays private: society admins cannot see it.

**Raising a complaint**
1. A tenant or owner files a complaint with a category and priority.
2. The society admin acknowledges it and assigns a technician.
3. The technician moves it through in progress and resolved.
4. The resident sees every status change and a notification.

**Booking a service**
1. The resident opens the Service Booking Portal and picks a technician category.
2. They choose a date, a time slot and describe the issue.
3. The booking is saved, the technician sees it in their task list and a private chat message is created automatically.

**Gate register**
1. The watchman logs each outsider entry (delivery, cab or guest) with the flat visited.
2. The entry is marked allowed or denied.
3. Facility problems are reported as incidents for the society admin.

**Data flow**
1. Every action updates the in-browser store and notifies the open screens.
2. The change is sent to the Express API.
3. The API writes to MongoDB, or to `mongo-data/*.json` when MongoDB is offline.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide icons, Motion, canvas-confetti |
| Backend | Node.js, Express 4, CORS |
| Database | MongoDB (local, via Compass) with JSON-file fallback |
| Testing | Selenium WebDriver, Pytest (Page Object pattern) |
| Tooling | tsx, esbuild, dotenv, StarUML (design), ProjectLibre (planning) |

---

## 🏗 Architecture

```
┌──────────────────────────┐   fetch /api/*    ┌──────────────────────────┐   driver   ┌────────────────────┐
│  React + TypeScript SPA  │ ────────────────► │  Express API  (:5000)    │ ─────────► │  MongoDB (:27017)  │
│  Vite dev server (:3000) │ ◄──────────────── │  server.cjs              │            │  db: smartnest     │
│  role-based portals      │                   │                          │ ─ fallback ► mongo-data/*.json  │
└──────────────────────────┘                   └──────────────────────────┘            └────────────────────┘
```

- The browser app keeps a reactive local store (`src/services/storage.ts`) and syncs changes to the Express API.
- The API reads and writes MongoDB when it is reachable, and otherwise uses the JSON files in `mongo-data/`, so the app always starts.
- `GET /api/health` reports the current mode (`MONGODB_COMPASS` or `LOCAL_JSON_FALLBACK`).

---

## 📁 Project Structure

```
smartnest/
├── src/
│   ├── App.tsx                    # app shell and role-based view routing
│   ├── main.tsx
│   ├── types.ts                   # TypeScript data model
│   ├── index.css
│   ├── services/
│   │   ├── authContext.tsx        # sign-in, register, session
│   │   ├── storage.ts             # reactive store + API sync
│   │   └── seedData.ts            # demo data
│   └── components/
│       ├── auth/                  # LoginModal, RegisterModal, PersonaSelectionModal
│       ├── public/                # LandingPage
│       ├── navigation/            # Navbar, Sidebar
│       ├── admin/                 # SuperAdminPortal, AdminDashboard, Flats/Owners/Tenants/Workers,
│       │                          # Bills, Payments, Complaints, Announcements, Services, AuditTrail
│       ├── owner/                 # OwnerDashboard, OwnerProperties, OwnerBillsAndCollections, OwnerComplaints
│       ├── tenant/                # TenantDashboard, TenantRentAndBills, TenantPaymentHistory, TenantServices, ...
│       ├── worker/                # WorkerDashboard, WorkerTasks, WorkerTaskHistory, WorkerProfile
│       ├── security/              # SecurityGuardPortal
│       ├── services/              # ServiceBookingPortal, ServiceBookingModal
│       ├── chat/                  # PrivateChatView
│       ├── common/                # NotificationBell, PaymentModal, ReceiptModal
│       └── ui/                    # Button, Card, Input, Modal, Badge, Toast
├── server.cjs                     # Express API with MongoDB + JSON fallback
├── mongo-data/                    # JSON backups of the 12 collections
├── scripts/                       # seed-smartnest-mongo.cjs, migrate-to-mongo.cjs, schema.sql
├── SmartNest_Testing/             # Selenium + Pytest suite
├── START_SMARTNEST.bat            # one-click launcher (Windows)
├── STOP_SMARTNEST.bat
├── SEED_DATABASE.bat
├── HOW_TO_RUN.txt
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) LTS and npm
- Git
- MongoDB Community Server and Compass (**optional**; the app works without them)

### Option 1: One click (Windows)

1. Clone or unzip the project.
2. Double-click **`START_SMARTNEST.bat`** in File Explorer.
3. It installs packages on first run, seeds the database, starts both servers and opens `http://localhost:3000`.
4. Double-click **`STOP_SMARTNEST.bat`** when you are done.

### Option 2: From the terminal (VS Code, any OS)

```bash
git clone https://github.com/luckysujay24-prog/smartnest.git
cd smartnest
npm install
```

Open **two terminals** in the project folder.

**Terminal 1: backend (port 5000)**
```bash
node server.cjs
```

**Terminal 2: frontend (port 3000)**
```bash
npm run dev
```

Then open **http://localhost:3000** in your browser. Make sure you are inside the folder that contains `package.json` before running `npm install`.

### Handy scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite frontend on port 3000 |
| `npm run server` | Start the Express API on port 5000 (same as `node server.cjs`) |
| `npm run seed:mongo` | Seed the `smartnest` database and refresh `mongo-data/` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | TypeScript type check |

### Environment variables

The app runs without any `.env` file. `.env.example` is the template that came with the project scaffold:

| Variable | Used for |
|---|---|
| `GEMINI_API_KEY` | Optional Gemini API access (not needed to run SmartNest) |
| `APP_URL` | URL where the app is hosted |
| `MONGO_URI` | MongoDB address for the API, default `mongodb://127.0.0.1:27017` |
| `DB_NAME` | Database name, default `smartnest` |
| `PORT` | API port, default `5000` |

---

## 🍃 Using MongoDB Compass

1. Install and start MongoDB Community Server.
2. Run `npm run seed:mongo` to create and fill the `smartnest` database.
3. Open **MongoDB Compass**, connect to `mongodb://127.0.0.1:27017` and open the `smartnest` database.
4. Restart the API. `http://localhost:5000/api/health` should now show `"connected": true`.

Collections: `communities`, `buildings`, `flats`, `users`, `bills`, `payments`, `visitor_logs`, `incident_reports`, `service_bookings`, `private_messages`, `complaints`, `announcements`.

If MongoDB is not running, the API prints a message and serves the same data from `mongo-data/*.json`.

---

## 📡 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server status, storage mode and collection list |
| GET / POST | `/api/communities` | List or create societies |
| GET | `/api/buildings` | List buildings |
| GET / POST | `/api/users` | List or create users |
| GET / POST | `/api/flats` | List or create flats |
| GET / POST | `/api/bills` | List or create bills |
| GET / POST | `/api/payments` | List or record payments |
| GET / POST | `/api/complaints` | List or file complaints |
| GET | `/api/announcements` | List announcements |
| GET / POST | `/api/visitor_logs` | Gate entry register |
| GET / POST | `/api/incident_reports` | Facility incident reports |
| GET | `/api/bookings` | List service bookings |
| POST | `/api/service_bookings` | Create a service booking |
| GET | `/api/messages` | List private messages |
| POST | `/api/private_messages` | Send a private message |

Opening `http://localhost:5000/` shows a small dashboard of the connected database.

---

## 🗄 Data Model

The TypeScript model in `src/types.ts` covers users, communities, buildings, flats, bills, payments, complaints, announcements, workers, visitors, incidents, bookings, messages and notifications. Twelve of these are stored as MongoDB collections.

Key relationships:
- A **community** has many **buildings**, and a building has many **flats**
- A **flat** has one owner and, when occupied, one tenant
- **Bills** belong to a flat and community; **payments** belong to a bill
- **Complaints** and **service bookings** link a resident to a technician
- **Private messages** link a sender and a recipient


---

## 📐 Design Overview

The system was modelled in **StarUML** before and during development.

| Model | What it shows |
|---|---|
| Use case diagram | Admin, Owner, Tenant, Worker and Security actors with use cases such as login, manage flats, pay rent, raise complaint, book service and view notifications |
| Class diagram | Domain classes (User, Community, Building, Flat, Bill, Payment, Complaint, Booking, Message) with generalization, aggregation, composition and associations |
| Component diagram | React portals, the Express API, the storage layer and MongoDB |
| Sequence diagram | A tenant paying rent: sign-in, view bill, pay, update status, receipt and notification to the owner |
| Communication diagram | The same rent payment scenario as numbered object-to-object messages |
| Deployment diagram | Client browser, web server, application server, database server and notification module |
| ER diagram | Apartment, User, Flat, Owner, Tenant, Rent, Maintenance Request, Moving Request, Service Booking, Service Provider, Notification, Announcement and Event with PK and FK columns |

The ER diagram reflects the design-phase schema. The final database has the 12 collections listed under [Using MongoDB Compass](#-using-mongodb-compass).

---

## 🧪 Automated Testing

The `SmartNest_Testing/` folder holds a Selenium and Pytest suite for the sign-in flow, written with the Page Object pattern.

- **15 functional tests** (F01–F15): modal loads, valid tenant, admin and owner login, wrong password, unknown email, empty and malformed fields, password masking and show/hide, logout and re-login, protected-route access, whitespace trimming
- **5 non-functional tests** (NF01–NF05): usability, login response time, repeated sessions, DOM password masking and keyboard accessibility

Run it with the app already running on port 3000:

```bash
pip install selenium pytest
cd SmartNest_Testing
python -m pytest -v -s
```

On Windows you can also double-click `SmartNest_Testing/run_tests.bat`. Chrome must be installed.

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| `npm error ENOENT ... package.json` | You are in the wrong folder. `cd` into the one that contains `package.json` |
| Browser does not open | Open `http://localhost:3000` yourself. Use `localhost`, not `0.0.0.0` |
| Page loads but no data | Start the backend (`node server.cjs`) |
| Port 3000 or 5000 already in use | Run `STOP_SMARTNEST.bat` or close the old terminals |
| PowerShell blocks scripts | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt |
| Want a clean slate | Clear the site's local storage in the browser, then run `npm run seed:mongo` |
| MongoDB not found | Nothing to fix; the API uses the JSON fallback automatically |

---

## ⚠️ Known Limitations

- Demo authentication: sign-in checks a shared default password in the browser and no tokens are issued. It is meant for demonstration, not production
- No payment gateway; payments are recorded inside the app
- No SMS or email notifications; notifications are in-app only
- Writes use a simple API without server-side authorization, so do not expose it publicly
- Automated tests currently cover sign-in only

---

## 🗺 Roadmap

- [ ] Real authentication with hashed passwords and JWT, plus server-side role checks
- [ ] Payment gateway integration with automatic confirmation
- [ ] Email, SMS and push notifications
- [ ] Update and delete endpoints for every collection
- [ ] Wider Selenium coverage: bills, complaints and booking flows
- [ ] Deployment (Vercel or Render for the app, MongoDB Atlas for data)

---

## 👨‍💻 Author

**Sujay**
B.Tech. Computer Science and Engineering (AI and Robotics), Vellore Institute of Technology
Register No. **24BRS1027**

- GitHub: [@luckysujay24-prog](https://github.com/luckysujay24-prog)

---

<div align="center">

⭐ If you like this project, give it a star.

</div>
