# IA Snake 🐍

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://pabloluqueromero.github.io/ia-snake-react)
[![React](https://img.shields.io/badge/React-17.0.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.3.5-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Pages](https://img.shields.io/badge/deployed_to-GitHub_Pages-blue.svg)](https://pabloluqueromero.github.io/ia-snake-react)

> An interactive web-based Snake AI sandbox comparing human players against heuristic search and reinforcement learning agents on a 2D grid.

🌐 **Play Live Demo:** [https://pabloluqueromero.github.io/ia-snake-react](https://pabloluqueromero.github.io/ia-snake-react)

---

## 🎮 Features

- **Player Modes**:
  - 👤 **Human Player**: Smooth keyboard controls (`Arrow Keys` / `WASD`) with responsive instant pause (`Space` / `P`).
  - 🤖 **A\* Search AI**: Laser-targeted shortest-path navigation using Manhattan distance heuristic, deterministic tie-breaking, live body collision validation, and BFS flood-fill survival fallback.
  - 🧠 **DQN Reinforcement Learning**: Deep Q-Network agent with real-time Q-value bar telemetry, chosen action highlights, and runtime $\epsilon$-exploration tuning.
- **Classic Arcade Aesthetic**:
  - Lush lawn green background with checkered grass canvas, smooth glowing snake segments, and bouncy apple animation.
- **Persistent Scoreboard & Memory**:
  - Records session history, all-time high scores, and efficiency metrics (`steps/point`) persisted across page reloads via `localStorage`.
- **Responsive & Contained**:
  - Perfectly sized to fit within standard viewport heights with zero page scrolling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v22+)
- npm

### Installation & Local Setup

```bash
# Clone the repository
git clone https://github.com/pabloluqueromero/ia-snake-react.git
cd ia-snake-react/snake-app

# Install dependencies
npm install

# Start development server
npm start
```

### Running Tests

```bash
npm test -- --watchAll=false
```

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

```bash
npm run deploy
```

---

## 📄 License

This project is licensed under the MIT License.
