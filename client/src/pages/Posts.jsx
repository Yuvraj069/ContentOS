import { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import api from '../api';

const FORMATS = ['Reel', 'Carousel', 'Static'];

const emptyForm = { title: '', format: 'Reel', topic: '', date: new Date().toISOString().split('T')[0], likes: '0', comments: '0', shares: '0', reach: '100' };

// Ported from main.js renderPostsView + renderPostForm + renderPostsList
export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  // Filters
  const [filterFormat, setFilterFormat] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CSV import
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (filterFormat) params.format = filterFormat;
      if (filterTopic) params.topic = filterTopic;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      const res = await api.get('/api/posts', { params });
      setPosts(res.data.items);
      setTotal(res.data.total);
    } catch {
      setError('Could not load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, filterFormat, filterTopic, filterFrom, filterTo]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(post) {
    setForm({
      title: post.title,
      format: post.format,
      topic: post.topic || '',
      date: post.date,
      likes: String(post.likes),
      comments: String(post.comments),
      shares: String(post.shares),
      reach: String(post.reach)
    });
    setEditingId(post._id);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    if (!form.date) { setFormError('Date is required'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      if (editingId) {
        await api.put('/api/posts/' + editingId, form);
      } else {
        await api.post('/api/posts', form);
      }
      closeForm();
      await fetchPosts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save post.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete('/api/posts/' + id);
      await fetchPosts();
    } catch {
      // silent
    }
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/api/posts/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data);
      await fetchPosts();
    } catch (err) {
      setImportResult({ error: err.response?.data?.error || 'Import failed.' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <NavBar />
      <main className="app-body" id="viewContainer">
        <div className="page-container">

          <div className="page-header flex-between">
            <div>
              <h1 className="page-title">Post Log</h1>
              <p className="page-subtitle">Log your posts and track interactions.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                {importing ? 'Importing...' : '↑ Import CSV'}
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} disabled={importing} />
              </label>
              <button id="toggleFormBtn" className="btn btn-primary" onClick={showForm ? closeForm : openNew}>
                {showForm ? 'Close Form' : '+ Log New Post'}
              </button>
            </div>
          </div>

          {importResult && (
            <div className={importResult.error ? 'error-banner' : 'form-card-box'} style={{ marginBottom: '16px' }}>
              {importResult.error
                ? <p>{importResult.error}</p>
                : <p>Import complete: <strong>{importResult.added}</strong> posts added, <strong>{importResult.skipped}</strong> rows skipped.</p>
              }
            </div>
          )}

          {/* Filter controls */}
          <div className="form-card-box" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="form-select" value={filterFormat} onChange={e => { setFilterFormat(e.target.value); setPage(1); }}>
                  <option value="">All Formats</option>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Topic</label>
                <input type="text" className="form-input" placeholder="Filter by topic..." value={filterTopic} onChange={e => { setFilterTopic(e.target.value); setPage(1); }} />
              </div>
              <div className="form-group">
                <label className="form-label">From</label>
                <input type="date" className="form-input" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="form-group">
                <label className="form-label">To</label>
                <input type="date" className="form-input" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>

          {/* Post Form */}
          {showForm && (
            <div id="postFormContainer" className="form-card-box" style={{ marginBottom: 'var(--space-6)' }}>
              <h3>{editingId ? 'Edit Post' : 'Log New Post'}</h3>
              <form id="postForm" onSubmit={handleFormSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Title / Caption Snippet *</label>
                  <input type="text" id="postTitle" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Morning routine reset" />
                  {formError && <div id="titleError" className="form-error" style={{ display: 'block' }}>{formError}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Format *</label>
                    <select id="postFormat" className="form-select" value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                      {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Topic Keyword</label>
                    <input type="text" id="postTopic" className="form-input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Productivity" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Posted *</label>
                    <input type="date" id="postDate" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Likes *</label>
                    <input type="number" id="postLikes" className="form-input" min="0" value={form.likes} onChange={e => setForm({ ...form, likes: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comments *</label>
                    <input type="number" id="postComments" className="form-input" min="0" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shares *</label>
                    <input type="number" id="postShares" className="form-input" min="0" value={form.shares} onChange={e => setForm({ ...form, shares: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reach *</label>
                    <input type="number" id="postReach" className="form-input" min="1" value={form.reach} onChange={e => setForm({ ...form, reach: e.target.value })} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" id="cancelFormBtn" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : (editingId ? 'Update Post' : 'Save Post')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          <div id="postsListContainer" className="posts-list">
            {loading && <p style={{ color: 'var(--text-dim)' }}>Loading posts...</p>}
            {error && <div className="error-banner"><p>{error}</p></div>}
            {!loading && posts.length === 0 && (
              <div className="empty-state">
                <p>No posts logged yet. Click &quot;+ Log New Post&quot; to add your first post.</p>
              </div>
            )}
            {posts.map(p => {
              const totalInteractions = (Number(p.likes) || 0) + (Number(p.comments) || 0) + (Number(p.shares) || 0);
              const engRate = Number(p.reach) > 0 ? ((totalInteractions / Number(p.reach)) * 100).toFixed(1) : '0.0';
              return (
                <div key={p._id} className="post-card" id={'card_' + p._id}>
                  <div className="post-header">
                    <span className={'badge badge-' + (p.format || '').toLowerCase()}>{p.format}</span>
                    <h3 className="post-title">{p.title}</h3>
                    <span className="post-date">{p.date}</span>
                  </div>
                  <div className="post-metrics">
                    <span className="metric-chip">Likes: {p.likes}</span>
                    <span className="metric-chip">Comments: {p.comments}</span>
                    <span className="metric-chip">Shares: {p.shares}</span>
                    <span className="metric-chip">Reach: {p.reach}</span>
                    <span className="metric-chip highlight">Engagement: {engRate}%</span>
                  </div>
                  <div className="post-actions">
                    <button className="btn btn-secondary btn-sm edit-btn" data-id={p._id} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm del-btn" data-id={p._id} onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '24px', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ color: 'var(--text-dim)', fontSize: '13px', alignSelf: 'center' }}>Page {page} of {totalPages} ({total} total)</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
