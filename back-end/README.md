# SwapBay Backend

The **SwapBay Backend** is an Express.js API that powers the SwapBay marketplace. It exposes authentication, listings, offers, items, and messaging routes, persists data in MongoDB Atlas via Mongoose, and serves shared static assets for the frontend.

---

### 1. Prerequisites
Install the following tools:
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- npm (bundled with Node)

Verify your environment:
```bash
node -v
npm -v
```

---

### 2. Installation
Clone the repo (if you haven’t already) and install dependencies in the backend directory:

```bash
git clone https://github.com/agile-students-fall2025/4-final-swapbay
cd back-end
npm install
```

---

### 3. Configure Environment & Database
Create `.env` in `back-end/` (or copy from `.env.example`) with:
```
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<random-long-secret>
PORT=3000
```

Provision a MongoDB Atlas cluster (or local MongoDB), create a database (e.g., `swapbay`), and whitelist your IP or configure network access. Use the provided URI in `MONGODB_URI`.

### 4. Running the Server
Start the Express server with:

```bash
npm run dev
```

This runs `src/server.js` with Nodemon on **http://localhost:3000**.

Use `npm start` for the non-watching version in production-like environments.

---

### 5. Project Structure
```
swapbay-backend/
├── src/
│   ├── app.js             # Express app with middleware + static hosting
│   ├── server.js          # Entry point that boots the server and DB connection
│   ├── config/db.js       # Mongoose connection helper
│   ├── middleware/auth.js # JWT auth + optional auth
│   ├── models/            # Mongoose models (User, Item, Offer, Chat)
│   ├── routes/            # Express routers (auth, listings, offers, my-items, chats)
│   └── utils/serializers.js# Response shaping helpers
├── tests/                 # Mocha + Chai + Supertest integration suites (uses in-memory Mongo)
├── public/                # Static assets shared with the frontend (logo, etc.)
├── package.json
└── eslint.config.js
```

---

### 6. Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with Nodemon (hot reload) |
| `npm start` | Start server with Node (no watch) |
| `npm test` | Run the full Mocha/Chai + Supertest suite (boots in-memory Mongo) |
| `npm run coverage` | Run tests with c8 coverage reporting |
| `npm run lint` | Lint the project with ESLint + Airbnb rules |

---

## Key Features
- Authentication: login, register, profile update, delete, logout via JWT
- Listings: public search/filter, detail view, offers per listing
- My Items: add/edit/delete, list/unlist, availability toggles
- Offers: incoming/outgoing views, create/cancel/accept/reject/delete
- Messaging: inbox summaries, per-thread view, send message mirroring
- Static assets: backend serves shared images and logos for the frontend

---

## Testing & Coverage
- Tests live under `tests/` and are grouped by feature (auth, listings, my-items, offers, chats).
- Integration tests spin up an in-memory MongoDB instance (`mongodb-memory-server`) and hit real HTTP routes via Supertest.
- Run `npm test` to execute all suites.
- Run `npm run coverage` to collect code coverage with `c8`.

---

## Environment Notes
- MongoDB Atlas (or local MongoDB) is required; configure `MONGODB_URI` and `JWT_SECRET` in `.env`.
- The frontend expects this server at `http://localhost:3000`; adjust with a proxy or env vars if needed.
- Static files are served from `public/` via `app.use(express.static(...))`.

---

## Deployment
Use the production start script to boot the API:
```bash
npm install
npm start
```
Host on any Node-compatible provider (Render, Railway, Heroku, etc.). Ensure environment variables include `MONGODB_URI`, `JWT_SECRET`, and optionally `PORT`.
