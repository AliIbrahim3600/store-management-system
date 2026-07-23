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

- Node.js >= 20
- PostgreSQL >= 15
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/AliIbrahim3600/store-management-system.git
cd store-management-system

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# Run database migrations
npx prisma migrate dev

# Install frontend dependencies
cd ../frontend
npm install

# Set up frontend environment variables
cp .env.example .env
```

### Development

```bash
# Start backend (from backend/)
npm run dev

# Start frontend (from frontend/)
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`

### Testing

```bash
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
