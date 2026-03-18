# Waste Zero Frontend

React + Vite client for auth, opportunities, matching, chat, and realtime notifications.

## Tech Stack
- React 19
- React Router DOM 7
- Zustand
- Axios
- Socket.io client
- Tailwind CSS 4

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

Default URL: `http://localhost:5173`

## Environment Variables
```env
VITE_APP_ENV=development
VITE_APP_NAME=Waste Zero
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_ENABLE_DEBUG_LOGS=false
```

## Milestone 3 Routes
- `/matches`
- `/messages`
- `/chat/:userId`
- `/opportunities/:id`

## Feature Coverage

### Matching UI
- Volunteer dashboard now includes `Recommended Opportunities`
- Dedicated `/matches` page:
  - Volunteer view: ranked opportunity recommendations
  - NGO view: volunteers matched per opportunity

### Messaging UI
- `/messages`: conversation list
- `/chat/:userId`: one-to-one chat
  - Sender/receiver bubble styling
  - timestamps
  - auto-scroll
  - socket + REST fallback send

### Realtime Integration
- Global `RealtimeBridge` connects socket after auth
- Listens for:
  - `newMessage`
  - `newNotification`
- Shows toast alerts
- Updates notification state live

### Notifications
- Notification badge in dashboard header
- Notification panel with read/unread state
- Mark single notification or mark all read
- API + websocket hybrid refresh flow

## API Modules Added
- `src/api/matchApi.js`
- `src/api/messageApi.js`
- `src/api/notificationApi.js`

## Realtime Module Added
- `src/services/socketClient.js`

## State Updates
- Added notification slice with:
  - `fetchNotifications`
  - `prependNotification`
  - `markNotificationRead`
  - `markAllNotificationsRead`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Validation Status
- `npm run lint`: passing
- `npm run build`: passing
