# postsStore.js — Logged Posts CRUD Data Store

## File Purpose
`postsStore.js` provides CRUD (Create, Read, Update, Delete) data operations for creator logged posts stored in user-isolated `localStorage` keys.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.postsStore`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.postsStore = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `getAll()`
- **Purpose**: Retrieves all logged posts for the active session handle.
- **Return Type**: Array of Post Objects.
- **Implementation**: Reads from key `contentos:posts:@handle`. If empty, returns pre-populated sample posts array so initial dashboard charts render cleanly.

---

### 2. `saveAll(posts)`
- **Purpose**: Writes the complete array of posts to `localStorage`.
- **Parameters**: `posts` (Array).
- **Return Type**: `Boolean`.

---

### 3. `add(postData)`
- **Purpose**: Creates and appends a new post record.
- **Parameters**: `postData` (Object) containing `title`, `format`, `topic`, `date`, `likes`, `comments`, `shares`, `reach`.
- **ID Generation**: Generates unique ID: `'post_' + Date.now() + '_' + Math.floor(Math.random() * 1000)`.
- **Return Type**: Newly created Post Object.

---

### 4. `update(id, updatedData)`
- **Purpose**: Modifies an existing post record by ID.
- **Parameters**: `id` (String), `updatedData` (Object).
- **Return Type**: Updated Post Object or `null`.

---

### 5. `remove(id)`
- **Purpose**: Deletes a post record by ID.
- **Parameters**: `id` (String).
- **Return Type**: `Boolean` (`true` if deleted, `false` if not found).
