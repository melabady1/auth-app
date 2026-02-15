# Full Stack Authentication App

A production-ready authentication system with modern security practices, featuring **refresh token rotation**, **httpOnly cookies**, **auto-token refresh**, and comprehensive logging.

---

## 🎯 Project Overview

This is a complete full-stack authentication solution built for the modern web. It demonstrates industry-standard security practices and clean architecture patterns.

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Hook Form, Zod |
| **Backend** | NestJS 11, MongoDB, Passport.js, JWT, Winston, Swagger |
| **Security** | bcrypt (12 rounds), JWT rotation, httpOnly cookies, rate limiting |

---

## ✨ Key Features

### Security Features
- ✅ **Refresh Token Rotation** – Old tokens invalidated on every refresh
- ✅ **Auto-Breach Detection** – Token reuse triggers full account logout
- ✅ **httpOnly Cookies** – XSS protection for refresh tokens
- ✅ **Auto-Token Refresh** – Seamless 5-minute access token renewal
- ✅ **Device Fingerprinting** – Tracks user agent and IP for suspicious activity
- ✅ **Rate Limiting** – 20 requests per 60 seconds per IP
- ✅ **Password Hashing** – bcrypt with 12 salt rounds
- ✅ **Input Validation** – class-validator on backend, Zod on frontend
- ✅ **CORS Protection** – Configurable allowed origins

### Developer Experience
- 📚 **Swagger/OpenAPI Documentation** – Interactive API testing
- 🪵 **Structured Logging** – Winston with file rotation
- 🧪 **Unit & E2E Tests** – Jest test suites included
- 🎨 **Modern UI** – Dark theme with purple accents, smooth animations
- 📱 **Responsive Design** – Mobile-first approach

### Production Ready
- 🔄 **Global Exception Handling** – No stack traces leaked
- 📊 **Request/Response Logging** – Complete audit trail
- 🚦 **Health Monitoring** – Track all API interactions
- 🔐 **Multi-Device Logout** – Users can revoke sessions
- ⚡ **Performance Optimized** – Minimal DB queries with smart caching

---

## 🏗️ Project Structure

```
.
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/           # Axios client with auto-refresh
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Zod schemas & utilities
│   │   ├── pages/         # Route components
│   │   └── types/         # TypeScript interfaces
│   └── package.json
│
├── backend/           # NestJS + MongoDB
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   │   ├── dto/           # Request/response DTOs
│   │   │   ├── schemas/       # RefreshToken schema
│   │   │   ├── strategies/    # Passport JWT & Local
│   │   │   └── tests/         # Unit tests
│   │   ├── users/         # User management
│   │   ├── common/        # Shared utilities
│   │   │   ├── decorators/    # @CurrentUser
│   │   │   ├── filters/       # Exception handling
│   │   │   ├── guards/        # JWT guard
│   │   │   ├── interceptors/  # Logging
│   │   │   └── logger/        # Winston config
│   │   └── main.ts        # Application bootstrap
│   ├── test/        # e2e test
│   └── package.json
│
└── README.md          # readme file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/melabady1/auth-app.git
cd auth-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=1d
CORS_ORIGINS=http://localhost:5173
```

> ⚠️ **Security:** Generate a strong JWT_SECRET (minimum 32 characters)

### 3. Configure Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
API_URL=http://localhost:3000
```

### 4. Start Development Servers

**Terminal 1 – Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Start Production Servers

**Terminal 1 – Backend:**
```bash
cd backend
npm run build && npm run start:prod
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run build && npm run preview -- --port 5173
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api/docs

---

## 🔐 Authentication Flow

### Sign Up Flow
```
User fills form → Frontend validates (Zod)
                ↓
Frontend sends: POST /auth/signup
                ↓
Backend validates (class-validator) → Checks email uniqueness
                ↓
Password hashed (bcrypt) → User saved to MongoDB
                ↓
Access token generated (5 min) + Refresh token (1 days)
                ↓
Refresh token saved to DB + httpOnly cookie set
                ↓
Access token returned → Frontend stores in localStorage
                ↓
User redirected to /app
```

### Sign In Flow
```
User submits credentials → Passport Local Strategy validates
                         ↓
Password verified (bcrypt) → Tokens generated
                         ↓
Refresh token in httpOnly cookie + Access token returned
                         ↓
User authenticated → Redirected to /app
```

### Auto-Refresh Flow (Transparent to User)
```
User makes request → Access token expired (after 5 min)
                   ↓
Backend returns 401 → Axios interceptor catches it
                   ↓
Frontend: POST /auth/refresh (httpOnly cookie sent automatically)
                   ↓
Backend: Validates refresh token → Checks device fingerprint
                   ↓
Old refresh token deleted (rotation) → New tokens generated
                   ↓
New access token returned → Original request retried
                   ↓
User experiences no interruption
```

### Logout Flow
```
User clicks logout → Frontend: POST /auth/logout
                   ↓
Backend deletes refresh token from DB
                   ↓
httpOnly cookie cleared → localStorage cleared
                   ↓
User redirected to /signin
```

