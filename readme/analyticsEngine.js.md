# analyticsEngine.js — Predictive Analytics & SVG Vector Charts Engine

## File Purpose
`analyticsEngine.js` contains the mathematical prediction algorithms for Viral Index Scores (0–100), 7-Day Day-of-Week (Mon–Sun) predictions, and dynamic native SVG line/bar graph generators.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.analyticsEngine`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.analyticsEngine = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `predictPostPerformance(title, format, topic)`
- **Purpose**: Calculates predicted viral score, reach bounds, and engagement rate for draft post hooks.
- **Parameters**: `title` (String), `format` (String), `topic` (String).
- **Mathematical Formula**:
  - Base Score: `65`.
  - Length Bonus: `+12` (18–65 chars); `+6` (> 5 chars).
  - Power Keyword Bonus: Matches 12 viral triggers (`how`, `mistake`, `secret`, `rule`, `setup`, `shortcut`, `top`, `doubled`, `why`, `fix`, `best`, `guide`), adding `+7` per match (up to `+16` max).
  - Format Bonus: `Reel` (+14), `Carousel` (+10), `Static` (+4).
  - Topic Bonus: `+8` for tech/workflow terms.
  - Clamping: `Math.min(98, Math.max(50, score))`.
- **Reach & Engagement Output**:
  - Min Reach: $\text{Round}(\text{Followers} \times \frac{\text{Score}}{100} \times 0.75)$
  - Max Reach: $\text{Round}(\text{Followers} \times \frac{\text{Score}}{100} \times 1.45)$
  - Predicted Eng Rate: $(6.5 + (\text{Score} \times 0.08))\%$
- **Return Type**: Object `{ score: Number, predictedReach: String, predictedEngRate: String, tips: Array }`.

---

### 2. `getWeeklyDayPredictions(userPosts)`
- **Purpose**: Groups posts by day of the week (Monday through Sunday) to calculate optimal posting times, best formats, best topics, and projected reach.
- **Parameters**: `userPosts` (Array).
- **Return Type**: Array of 7 Day Prediction Objects `[ { day: 'Monday', bestFormat, bestTopic, bestTime, avgReach, viralScore, suggestedHook }, ... ]`.

---

### 3. `renderPerformanceTrendChart(userPosts)`
- **Purpose**: Generates dynamic vector SVG path strings for the Reach Velocity Line Chart with gradient area fill (`url(#reachGrad)`).
- **Parameters**: `userPosts` (Array).
- **Return Type**: SVG Markup String.

---

### 4. `renderFormatEfficiencyChart(userPosts)`
- **Purpose**: Generates dynamic vector SVG bar chart comparing average reach across `Reel`, `Carousel`, and `Static`.
- **Parameters**: `userPosts` (Array).
- **Return Type**: SVG Markup String.
