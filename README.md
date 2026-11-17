# AICTE Portal — Full-Stack Website Clone with Student Dashboard & Admin Panel

> **Academic Project Disclaimer:** This application is an independent academic demonstration project inspired by the official All India Council for Technical Education (AICTE) Approval Process 2026–2027 portal (`https://www.aicte.gov.in/`). It is **not** an official Government of India or AICTE portal and is created strictly for educational and demonstration purposes.

---

## Key Features

### 1. Public Portal (AICTE Reference Design)
- **Top Utility & Accessibility Bar**: Live system clock, Screen Reader Access modal/focus mode, Font Size controls (`A-`, `A`, `A+`), High Contrast toggle, language toggle badge, and Web Portal Login menu.
- **Official-Style Header & Navigation**: Bilingual Hindi/English header (`अखिल भारतीय तकनीकी शिक्षा परिषद` / `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION`), custom SVG emblem, and 11-item dark-blue navigation bar (`Home`, `About Us`, `NewsRoom`, `Bureaus/Cell`, `Initiatives`, `Schemes`, `Education`, `Statistics`, `Opportunities`, `Bulletins`, `Search`).
- **Sky & Clouds Approval Process 2026–2027 Section**: Matches the AICTE Approval Process 2026–2027 layout with gold-bordered two-column panels and rounded golden-orange pill buttons.
- **Real Dynamic PDF Downloads**: Generates downloadable PDF documents via `pdfkit` for Public Notice, Corrigendum/Addendum, APH Handbook Summary, Unapproved Institutions Caution List, and Revised Academic Calendar 2026–27.
- **Interactive Modules**: Searchable Approved & Unapproved Institutions Directory, Global Portal Search, FAQs modal, Technical Helpline modal, Live VC Information Facilitation Center modal, and Centralized Support Query Submission.

### 2. Student Authentication & Dashboard
- **Student Registration (`/register`)**: Full field validation, unique email & enrollment enforcement, `bcryptjs` password hashing, and welcome notification.
- **Student Login (`/login`)**: Supports Email or Enrollment Number, show/hide password, Remember Me (`localStorage` vs `sessionStorage`), and Forgot/Reset Password flow (`/forgot-password`, `/reset-password`).
- **Student Dashboard (`/student/dashboard`)**:
  - Summary metrics (Total, Pending, Approved, Rejected Applications) & academic profile snapshot
  - **My Profile**: Edit permitted details & upload profile photo (JPG/PNG)
  - **New Application (5-Step Wizard)**: Personal Details, Academic Details, Application Details, Document Upload (PDF/JPG/PNG up to 5 MB), Review & Submit — supports **Save as Draft**, **Edit Draft**, and **Submit** (submitted apps lock against edits)
  - **Upload & Manage Documents**: Preview PDFs/images inline or download securely
  - **Application Status Tracking**: Dynamic 4-stage vertical progress timeline (`Application Created` -> `Submitted` -> `Under Administrative Review` -> `Approved / Rejected`) with admin remarks
  - **Notifications & Help/Support**: Unread badge count, mark read/all read, support tickets, and Change Password

### 3. Admin Control Panel (`/admin/login` & `/admin/dashboard`)
- **Analytics Overview**: Stat cards & interactive **Recharts** visualizations (monthly application bar charts & status distribution pie chart)
- **Manage Students**: Search by name/enrollment, filter by college, inspect student profiles, activate/deactivate accounts
- **Manage Applications**: Separate views for All, Pending, Approved, and Rejected applications; inspect documents; add remarks; update status (`Under Review`, `Approved`, `Rejected`) with automatic student notifications
- **Manage Notifications & Announcements**: Publish/edit/delete announcements that appear on the public homepage and notify active students; reply to helpdesk tickets
- **Reports & Settings**: Export filtered/all applications as **CSV**, and configure academic portal settings

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, React Hook Form, React Hot Toast, Lucide React, Recharts
- **Backend**: Node.js, Express.js, REST API, Multer, PDFKit, Helmet, Express Rate Limit, Morgan
- **Authentication & Security**: JWT (`jsonwebtoken`), `bcryptjs`, SHA-256 hashed reset tokens, Role-Based Access Control (`student` / `admin`), strict student data & document ownership isolation
- **Database**: **MongoDB + Mongoose** (`MONGODB_URI` supported for local `mongod` or MongoDB Atlas) with an automatic **persistent disk-backed local datastore (`@seald-io/nedb` in `backend/data/*.db`)** when no external MongoDB server is running

---

## Project Structure

```text
aicte/
├── backend/
│   ├── config/          # Environment & DB connection (Mongoose + NeDB fallback)
│   ├── controllers/     # Route handlers (auth, student, application, admin, public, notification)
│   ├── data/            # Persistent disk DB files (auto-created in local fallback mode)
│   ├── middleware/      # JWT auth, role guard, multer uploads, rate limiters, error handler
│   ├── models/          # Mongoose schemas + unified DB adapter
│   ├── routes/          # Express REST API routes
│   ├── services/        # Token service, PDFKit generator, demo data seeder
│   ├── uploads/         # Uploaded student documents & avatars
│   ├── utils/           # Validators, CSV exporter, seed runner
│   ├── .env.example
│   ├── app.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Header, Navbar, Footer, Modals, Badges, ProtectedRoute
│   │   ├── context/     # AuthContext, AccessibilityContext
│   │   ├── layouts/     # PublicLayout, DashboardLayout
│   │   ├── pages/       # Public, Auth, Student Dashboard, Admin Dashboard pages
│   │   ├── routes/      # AppRoutes
│   │   ├── services/    # Axios API clients
│   │   └── utils/       # Constants & formatters
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json
└── README.md
```

