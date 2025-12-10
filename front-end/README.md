# SwapBay Frontend

The **SwapBay Frontend** is a React.js application that provides the complete user experience for the SwapBay marketplace — including authentication, listings, offers, messaging, and profile management.

---

### 1. Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- npm (comes with Node) or yarn

Verify versions:
```bash
node -v
npm -v
```

---

### 2. Installation
Clone the repository and navigate into the frontend directory:

```bash
git clone https://github.com/agile-students-fall2025/4-final-swapbay
cd front-end
npm install
```

---

### 3. Running the Development Server
Start the local development environment with:

```bash
npm run dev
```

This will start the app using [Vite](https://vitejs.dev/).  
Visit the app in your browser at:

 **http://localhost:5173/**

---

### 4. Project Structure
```
swapbay-frontend/
├── src/
│   ├── components/       # Reusable UI (Header, Modal, etc.)
│   ├── context/          # React Contexts (Auth, Items, Offers, Chat)
│   ├── layout/           # Global layout with Header/Footer
│   ├── pages/            # All app screens (Home, Login, etc.)
│   ├── utils/            # API helpers / shared utilities
│   ├── App.jsx           # Root app with router
│   ├── main.jsx          # Vite entry point
│   └── index.css         # TailwindCSS base styles
├── public/
├── package.json
└── vite.config.js
```

---

### 5. Available Scripts
| Command | Description |
|----------|--------------|
| `npm run dev` | Starts Vite development server |
| `npm run build` | Builds the production-ready app |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint checks |

---

## Key Features Implemented
- Authentication: Login, Register, Reset Password
- Home Page: Search, filter, and view live listings from the backend
- My Items: Add/Edit/Delete, List, and manage visibility
- Messaging: Chat interface with message threads
- Offers: Make, view, cancel offers and accept/reject incoming ones
- Profile: Edit profile and delete account
- Styling: TailwindCSS with responsive layout and toasts

---

## Tech Stack
- **React.js** + **Vite**
- **React Router DOM**
- **TailwindCSS**
- **React Hot Toast** (for notifications)
- REST API powered by the SwapBay Express backend

---

### Environment
- The frontend expects the backend running on `http://localhost:3000`. Override with a `.env` file in `front-end/` for local or production:

  ```
  # Local
  VITE_API_URL=http://localhost:3000

  # Production example
  VITE_API_URL=http://165.227.222.189
  ```

- Data persists in MongoDB via the backend API (configure `MONGODB_URI`/`JWT_SECRET` in `back-end/.env`).
- Designed mobile-first, responsive to desktop.

---

### Build for Deployment
Generate a production build:

```bash
npm run build
```

The compiled static files will appear in the `dist/` directory.

Deployed instance: http://165.227.222.189
