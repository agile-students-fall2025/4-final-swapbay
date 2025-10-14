# Contributing to SwapBay

Welcome!  
This document explains how to contribute to **SwapBay**, our team’s shared principles, and the workflow we follow.  
Please review it before contributing to ensure quality, consistency, and collaboration across the project.

---

## 1. Team Norms

- Team norms are established early in the project and revisited regularly to ensure they reflect how we work.  
- Communication happens primarily through **Slack (team channel)** and **GitHub Issues**, with expected responses within **24 hours on weekdays**.  
- Each member is responsible for completing their assigned work and updating the team on progress or blockers.  
- Code changes must be reviewed by at least one teammate before merging.  
- Disagreements are handled respectfully through open discussion; unresolved issues will be resolved by team vote or escalation.  
- Consistent failure to communicate or deliver tasks will be addressed directly and reported if necessary.  
- PR reviews should be completed within **48 hours** of submission whenever possible.  

---

## 2. Team Values

- **Accountability:** Every member owns their tasks and meets deadlines responsibly.  
- **Transparency:** We share progress, blockers, and updates openly with the team.  
- **Respect:** Every opinion, schedule, and contribution is valued.  
- **Collaboration:** We work together, help each other, and solve problems collectively.  
- **Quality:** We write maintainable, clear, and efficient code that represents our best work.  
- **Continuous Improvement:** We seek feedback and iterate on both our code and process to keep learning as a team.  

---

## 3. Sprint and Collaboration

- The project follows **two-week sprints**, balancing steady progress with flexibility.  
- Each sprint begins with a planning session to define priorities and assign responsibilities.  
- Team check-ins or standups are held to track progress and discuss challenges.  
- Weekly virtual meetings (60–90 minutes) allow deeper discussion of sprint goals and problem-solving.  
- Tasks and backlog items are tracked on **GitHub Projects** under milestones.  
- Research or exploratory tasks (spikes) are also recorded in the sprint board for visibility.  
- All members are expected to attend meetings, share updates, and participate in decisions.  
- Non-participation or lack of communication without notice will be raised and discussed by the team.  

---

## 4. Coding Standards

- Use **Visual Studio Code** as the standard development environment.  
- Apply **ESLint** and **Stylelint** to maintain consistent code formatting.  
- Begin with a working prototype and then refine iteratively for improvements.  
- All code must pass review and basic tests before merging into `main`.  
- Keep commits small, meaningful, and descriptive.  
- Avoid commented-out or unused code in submissions.  
- Use clear, self-explanatory variable and function names.  
- Add or update tests for important features or logic whenever applicable.  
- Prioritize readability, maintainability, and functionality equally.  
- Follow **Conventional Commits** for messages (e.g., `feat: add swap listing page`, `fix: resolve login error`).  
- Keep function comments short but informative for complex logic.

---

## 5. Git Workflow

We use a **feature-branch workflow** to maintain a stable and deployable `main` branch.

### Step-by-Step Process
1. **Start from the latest `main`:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create a new branch for your task:**
   ```bash
   git checkout -b feature/<short-description>
   ```
3. **Make focused commits:**
   ```bash
   git add .
   git commit -m "feat: implement swap offer feature"
   ```
4. **Push your branch to GitHub:**
   ```bash
   git push origin feature/<short-description>
   ```
5. **Open a Pull Request (PR):**
   - Clearly describe the purpose of your changes.  
   - Link related issues or stories.  
   - Include test steps and screenshots if necessary.  
   - Request peer review before merging.
6. **After Approval:**
   - Merge into `main` only after review and successful checks.  
   - Delete the merged branch to keep the repository organized.  

### Guidelines
- Never push directly to `main`.  
- Keep your branch up to date with `main` to avoid conflicts:  
  ```bash
  git fetch origin
  git merge origin/main
  ```
- Resolve any merge conflicts locally, retest, and push again.  
- Use descriptive branch names like `feature/login`, `fix/image-upload`, or `docs/update-readme`.  

---

## 6. Rules for Contributing

Contributors—both internal and external—are expected to follow these rules:

- Adhere to the team norms, coding standards, and Git workflow described above.  
- Write clear, descriptive commit messages and PR titles.  
- Update documentation if your changes modify features or project behavior.  
- Do not include sensitive information such as credentials or private data.  
- Use GitHub Issues to report bugs, suggest features, or ask questions.  
- Keep all discussions constructive and focused on improving the project.  
- Test your changes locally before submitting a PR.  
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md) if applicable.  

> Failure to follow these standards may result in delays, review requests, or revision requirements.

---

## 7. Setting Up Local Development

### Prerequisites
Make sure you have:
- **Git** (for version control)  
- **Node.js v18+** and **npm**  
- **MongoDB Atlas** account *(or Docker for a local instance)*  
- **Visual Studio Code** *(recommended IDE)*  

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/agile-students-fall2025/swapbay.git
   cd swapbay
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the project root and include necessary environment variables:
   ```bash
   MONGO_URI=<your-mongodb-connection-string>
   PORT=3000
   JWT_SECRET=<your-secret-key>
   ```
4. **Start the development server:**
   ```bash
   npm start
   ```
5. Open the app in your browser:
   ```
   http://localhost:3000
   ```

---

## 8. Building & Testing

Detailed build and testing instructions will be **added later** as the project evolves.  
For now:

- Run preliminary tests (if available):
  ```bash
  npm test
  ```
- Refer to the `README.md` for setup and development procedures.  
- Contact the team during meetings or through communication channels for help running or testing the application.  

---

Thank you for contributing to **SwapBay**.  
Your participation helps improve the platform and supports a collaborative, high-quality development process.

© 2025 SwapBay Team. All rights reserved.
