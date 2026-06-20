# CodeHub – Open‑Source Repository Explorer & Manager  

A modern, **React‑Vite** web application that lets users discover, explore, and manage open‑source repositories. It features a sleek glass‑morphism UI, custom cursor, dark theme, and full CRUD operations for repositories and files (including folder uploads and ZIP extraction).

---  

## Table of Contents  

- [Demo](#demo)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Installation & Development](#installation--development)  
- [Build & Deploy](#build--deploy)  
- [Folder Structure](#folder-structure)  
- [API Integration](#api-integration)  
- [Available Scripts](#available-scripts)  
- [Environment Variables](#environment-variables)  
- [Testing & Linting](#testing--linting)  
- [Contributing](#contributing)  
- [License](#license)  

---  

## Demo  

> **Note:** The demo requires a running backend at `https://back.coodhuub.ir:8000/api/v1`.  
You can start the frontend locally (see below) and point it to your own API endpoint.

---  

## Features  

| ✅ | Description |
|---|-------------|
| **Repository browsing** | Home page shows latest public repositories in a responsive grid. |
| **Repository detail view** | File‑tree explorer, Markdown rendering for `README.md`, syntax‑highlighted source viewer. |
| **User dashboard** | Create, edit, delete repositories; upload files (single, folder, or ZIP archive). |
| **Authentication** | JWT‑based login & registration with token persistence in `localStorage`. |
| **Custom cursor** | Animated core + halo on desktop devices. |
| **Glass‑morphism UI** | Modern blurred, translucent components with dark theme variables. |
| **Responsive design** | Mobile‑first layout with adaptive navigation, sidebars, and grid. |
| **SweetAlert2 dialogs** | Friendly confirmations, error handling, and success notifications. |
| **Skeleton loaders** | Visual placeholders while data is being fetched. |
| **Internationalization ready** | UI strings are in English; the codebase already contains Persian comments for future i18n. |

---  

## Tech Stack  

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 (with hooks) |
| **Bundler** | Vite 8 |
| **Styling** | CSS (custom variables, glass‑morphism) |
| **Routing** | React Router 7 |
| **State** | Local component state + `localStorage` for auth token |
| **HTTP client** | Axios (interceptor adds JWT) |
| **Icons** | Lucide‑React, React‑Icons (FontAwesome, Simple Icons, Tabler) |
| **Markdown** | `react-markdown` + `remark-gfm` + `rehype-raw` |
| **Syntax Highlighting** | `react-syntax-highlighter` (Prism, atomDark theme) |
| **Date handling** | `date-fns` |
| **Alerts** | SweetAlert2 |
| **Loading placeholders** | `react-loading-skeleton` |
| **Linting** | ESLint (core + React hooks) |
| **Package manager** | npm (scripts defined in `package.json`) |

---  

## Prerequisites  

- **Node.js** ≥ 20 (LTS recommended)  
- **npm** ≥ 10 (comes with Node)  
- Access to the backend API (`https://back.coodhuub.ir:8000/api/v1`) or a local copy of the API (see backend repo for details).  

---  

## Installation & Development  

```bash
# 1️⃣ Clone the repository
git clone https://github.com/your-username/codehub.git
cd codehub

# 2️⃣ Install dependencies
npm ci   # or `npm install` if you prefer

# 3️⃣ Start the dev server (Vite)
npm run dev
```

The app will be available at `http://localhost:5173`. Vite provides hot‑module replacement, so any change in the source files updates the browser instantly.

### Running the frontend **and** watching the build simultaneously  

If you need the compiled assets while developing (e.g., for a separate static server), you can run:

```bash
npm run dev:full
```

This runs both `npm run dev` and `npm run build:watch` concurrently.

---  

## Build & Deploy  

```bash
# Production build (outputs to /dist)
npm run build
```

The generated `dist/` folder can be served by any static web server (NGINX, Apache, Vercel, Netlify, etc.).  

**Example Nginx config**

```nginx
server {
    listen 80;
    server_name codehub.example.com;

    root /var/www/codehub/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---  

## Folder Structure  

```
codehub/
├─ public/                     # Static assets (favicon, fonts, etc.)
├─ src/
│  ├─ assets/                 # Images, icons, fonts
│  ├─ components/
│  │  ├─ common/              # Navbar, Footer, CustomCursor, SkeletonLoader, etc.
│  │  └─ repository/          # RepoCard component
│  ├─ pages/
│  │  ├─ Auth.jsx            # Login / Register page
│  │  ├─ Dashboard.jsx       # User repo management
│  │  ├─ Home.jsx            # Public repo listing
│  │  └─ RepoDetail.jsx      # File explorer & README viewer
│  ├─ services/
│  │  └─ api.js               # Axios instance + API wrappers
│  ├─ App.jsx                  # Root component, routing, auth handling
│  ├─ App.css                  # Global CSS variables & component styles
│  ├─ index.css                # Minimal reset & root styles
│  └─ main.jsx                 # ReactDOM entry point
├─ vite.config.js              # Vite configuration (React plugin)
├─ package.json
└─ index.html
```

---  

## API Integration  

All HTTP calls go through `src/services/api.js`. The base URL is defined as:

```js
const API_BASE_URL = 'https://back.coodhuub.ir:8000/api/v1';
```

### Auth endpoints  

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/auth/login` | Returns `{ access_token, refresh_token }` |
| `POST` | `/auth/register` | Registers a new user |
| `GET`  | `/auth/user-info` | Retrieves logged‑in user details (used on app start) |

### Repository endpoints  

| Method | URL | Description |
|--------|-----|-------------|
| `GET`  | `/repo/getAll` | Public repositories (home page) |
| `GET`  | `/repo` | Repositories owned by the authenticated user |
| `GET`  | `/repo/:repoName` | Single repository details |
| `POST` | `/repo` | Create a repository |
| `PUT`  | `/repo` | Update repository (requires `id`) |
| `DELETE`| `/repo` | Delete repository (requires `id` in request body) |

### File endpoints  

| Method | URL | Description |
|--------|-----|-------------|
| `GET`  | `/file/:repoId/files` | List all files in a repo |
| `GET`  | `/file/:repoId/files/:fileId/content` | Get raw file content (text) |
| `GET`  | `/file/:repoId/files/:fileId/download` | Download binary files |
| `POST` | `/file/:repoId/files` | Upload files/folders (multipart/form‑data) |
| `POST` | `/file/:repoId/import` | Upload a ZIP archive – server extracts it automatically |

All requests automatically include the `Authorization: Bearer <access_token>` header via an Axios request interceptor.

---  

## Available Scripts  

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts Vite dev server (hot reload). |
| `npm run build` | Generates an optimized production build in `dist/`. |
| `npm run build:watch` | Re‑builds on file changes (useful for static servers). |
| `npm run preview` | Serves the production build locally (`vite preview`). |
| `npm run lint` | Runs ESLint across the codebase. |
| `npm run dev:full` | Runs dev server **and** build‑watch concurrently. |

---  

## Environment Variables  

The project currently uses a hard‑coded API URL. To override it without editing source code, create a `.env` file at the project root:

```dotenv
VITE_API_BASE_URL=https://your-api.example.com/api/v1
```

Vite automatically prefixes env variables with `VITE_`. Then modify `src/services/api.js`:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back.coodhuub.ir:8000/api/v1';
```

---  

## Testing & Linting  

The repo does **not** ship with unit tests yet, but linting is set up:

```bash
npm run lint
```

You can extend the configuration in `.eslintrc.cjs` (generated by Vite) to add prettier, TypeScript, or other rules.

---  

## Contributing  

Contributions are welcome! Follow these steps:

1. Fork the repository.  
2. Create a feature branch: `git checkout -b feature/awesome-feature`.  
3. Install dependencies (`npm ci`).  
4. Make your changes, ensuring the UI remains responsive and the code follows existing patterns.  
5. Run `npm run lint` and fix any warnings/errors.  
6. Commit with a clear message and push to your fork.  
7. Open a Pull Request against the `main` branch.  

### Code Style  

- Use functional components and React hooks only.  
- Keep CSS in the component‑specific files (`*.css`) or use CSS modules if you prefer.  
- Prefer **named imports** from libraries (e.g., `import { useState } from 'react'`).  
- All new UI elements should respect the existing CSS variables (`--ch-…`).  

---  

## License  

This project is licensed under the **MIT License** – see the `LICENSE` file for details.  

---  

*Happy coding! 🎉*