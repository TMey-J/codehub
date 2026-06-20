# CodeHub  

**CodeHub** is a modern, open‑source code‑hosting and collaboration platform built with React 19, Vite, and a RESTful API. It provides a sleek glass‑morphism UI, powerful repository management, file explorer, markdown rendering, and AI‑enhanced search.  

---  

## Table of Contents  

- [Demo](#demo)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running the Development Server](#running-the-development-server)  
  - [Building for Production](#building-for-production)  
- [Project Structure](#project-structure)  
- [API Integration](#api-integration)  
- [Scripts](#scripts)  
- [Environment Variables](#environment-variables)  
- [Testing & Linting](#testing--linting)  
- [Contributing](#contributing)  
- [Roadmap](#roadmap)  
- [License](#license)  
- [Acknowledgements](#acknowledgements)  

---  

## Demo  

> **Live demo:** (replace with your hosted URL)  
> `https://codehub.example.com`  

---  

## Features  

| ✅ | Feature | Description |
|---|---|---|
| **Repository Management** | Create, edit, delete, and explore repositories. |
| **File Explorer** | Tree view with folder/file icons, support for uploading files, whole folders, or ZIP archives (auto‑extract). |
| **Markdown Viewer** | Render `README.md` with GitHub‑style alerts, code blocks, copy‑to‑clipboard, and smooth heading navigation. |
| **AI‑Powered Search** | Search results are cached in `sessionStorage` for instant subsequent loads. |
| **Responsive Design** | Fully responsive UI with mobile navigation drawer, glass‑morphism, and custom cursor on desktop. |
| **Authentication** | JWT‑based login/registration with token refresh handling. |
| **Dark Theme** | Default dark theme with accent colors (`#a855f7`, `#6366f1`). |
| **Custom Cursor** | Animated core + halo cursor (desktop only). |
| **Progressive Loading** | Skeleton loaders for cards, grids, and content placeholders. |
| **File Download** | Individual file download and whole‑repo ZIP download. |
| **Internationalisation** | English/Farsi toggle on the About page. |
| **Accessibility** | Keyboard‑friendly navigation, ARIA‑compatible components. |

---  

## Tech Stack  

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React‑Router 7, Vite, JSX, CSS (custom variables, glass‑morphism) |
| **UI Icons** | `lucide-react`, `react-icons` |
| **State & Effects** | React hooks (`useState`, `useEffect`, `useCallback`) |
| **HTTP** | Axios (interceptors for JWT) |
| **Markdown** | `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-slug` |
| **Syntax Highlighting** | `react-syntax-highlighter` (Prism, `atomDark` theme) |
| **Date Formatting** | `date-fns` (Persian locale) |
| **Modals & Alerts** | SweetAlert2 |
| **Loading Skeletons** | `react-loading-skeleton` |
| **Build Tool** | Vite (fast HMR) |
| **Linting** | ESLint (React hooks, refresh) |
| **Package Manager** | npm (scripts defined in `package.json`) |

---  

## Getting Started  

### Prerequisites  

- **Node.js** ≥ 20 (recommended)  
- **npm** ≥ 10 (comes with Node)  
- Access to the backend API (`https://back.coodhuub.ir:8000/api/v1`). If you need a local backend, see the backend repository for setup instructions.  

### Installation  

```bash
# Clone the repository
git clone https://github.com/yourusername/codehub.git
cd codehub

# Install dependencies
npm install
```

### Running the Development Server  

```bash
npm run dev
```

- The app will be available at `http://localhost:5173`.  
- Vite provides hot‑module replacement, so any change in `src/` instantly reflects in the browser.  

### Building for Production  

```bash
npm run build
```

- The compiled assets are placed in the `dist/` folder.  
- To preview the production build locally:  

```bash
npm run preview
```

---  

## Project Structure  

```
codehub/
├─ public/                     # Static assets (favicon, fonts, etc.)
├─ src/
│  ├─ assets/                  # Images, icons, etc.
│  ├─ components/
│  │   ├─ common/              # Navbar, Footer, CustomCursor, AIPopup, SkeletonLoader, etc.
│  │   └─ repository/          # RepoCard component
│  ├─ pages/                   # Route pages (Home, Dashboard, RepoDetail, Auth, About, Explore, SearchResults)
│  ├─ services/
│  │   └─ api.js               # Axios instance + auth, repo, file services
│  ├─ App.jsx                  # Root component with routing & auth handling
│  ├─ App.css                  # Global CSS variables, layout, animations
│  ├─ index.css                # Minimal reset & root styles
│  └─ main.jsx                 # ReactDOM entry point
├─ .eslintrc.js                # ESLint configuration
├─ vite.config.js              # Vite configuration
├─ package.json
└─ README.md
```

---  

## API Integration  

All API calls are centralized in `src/services/api.js`.  

| Service | Endpoint | Method | Description |
|---|---|---|---|
| **authService** | `/auth/login` | POST | Returns `access_token` & `refresh_token`. |
| | `/auth/register` | POST | Registers a new user. |
| | `/auth/user-info` | GET | Retrieves logged‑in user details. |
| **repoService** | `/repo/getAll` | GET | List all public repositories (supports pagination & query). |
| | `/repo` | GET | List repositories owned by the authenticated user. |
| | `/repo/:owner/:name` | GET | Get a single repository’s metadata. |
| | `/repo` | POST | Create a new repository. |
| | `/repo` | PUT | Update repository details. |
| | `/repo` | DELETE | Delete a repository. |
| **fileService** | `/file/:repoId/files` | GET | List files of a repository. |
| | `/file/:repoId/files/:fileId/content` | GET | Get raw file content (text or binary). |
| | `/file/:repoId/files/:fileId/download` | GET | Download a single file (blob). |
| | `/file/:repoId/download` | GET | Download the whole repository as a ZIP. |
| | `/file/:repoId/files` | POST | Upload files/folders (multipart/form‑data). |
| | `/file/:repoId/import` | POST | Upload a ZIP archive (auto‑extract). |
| | `/file/:repoId/files/:fileId` | DELETE | Delete a file. |

> **Note:** The Axios instance automatically adds the `Authorization: Bearer <token>` header from `localStorage`.  

---  

## Scripts  

| Script | Description |
|---|---|
| `npm run dev` | Starts Vite dev server (HMR). |
| `npm run build` | Generates production assets in `dist/`. |
| `npm run build:watch` | Builds continuously (useful with a separate dev server). |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint across the codebase. |
| `npm run dev:full` | Runs both `dev` and `build:watch` concurrently (requires `concurrently`). |

---  

## Environment Variables  

The frontend currently uses a single constant defined in `src/services/api.js`:  

```js
const API_BASE_URL = 'https://back.coodhuub.ir:8000/api/v1';
```

If you need to switch environments, replace the value or create a `.env` file and modify the import:

```bash
VITE_API_BASE_URL=https://your-backend/api/v1
```

Then update `api.js`:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---  

## Testing & Linting  

- **Linting**: `npm run lint` – uses ESLint with the official `eslint` config and React hooks rules.  
- **Testing**: No test suite is bundled yet, but you can add Jest/React Testing Library.  

---  

## Contributing  

1. Fork the repository.  
2. Create a feature branch: `git checkout -b feature/awesome-feature`.  
3. Install dependencies (`npm install`).  
4. Make your changes, ensuring the UI stays responsive and follows the existing design system (CSS variables, glass‑morphism, custom cursor).  
5. Run `npm run lint` and fix any warnings/errors.  
6. Commit with a clear message and push to your fork.  
7. Open a Pull Request describing the changes.  

**Guidelines**  

- Keep components small and reusable.  
- Use functional components + hooks; avoid class components.  
- Follow the existing naming convention (`PascalCase` for components, `camelCase` for functions/variables).  
- Add or update documentation in `README.md` when introducing new features.  

---  

## Roadmap  

- [ ] **Unit & Integration Tests** (Jest + React Testing Library).  
- [ ] **Dark/Light Theme Switcher**.  
- [ ] **Real‑time Collaboration** (WebSocket).  
- [ ] **Issue Tracker & Pull Request UI**.  
- [ ] **GitHub OAuth Login**.  
- [ ] **CI/CD Pipeline** (GitHub Actions).  

---  

## License  

This project is licensed under the **MIT License** – see the `LICENSE` file for details.  

---  

## Acknowledgements  

- **Lucide** – open‑source icon set.  
- **React‑Markdown** – powerful markdown rendering.  
- **SweetAlert2** – beautiful modal dialogs.  
- **Vite** – fast bundler and dev server.  
- **All contributors** – thank you for your time and effort!  

---  

*Happy coding! 🚀*