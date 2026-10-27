import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// Ported from main.js renderIdeasView + fetchAndRenderIdea — same layout, same wording
export default function Ideas() {
  const { user } = useAuth();
  const niche = user?.niche || 'Lifestyle';

  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaResult, setIdeaResult] = useState(null);
  const [ideaError, setIdeaError] = useState('');

  const [savedHooks, setSavedHooks] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSaved = useCallback(async () => {
    setSavedLoading(true);
    try {
      const res = await api.get('/api/ideas/saved/list');
      setSavedHooks(res.data);
    } catch {
      setSavedError('Could not load saved hooks.');
    } finally {
      setSavedLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  async function generateIdea() {
    setIdeaLoading(true);
    setIdeaResult(null);
    setIdeaError('');
    try {
      const res = await api.get('/api/ideas/' + niche);
      setIdeaResult(res.data);
    } catch {
      setIdeaError('Could not load advice quote right now. Please try again.');
    } finally {
      setIdeaLoading(false);
    }
  }

  async function saveHook() {
    if (!ideaResult?.hook) return;
    setSaving(true);
    try {
      await api.post('/api/ideas/saved', { text: ideaResult.hook, niche });
      await fetchSaved();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function deleteHook(id) {
    try {
      await api.delete('/api/ideas/saved/' + id);
      await fetchSaved();
    } catch {
      // silent
    }
  }

  return (
    <div>
      <NavBar />
      <main className="app-body" id="viewContainer">
        <div className="page-container">

          <div className="page-header">
            <h1 className="page-title">Content Idea Generator</h1>
            <p className="page-subtitle">Combines niche phrase templates with a fetched advice quote.</p>
          </div>

          <div className="ideas-card-box">
            <p>Click the button below to generate a new content hook for your niche (<strong>{niche}</strong>).</p>
            <button
              id="generateIdeaBtn"
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={generateIdea}
              disabled={ideaLoading}
            >
              {ideaLoading ? 'Loading idea...' : 'Generate Idea'}
            </button>

            <div id="ideaResultSlot" style={{ marginTop: '24px' }}>
              {ideaLoading && (
                <div className="loading-spinner">Fetching fresh advice quote...</div>
              )}
              {ideaError && (
                <div className="error-banner">
                  <p>{ideaError}</p>
                  <button id="retryIdeaBtn" className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }} onClick={generateIdea}>Retry</button>
                </div>
              )}
              {ideaResult?.success && (
                <div className="idea-result-card">
                  <span className="badge badge-purple">Generated Hook</span>
                  <p className="idea-hook-text">{ideaResult.hook}</p>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '12px' }}
                    onClick={saveHook}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '💾 Save Hook'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Saved Hooks */}
          <div className="section-container" style={{ marginTop: 'var(--space-8)' }}>
            <h2 className="section-title">Saved Hooks</h2>
            {savedLoading && <p style={{ color: 'var(--text-dim)' }}>Loading saved hooks...</p>}
            {savedError && <div className="error-banner"><p>{savedError}</p></div>}
            {!savedLoading && savedHooks.length === 0 && (
              <div className="empty-state"><p>No saved hooks yet. Generate an idea and save it.</p></div>
            )}
            <div className="posts-list">
              {savedHooks.map(hook => (
                <div key={hook._id} className="post-card">
                  <div className="post-header">
                    <span className="badge badge-purple">{hook.niche}</span>
                    <p className="idea-hook-text" style={{ flex: 1, marginLeft: '12px' }}>{hook.text}</p>
                    <span className="post-date">{new Date(hook.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="post-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteHook(hook._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
