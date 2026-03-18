# Waste Zero Backend

Backend API for auth, opportunities, matching, messaging, notifications, and real-time chat.

## Tech Stack
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth
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

Default server URL: `http://localhost:3000`

## Environment Variables
```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

## Milestone 3 Data Models

### `matches`
- `volunteer_id`, `ngo_id`, `opportunity_id`
- `skill_overlap`, `skill_score`, `location_score`, `score`
- `is_active`, `last_evaluated_at`
- Indexes:
  - unique `(volunteer_id, opportunity_id)`
  - `(opportunity_id, is_active, score)`

### `messages`
- `sender_id`, `receiver_id`, `content`, `timestamp`
- `conversation_id` (sorted user-id pair)
- Indexes:
  - `(sender_id, receiver_id, timestamp)`
  - `(conversation_id, timestamp)`

### `notifications`
- `user_id`, `type` (`newMatch`, `newMessage`)
- `title`, `message`, `metadata`, `is_read`
- Index: `(user_id, is_read, createdAt)`

## Matching Logic
- Skill overlap between volunteer skills and `required_skills`
- Location proximity scoring (exact/nearby text match)
- Score-based eligibility with minimum threshold
- Stored in `matches` collection and ranked by score

## API Base
`http://localhost:3000/api/v1`

## Endpoint Summary

### Auth + User
- `POST /register`
- `POST /login`
- `POST /refresh-token`
- `GET /verify-email`
- `GET /me`
- `PUT /me`
- `PUT /me/password`
- `POST /me/verify-email`

### Opportunities
- `POST /opportunities` (NGO)
- `GET /opportunities`
- `GET /opportunities/:id`
- `PUT /opportunities/:id` (owner NGO)
- `DELETE /opportunities/:id` (owner NGO)

### Matches
- `GET /matches` (volunteer): ranked matched opportunities
- `GET /matches/:opportunityId` (NGO owner): matched volunteers

### Messages
- `POST /messages`
  - body: `{ "receiver_id": "...", "content": "..." }`
  - validates matched user pair
- `GET /messages`
  - conversation list for current user
- `GET /messages/:userId`
  - history with one user, sorted by timestamp
  - query: `limit`, `before` (optional)

### Notifications
- `GET /notifications?limit=20`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

## Socket.io
- Connection auth: JWT in `auth.token` or `Authorization` header
- User room: `user:<userId>`
- Incoming event:
  - `sendMessage` payload: `{ receiver_id, content }`
- Outgoing events:
  - `newMessage`
  - `newNotification`
  - `newMatch` (via notification event type)

## Security and Validation
- Role + ownership checks enforced on protected routes
- Chat only allowed between matched NGO-volunteer pairs
- Socket sender spoof prevention (sender from JWT only)
- Message rate limit per sender
- Input validation for IDs and payloads

## Notes
- Match notifications are emitted when a user transitions into an active match.
- `npm test` is still a placeholder script.
