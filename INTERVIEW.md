# Waste Zero - Technical Interview & Project Overview Guide

This document provides a comprehensive breakdown of the **Waste Zero** platform's architecture, implementation logic, key features, and an interview Q&A section containing 10 technical questions and detailed answers.

---

## 1. Project Explanation

**Waste Zero** is a full-stack platform designed to bridge the gap between volunteers, Non-Governmental Organizations (NGOs), and platform administrators. The primary mission is to facilitate waste management initiatives, cleanup campaigns, e-waste recovery, and recycling operations through community coordination.

### User Roles
- **Volunteers**: Browse matched opportunities, update profiles with waste management skills, communicate with NGOs, and track cleanup actions.
- **NGOs**: Post, update, and manage volunteering opportunities, view automated matching scores for volunteers, and chat in real-time.
- **Admins**: Monitor platform metrics, moderate opportunities, suspend or activate user accounts, check audit logs, and export date-filtered reports.

---

## 2. Technical Stack & Architecture

Waste Zero follows a decoupled client-server architecture:

### Backend
- **Node.js & Express 5**: Powers the REST APIs and HTTP routing.
- **MongoDB & Mongoose**: Used as the database layer. Mongoose schemas model the entities with custom validators, hooks, and indexes.
- **Socket.io**: Handles low-latency, real-time message delivery and instant push notifications.
- **JWT (Json Web Tokens)**: Used for stateless session management with access/refresh token rotation.

### Frontend
- **React 19 & Vite**: Provides a fast and interactive user interface.
- **Zustand**: Manages global client-side state (auth, user profiles, theme toggles, notifications).
- **Tailwind CSS 4**: Used for UI styling, dark/light theme support, and premium glassmorphism accents.
- **Axios**: Configured with request/response interceptors to attach bearer tokens and handle automatic token refreshes upon 401 errors.

---

## 3. Core Logic & Implementation Details

### A. The Matching Algorithm
The matching logic automatically evaluates how well a volunteer fits an opportunity based on two criteria:
1. **Skills Matching (70% Weight)**: 
   - We normalize both the volunteer's skills and the opportunity's required skills.
   - Skill Overlap Ratio = `(Overlapping Skills) / (Total Required Skills)`.
   - Skill Score = `Round(Skill Overlap Ratio * 70)`.
2. **Location Matching (30% Weight)**:
   - If the volunteer's location matches the opportunity's location exactly, they receive `30 points`.
   - If one location is a substring of another, they receive `15 points`.
   - Otherwise, `0 points`.

- **Eligibility Threshold**: A match is considered valid (`is_active: true`) only if the combined score is **greater than or equal to 40**, and there is **at least one overlapping skill**.

### B. Real-Time Socket Connection & Messaging
- Sockets are authenticated via JWT in a custom handshake middleware.
- Upon connecting, a socket joins a room named after the user's ID (`user:<userId>`).
- Real-time messages are sent using a hybrid fallback: if Sockets are disconnected, the client falls back to REST API POST calls.
- Message rate-limiting restricts users to a maximum of 30 messages per minute in memory to prevent abuse.

### C. Admin Governance & Suspension Sync
- When an Admin suspends a user, the system:
  1. Updates the user status to `suspended`.
  2. Immediately sets all associated matches to `is_active: false`.
  3. Re-evaluates matches dynamically if the status is switched back to `active`.
- Access and refresh tokens check the status dynamically to reject suspended sessions instantly.

---

## 4. 10 Assumed Interview Questions & Answers

