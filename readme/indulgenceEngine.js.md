# indulgenceEngine.js — Audience Indulgence & Format Craving Engine

## File Purpose
`indulgenceEngine.js` calculates the Audience Indulgence Index (%) by weighting high-intent interactions (comments 2.5x, shares 3x, likes 1x) relative to reach and monthly followers. It also calculates topic demand and format craving chips.

---

## Code Architecture & Scope
Wrapped in an IIFE attached to `window.ContentOS.indulgenceEngine`:

```javascript
window.ContentOS = window.ContentOS || {};
(function (App) {
  'use strict';
  App.indulgenceEngine = { ... };
})(window.ContentOS);
```

---

## Function Breakdown

### 1. `calculateIndulgence(igData, posts)`
- **Purpose**: Computes audience indulgence score %, loyalty level, topic breakdown %, and format cravings %.
- **Parameters**: `igData` (Object), `posts` (Array).
- **Calculation Logic**:
  1. Computes weighted score per post:
     $$\text{Weighted Score} = \text{Likes} + (\text{Comments} \times 2.5) + (\text{Shares} \times 3.0)$$
  2. Computes average weighted interactions across logged posts.
  3. Computes engagement ratio relative to total monthly followers ($F$):
     $$\text{Engagement Ratio \%} = \left( \frac{\text{Avg Interactions}}{F} \right) \times 100$$
  4. Calculates Indulgence Score clamped between 45% and 99%:
     $$\text{Indulgence Score} = \text{Clamp}_{45}^{99}\Big( 50 + (\text{Engagement Ratio} \times 3.8) \Big)$$
  5. Maps score to Level:
     - $\ge 85\%$: `Viral Fanaticism`
     - $72\% - 84\%$: `High Indulgence`
     - $60\% - 71\%$: `Steady Audience`
     - $< 60\%$: `Moderate Resonance`
- **Return Type**: Object `{ indulgenceScore: Number, level: String, nicheBreakdown: Object, formatCraving: Object }`.
