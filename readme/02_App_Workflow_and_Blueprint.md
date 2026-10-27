# 02. Application Workflow, Page Linkage Blueprint & System Architecture

## System Navigation Blueprint

ContentOS uses a multi-page interlinked HTML architecture gated by session authentication:

```
                      [ login.html / index.html ]
                                   │
                           (Password Auth)
                                   ▼
        ┌──────────────────────────┴──────────────────────────┐
        │                                                     │
        ▼                                                     ▼
 [ dashboard.html ] ◄──────────► [ posts.html ] ◄──────────► [ ideas.html ]
 (Analytics & Predictions)     (Post Log & CRUD)         (Content Hooks Generator)
```

---

## Page-by-Page Interlinkage & Access Control

1. **`index.html` / `login.html`**:
   - **Entry Point**: Serves as the authentication gateway.
   - **Pre-check**: Executes `App.auth.redirectIfAuthenticated()`. If a valid session exists in `localStorage`, automatically redirects to `dashboard.html`.
   - **Login Submission**: On form submit, calls `App.auth.login(handle, password, niche)`. Validates credentials and redirects to `dashboard.html`.

2. **`dashboard.html`**:
   - **Protection**: Executes `App.auth.requireAuth()` on load. If session is missing/invalid, redirects back to `login.html`.
   - **Navigation Bar**: Hyperlink buttons to `dashboard.html` (active), `posts.html`, and `ideas.html`.
   - **Header Logout**: Clicking `Log Out` calls `App.auth.logout()`, clears session, and redirects to `login.html`.

3. **`posts.html`**:
   - **Protection**: Executes `App.auth.requireAuth()` on load.
   - **Navigation Bar**: Hyperlink buttons to `dashboard.html`, `posts.html` (active), and `ideas.html`.
   - **Post Management**: Interacts with `App.postsStore` to add, edit, or delete posts.

4. **`ideas.html`**:
   - **Protection**: Executes `App.auth.requireAuth()` on load.
   - **Navigation Bar**: Hyperlink buttons to `dashboard.html`, `posts.html`, and `ideas.html` (active).
   - **Idea Generation**: Calls `App.ideaEngine.generateIdea(niche)` using `fetch()` with local fallback.

---

## State Management & LocalStorage Key Schema

All application state is persisted locally using JSON serialization in `localStorage`:

| LocalStorage Key | Data Type | Purpose |
| :--- | :--- | :--- |
| `contentos:accounts` | Object | Stores registered user credentials (`handle`, `password`, `niche`, `createdAt`). |
| `contentos:session` | Object | Stores active user session (`handle`, `loggedInAt`). |
| `contentos:profile:@handle` | Object | User profile details (`handle`, `niche`). |
| `contentos:posts:@handle` | Array | Array of logged post objects (`id`, `title`, `format`, `topic`, `date`, `likes`, `comments`, `shares`, `reach`). |
| `contentos:followers:@handle` | Object | Monthly follower count records (`count`, `month`). |
| `contentos:theme` | String | Active UI theme preference (`"dark"` or `"light"`). |

---

## Application Bootstrapping Sequence

1. **DOM Load Event**: Browser fires `DOMContentLoaded`.
2. **Module Initialization**: Script tags load core modules (`storage.js`, `validators.js`, `postsStore.js`, `followersStore.js`, `recommendations.js`, `ideaEngine.js`, `indulgenceEngine.js`, `analyticsEngine.js`, `auth.js`, `main.js`).
3. **Session Verification**: Page script calls `App.auth.requireAuth()` or `App.auth.redirectIfAuthenticated()`.
4. **App Shell Rendering**: `App.main.renderAppShell(pageName, appEl)` reads saved theme, attaches sticky glassmorphic navigation header, and initializes page view containers.
5. **Dynamic Metric Calculation**: Analytics engines compute real-time numbers, SVG vector charts, and 7-day predictions grid.
