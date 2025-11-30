# Phase 2 Implementation Plan - Auth & Admin Dashboard

**Goal:** Add Authentication, Role-Based Access Control (RBAC), and a modern Web Dashboard.

---

## 🔐 New Requirements (Auth & RBAC)
1.  **Authentication:** JWT-based login system.
2.  **Roles:**
    *   **Admin:** Can manage users, view ALL history.
    *   **User:** Can view ONLY their own history.
3.  **User Management:** Admin can create new users (hashing passwords).
4.  **Admin Script:** CLI script to create the first super-admin.

---

## 🏗️ Architecture Updates

### 1. Database Schema Updates (MySQL)

**New Table: `users`**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Update Table: `extractions`**
- Add `user_id` (Foreign Key linked to `users.id`)
- Update queries to filter by `user_id` (unless Admin)

### 2. Backend API Updates (`kyc_extractor`)
- **Dependencies:** `passlib[bcrypt]`, `python-jose` (for JWT), `python-multipart`.
- **New Endpoints:**
    *   `POST /auth/login` - Get access token.
    *   `POST /users` - Create new user (Admin only).
    *   `GET /users` - List users (Admin only).
- **Middleware:** `get_current_user` dependency to protect routes.

### 3. Frontend Dashboard (`dashboard`)
- **Tech Stack:** React + Vite + Tailwind CSS.
- **Pages:**
    *   `/login` - Login screen.
    *   `/` - Dashboard (Stats & Recent Activity).
    *   `/upload` - Document upload.
    *   `/history` - Extraction history (Filtered by role).
    *   `/users` - User management (Admin only).

---

## 📅 Implementation Steps

### **Part A: Backend Authentication (Priority)**
- [ ] **Step 1: Auth Setup**
    - Install auth dependencies.
    - Create `users` model and migration.
    - Create `create_admin.py` script.
- [ ] **Step 2: Auth Logic**
    - Implement Password Hashing & JWT Utils.
    - Create Login Endpoint (`/auth/login`).
    - Create User Management Endpoints (`/users`).
- [ ] **Step 3: Protect Endpoints**
    - Update `/extract` to require login & save `user_id`.
    - Update `/history` to filter by user (or show all for Admin).

### **Part B: Frontend Dashboard**
- [ ] **Step 4: Project Init**
    - Initialize React + Vite + Tailwind.
    - Setup Axios interceptors (for JWT).
- [ ] **Step 5: Auth UI**
    - Build Login Page.
    - Build Protected Route wrapper.
- [ ] **Step 6: Core Features**
    - Upload Interface.
    - History Table (Role-aware).
    - User Management UI (Admin only).

---

## ⏱️ Timeline Estimate
- **Part A (Backend Auth):** 4-6 hours
- **Part B (Frontend):** 8-10 hours

**Total:** ~12-16 hours

---

**Ready to start with Part A (Backend Authentication)?**
