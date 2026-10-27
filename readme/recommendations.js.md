# recommendations.js — Overall Analytics & Best Performance Recommendations Engine

## File Purpose
`recommendations.js` computes summary post statistics, average engagement rates, best content format, top performing day of week, and top topic keyword from logged posts.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.recommendations`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.recommendations = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `getStats(posts)`
- **Purpose**: Calculates total posts count, total reach, total engagement, and overall average engagement rate %.
- **Parameters**: `posts` (Array).
- **Formula**:
  $$\text{Post Engagement Rate} = \frac{\text{Likes} + \text{Comments} + \text{Shares}}{\text{Reach}}$$
  $$\text{Average Engagement Rate} = \left( \frac{\sum \text{Post Engagement Rate}}{\text{Total Posts}} \right) \times 100$$
- **Return Type**: Object `{ totalPosts: Number, totalReach: Number, avgEngagement: String }`.

---

### 2. `getTopFacts(posts)`
- **Purpose**: Identifies the top performing format, best day of week, and top topic from post history.
- **Parameters**: `posts` (Array).
- **Logic Flow**:
  1. Groups posts by `format` (`Reel`, `Carousel`, `Static`), `day` (`Monday` - `Sunday`), and `topic`.
  2. Computes average engagement rate for each format, day, and topic group.
  3. Identifies the max average for each category.
- **Return Type**: Object `{ bestFormat: String, bestDay: String, topTopic: String }` or `null` if posts count < 3.
