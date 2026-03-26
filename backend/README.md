# Waste Zero Backend

Express + MongoDB API for auth, opportunities, matching, messaging, notifications, and admin governance.

## Stack
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT
- Socket.io

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

PowerShell:
```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

## Environment
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
PORT=3000
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

## Roles and Status
- Roles: `volunteer`, `NGO`, `admin`
- User status: `active`, `suspended`
- Suspended users cannot login, refresh tokens, call protected APIs, or open sockets
- Public signup is limited to `volunteer` and `NGO`

## Core API Base
`http://localhost:3000/api/v1`

## Main Routes

### Auth and Profile
- `POST /register`
- `POST /login`
- `POST /refresh-token`
- `GET /verify-email`
- `GET /me`
- `PUT /me`
- `PUT /me/password`
- `POST /me/verify-email`

### Opportunities
- `POST /opportunities`
- `GET /opportunities`
- `GET /opportunities/:id`
- `PUT /opportunities/:id`
- `DELETE /opportunities/:id`

### Matches
- `GET /matches`
- `GET /matches/:opportunityId`

### Messages
- `GET /messages`
- `POST /messages`
- `GET /messages/:userId`

### Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

### Admin
- `GET /admin/overview`
- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `GET /admin/opportunities`
- `DELETE /admin/opportunities/:id`
- `GET /admin/reports`
- `GET /admin/logs`

## Milestone 4 Models

### `users`
- Added `role: admin`
- Added `status: active | suspended`
- Index: `(role, status)`

### `admin_logs`
- `action`
- `admin_id`
- `target_user_id`
- `target_opportunity_id`
- `metadata`
- timestamp via `createdAt`
- Index: `createdAt`

## Admin Features
- Admin-only RBAC on all `/admin/*` routes
- Overview counts for users and opportunities
- User search, filters, pagination, suspend/activate actions
- Opportunity moderation with filters and admin override delete
- Reports with date range filters
- CSV and PDF report export from `GET /admin/reports?format=csv|pdf`
- Audit log feed from `GET /admin/logs`

## Security Notes
- Admin action rate limiting is applied to sensitive admin mutations and report exports
- Self-suspension is blocked
- No bulk delete endpoints are exposed
- Chat remains restricted to matched NGO-volunteer pairs

## Socket Events
- Client emits: `sendMessage`
- Server emits: `newMessage`, `newNotification`, `newMatch`

## Validation
- `node --check backend/server.js`
- `node --check backend/controllers/admin.controller.js`
- `node --check backend/services/admin.service.js`

## License
MIT. See [LICENSE](C:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/LICENSE).
