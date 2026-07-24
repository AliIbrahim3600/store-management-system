<div align="center">
  <h1>Store Management System</h1>
  <p>A full-stack store management application built with modern web technologies.</p>
</div>

## Features

- **Authentication & Authorization** — JWT-based login with role-based access control
- **Store Management** — Create and manage multiple store locations
- **Product Management** — CRUD operations with inventory tracking
- **Employee Management** — Manage staff across stores
- **Inventory Management** — Real-time stock tracking across stores
- **Sales Processing** — Point-of-sale and order management
- **Reporting & Analytics** — Sales reports and performance metrics
- **Real-time Updates** — WebSocket-based live notifications
- **API Documentation** — Swagger/OpenAPI documentation

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| React Router | Client-side routing |
| TanStack Query | Server state & caching |
| Axios | HTTP client |
| Zustand | Client state management |
| React Hook Form + Zod | Form & validation |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| React Hot Toast | Notifications |

### Backend

| Technology | Purpose |
|---|---|
| Express + TypeScript | REST API framework |
| Prisma + PostgreSQL | ORM & database |
| JWT + bcrypt | Authentication & password hashing |
| Zod | Schema validation |
| Helmet + CORS + Compression | Security middleware |
| Multer | File upload handling |
| Nodemailer | Email service |
| Socket.io | WebSocket communication |
| Pino | Structured logging |
| Swagger | API documentation |
| Jest + Supertest | Testing |

## Project Structure

```
store-management-system/
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── app/            # Core app setup (router, store, query client)
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route page components
│   │   ├── features/       # Feature-specific logic & hooks
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Shared custom hooks
│   │   ├── types/          # TypeScript type definitions
│   │   ├── validations/    # Zod schemas
│   │   ├── utils/          # Utility functions
│   │   ├── constants/      # App constants
│   │   └── styles/         # Global styles
│   └── ...
├── backend/                 # Express + TypeScript API
│   ├── prisma/             # Schema & migrations
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # Route definitions
│   │   ├── middlewares/    # Express middlewares
│   │   ├── validators/     # Request validation
│   │   ├── types/          # TypeScript definitions
│   │   ├── sockets/        # WebSocket handlers
│   │   └── docs/           # Swagger documentation
│   └── tests/              # Test files
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **Docker** + **Docker Compose** (for PostgreSQL)
- **npm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AliIbrahim3600/store-management-system.git
cd store-management-system

# 2. Start PostgreSQL via Docker
docker compose up -d

# 3. Install backend dependencies
cd backend
npm install

# 4. Configure environment — .env files are pre-configured for local dev
#    Edit backend/.env to change secrets before going to production

# 5. Generate Prisma Client & apply migrations
npx prisma generate
npx prisma migrate dev

# 6. (Optional) Seed the database with sample data
npx prisma db seed

# 7. Install frontend dependencies
cd ../frontend
npm install

# 8. Configure frontend environment
cp .env.example .env
```

### Development

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (from backend/)
npm run dev

# Terminal 2 — Frontend (from frontend/)
npm run dev
```

| Service     | URL                                |
|-------------|------------------------------------|
| Frontend    | `http://localhost:5173`            |
| Backend API | `http://localhost:3000`            |
| API Docs    | `http://localhost:3000/api-docs`   |
| PostgreSQL  | `localhost:5432`                   |
| Prisma Studio | `npx prisma studio` (from `backend/`) |

### Default Accounts (after seeding)

All seeded accounts use password: `Admin@123`

| Email                | Role        |
|----------------------|-------------|
| `dev@freshmart.com`  | Developer   |
| `owner@freshmart.com`| Owner       |
| `admin@freshmart.com`| Admin       |
| `cashier1@freshmart.com` | Employee |

### Useful Commands

```bash
# Stop PostgreSQL (keeps data)
docker compose stop

# Stop PostgreSQL and delete data volume
docker compose down -v

# Open Prisma Studio (GUI database browser)
cd backend && npx prisma studio

# Reset database (drops all data, re-runs migrations, re-seeds)
cd backend && npx prisma migrate reset

# Backend tests
cd backend
npm test
npm run test:coverage
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | API server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Access token expiry |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry |
| `CORS_ORIGIN` | Allowed CORS origin |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | WebSocket server URL |

## License

MIT
