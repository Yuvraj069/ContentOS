# followersStore.js — Monthly Followers Data Store

## File Purpose
`followersStore.js` manages creator monthly follower count records in browser `localStorage`. Follower counts directly drive Audience Indulgence Index calculations, reach multipliers, and day predictions.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.followersStore`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.followersStore = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `getCurrentMonthKey()`
- **Purpose**: Generates a current month string key using JavaScript's native `Date` object.
- **Return Type**: `String` e.g. `"Aug 2026"`.
- **Implementation**:
  ```javascript
  getCurrentMonthKey: function () {
    var now = new Date();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[now.getMonth()] + ' ' + now.getFullYear();
  }
  ```

---

### 2. `getLatestFollowers()`
- **Purpose**: Retrieves the active creator's follower count for the current month.
- **Return Type**: `Number` (e.g. `12500`).
- **Implementation**: Reads from user-isolated key `contentos:followers:@handle`. If missing or empty, returns default `12500`.

---

### 3. `setMonthlyFollowers(count)`
- **Purpose**: Saves or updates the creator's follower count for the current month.
- **Parameters**: `count` (Number).
- **Logic Flow**: Saves object `{ count: Number(count), month: getCurrentMonthKey(), updatedAt: Date.now() }` into `localStorage`.
- **Return Type**: `Number` (saved follower count).
