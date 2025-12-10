# SwapBay

SwapBay is a modern online marketplace designed to make exchanging goods flexible, sustainable, and community-driven.  
Users can buy, sell, or swap items directly, combining the convenience of e-commerce with the creativity of bartering.

---

## Product Vision Statement

SwapBay empowers people to exchange value, not just money.  
By supporting both cash offers and item-for-item trades, the platform promotes sustainable reuse and creates an inclusive marketplace for students, hobbyists, and local communities.  

The goal of SwapBay is to make secondhand exchange accessible, affordable, and environmentally friendly, encouraging users to trade what they have for what they need.

---

## Core Team

| Name & GitHub |
|:---------------|
| [Hailemariam](https://github.com/HailemariamMersha) |
| [Sebahadin](https://github.com/sebahadin) |
| [Abinet](https://github.com/Abinet-Cholo) |
| [Amanuel](https://github.com/Amanuel-Nigussie) |
| [Krishiv](https://github.com/krishivseth) |


**Sprint 0 Roles:**  

- **Scrum Master:** *Hailemariam*  
- **Product Owner:** *Hailemariam*  
- **Developers**
    * Amanuel
    * Abinet
    * Sebahadin
    * Krishiv

*(Roles rotate each sprint.)*

---

## Project History

The idea for SwapBay emerged during the Fall 2025 Agile Software Development & DevOps course.  
Our team observed that most online marketplaces only allow cash-based transactions, which limits flexibility and accessibility for many users.  

SwapBay addresses this by introducing the option to exchange goods directly through swaps, in addition to traditional buy-and-sell transactions.  
This dual-offer model promotes sustainable consumption and encourages community engagement through a circular exchange economy.

The project follows an Agile/SCRUM development process, with iterative sprints, peer reviews, and continuous feedback loops.

---

These features together provide a comprehensive and user-friendly marketplace experience.

---

## Product Features

**Accounts & Profile**  
- Register/login/logout with JWT sessions plus forgot/reset password emails  
- Edit name, username, email, and avatar; delete account with data cleanup  

**Listings & Items**  
- Add items with category, condition, description, and uploaded images  
- Keep items as private drafts or publish/unlist with seller offer type (money, swap, both)  
- Mark items sold/swapped and block edits while listed or included in offers  

**Browse & Discovery**  
- Home feed of public listings (excludes your own) with search and filters by condition and offer type  
- Listing cards show owner info with quick actions to message or make an offer  

**Offers**  
- Compose offers using cash, one of your items, or both; pick from available personal items  
- Track outgoing offers with status filters and cancel pending ones  
- Review incoming offers per listing, accept/reject; acceptance marks items unavailable and rejects competing offers  

**Messaging & Notifications**  
- Inbox with unread counts and per-conversation threads  
- Direct messages between buyers and sellers plus system messages for offer updates  

**Media Uploads**  
- Authenticated uploads for avatars and item photos (JPEG/PNG/WEBP) served from `/uploads`

These features together provide a comprehensive and user-friendly marketplace experience.

---

## Instructions for Building and Testing the Project

### Running the Frontend

```bash
# Clone repo
git clone https://github.com/agile-students-fall2025/4-final-swapbay

# Move into frontend
cd front-end

# Install dependencies
npm install

# Run dev server
npm run dev
```
The app will open at:  
http://localhost:5173/

### Running the Backend API
The backend now uses MongoDB (via Mongoose). Set up environment variables before starting:
```
cd back-end
cp .env.example .env   # if provided, or create .env manually
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<random-long-secret>
PORT=3000
```

```bash
# From repo root
cd back-end

# Install dependencies
npm install

# Start the API (reload on changes)
npm run dev

# Or run once for production-style start
npm start
```
The API listens on http://localhost:3000/ by default (configurable through the `PORT` env var).

#### Backend Testing & Linting

```bash
# Run unit/integration tests
npm test

# Generate coverage report
npm run coverage

# Lint the codebase
npm run lint
```
Test output and coverage artifacts stay inside `back-end/tests` and `back-end/coverage`.

---

## How to Contribute

We welcome collaboration from both team members and external contributors.  

If you would like to contribute:
1. Check existing issues to see if your idea already exists.  
2. Fork this repository and create a feature branch.  
3. Commit small, focused changes with clear messages.  
4. Push your branch and open a Pull Request to `main`.  

For detailed contribution guidelines, please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

---

## Technology Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React.js |
| Backend | Node.js / Express |
| Database | MongoDB / Mongoose |
| Styling | CSS |
| Version Control | Git & GitHub |
| Deployment | TBD |


---

> “Not everyone has cash, but everyone has something to trade.”

---

