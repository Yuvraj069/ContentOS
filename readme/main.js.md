# main.js — App Orchestrator & View Renderer

## File Purpose
`main.js` is the master view orchestrator of ContentOS. It handles theme toggling (`light`/`dark`), renders top navigation app shells, attaches DOM event handlers, and renders content across `login.html`, `dashboard.html`, `posts.html`, and `ideas.html`.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.main`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.main = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `init()`
- **Purpose**: App startup handler. Initializes saved theme setting from `localStorage`.

---

### 2. `initTheme()`
- **Purpose**: Reads saved theme (`"dark"` or `"light"`) from `localStorage` under `contentos:theme` and sets `data-theme` attribute on `document.body`.

---

### 3. `toggleTheme()`
- **Purpose**: Switches `data-theme` between `"dark"` and `"light"`, updates all `.theme-toggle-btn` elements, and saves choice in `localStorage`.

---

### 4. `renderAppShell(pageName, appEl)`
- **Purpose**: Builds and attaches the top sticky glassmorphic navigation header (`Dashboard`, `Post Log`, `Ideas`, `@user` handle pill, Theme Toggle button, Log Out button) and injects `<main id="viewContainer">`.
- **Parameters**: `pageName` (String: `'dashboard'`, `'posts'`, `'ideas'`), `appEl` (DOM Element).

---

### 5. `renderLoginView(container)`
- **Purpose**: Renders the login card on `login.html` / `index.html`. Attaches submit handler to call `App.auth.login(handle, password, niche)`. Shows validation/error messages and redirects to `dashboard.html` on success.

---

### 6. `renderDashboardView(container)`
- **Purpose**: Renders monthly followers update box, key metrics row, 7-Day Prediction Grid (Mon–Sun), SVG Reach Velocity graph, Format Efficiency bar chart, Precision Predictor widget, and Indulgence Matrix. Attaches live input event listeners to recalculate predictions in real-time.

---

### 7. `renderPostsView(container)`
- **Purpose**: Renders the post log form and list on `posts.html`. Attaches form validation, post edit, and post deletion handlers.

---

### 8. `renderIdeasView(container)`
- **Purpose**: Renders the strategy idea generator on `ideas.html`. Attaches niche selection and idea generation button handlers.
