# CodeHub  

**A modern, open‑source code hosting and collaboration platform built with React.**  
Manage repositories, upload files/folders/ZIP archives, explore public projects, and enjoy a sleek glass‑morphism UI with dark/light themes.

---  

## Table of Contents  

- [Demo](#demo)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running the App](#running-the-app)  
  - [Building for Production](#building-for-production)  
- [Project Structure](#project-structure)  
- [Key Pages & Components](#key-pages--components)  
- [API Services](#api-services)  
- [Environment Variables](#environment-variables)  
- [Testing](#testing)  
- [Contributing](#contributing)  
- [License](#license)  

---  

## Demo  

> **⚠️** A live demo is not included in this repository. Deploy the app to Vercel, Netlify, or any static‑host of your choice after building.

---  

## Features  

| Category | Description |
|----------|-------------|
| **User Dashboard** | List, create, edit, delete repositories; pagination; debounced search. |
| **File Upload** | Upload single/multiple files, whole folders (preserving structure), or ZIP archives (auto‑extract). |
| **Search Results** | AI‑powered search with client‑side pagination and session‑storage caching. |
| **Explore** | Browse all public repositories with query support and pagination. |
| **Authentication** | Login & registration with password‑strength indicator, eye‑toggle, and auto‑login after sign‑up. |
| **About Page** | Bilingual (English/Farsi) hero, feature list, team showcase, animated particles, scroll‑reveal effects. |
| **UI/UX** | Glass‑morphism design, responsive grid, custom pagination, skeleton loaders, SweetAlert2 dialogs, Lucide icons. |
| **Internationalisation** | Simple language toggle on the About page (EN ↔ FA). |
| **State Management** | React hooks (`useState`, `useEffect`, `useCallback`, `useRef`) – no external state library required. |
| **Error Handling** | Centralised error messages, API response validation, graceful fallback UI. |

---  

## Tech Stack  

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 (functional components, hooks) |
| **Routing** | `react-router-dom` |
| **Icons** | `lucide-react` |
| **Modals & Alerts** | `sweetalert2` |
| **Styling** | CSS custom properties (dark mode), glass‑morphism, responsive grid |
| **HTTP Client** | `axios` (wrapped in `src/services/api.js`) |
| **Build Tool** | Vite (or CRA – check `package.json`) |
| **Version Control** | Git |
| **Optional** | `dotenv` for environment variables |

---  

## Getting Started  

### Prerequisites  

- **Node.js** ≥ 18 (LTS)  
- **npm** ≥ 9 (or `yarn`/`pnpm`)  

### Installation  

```bash
# Clone the repository
git clone https://github.com/your-username/codehub.git
cd codehub

# Install dependencies
npm install   # or yarn / pnpm install
```

### Running the App  

```bash
# Development server (hot‑reloading)
npm run dev   # Vite: `vite` or CRA: `react-scripts start`
```

Open `http://localhost:5173` (Vite default) or `http://localhost:3000` (CRA) in your browser.

### Building for Production  

```bash
npm run build   # Generates an optimized static bundle in ./dist (Vite) or ./build (CRA)
```

Deploy the generated folder to any static‑hosting service (Vercel, Netlify, GitHub Pages, etc.).

---  

## Project Structure  

```
src/
├─ assets/                # Images, fonts, static assets
├─ components/
│   ├─ common/            # SkeletonLoader, reusable UI pieces
│   └─ repository/        # RepoCard, other repo‑specific UI
├─ pages/
│   ├─ About.jsx          # Bilingual about page with animations
│   ├─ Auth.jsx           # Login / Register
│   ├─ Dashboard.jsx      # User repo management & upload UI
│   ├─ Explore.jsx        # Public repo explorer
│   ├─ Home.jsx           # Landing page with latest repos
│   └─ SearchResults.jsx # AI‑driven search results
├─ services/
│   └─ api.js             # Axios instances: repoService, fileService, authService
├─ App.jsx                # Root component, routes definition
└─ index.jsx              # React entry point
```

> **Note:** The repository also contains global CSS (`src/index.css` or `src/App.css`) that defines the glass‑morphism variables (`--ch-accent`, `--ch-text`, etc.).

---  

## Key Pages & Components  

### `Dashboard.jsx`  

- Handles **CRUD** for user repositories.  
- Implements **debounced search**, pagination, and view state (`list`, `create`, `edit`, `upload`).  
- **Upload flow** supports three modes:  
  1. **Files** – select one or many files.  
  2. **Folder** – upload an entire folder while preserving relative paths.  
  3. **ZIP** – upload a `.zip` archive; the backend extracts it automatically.  
- Uses `SweetAlert2` for success/error dialogs and `SkeletonLoader` while loading.

### `SearchResults.jsx`  

- Reads query param `q` from the URL.  
- Caches results in `sessionStorage` (`search_cache_<query>`) to avoid duplicate API calls.  
- Client‑side pagination with a configurable `itemsPerPage`.  

### `Explore.jsx`  

- Public repository explorer with optional search (`?q=`) and pagination (`?page=`).  
- Mirrors the UI of the dashboard list but without edit/delete actions.  

### `Auth.jsx`  

- Login & registration forms with **password visibility toggle** (`react-icons/fi`).  
- Real‑time **password strength meter** (4‑point scale).  
- On successful registration, automatically logs the user in.  

### `About.jsx`  

- Bilingual content (`en` / `fa`) toggled via a button.  
- Animated background particles, scroll‑reveal sections, and a final CTA.  

### Reusable UI  

- **`SkeletonLoader`** – placeholder while data loads.  
- **`RepoCard`** – displays repo name, description, language tag, visibility icon, and action buttons.  

---  

## API Services (`src/services/api.js`)  

The file exports three pre‑configured Axios instances:

| Service | Endpoints (example) | Usage |
|---------|---------------------|-------|
| `repoService` | `GET /user?page=&size=&search=` – fetch user repos <br> `POST /repo` – create <br> `PUT /repo/:id` – update <br> `DELETE /repo/:id` – delete <br> `GET /search?q=` – AI search | Imported in Dashboard, SearchResults, Explore, Home |
| `fileService` | `GET /files/:repoId` – list files <br> `POST /files/:repoId/upload` – upload files <br> `POST /files/:repoId/import-zip` – extract ZIP | Used in Dashboard upload flow |
| `authService` | `POST /auth/login` <br> `POST /auth/register` | Used in Auth page |

All services return a response shape:  

```json
{
  "is_success": true,
  "response": { ... },
  "errors": [ "Error message" ]
}
```

Error handling in the UI checks `is_success` and displays the first error message if present.

---  

## Environment Variables  

Create a `.env` file at the project root:

```dotenv
VITE_API_BASE_URL=https://api.yourdomain.com   # Vite prefix (VITE_) required
# Example for CRA:
# REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

The `api.js` file reads this variable to configure the Axios base URL.

---  

## Testing  

The repository does **not** include a test suite out‑of‑the‑box. To add tests:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Create `src/__tests__/` and write component/unit tests using React Testing Library. Adjust `package.json` scripts:

```json
"scripts": {
  "test": "jest"
}
```

---  

## Contributing  

1. Fork the repository.  
2. Create a feature branch: `git checkout -b feature/awesome-feature`.  
3. Install dependencies (`npm install`).  
4. Make your changes, ensuring the UI remains responsive and accessible.  
5. Run the linter (if configured) and tests.  
6. Commit with a clear message and push to your fork.  
7. Open a Pull Request describing the changes.

> **Style guide:** Follow the existing code conventions – functional components, hooks, camelCase for variables, and PascalCase for component names.  

---  

## License  

This project is licensed under the **MIT License** – see the `LICENSE` file for details.  



---  

*Happy coding! 🚀*