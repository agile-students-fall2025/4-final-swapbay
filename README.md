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

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier is sufficient)

### Database Setup (MongoDB Atlas)

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (free M0 tier is recommended)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these for later)
   - Set user privileges to "Read and write to any database"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your specific IP address
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd back-end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the `back-end` directory:
   ```bash
   touch .env
   ```

   - Add the following environment variables to `.env`:
   ```env
   # MongoDB Atlas Connection URI
   # Replace <username>, <password>, and <cluster-url> with your actual values
   # Replace <database-name> with your desired database name (e.g., "swapbay")
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

   # JWT Secret Key (generate a secure random string)
   # You can generate one using: openssl rand -base64 32
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Server Port (default: 3000)
   PORT=3000

   # Node Environment
   NODE_ENV=development
   ```

   **Important:** 
   - Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your actual MongoDB Atlas credentials
   - The `.env` file is already included in `.gitignore` and will NOT be committed to version control
   - Never commit credentials or secrets to the repository

4. **Start the backend server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

   The backend API will be available at:  
   http://localhost:3000

### Frontend Setup

```bash
# Clone repo (if not already done)
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

### Environment Variables Summary

**Backend `.env` file format:**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secret key for signing JWT tokens (use a long, random string)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `JWT_EXPIRES_IN`: (Optional) JWT token expiration time (default: 7d)

**Security Notes:**
- ✅ The `.env` file is already in `.gitignore` - it will not be committed
- ✅ Never hardcode credentials in source code
- ✅ Use different secrets for development and production
- ✅ Share `.env` files securely through team communication channels (not via git)

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

