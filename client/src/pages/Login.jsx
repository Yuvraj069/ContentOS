import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Ported from main.js renderLoginView — same two-tab card layout
export default function Login() {
  const [mode, setMode] = useState('login');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [niche, setNiche] = useState('Lifestyle');
  const [followers, setFollowers] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(handle, password);
      } else {
        await register(handle, password, niche, followers);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="auth-mode-toggle">
            <button
              type="button"
              id="tabLoginBtn"
              className={'auth-tab-btn' + (mode === 'login' ? ' active' : '')}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Login
            </button>
            <button
              type="button"
              id="tabRegisterBtn"
              className={'auth-tab-btn' + (mode === 'register' ? ' active' : '')}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
            </button>
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="auth-brand">
          <span className="logo-badge large">C</span>
          <h1 className="auth-title">ContentOS</h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to access your creator workspace.'
              : 'Create a creator account and set your followers.'}
          </p>
        </div>

        <form id="loginForm" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="handleInput">Creator Handle *</label>
            <div className="input-prefix-wrapper">
              <span className="prefix">@</span>
              <input
                type="text"
                id="handleInput"
                className="form-input"
                placeholder="username"
                value={handle}
                onChange={e => setHandle(e.target.value)}
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="nicheSelect">Creator Niche *</label>
                <select
                  id="nicheSelect"
                  className="form-select"
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                >
                  <option value="Tech">Tech</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Food">Food</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="followersInput">Current Total Followers *</label>
                <input
                  type="number"
                  id="followersInput"
                  className="form-input"
                  min="1"
                  placeholder="e.g. 5000"
                  value={followers}
                  onChange={e => setFollowers(e.target.value)}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Enter your current follower count for accurate reach calculations.
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="passInput">Password *</label>
            <input
              type="password"
              id="passInput"
              className="form-input"
              placeholder={mode === 'login' ? 'Enter password' : 'Create password (min 4 chars)'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div id="handleError" className="form-error" style={{ marginBottom: '12px', display: 'block' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Login & Enter Workspace' : 'Create Account & Enter')}
          </button>
        </form>
      </div>
    </div>
  );
}
