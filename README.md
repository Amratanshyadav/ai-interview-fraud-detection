# AI Interview Fraud Detection Platform (IntelliHire Shield)

An industrial-grade, secure, and patent-ready AI-powered online interview monitoring and fraud detection platform. It implements low-latency client-side facial/eye mesh calculations combined with server-side multi-agent risk scoring to track candidate authenticity and generate secure hiring recommendations.

---

## Technical Architecture

```
                                  +-----------------------+
                                  |    Next.js Client     |
                                  |  (WebAssembly / WASM) |
                                  +-----------+-----------+
                                              |
                                              | WebRTC / WebSocket Event Streams
                                              v
                                  +-----------+-----------+
                                  |    Socket.IO Server   |
                                  +-----------+-----------+
                                              |
                                              v
                              +---------------+---------------+
                              |     AI Agent Orchestrator     |
                              +---------------+---------------+
                                              |
      +----------------------+----------------+----------------------+----------------------+
      |                      |                                       |                      |
      v                      v                                       v                      v
+-----+------+         +-----+-----+                           +-----+-----+          +-----+------+
| Monitoring |         | Audio/Voice|                           | Risk Score|          | AI Reports |
|   Agent    |         |   Agent   |                           |   Agent   |          |   Agent    |
+------------+         +-----------+                           +-----------+          +------------+
```

### Core Innovations & Patent Ideas
1. **AI Behavioral Fingerprinting**: Leverages client-side landmarks mapping (Yaw/Pitch rotational gazes) to compose spatial-temporal signatures for each candidate.
2. **Adaptive Fraud Intelligence**: Uses rolling sliding windows on Socket event packages to auto-calibrate threshold grades, reducing false flags.
3. **Multi-Layer Fraud Confidence scoring (MLFC)**: Weighs browser blurs, WASM meshes, and background speech anomalies into a single trust metric.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15+ & React 19+ (TypeScript)
- **Styling**: Tailwind CSS & Glassmorphism design system
- **State & Sync**: Zustand (Lightweight store) & Axios with auto-JWT interceptors
- **Visuals**: Framer Motion & Lucide Icons

### Backend
- **Core**: Node.js & Express.ts
- **Databases**: MongoDB Atlas with Mongoose schema modeling
- **Real-Time Layer**: Socket.IO authenticated channel management
- **Middlewares**: Helmet security shields, Rate limit filters, Compression, Winston logger

---

## File Structure

```
/apps
  /backend
    /src
      /config         # Database and Winston log configurations
      /models         # User, Interview, FraudEvent, ChatMessage, AIReport Mongoose Schemas
      /controllers    # Auth, Interview sessions, Event logs, Chat and PDF managers
      /middlewares    # RBAC permissions, limits, error handlers
      /websocket      # Sockets connection streams
      /agents         # Multi-Agent scoring engines
  /frontend
    /src
      /app            # Routing pages (Landing, Login, Dashboard, Interview Room)
      /components     # Custom Glassmorphic layouts
      /store          # Zustand state management
      /services       # Axios REST services
      /hooks          # useSocket custom listener hooks
```

---

## Installation & Setup

### 1. Prerequisites
- [Node.js v20+](https://nodejs.org/)
- [MongoDB Local](https://www.mongodb.com/try/download/community) or [MongoDB Atlas URI](https://www.mongodb.com/cloud/atlas)

### 2. Environment Configurations

#### Backend Setup (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ai_interview_fraud_detection
JWT_SECRET=your_jwt_access_secret_should_be_long_and_complex
JWT_REFRESH_SECRET=your_jwt_refresh_secret_should_be_long_and_complex
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Setup (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Local Startup

1. **Start the Backend server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the Frontend development server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser to [http://localhost:3000](http://localhost:3000).

---

## Running with Docker Compose

To boot the entire production MERN pipeline (Database, Sockets, and Interfaces) automatically:

```bash
docker-compose up --build
```
The client dashboard will be exposed on port `3000`, the Express endpoints on port `5000`, and MongoDB on port `27017`.

---

## API Documentation

### Authentication (`/api/v1/auth`)
- `POST /register`: Candidate or Recruiter signup.
- `POST /login`: Account verification, locks on brute-force attempts.
- `POST /logout`: Clears authorization tokens.
- `GET /profile`: Obtains the authenticated profile.

### Interviews (`/api/v1/interviews`)
- `POST /`: Schedule an interview.
- `GET /recruiter`: Retrieves scheduled sessions for recruiters.
- `GET /candidate`: Retrieves scheduled sessions for candidates.
- `POST /join`: Joins room via key access.

### Anomaly Logging & Chat (`/api/v1/fraud`, `/api/v1/chat`)
- `POST /fraud/event`: Ingests suspicious behavior metrics.
- `GET /fraud/:interviewId/events`: Chronological timeline retrieval.
- `GET /chat/:interviewId/history`: Chat history listing.

---

## Security Implementation
- **Helmet**: Adds crucial browser security header protections.
- **Brute Force Protection**: Suspends users for 2 hours after 5 failed login attempts.
- **Secure JWT Tokens**: Implements cookie tracking and rotation validation.
- **Sanitizers**: Express validator checks input fields against MongoDB injection vectors.
