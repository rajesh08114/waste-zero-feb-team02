# Waste Zero

Waste Zero is a full-stack platform for volunteers, NGOs, and admins. It now covers authentication, opportunity management, matching, realtime messaging, notifications, and Milestone 4 admin governance tools.

## Milestones
- Milestone 1-2: auth, profiles, opportunity CRUD, role protection
- Milestone 3: match suggestions, chat, notifications, sockets
- Milestone 4: admin overview, user moderation, opportunity moderation, analytics, exports, audit logs

## Roles
- `volunteer`
- `NGO`
- `admin`

Public signup only creates `volunteer` and `NGO` accounts. Admin accounts should be created directly in the database or through a controlled internal workflow.
New accounts can sign in immediately after signup. Email verification is not part of the current auth flow.

## Admin Routes
- `/admin`
- `/admin/users`
- `/admin/opportunities`
- `/admin/reports`
- `/admin/logs`

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

## Documentation
- Backend API and security notes: [backend/README.md](C:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/README.md)
- Frontend routing and UI notes: [frontend/README.md](C:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/frontend/README.md)

## License
MIT. See [LICENSE](C:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/LICENSE).
