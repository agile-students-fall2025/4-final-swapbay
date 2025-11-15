# SwapBay Backend

The **SwapBay Backend** is an Express.js mock API that powers the SwapBay marketplace. It exposes authentication, listings, offers, items, and messaging routes and serves shared static assets for the frontend.

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
Clone the repo (if you haven’t) and install dependencies in the backend directory:

```bash
git clone https://github.com/agile-students-fall2025/4-final-swapbay
cd back-end
npm install
```

---

### 3. Running the Server
Start the Express server with:

```bash
npm run dev
```

This runs `src/server.js` with Nodemon on **http://localhost:3000**.

Use `npm start` for the non-watching version in production-like environments.

---

### 4. Project Structure
```
swapbay-backend/
├── src/
│   ├── app.js             # Express app with middleware + static hosting
│   ├── server.js          # Entry point that boots the server
│   ├── data/              # In-memory mock data sets (users, items, offers, chats)
│   ├── services/          # Domain logic (serialization, filtering, offer creation)
│   └── routes/            # Express routers (auth, listings, offers, my-items, chats)
├── tests/                 # Mocha + Chai suites (services + HTTP routes)
├── public/                # Static assets shared with the frontend (logo, etc.)
├── package.json
└── eslint.config.js
```

---

### 5. Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with Nodemon (hot reload) |
| `npm start` | Start server with Node (no watch) |
| `npm test` | Run the full Mocha/Chai suite |
| `npm run coverage` | Run tests with c8 coverage reporting |
| `npm run lint` | Lint the project with ESLint + Airbnb rules |

---

## Key Features
- Authentication: login, register, profile update, delete, logout (mock session)
- Listings: public search/filter, detail view, offers per listing
- My Items: add/edit/delete, list/unlist, availability toggles
- Offers: incoming/outgoing views, create/cancel/accept/reject/delete
- Messaging: inbox summaries, per-thread view, send message mirroring
- Static assets: backend serves shared images and logos for the frontend

Everything runs in-memory using the mock data, which makes the backend deterministic for demos and tests.

---

## Testing & Coverage
- Tests live under `tests/` and are grouped by feature (auth, listings, my-items, offers, chats, store helpers).
- Run `npm test` to execute all suites.
- Run `npm run coverage` to collect code coverage with `c8` (currently ~90%+).

---

## Environment Notes
- No database required—mock data is reloaded each time the process starts.
- The frontend expects this server at `http://localhost:3000`; adjust with a proxy or env vars if needed.
- Static files (e.g., branding assets) are served from `public/` via `app.use(express.static(...))`.

---

## Deployment
Use the production start script to boot the API:
```bash
npm install
npm start
```
Host on any Node-compatible provider (Render, Railway, Heroku, etc.). Since data is in-memory, restarting wipes the state—persist only if you later wire a real database.

---

SwapBay Backend gives the frontend a consistent mock API surface so the entire marketplace experience can be demoed without external services.
