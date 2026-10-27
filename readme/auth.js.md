# auth.js — Real Password Authentication & Page Session Gating

## File Purpose
`auth.js` manages creator account registration, real non-cosmetic password verification, active session tracking, and security page gating across `login.html`, `dashboard.html`, `posts.html`, and `ideas.html`.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.auth`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.auth = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `getAccounts()`
- **Purpose**: Reads all registered user accounts from `localStorage` under `contentos:accounts`.
- **Return Type**: Object dictionary `{ handle_name: { handle, password, niche, createdAt } }`.

---

### 2. `login(handle, password)`
- **Purpose**: Authenticates an existing user account with password verification.
- **Parameters**: `handle` (String), `password` (String).
- **Logic Flow**:
  1. Checks if `accounts[cleanHandle]` exists. If missing, returns error `{ success: false, error: 'Account @handle does not exist. Please register first.' }`.
  2. Verifies `account.password === cleanPass`. Returns error `{ success: false, error: 'Incorrect password for @handle' }` if invalid.
  3. Saves session object `{ handle, loggedInAt }` under `contentos:session`.
  4. Saves profile object under `contentos:profile:@handle`.
- **Return Type**: Object `{ success: Boolean, session: Object, error: String }`.

---

### 3. `register(handle, password, niche, initialFollowers)`
- **Purpose**: Registers a new creator account and sets their initial monthly follower count.
- **Parameters**: `handle` (String), `password` (String), `niche` (String), `initialFollowers` (Number).
- **Logic Flow**:
  1. Validates handle ($\ge 2$ chars), password ($\ge 4$ chars), and follower count ($\ge 1$).
  2. Checks if `accounts[cleanHandle]` already exists. If yes, returns error `{ success: false, error: 'Account @handle already exists. Please login instead.' }`.
  3. Saves new account in `contentos:accounts`.
  4. Saves session token and profile data.
  5. Calls `App.followersStore.setMonthlyFollowers(initialFollowers)` to record creator followers immediately.
- **Return Type**: Object `{ success: Boolean, session: Object, error: String }`.

---

### 3. `getSession()`
- **Purpose**: Reads the current active session object from `contentos:session`.
- **Return Type**: Session Object or `null`.

---

### 4. `logout()`
- **Purpose**: Clears active session and redirects creator to `login.html`.
- **Implementation**: Deletes `contentos:session` from `localStorage` and sets `window.location.href = 'login.html'`.

---

### 5. `requireAuth()`
- **Purpose**: Security gate function called on load by protected pages (`dashboard.html`, `posts.html`, `ideas.html`).
- **Logic Flow**: Checks `getSession()`. If session is missing or `null`, executes `window.location.href = 'login.html'`.
- **Return Type**: Session Object if authenticated; `null` if unauthenticated.

---

### 6. `redirectIfAuthenticated()`
- **Purpose**: Function called on load by `login.html` / `index.html`.
- **Logic Flow**: Checks `getSession()`. If session exists, automatically redirects creator to `dashboard.html`.
