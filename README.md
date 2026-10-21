# SmartNest - Modern Residential Management Platform

SmartNest is an integrated residential operating system for gated apartment societies and high-rises. It features role-isolated access for **Super Admin**, **Society Admins**, **Property Owners**, **Tenants**, **Gate Watchmen**, and **Service Technicians**, complete with private owner-tenant rent management, gate entry passes, on-demand technician bookings, and **MongoDB Compass** integration.

---

## 🚀 1-Click Launch (Windows)

Whenever you want to run and open SmartNest, simply double-click:
```text
START_SMARTNEST.bat
```
This automatically verifies dependencies, seeds the database, boots the Express backend and Vite frontend, and opens [http://localhost:3000](http://localhost:3000) in your web browser.

To stop the servers when finished, double-click:
```text
STOP_SMARTNEST.bat
```

---

## 🌐 URLs & Service Endpoints

- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API & MongoDB Dashboard**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Compass Connection**: `mongodb://127.0.0.1:27017/smartnest`

---

## 📁 Key Features

1. **Role-Based Persona Launcher**:
   - Choose your apartment (*Grand Palms Residency*, *Shanti Niketan Haven*, *Surya Emerald Heights*) and open any registered profile directly.
2. **Owner-Controlled Tenant Assignment**:
   - Only Property Owners can lease, assign, change, or vacate tenants for their units.
3. **Financial Privacy & Isolation**:
   - Rent is strictly private between respective owners and tenants. Society Admins only manage society maintenance and shared utility assessments.
4. **Security Guard / Watchman Portal**:
   - Outsider entry log (Swiggy, Zomato, Cabs, Guests) with `ALLOWED` / `DENIED` statuses and incident problem reporting.
5. **On-Demand Service Booking**:
   - Book verified electricians, plumbers, and AC technicians with designated time slots and automatic 1-on-1 private chat notifications.
6. **MongoDB Compass Integration**:
   - 12 populated collections in database `smartnest` with clean JSON backups in `mongo-data/`.

---

## 🛠️ Manual Terminal Commands

```powershell
# Install project dependencies
npm install

# Initialize/re-seed MongoDB database & export JSON data
npm run seed:mongo

# Start Express Backend API (Port 5000)
node server.cjs

# Start Vite Frontend (Port 3000)
npm run dev

# Run TypeScript checks
npm run lint

# Build production bundle
npm run build
```
