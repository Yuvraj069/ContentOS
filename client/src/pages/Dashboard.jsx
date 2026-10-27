import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import StatCard from '../components/StatCard';
import api from '../api';

// Ported from main.js renderDashboardView — same sections, same charts, same predictor widget
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Followers panel
  const [showFollowersPanel, setShowFollowersPanel] = useState(false);
  const [followerInput, setFollowerInput] = useState('');
  const [followerSaving, setFollowerSaving] = useState(false);

  // Predictor widget (controlled inputs)
  const [predTitle, setPredTitle] = useState('10 Minimalist Desk Setup Items That Doubled My Focus');
  const [predFormat, setPredFormat] = useState('Reel');
  const [predTopic, setPredTopic] = useState('Productivity Systems');
  const [predResult, setPredResult] = useState(null);
  const [predLoading, setPredLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/summary');
      setData(res.data);
      setFollowerInput(res.data.followers || '');
    } catch (err) {
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Run predictor on input changes
  useEffect(() => {
    const run = async () => {
      if (!predTitle && !predFormat) return;
      setPredLoading(true);
      try {
        const res = await api.post('/api/analytics/predict', {
          title: predTitle,
          format: predFormat,
          topic: predTopic
        });
        setPredResult(res.data);
      } catch {
        // silent
      } finally {
        setPredLoading(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [predTitle, predFormat, predTopic]);

  async function saveFollowers() {
    const val = Number(followerInput);
    if (!val || val < 1) return;
    setFollowerSaving(true);
    try {
      await api.put('/api/followers', { count: val });
      await fetchDashboard();
      setShowFollowersPanel(false);
    } catch {
      // silent
    } finally {
      setFollowerSaving(false);
    }
  }

  async function saveBannerFollowers(val) {
    if (!val || Number(val) < 1) return;
    try {
      await api.put('/api/followers', { count: Number(val) });
      await fetchDashboard();
    } catch {
      // silent
    }
  }

  if (loading) return (
    <div data-theme={undefined}>
      <NavBar />
      <main className="app-body"><div className="page-container"><p style={{ color: 'var(--text-dim)' }}>Loading dashboard...</p></div></main>
    </div>
  );

  if (error) return (
    <div>
      <NavBar />
      <main className="app-body"><div className="page-container"><div className="error-banner"><p>{error}</p></div></div></main>
    </div>
  );

  const { stats, indulgence, weeklyPredictions, trendChart, formatEfficiency, followers, totalPosts } = data;
  const isFollowersSet = !!followers && followers > 0;

  // Get current month key
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const currentMonthKey = monthNames[now.getMonth()] + ' ' + now.getFullYear();

  // Build SVG trend chart from server data
  function renderTrendChart() {
    if (!trendChart || trendChart.empty || !trendChart.points || trendChart.points.length === 0) {
      return <div className="empty-recs-box"><p>Log your first post to see real-time reach trajectory graphs.</p></div>;
    }
    const { points, width, height, padding, chartW, chartH } = trendChart;
    let reachPath = `M ${points[0].x} ${points[0].y}`;
    let reachArea = `M ${points[0].x} ${padding.top + chartH} L ${points[0].x} ${points[0].y}`;
    for (let p = 1; p < points.length; p++) {
      reachPath += ` L ${points[p].x} ${points[p].y}`;
      reachArea += ` L ${points[p].x} ${points[p].y}`;
    }
    reachArea += ` L ${points[points.length - 1].x} ${padding.top + chartH} Z`;

    return (
      <div className="svg-chart-wrapper">
        <div className="chart-header-legend">
          <span className="chart-title">Reach Velocity Curve</span>
          <span className="legend-item reach-legend"><span className="dot"></span> Logged Posts Reach</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
          <defs>
            <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} className="chart-grid-line" />
          <line x1={padding.left} y1={padding.top + chartH * 0.5} x2={width - padding.right} y2={padding.top + chartH * 0.5} className="chart-grid-line" />
          <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} className="chart-grid-line" />
          <path d={reachArea} fill="url(#reachGrad)" />
          <path d={reachPath} className="chart-path-reach" />
          {points.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="5" className="chart-dot">
              <title>{pt.title} ({Number(pt.reach).toLocaleString()} reach)</title>
            </circle>
          ))}
        </svg>
      </div>
    );
  }

  // Build format efficiency bars
  function renderFormatBars() {
    if (!formatEfficiency) return null;
    const { avgs, maxAvgReach } = formatEfficiency;
    const colors = { Reel: 'var(--primary)', Carousel: 'var(--accent)', Static: '#8B5CF6' };
    return (
      <div className="ideas-card-box">
        <h3 className="box-subtitle">📊 Format Efficiency Analysis</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Average reach achieved per post format in your log.</p>
        <div className="format-bars-container">
          {['Reel', 'Carousel', 'Static'].map(fmt => {
            const val = avgs[fmt] || 1000;
            const pct = Math.max(12, Math.round((val / (maxAvgReach || 1)) * 100));
            return (
              <div key={fmt} className="format-bar-row">
                <span className="fmt-bar-name">{fmt}</span>
                <div className="fmt-bar-track">
                  <div className="fmt-bar-fill" style={{ width: pct + '%', background: colors[fmt] }}></div>
                </div>
                <span className="fmt-bar-val">{val.toLocaleString()} avg reach</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <main className="app-body" id="viewContainer">
        <div className="page-container">

          {/* Followers setup banner */}
          {!isFollowersSet && (
            <div className="form-card-box highlight-card" style={{ border: '2px solid var(--primary)', marginBottom: 'var(--space-6)' }}>
              <h3>Welcome! Set Your Follower Count</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                Please enter your current total followers for <strong>{currentMonthKey}</strong> so ContentOS can calculate exact reach predictions for your posts.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Current Total Followers *</label>
                  <input
                    type="number"
                    id="bannerFollowerInput"
                    className="form-input"
                    placeholder="e.g. 5000"
                    value={followerInput}
                    onChange={e => setFollowerInput(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    id="saveBannerFollowersBtn"
                    className="btn btn-primary btn-full"
                    onClick={() => saveBannerFollowers(followerInput)}
                  >
                    Save &amp; Calculate Predictions
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="page-header flex-between">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Monthly followers tracking, day-of-week niche predictions, and post log performance analytics.</p>
            </div>
            <div className="ig-sync-box">
              <button id="updateFollowersBtn" className="btn btn-primary btn-sm" onClick={() => setShowFollowersPanel(p => !p)}>
                Update Monthly Followers
              </button>
            </div>
          </div>

          {/* Monthly Followers Update Panel */}
          {showFollowersPanel && (
            <div id="followersConfigPanel" className="form-card-box" style={{ marginBottom: 'var(--space-6)' }}>
              <h3>Update Monthly Followers Record</h3>
              <p style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-dim)' }}>
                Enter your follower count for <strong>{currentMonthKey}</strong>. All indulgence metrics and predictions will recalculate automatically.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Month &amp; Year</label>
                  <input type="text" className="form-input" value={currentMonthKey} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Followers *</label>
                  <input
                    type="number"
                    id="followerCountInput"
                    className="form-input"
                    placeholder="e.g. 15000"
                    value={followerInput}
                    onChange={e => setFollowerInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button id="saveFollowersBtn" className="btn btn-primary btn-sm" onClick={saveFollowers} disabled={followerSaving}>
                  {followerSaving ? 'Saving...' : 'Save Followers Count'}
                </button>
              </div>
            </div>
          )}

          {/* Key Metrics Row */}
          <div className="stats-row">
            <StatCard
              label={`Followers (${currentMonthKey})`}
              value={isFollowersSet ? Number(followers).toLocaleString() : 'Not Set'}
              sublabel={isFollowersSet ? 'Tracked Monthly' : 'Action Required'}
              highlight={true}
            />
            <StatCard
              label="Audience Indulgence Index"
              value={indulgence?.indulgenceScore + '%'}
              sublabel={indulgence?.level}
            />
            <StatCard
              label="Total Logged Posts"
              value={stats?.totalPosts || 0}
              sublabel={'Average Eng: ' + (stats?.avgEngagement || 0) + '%'}
            />
          </div>

          {/* Day-of-Week 7-Day Predictions Grid */}
          <div className="section-container">
            <h2 className="section-title">Day-of-Week Niche &amp; Time Predictions (Mon - Sun)</h2>
            <p className="page-subtitle" style={{ marginTop: '-8px', marginBottom: '16px' }}>
              Specific time, format, and niche predictions for each day based on past post performance.
            </p>
            <div className="weekly-predictions-grid">
              {(weeklyPredictions || []).map(wp => (
                <div key={wp.day} className="day-pred-card">
                  <div className="day-pred-header">
                    <span className="day-name">{wp.day}</span>
                    <span className="day-score-pill">Score: {wp.viralScore}</span>
                  </div>
                  <div className="day-best-time">Best Time: {wp.bestTime}</div>
                  <div className="day-niche-tag">Niche: <strong>{wp.bestTopic}</strong></div>
                  <div className="day-format-tag">Format: <span className="badge badge-reel">{wp.bestFormat}</span></div>
                  <div className="day-est-reach">Est. Reach: ~{Number(wp.avgReach).toLocaleString()}</div>
                  <div className="day-hook-box">{wp.suggestedHook}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Graphs */}
          <div className="section-container">
            <h2 className="section-title">Reach Trajectory &amp; Format Graphs</h2>
            <p className="page-subtitle" style={{ marginTop: '-8px', marginBottom: '16px' }}>Mathematical curve analysis of your logged posts.</p>
            <div className="graphs-grid">
              {renderTrendChart()}
              {renderFormatBars()}
            </div>
          </div>

          {/* Precision Post Predictor */}
          <div className="section-container">
            <h2 className="section-title">Precision Post Performance Predictor</h2>
            <p className="page-subtitle" style={{ marginTop: '-8px', marginBottom: '16px' }}>
              Test candidate post titles and formats to calculate an exact prediction score before publishing.
            </p>
            <div className="predictor-wrapper ideas-card-box">
              <div className="predictor-form">
                <div className="form-group">
                  <label className="form-label">Draft Post Caption / Title Hook</label>
                  <input
                    type="text"
                    id="predTitleInput"
                    className="form-input"
                    value={predTitle}
                    onChange={e => setPredTitle(e.target.value)}
                    placeholder="e.g. 5 Morning Habits That Saved Me 10 Hours A Week"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Format</label>
                    <select id="predFormatSelect" className="form-select" value={predFormat} onChange={e => setPredFormat(e.target.value)}>
                      <option value="Reel">Reel (Short Video)</option>
                      <option value="Carousel">Carousel (Multi-Slide)</option>
                      <option value="Static">Single Image Static</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Niche / Topic</label>
                    <input
                      type="text"
                      id="predTopicInput"
                      className="form-input"
                      value={predTopic}
                      onChange={e => setPredTopic(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div id="predResultBox" className="predictor-result-box">
                {predLoading ? (
                  <p style={{ color: 'var(--text-dim)' }}>Calculating...</p>
                ) : predResult ? (
                  <>
                    <div className="pred-score-badge">
                      <span className="score-num" id="predScoreVal">{predResult.score}</span>
                      <span className="score-label">Viral Index / 100</span>
                    </div>
                    <div className="pred-details">
                      <div className="pred-metric"><span>Est. Reach:</span> <strong id="predReachVal">{predResult.predictedReach}</strong></div>
                      <div className="pred-metric"><span>Est. Engagement Rate:</span> <strong id="predEngVal">{predResult.predictedEngRate}</strong></div>
                      <div className="pred-tips" id="predTipsBox">
                        {(predResult.tips || []).map((tip, i) => <div key={i}>{tip}</div>)}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Follower Indulgence Breakdown */}
          <div className="section-container">
            <h2 className="section-title">Follower Indulgence &amp; Craving Matrix</h2>
            <div className="indulgence-grid">
              <div className="ideas-card-box">
                <h3 className="box-subtitle">Topic Indulgence Breakdown</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Topics your followers engage with and consume most heavily.</p>
                {indulgence?.nicheBreakdown && Object.entries(indulgence.nicheBreakdown).map(([name, pct]) => (
                  <div key={name} className="indulgence-bar-group">
                    <div className="indulgence-bar-label"><span>{name}</span><span>{pct}%</span></div>
                    <div className="indulgence-bar-track"><div className="indulgence-bar-fill" style={{ width: pct + '%' }}></div></div>
                  </div>
                ))}
              </div>
              <div className="ideas-card-box">
                <h3 className="box-subtitle">Format Craving</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>What content formats your followers demand right now.</p>
                <div className="format-craving-container">
                  {indulgence?.formatCraving && Object.entries(indulgence.formatCraving).map(([name, pct]) => (
                    <div key={name} className="indulgence-chip">
                      <span className="fmt-title">{name}</span>
                      <span className="fmt-pct">{pct}% Craving</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
