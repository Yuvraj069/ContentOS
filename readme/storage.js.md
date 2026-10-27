# storage.js — Storage Engine & LocalStorage Manager

## File Purpose
`storage.js` provides a safe, centralized abstraction wrapper over the browser's `localStorage` API. It handles JSON serialization, key namespacing by creator handle, error trapping, and data retrieval defaults.

---

## Code Architecture & Scope
Wrapped in an Immediately Invoked Function Expression (IIFE) attached to `window.ContentOS`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.storage = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `get(key, defaultValue)`
- **Purpose**: Safely retrieves and parses JSON data from `localStorage`.
- **Parameters**: 
  - `key` (String): Storage key name.
  - `defaultValue` (Any): Fallback value if key is missing or corrupted.
- **Return Type**: Parsed JavaScript object/array/value or `defaultValue`.
- **Implementation**:
  ```javascript
  get: function (key, defaultValue) {
    try {
      var item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  ```

---

### 2. `set(key, value)`
- **Purpose**: Serializes and writes data to `localStorage`.
- **Parameters**:
  - `key` (String): Storage key name.
  - `value` (Any): Data to store.
- **Return Type**: `Boolean` (`true` if successful, `false` on storage quota error).
- **Implementation**:
  ```javascript
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
  ```

---

### 3. `remove(key)`
- **Purpose**: Deletes a key from `localStorage`.
- **Parameters**: `key` (String).
- **Return Type**: `void`.

---

### 4. `getUserKey(baseKey)`
- **Purpose**: Generates a user-isolated storage key scoped to the active handle in session.
- **Parameters**: `baseKey` (String) e.g., `'contentos:posts'`.
- **Return Type**: `String` e.g., `'contentos:posts:creator_demo'`.
- **Implementation**: Reads active session handle from `contentos:session`. Appends `:@handle` if logged in.
