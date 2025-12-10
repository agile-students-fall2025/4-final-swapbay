# SwapBay Backend

Express + MongoDB API that powers the SwapBay marketplace. It handles auth, listings, offers, chats, image uploads, and password reset emails for the frontend.

---

## Stack
- Node.js 18+, Express, MongoDB Atlas (via Mongoose), JWT, Multer for uploads, SendGrid for password reset emails
- Tests: Mocha + Chai + Supertest + mongodb-memory-server

## Quickstart
```bash
node -v && npm -v    # verify Node/npm (Node 18+ recommended)
cd back-end
npm install
cp .env.example .env # then fill in values below
```

## Environment
Add these to `.env` in `back-end/`:
```
MONGODB_URI=<mongodb connection string>
JWT_SECRET=<random-long-secret>
PORT=3000
FRONTEND_URL=http://localhost:5173   # use your deployed URL in prod
SENDGRID_API_KEY=<sendgrid-api-key>  # required for forgot-password
SENDGRID_FROM_EMAIL=<verified-from-address@yourdomain.com>
NODE_ENV=production                  # set to production in deployments
JWT_EXPIRES_IN=7d                    # adjust as needed
```
- SendGrid values are needed only for the live forgot/reset password flow (tests skip the outbound call).
- Atlas or local MongoDB both work; ensure `MONGODB_URI` is reachable from where you run the server.

## Run
```bash
npm run dev   # nodemon reloads on changes, serves on http://localhost:3000
npm start     # plain node for production-like runs
```
Health check: `GET /health`.

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with Nodemon |
| `npm start` | Start server with Node |
| `npm test` | Mocha/Chai + Supertest against an in-memory MongoDB |
| `npm run coverage` | Test coverage via c8 |
| `npm run lint` | ESLint (Airbnb base) |

## API surface (high level)
- `/api/auth` — register, login, logout, get/update/delete profile, forgot-password, reset-password.
- `/api/listings` — list/search listings, view detail, and related offers.
- `/api/me/items` — CRUD and availability toggles for the authenticated user's items.
- `/api/offers` — create/cancel/accept/reject/delete offers.
- `/api/chats` — messaging threads (participant scoped).
- `/api/uploads` — authenticated image uploads (avatars/items) returning a public URL.

## File uploads
- Endpoints: `POST /api/uploads/avatar` and `POST /api/uploads/item`.
- Auth required; send `multipart/form-data` with the `image` field.
- Accepts JPEG/PNG/WEBP up to 5 MB; files are stored under `public/uploads/avatars` or `public/uploads/items` and served at `/uploads/...`.

## Password reset (SendGrid)
1. Configure `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, and `FRONTEND_URL` in `.env`.
2. `POST /api/auth/forgot-password` with `{ email }` to send a reset link to `${FRONTEND_URL}/reset-password-confirm?token=...`.
3. `POST /api/auth/reset-password` with `{ token, password }` to set the new password.

## Project Structure
```
back-end/
├── src/
│   ├── app.js               # Express app + middleware + static hosting
│   ├── server.js            # Entry point (server + DB bootstrap)
│   ├── config/db.js         # Mongoose connection helper
│   ├── middleware/auth.js   # JWT auth + optional auth helpers
│   ├── models/              # Mongoose models (User, Item, Offer, Chat)
│   ├── routes/              # auth, listings, my-items, offers, chats, uploads
│   └── utils/               # serializers, email sender (SendGrid)
├── public/                  # Static assets + uploads/ for user images
├── tests/                   # Mocha/Chai/Supertest suites (in-memory Mongo)
├── package.json
└── eslint.config.js
```

## Testing
- `npm test` spins up an isolated `mongodb-memory-server` instance and hits HTTP routes via Supertest.
- `npm run coverage` reports coverage with c8.

## Deployment
1. `npm ci`
2. Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`, SendGrid values, `NODE_ENV=production`).
3. Start with your process manager of choice (e.g., `pm2 start src/server.js --name swapbay-api`).

Deploy to any Node-friendly host (Droplet with Nginx/PM2, Render, Railway, etc.). Ensure `public/` is served and writable for uploads if users will upload images.

