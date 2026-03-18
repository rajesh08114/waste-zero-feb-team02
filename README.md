# Waste Zero (Full Stack)

Waste Zero connects volunteers and NGOs for impact opportunities, match suggestions, and real-time messaging.

## Repository
```text
waste-zero-feb-team02/
|- backend/
|- frontend/
`- README.md
```

## Milestone Coverage

### Milestone 1-2
- Auth (register/login/refresh)
- Role-based access (`volunteer`, `NGO`)
- Opportunity CRUD with NGO ownership checks

### Milestone 3
- Matching algorithm and `matches` collection
- Volunteer/NGO matching APIs
- Real-time 1:1 chat (Socket.io + REST)
- Message history and conversation list APIs
- Notification APIs + realtime notification events
- Frontend routes and UI:
  - `/matches`
  - `/messages`
  - `/chat/:userId`

## Quick Start

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## Documentation
- Backend API + socket docs: [backend/README.md](./backend/README.md)
- Frontend routes/state/realtime docs: [frontend/README.md](./frontend/README.md)
