# 01. Project Overview, Model Working & Walkthrough

## Executive Summary
**ContentOS** is a privacy-first content strategy workspace and predictive analytics engine built for social media creators (Instagram Reels, Carousels, Static Posts, and YouTube Shorts).

Unlike conventional analytics tools that require third-party Meta/Instagram Graph API tokens or OAuth authentication, ContentOS operates **100% locally** within the browser. It combines local post logs with monthly follower records to predict:
- **Optimal Posting Days & Time Slots** (Monday through Sunday).
- **Viral Potential Index Scores** (0–100) before publishing.
- **Estimated Reach Velocity Ranges** (lower and upper bounds).
- **Audience Indulgence & Craving Indexes** (audience fan loyalty and format demand).

---

## Core Predictive Models

### 1. Viral Potential Index Score Model (0–100)
The Viral Index Score measures the predicted reach potential of a candidate caption hook before posting.

- **Base Score**: 65 points.
- **Hook Title Length**: +12 points if length is between 18 and 65 characters; +6 points if > 5 characters.
- **Power Keywords**: Matches against 12 viral triggers (`how`, `mistake`, `secret`, `rule`, `setup`, `shortcut`, `top`, `doubled`, `why`, `fix`, `best`, `guide`), adding +7 points per match (up to +16 max).
- **Format Bonus**: Reel (+14 points), Carousel (+10 points), Static (+4 points).
- **Topic Alignment**: +8 points for tech/workflow keywords (`tool`, `tech`, `workflow`, `focus`).
- **Score Clamping**: Restricts output strictly between 50 and 98 points using `Math.min(98, Math.max(50, score))`.

---

### 2. Estimated Reach Range & Engagement Rate Model
Using the creator's total monthly followers ($F$) and Viral Score ($S$):

- **Minimum Estimated Reach**:
  $$\text{Min Reach} = \text{Round}\left( F \times \frac{S}{100} \times 0.75 \right)$$

- **Maximum Estimated Reach**:
  $$\text{Max Reach} = \text{Round}\left( F \times \frac{S}{100} \times 1.45 \right)$$

- **Predicted Engagement Rate %**:
  $$\text{Predicted Eng Rate} = (6.5 + (S \times 0.08))\%$$

---

### 3. Audience Indulgence Index Model (%)
Measures comment depth, shares, and likes relative to reach:

- **Weighted Interaction Score**:
  $$\text{Weighted Score} = \text{Likes} + (\text{Comments} \times 2.5) + (\text{Shares} \times 3.0)$$

- **Indulgence Score**:
  $$\text{Indulgence Score} = \text{Clamp}_{45}^{99}\left( 50 + \left( \frac{\text{Avg Weighted Score}}{\text{Monthly Followers}} \right) \times 3.8 \right)$$

- **Loyalty Classification Levels**:
  - $\ge 85\%$: `Viral Fanaticism`
  - $72\% - 84\%$: `High Indulgence`
  - $60\% - 71\%$: `Steady Audience`
  - $< 60\%$: `Moderate Resonance`

---

### 4. Day-of-Week 7-Day Prediction Model
Groups historical logged posts into 7 days of the week (**Monday through Sunday**) to generate:
- **Optimal Time Slot**: Identifies peak reach hours per day (e.g. *Tuesday @ 06:00 PM*).
- **Best Niche & Format**: Identifies top performing topic and format for that specific day.
- **Day Viral Score & Reach Projection**: Calculates projected reach for each day.

---

## Step-by-Step Creator Walkthrough

### 1. Real Password Authentication with Login/Register Tabs (`login.html` / `js/auth.js`)
- **Explicit Auth Tabs**: Provides distinct **Login** and **Register** mode toggles on the entrance card.
- **Login Mode**: Accepts Creator Handle (`@username`) and Password. Validates account existence and checks password.
- **Register Mode**: Accepts Creator Handle, Niche, **Current Monthly Followers Count**, and Password. Saves the creator's real initial follower count immediately upon account creation.
- **Security Gating**: Direct visits to `dashboard.html`, `posts.html`, or `ideas.html` verify session status. Unauthenticated visits automatically redirect to `login.html`.

### 2. Privacy-First Monthly Followers Tracker (`js/followersStore.js`)
- **Real Follower Input**: Requires creators to set their real follower count during registration or via an initial setup banner on the dashboard. No random hardcoded default numbers are assumed.
- All audience indulgence scores, reach multipliers, and prediction models dynamically compute based on the creator's real follower count. **7-Day Prediction Grid (Mon–Sun)** to decide which day and time to post.
   - Creator tests candidate titles in the **Precision Post Performance Predictor Widget** to view real-time viral index scores.

3. **Logging Posts (`posts.html`)**:
   - Creator logs published posts with Title, Format, Topic, Date, Likes, Comments, Shares, and Reach.
   - Analytics automatically recalculate across all graphs and predictions.

4. **Generating Strategy Hooks (`ideas.html`)**:
   - Creator selects their niche (`Tech`, `Fitness`, `Food`, `Lifestyle`, `Fashion`, `Education`) to generate creative content hooks.