### Q1: How does the matching system score volunteers against opportunities, and where is this logic executed?
**Answer:** The matching system is written in JavaScript on the backend inside [match.service.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/services/match.service.js#L30-L67). It splits the score into two parts: a skill overlap score (70% weight) and a location score (30% weight). The matching calculation is triggered automatically whenever a new opportunity is created/updated, or a volunteer updates their profile skills or location. The matches are stored in a dedicated `matches` collection in MongoDB, indexed by `score` and `is_active` for fast paginated reads.

---

### Q2: How is real-time chat implemented, and how is it secured so only matched pairs can message each other?
**Answer:** Real-time chat is powered by Socket.io. Sockets are authenticated using a custom middleware in [socket.service.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/services/socket.service.js#L61-L89) which verifies the JWT token during the handshake. Chat security is enforced inside the message service using `validateMatchedPair`. This function queries the `matches` collection to ensure there is at least one active match between the volunteer and the NGO for an opportunity that is currently `"open"` or `"in-progress"`. If no active matches exist, the message transaction is aborted with a `403 Forbidden` error.

---

### Q3: What happens to active matches and ongoing conversations when an admin suspends a user?
**Answer:** Immediate state adjustments occur. When the status is set to `suspended` in `updateAdminUserStatusController` in [admin.controller.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/controllers/admin.controller.js#L55-L79), we immediately run a bulk update:
- If a volunteer is suspended: all matches with their `volunteer_id` are set to `is_active: false`.
- If an NGO is suspended: all matches associated with their `ngo_id` are set to `is_active: false`.
Because messaging requires an active match with status `"open"` or `"in-progress"`, this suspension immediately locks them out of chat. Any active websocket connection they have is closed since the socket authenticator rejects suspended accounts.

---

### Q4: How is JWT session security and token refresh handled in the frontend to prevent session expiration or infinite refresh loops?
**Answer:** We implement access/refresh token rotation. The access token is short-lived (e.g. 15 minutes), and the refresh token is stored securely in localStorage. In the frontend [axiosClient.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/frontend/src/api/axiosClient.js#L41-L85), we set up a response interceptor. If an API request fails with a `401 Unauthorized` status, the interceptor intercepts the error, flags the request with `_retry = true` to prevent infinite request loops, calls the `/refresh-token` endpoint to get a new access token using the refresh token, updates the token stores, and retries the original request. If the refresh token itself is expired or invalid, we clear all stored auth state, trigger a logout, and redirect the user to `/login`.

---

### Q5: How did we support chat communication for opportunities that are currently "in-progress" without exposing closed ones?
**Answer:** Previously, only `"open"` status opportunities allowed active matches. Once an NGO changed the status to `"in-progress"` (meaning volunteers had started working), matches were deactivated, which blocked chat communication. To resolve this, we updated [match.service.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/services/match.service.js#L182-L208) to query and validate opportunities with status `$in: ["open", "in-progress"]`. This allows the active volunteer and NGO to continue messaging each other throughout the lifecycle of the campaign, and deactivates matches only when the opportunity is explicitly marked `"closed"`.

---

### Q6: How do we prevent spam in chat messaging without utilizing heavy external rate limiting servers like Redis?
**Answer:** Inside [message.service.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/services/message.service.js#L21-L34), we implement an in-memory sliding window rate limiter using a JavaScript `Map`. The keys are the sender IDs and the values are arrays of timestamps of recent messages. For each message attempt, we filter out timestamps older than 60 seconds. If the remaining timestamps exceed `30`, we throw a `429 Too Many Requests` error. This memory footprint is lightweight, efficient, and protects our MongoDB instance from write loops.

---

### Q7: Why did we write a custom PDF generator in `reportExport.js` instead of installing a library like `pdfkit` or `html-pdf`?
**Answer:** Writing a lightweight custom PDF generator in [reportExport.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/utils/reportExport.js#L43-L97) directly formats a standard PDF document tree. This completely avoids pulling in heavy native C++ binaries or headless browser dependencies (like Puppeteer), ensuring the backend starts up quickly, is highly portable, runs fast on memory-constrained containers, and has zero external package maintenance overhead.

---

### Q8: How is email format and password length validation implemented on signup, and why was it added to both the backend and frontend?
**Answer:** Frontend validation improves user experience by catching errors immediately (checking password length in [SignupPage.jsx](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/frontend/src/pages/SignupPage.jsx#L45-L50) before submitting). However, client-side code can easily be bypassed by raw API requests. Therefore, we added robust backend validation inside [user.controller.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/controllers/user.controller.js#L18-L29) using `validator.isEmail` to check email syntax and enforce a minimum password length of 6 characters before hashing.

---

### Q9: How does the system handle database index optimization for admin logs and matching queries?
**Answer:** We defined database indexes directly inside our Mongoose models to optimize query speeds. In [User.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/models/User.js#L30), we index `{ role: 1, status: 1 }` to optimize volunteer and NGO directory lookups. In [Match.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/models/Match.js#L56-L57), we enforce a unique compound index on `{ volunteer_id: 1, opportunity_id: 1 }` to prevent duplicate match records, and index `{ opportunity_id: 1, is_active: 1, score: -1 }` to optimize NGO dashboard matching queries. In [AdminLog.js](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/backend/models/AdminLog.js#L40), we index `{ createdAt: -1 }` to serve fast paginated audit feeds.

---

### Q10: How does the platform enforce Route-Based Access Control (RBAC) for NGO and Admin endpoints?
**Answer:** RBAC is handled via Express middlewares. First, `authenticateToken` validates the request header JWT token, verifies that the user is not suspended, and injects `req.user` with their database record. Then, `authorizeRoles("admin")` or `authorizeRoles("NGO")` checks if `req.user.role` matches the required permission scope. If the role doesn't match, it stops execution and responds with a `403 Forbidden` JSON payload.

---

### Q11: How do we deploy this React + Express monorepo on Vercel, and how are Socket.io limitations handled in serverless runtimes?
**Answer:** We configure a root-level [vercel.json](file:///c:/Users/chall/OneDrive/Desktop/waste_zero/waste-zero-feb-team02/vercel.json) defining two builds: `@vercel/node` for `backend/server.js` and `@vercel/static-build` for the `frontend` package. Rewrites map all `/api/v1/*` requests to the serverless function. Sockets (WebSockets) require persistent connections, which Vercel Serverless Functions do not support. To keep local/persistent deploys working alongside serverless, we export the Express `app` and only call `listen()` locally if `process.env.VERCEL` is not set. We also implemented a database connection middleware in the backend to lazy-load the MongoDB connection dynamically per serverless request.
