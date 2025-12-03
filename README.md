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

## Product Features

**Core Functionality**
- User registration, login, and profile management  
- Ability to post and manage item listings with descriptions and images  
- Three offer types: cash offers and swap offers, and both  
- Offer review system with acceptance and rejection 
- Search and filtering of listings by category, price, or keywords   

**Additional Features (planned)**
- In-app messaging between users before confirming transactions  

 

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
