# validators.js — Data Input Validation & Sanitization Engine

## File Purpose
`validators.js` ensures input data integrity before saving accounts, logging posts, or processing metrics. It sanitizes strings and checks numerical constraints to prevent runtime errors.

---

## Code Architecture & Scope
Wrapped inside an IIFE attached to `window.ContentOS.validators`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.validators = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `validateHandle(handle)`
- **Purpose**: Validates and sanitizes a creator username.
- **Parameters**: `handle` (String).
- **Validation Rules**:
  - Trims whitespace.
  - Strips leading `@` characters using `.replace(/^@+/, '')`.
  - Converts to lowercase.
  - Checks if length is at least 2 characters.
- **Return Type**: Object `{ valid: Boolean, cleanHandle: String, error: String }`.

---

### 2. `validatePost(post)`
- **Purpose**: Validates all fields of a post entry before saving to `postsStore`.
- **Parameters**: `post` (Object) containing `title`, `date`, `likes`, `comments`, `shares`, `reach`.
- **Validation Rules**:
  - `title`: Must be non-empty after trimming.
  - `date`: Must be a valid date string.
  - `likes`, `comments`, `shares`: Must be non-negative integers ($\ge 0$).
  - `reach`: Must be a positive integer ($\ge 1$).
- **Return Type**: Object `{ valid: Boolean, errors: Array }`.
