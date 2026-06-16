# MedConnect – Full-Stack Doctor Appointment Booking Platform

## 🔗 Live Demo Links
* **Live Storefront (Frontend)**: [https://medconnect-health.vercel.app](https://medconnect-health.vercel.app)
* **API Server (Backend)**: [https://medconnect-api.onrender.com](https://medconnect-api.onrender.com)

MedConnect is a production-grade healthcare/telemedicine application designed to manage appointments, patient records, clinical schedules, and administrative approvals. It is built using the MERN stack with Tailwind CSS, Socket.io, Chart.js, and Framer Motion.

---

## 🚀 Core Features

1. **Role-Based Access**: Specialized dashboards for Patients, Doctors, and Administrators.
2. **Doctor Discovery**: Filter by specialization, consultation fee, rating, experience, clinic location, and weekly availability. Sort by ratings, experience, or fees.
3. **Double-Booking Prevention**: The backend verifies scheduling slots during booking and rejects overlapping appointments.
4. **Real-Time Notification Engine**: Immediate notification popups (using Socket.io and `react-toastify`) for confirmations, cancellations, and clinical reports.
5. **Medical Report Directory**: Patients can upload reports (PDF/Images) with local file storage backup. Doctors can search and review these reports for active patients.
6. **Platform Analytics**: Interactive Chart.js charts for appointments growth, clinic specializations, user ratios, and revenue indicators.
7. **Verified Patient Reviews**: Rating reviews can only be posted by patients who have completed a consultation.

---

## 🛠️ Technology Stack

* **Database**: MongoDB (Mongoose schemas)
* **Backend**: Node.js, Express.js, JWT Auth, Socket.io, Multer, Nodemailer
* **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React-Toastify, Chart.js, Framer Motion

---

## 📦 Project Structure

```
medconnect/
├── backend/
│   ├── config/             # DB & socket configs
│   ├── controllers/        # Express handlers (auth, doctor, reviews, appointments, notifications, analytics)
│   ├── middleware/         # Auth checkers, upload limits
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST routing
│   ├── utils/              # Emailer helper, local upload writer, seeding data
│   ├── uploads/            # Local reports & profiles storage fallback
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── seed.js             # Seeding command script
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/     # UI elements (Navbar, Footer, ProtectedRoute)
    │   ├── context/        # Auth and Socket state contexts
    │   ├── pages/          # Home, Search, Details, Patient/Doctor/Admin Dashboards
    │   ├── services/       # Axios API layer
    │   ├── App.jsx
    │   ├── index.css       # Tailwind directives
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Environment Setup

### Backend Environment Variables (`backend/.env`)

Ensure you create `backend/.env` with the following variables (we have pre-created a template for you):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medconnect
JWT_SECRET=medconnectsupersecretkey123456!
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

*Note: If Cloudinary credentials are left empty, Multer will save files locally to `backend/uploads/` and serve them statically. If SMTP credentials are empty, emails will log directly to the server console.*

---

## ⚡ Quick Start & Installation

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Seed the Database

Wipe your local collections and create default accounts (Patient, Doctor, Admin) loaded with appointments, reviews, and reports to test analytics immediately.

Make sure your MongoDB is running, then execute:

```bash
cd backend
npm run seed
```

### 🔑 Seed Login Credentials

Use these logins to explore the platform without registering:

* **Patient Account**:
  * **Email**: `patient@medconnect.org`
  * **Password**: `patient123`
* **Doctor Account** (Pre-approved Cardiologist):
  * **Email**: `doctor@medconnect.org`
  * **Password**: `doctor123`
* **Admin Account**:
  * **Email**: `admin@medconnect.org`
  * **Password**: `admin123`

### Step 3: Run the Application

Start both the backend server and frontend development server:

```bash
# Start backend (Runs on Port 5000)
cd backend
npm run dev

# Start frontend (Runs on Port 5173)
cd ../frontend
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security Features

1. **Role-Based Middlewares**: Express checks JWT headers and ensures endpoints are accessible only to authorized roles (e.g. Admin for analytics/approvals, Patient for bookings).
2. **Double-Booking Checks**: Checks existing active appointments (Pending/Confirmed) matching doctor ID, date, and slot.
3. **Medical Records Privacy**: Clinicians can only view reports for patients who have booked a consultation with them.
4. **BCrypt Hashing**: Passwords are securely hashed before writing to MongoDB.
