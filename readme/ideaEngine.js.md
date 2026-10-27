# ideaEngine.js — Content Strategy Hook Generator & Advice Fetcher

## File Purpose
`ideaEngine.js` generates creative post hooks and content ideas tailored to creator niches (`Tech`, `Fitness`, `Food`, `Lifestyle`, `Fashion`, `Education`). It fetches random advice quotes via browser `fetch()` API with automatic local fallback.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.ideaEngine`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.ideaEngine = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `generateIdea(niche)`
- **Purpose**: Generates a content hook idea object by combining niche templates with motivational advice.
- **Parameters**: `niche` (String) e.g. `"Tech"`.
- **Logic Flow**:
  1. Requests random quote from `https://api.adviceslip.com/advice` using `fetch()` and `async/await`.
  2. If network succeeds, extracts advice string `data.slip.advice`.
  3. If network fails/offline, catches error and selects quote from built-in `localQuotes` array.
  4. Merges quote with niche-specific hook templates.
- **Return Type**: `Promise<Object>` resolving to `{ niche, format, hookTitle, quote, advice }`.
