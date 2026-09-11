# Neon Dodge

> **DODGE. SURVIVE. DOMINATE.**

A futuristic, high-performance HTML5 Canvas arcade game portal built for the **ACM SIGGRAPH SRMIST Web Development Induction Task 2026–27**.

Take command of an agile neon spacecraft navigating an increasingly intense celestial hazard storm. Test your reaction time, dodge falling asteroids and high-velocity laser shards, and push your survival score beyond the limits.

---

## 🌟 Features

- **Centralized Game Hub**: Minimalist sci-fi interface featuring an ambient starfield canvas, dynamic hero section, engine specs, and real-time high-score syncing.
- **High-Performance Canvas 2D Engine**:
  - Logical resolution (600×800, 3:4 aspect ratio) scaled smoothly to any screen.
  - **DPR Scaling**: Automatically leverages `window.devicePixelRatio` for razor-sharp rendering on Retina and high-density mobile screens without distortion.
  - **Delta-Time Game Loop**: Frame-rate independent physics powered by `requestAnimationFrame`.
- **Tactical Hazard Spectrum**:
  - *Asteroids*: Heavy, rotating geometric hazards with orange neon edge glow and crater details.
  - *Laser Shards*: High-speed, narrow energy projectiles challenging split-second reaction times.
- **Dynamic Particle Physics**:
  - Particle pooling system for engine exhaust trails, ambient space dust, and collision explosion bursts.
  - Strict ceiling cap (max 160 particles) to guarantee zero memory leaks and constant 60+ FPS.
- **Impact Screen Shake**: Controlled micro-displacement feedback on collision.
- **Progressive Difficulty Curve**: Speed and spawn cadences dynamically scale as score and levels increase.
- **Persistent High Scores**: Seamless local persistence via `localStorage` with in-memory fallback.
- **Zero-Dependency Procedural Audio**:
  - Built with the native Web Audio API (start fanfare, electronic clicks, warnings, explosion rumblings).
  - Handles browser autoplay policies cleanly with an accessible mute toggle and keyboard shortcut (`M`).
- **Unified Dual-Mode Mobile Controls**:
  - Dedicated on-screen glowing arcade touch buttons (`◀` and `▶`).
  - Direct touch-drag gesture steering on the Canvas with scroll-locking (`touch-action: none`).
- **Fully Responsive**: Flawless experience from 375px mobile displays up to 4K desktop screens.

---

## 🛠️ Tech Stack

- **Markup**: Semantic HTML5 with ARIA accessibility labels
- **Styles**: Vanilla CSS3 (Custom Properties, Glassmorphism, CSS Grid & Flexbox, micro-interactions)
- **Programming Language**: Vanilla JavaScript (ES6+ Modules)
- **Graphics API**: Native HTML5 Canvas 2D API
- **Persistence**: Web Storage API (`localStorage`)
- **Sound**: Web Audio API (Procedural Synthesizer)

---

## 📁 Project Structure

```
neon-dodge/
│
├── index.html              # Game Hub (Hero, animated background, mission card)
├── game.html               # Canvas Arcade Game (HUD, modals, touch bar)
├── README.md               # Project documentation & deployment guide
│
├── css/
│   ├── reset.css           # Modern normalization, box-sizing, prefers-reduced-motion
│   ├── main.css            # Color tokens, typography, navbar, footer, buttons
│   ├── hub.css             # Hub hero, 3D tilt card, specs grid, animations
│   └── game.css            # Game viewport, responsive Canvas, HUD, modals
│
├── js/
│   ├── main.js             # Global application metadata & console banner
│   ├── hub.js              # Hub background starfield canvas & live record sync
│   ├── game.js             # State machine, DPR scaling, delta-time game loop
│   ├── player.js           # Vector-drawn neon spacecraft & physics
│   ├── obstacle.js         # Asteroid and Laser Shard manager & pooling
│   ├── particles.js        # Capped particle pool for thrusters & explosions
│   ├── collision.js        # Fair circle & segment collision algorithms
│   ├── score.js            # Survival scoring, level scaling, and record commit
│   ├── input.js            # Unified Desktop keyboard & Mobile touch manager
│   ├── audio.js            # Procedural Web Audio synthesizer & mute toggle
│   └── storage.js          # Resilient LocalStorage manager with fallback
│
└── assets/
    ├── icons/
    │   └── favicon.svg     # Scalable neon crest favicon
    └── images/
        └── game-thumb.svg  # High-definition vector game preview
```

---

## 🎮 Controls

### Desktop
| Action | Keybinding |
| :--- | :--- |
| **Move Left** | <kbd>←</kbd> (Left Arrow) or <kbd>A</kbd> |
| **Move Right** | <kbd>→</kbd> (Right Arrow) or <kbd>D</kbd> |
| **Pause / Resume** | <kbd>P</kbd>, <kbd>Space</kbd>, or <kbd>Escape</kbd> |
| **Restart Game** | <kbd>R</kbd> (when Paused or Game Over) |
| **Toggle Audio** | <kbd>M</kbd> or Header Sound Button |

### Mobile / Tablet
| Control Method | Interaction |
| :--- | :--- |
| **Virtual Buttons** | Tap or hold the glowing **◀** or **▶** on-screen buttons |
| **Touch / Drag** | Slide finger anywhere horizontally across the game screen |

---

## 🚀 Run Locally

Because the project uses standard native **ES6 Modules** (`import` / `export`), it must be served through a local HTTP server rather than the `file://` protocol.

### Option 1: Using Node.js / npx (Recommended)
```bash
# From the project root folder:
npx serve .
```
Then open the displayed URL (usually `http://localhost:3000`).

### Option 2: Using Python
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### Option 3: Using VS Code Live Server
1. Open the project folder in **VS Code**.
2. Right-click `index.html`.
3. Select **"Open with Live Server"**.

---

## 🌐 Live Deployment

The project is completely static and ready for instant deployment to any modern hosting provider:

### Deploying to Vercel
1. Push your code to a public GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Leave all build and output settings as default (root directory).
5. Click **"Deploy"**. Your game is live in seconds.

Alternatively via the Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Deploying to GitHub Pages
1. In your GitHub repository, navigate to **Settings** → **Pages**.
2. Under **Build and deployment** → **Branch**, select `main` (or `master`) branch and folder `/ (root)`.
3. Click **Save**. GitHub Pages will deploy your site at `https://rudi-rock.github.io/web-game-portal-siggraph-task/`.

### Deploying to Netlify
- Drag and drop the project folder directly into [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 👨‍💻 Project & Author Details

- **Project**: NEON DODGE
- **Developer**: Rudra Pratap Singh
- **Registration Number**: RA2511003011539
- **Organization**: ACM SIGGRAPH SRMIST Student Chapter
- **Induction Task**: Web Development 2026–27
- **GitHub Repository**: [web-game-portal-siggraph-task](https://github.com/Rudi-rock/web-game-portal-siggraph-task)
- **Vercel Project**: `neon-dodge-arcade`

---

## 🔗 Project Links

- **Live Demo (Vercel)**: [https://neon-dodge-arcade-seven.vercel.app](https://neon-dodge-arcade-seven.vercel.app)
- **Source Repository**: [https://github.com/Rudi-rock/web-game-portal-siggraph-task](https://github.com/Rudi-rock/web-game-portal-siggraph-task)