---

## Installation & Setup Instructions

### 1. Prerequisites
- Node.js `v18+` (tested on `v20.17.0`) and npm `v9+`
- Optional: MongoDB local instance or MongoDB Atlas URI (if left blank in `backend/.env`, the server automatically persists all collections to disk in `backend/data/`)

### 2. Install Dependencies
From the project root (`c:\Users\harod\Music\aicte`):
```bash
npm run install:all
```
Or install separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables
Copy the example env files if needed:
- `backend/.env` (see `backend/.env.example`):
  ```env
  PORT=5000
  NODE_ENV=development
  CLIENT_URL=http://localhost:5173
  MONGODB_URI=
  JWT_SECRET=your_super_secret_jwt_key
  JWT_EXPIRES_IN=7d
  UPLOAD_MAX_SIZE_MB=5
  DEMO_SEED=true
  ```
- `frontend/.env` (see `frontend/.env.example`):
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

### 4. Seed Demo Data (Optional — runs automatically on server startup)
```bash
npm run seed
```

### 5. Run Backend and Frontend
Open two terminals from the project root:

**Terminal 1 — Backend API (`http://localhost:5000`):**
```bash
npm run dev:backend
```

**Terminal 2 — Frontend UI (`http://localhost:5173`):**
```bash
npm run dev:frontend
```

---

## Demo Login Credentials (Academic Testing Only)

> **Security Note:** Demo accounts are seeded only when `DEMO_SEED=true`. Change or disable demo seeding and rotate `JWT_SECRET` before deploying to any public production environment.

| Role | Login Portal | Email / Enrollment ID | Password |
| :--- | :--- | :--- | :--- |
| **Student (Primary Demo)** | `/login` | `student@aicte-demo.edu` (or `AICTE2026CS1042`) | `Student@123` |
| **Student (Secondary)** | `/login` | `priya.verma@aicte-demo.edu` (or `AICTE2026EC2081`) | `Student@123` |
| **Administrator** | `/admin/login` | `admin@aicte-demo.edu` | `Admin@123` |

---

## REST API Documentation

### Public Endpoints (`/api/public`)
- `GET /api/public/homepage` — Active announcements, portal settings, and FAQs
- `GET /api/public/documents/:slug/download` — Dynamically generated sample PDF downloads (`public-notice-2026-27`, `corrigendum-addendum-2026-27`, `aph-handbook-2026-27`, `unapproved-institutions-list`, `revised-academic-calendar-2026-27`)
- `GET /api/public/institutions?type=approved|unapproved&search=&state=` — Search institutions directory
- `GET /api/public/search?q=` — Global portal search
- `POST /api/public/support-query` — Submit public centralized support ticket

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Login (`identifier`, `password`, optional `portalType`)
- `GET /api/auth/me` — Get current authenticated user (JWT protected)
- `POST /api/auth/forgot-password` — Generate password reset token
- `POST /api/auth/reset-password` — Reset password using token
- `PUT /api/auth/change-password` — Change password (JWT protected)

### Student Endpoints (`/api/student` & `/api/applications` & `/api/notifications`)
- `GET /api/student/dashboard` — Dashboard stats & recent applications
- `GET /api/student/profile` / `PUT /api/student/profile` — View/edit permitted profile details
- `POST /api/student/profile/photo` — Upload avatar image (`multipart/form-data`, `photo`)
- `GET /api/student/support` / `POST /api/student/support` — Student support tickets
- `GET /api/applications/my` — List logged-in student's applications
- `POST /api/applications` — Create application (Draft or Submitted)
- `PUT /api/applications/:id` — Edit Draft application
- `POST /api/applications/:id/submit` — Submit Draft application
- `DELETE /api/applications/:id` — Delete Draft application
- `POST /api/applications/:id/documents` — Upload PDF/JPG/PNG document (`file`, `docType`)
- `GET /api/applications/documents/my` — List student's uploaded documents
- `GET /api/applications/:id/documents/:filename` — Protected preview/download (owner or admin only)
- `GET /api/notifications` / `PUT /api/notifications/:id/read` / `PUT /api/notifications/read-all`

### Admin Endpoints (`/api/admin`, role `admin` required)
- `GET /api/admin/dashboard` — Statistics, status breakdown, monthly trends
- `GET /api/admin/students` / `GET /api/admin/students/:id` / `PATCH /api/admin/students/:id/status`
- `GET /api/admin/applications` / `PATCH /api/admin/applications/:id/status`
- `GET /api/admin/reports/export-csv` — Download CSV report
- `GET /api/admin/announcements` / `POST /api/admin/announcements` / `PUT /api/admin/announcements/:id` / `DELETE /api/admin/announcements/:id`
- `GET /api/admin/settings` / `PUT /api/admin/settings`
- `GET /api/admin/support` / `PATCH /api/admin/support/:id`