---

## 🛡️ Security Architecture

### Token Strategy

| Token Type | Lifetime | Storage | Purpose |
|------------|----------|---------|---------|
| **Access Token** | 5 minutes | localStorage | API authentication |
| **Refresh Token** | 1 days | httpOnly cookie + MongoDB | Generate new access tokens |

### Why This Design?

1. **Short access token (5 min)**
   - Limits damage if stolen
   - Forces frequent refresh
   - Stateless (no DB lookup)

2. **Refresh token in httpOnly cookie**
   - Can't be accessed by JavaScript (XSS protection)
   - Auto-sent with requests (no manual handling)
   - Can be revoked server-side (true logout)

3. **Refresh token rotation**
   - Every use generates new token
   - Old token immediately invalidated
   - Detects token theft (reuse = attack)

### Attack Scenarios & Protections

#### Scenario 1: XSS Attack (Malicious JavaScript)
```
❌ Attacker injects: <script>steal(localStorage.accessToken)</script>
✅ Protection: Access token only valid for 5 minutes
✅ Protection: Refresh token is httpOnly (can't be read by JS)
```

#### Scenario 2: Stolen Refresh Token
```
❌ Attacker gets refresh token from network sniffing (no HTTPS)
✅ Protection: HTTPS enforced in production (secure cookie)
✅ Protection: Device fingerprint mismatch triggers alert
✅ Protection: User can revoke all sessions via /logout-all
```

#### Scenario 3: Token Reuse (Breach Detection)
```
1. User refreshes token → Gets new token A
2. Attacker uses old token → Fails (already used)
3. System detects reuse → Revokes ALL user tokens
4. Both attacker and user logged out
5. User forced to re-authenticate
```

---

## 📊 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/signin` | Login with credentials |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Logout (invalidate refresh token) |

### Protected Endpoints (Requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/profile` | Get current user info |
| `POST` | `/auth/logout-all` | Logout from all devices |

**Full API documentation:** http://localhost:3000/api/docs

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Run tests (not implemented yet)
npm run test
```

---

## 🏗️ Production Deployment

### Backend Checklist

- [ ] Set strong `JWT_SECRET` (min 32 chars, random)
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Enable HTTPS (TLS/SSL certificate)
- [ ] Set `secure: true` for cookies (enforces HTTPS)
- [ ] Configure proper `CORS_ORIGINS`
- [ ] Set up log rotation (Winston file transports)
- [ ] Enable MongoDB backups
- [ ] Set up monitoring (e.g., Sentry, DataDog)
- [ ] Use environment variables (never commit `.env`)

### Frontend Checklist

- [ ] Set production `API_URL`
- [ ] Build optimized bundle: `npm run build`
- [ ] Deploy to CDN (Vercel, Netlify, Cloudflare Pages)
- [ ] Enable HTTPS
- [ ] Set up error tracking (Sentry)
- [ ] Configure CSP headers
- [ ] Test cross-browser compatibility

---

## 📈 Performance Considerations

### Backend Optimizations
- MongoDB indexes on `email` (unique) and `refreshToken.token`
- TTL index on `refreshToken.expiresAt` (auto-cleanup)
- Connection pooling for MongoDB
- Rate limiting prevents DDoS
- Stateless JWT = no DB lookup per request

### Frontend Optimizations
- Code splitting with React Router
- Lazy loading of routes
- Vite's fast HMR in development
- Optimized production builds
- Tailwind CSS purging unused styles

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
# Local: mongod --dbpath /path/to/data
# Or use MongoDB Atlas connection string
```

### "CORS error in browser"
```bash
# Backend .env: Add frontend URL to CORS_ORIGINS
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### "401 Unauthorized on protected routes"
```bash
# Check access token in localStorage
# Check token expiry (5 min)
# Check backend JWT_SECRET matches
```

### "Refresh token not working"
```bash
# Ensure withCredentials: true in axios
# Check cookie is being set (inspect Network tab)
# Verify backend cookie-parser is installed
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🌟 Project Strengths

### Security Excellence
- **Industry-standard token rotation** prevents token theft
- **Automatic breach detection** through token reuse monitoring
- **Multi-layer defense** (httpOnly cookies + short expiry + fingerprinting)
- **Zero trust architecture** – every request validated

### Developer Experience
- **Type-safe** end-to-end (TypeScript everywhere)
- **Self-documenting API** with Swagger/OpenAPI
- **Comprehensive logging** for debugging and auditing
- **Clean architecture** with separation of concerns
- **Easy to extend** – modular structure

### Production Readiness
- **Scalable** – stateless JWT authentication
- **Resilient** – graceful error handling throughout
- **Observable** – structured logging with Winston
- **Performant** – optimized DB queries and indexes
- **Testable** – unit and E2E test examples included

### Modern Stack
- Latest stable versions of all dependencies
- React 19 with modern hooks patterns
- NestJS 11 with advanced decorators
- Tailwind CSS v4 with design tokens
- MongoDB with Mongoose ODM

---

