# Waste Zero Frontend

React + Vite client for volunteers, NGOs, and admins.

## Stack
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

## Environment
```env
VITE_APP_ENV=development
VITE_APP_NAME=Waste Zero
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
VITE_ENABLE_DEBUG_LOGS=false
```

## Route Coverage

### Shared
- `/profile`
- `/opportunities`
- `/opportunities/:id`

### Volunteer and NGO
- `/matches`
- `/messages`
- `/chat/:userId`

### NGO
- `/dashboard/ngo`
- `/dashboard/ngo/opportunities`
- `/opportunities/create`
- `/opportunities/edit/:id`

### Volunteer
- `/dashboard/volunteer`

### Admin
- `/admin`
- `/admin/users`
- `/admin/opportunities`
- `/admin/reports`
- `/admin/logs`

## Milestone 4 UI
- Admin overview cards and recent activity feed
- User management table with search, role/status filters, pagination, profile modal
- Opportunity moderation screen with filters, detail modal, remove action
- Reports dashboard with date range filter, trend charts, participation table, CSV/PDF export
- Admin audit log page with action filter and pagination
- Admin-specific sidebar navigation and route protection

## Shared Realtime Features
- Global notification panel in the dashboard header
- Match and message toasts via socket bridge
- Chat UI with realtime delivery and REST fallback

## Validation
- `npm run lint`
- `npm run build`

## Cleanup Notes
- Removed the unused `src/components/layout/Header.jsx`
- Consolidated dashboard redirect logic into `src/utils/dashboardRoute.js`
- Simplified dashboard sidebar account section to active links only

## License
MIT. See [LICENSE](C:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/LICENSE).
