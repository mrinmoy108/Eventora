# 🎉 Eventora — Event Management & Professional Hiring Platform

A full-stack web application for managing events, selling tickets, and connecting event organizers with professional service providers (photographers, event managers, etc.).

---

## 👨‍💻 Project Information

| Field | Details |
|---|---|
| **Project Title** | Eventora – Event Management & Professional Hiring Platform |
| **Student 1** | Mrinmoy Kumar Dey — ID: 22CSE028 |
| **Student 2** | Ismail Hossain — ID: 22CSE036 |
| **Session** | 2022–2023 |
| **Department** | Computer Science & Engineering |
| **University** | Gopalganj Science and Technology University (GSTU) |
| **Supervisor** | Dr. Mrinal Kanti Baowaly |
| **Course** | Software Engineering Sessional |

---

## 🚀 Features

- 🎟️ **Multi-tier Ticketing** — General, VIP, and VVIP ticket categories with QR code generation
- 👤 **Role-based Dashboards** — Separate dashboards for Attendees, Organizers, Professionals, and Admins
- 📸 **Professional Marketplace** — Hire photographers, event managers, and other professionals
- 🔐 **JWT Authentication** — Secure login and registration
- 📊 **Admin Panel** — Manage users, events, and platform analytics
- 📱 **Responsive UI** — Modern design with Tailwind CSS v4

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **QR Code:** `qrcode` package

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** MySQL 8+
- **Auth:** JWT + bcryptjs
- **File Upload:** Multer

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

---

### 1. Clone the Repository
```bash
git clone https://github.com/mrinmoy108/Eventora.git
cd Eventora
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/eventora"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
```

Run database migrations and start the server:
```bash
npx prisma migrate dev --name init
npm run dev
```

The backend will run on `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 📂 Project Structure

```
Eventora/
├── frontend/           # Next.js 15 frontend
│   ├── src/
│   │   └── app/        # App Router pages & components
│   └── package.json
├── backend/            # Node.js + Express backend
│   ├── prisma/
│   │   └── schema.prisma   # 31 database models
│   ├── src/            # Route handlers & middleware
│   └── package.json
└── README.md
```

---

## 🌐 API Endpoints

The backend exposes REST API endpoints at `http://localhost:5000/api/`:

- `/api/auth` — Register, login, logout
- `/api/events` — CRUD for events
- `/api/tickets` — Ticket purchase & QR generation
- `/api/professionals` — Professional profiles & hiring
- `/api/admin` — Admin management routes

---

## 📄 License

This project is developed for academic purposes at Gopalganj Science and Technology University.
