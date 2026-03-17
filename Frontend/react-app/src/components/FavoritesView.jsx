import { useEffect, useState } from 'react';
import { CONFIG } from '../config';

function apiFetch(path, token, opts = {}) {
    return fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(opts.headers || {}),
        },
    }).then((r) => r.json());
}

function favicon(url) {
    try {
        const host = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
    } catch { return null; }
}

const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const ExternalIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);
const PencilIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

function EditModal({ link, token, onClose, onUpdated }) {
    const [title, setTitle] = useState(link.title);
    const [url, setUrl] = useState(link.url);
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        await apiFetch(`/favorites/links/${link._id}`, token, {
            method: 'PUT',
            body: JSON.stringify({ title, url }),
        }).catch(() => { });
        onUpdated({ ...link, title, url });
        setSaving(false);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Edit Favorite</h3>
                <form onSubmit={save} className="modal-form">
                    <div>
                        <label className="modal-label">Title</label>
                        <input className="modal-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="modal-label">URL</label>
                        <input className="modal-input" value={url} onChange={(e) => setUrl(e.target.value)} type="url" required />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function FavoritesView({ token }) {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [editTarget, setEditTarget] = useState(null);

    useEffect(() => {
        apiFetch('/favorites/links', token)
            .then((data) => setLinks(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const addFavorite = async (e) => {
        e.preventDefault();
        setError('');
        setAdding(true);
        try {
            const res = await apiFetch('/favorites/links', token, {
                method: 'POST',
                body: JSON.stringify({ title, url }),
            });
            if (res.error) throw new Error(res.error);
            setLinks((prev) => [res, ...prev]);
            setTitle('');
            setUrl('');
        } catch (err) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const deleteFav = async (id) => {
        await apiFetch(`/favorites/links/${id}`, token, { method: 'DELETE' });
        setLinks((prev) => prev.filter((l) => l._id !== id));
    };

    return (
        <div className="main-content">
            <div className="content-header">
                <h2 className="content-title">⭐ Favorites</h2>
                <span className="badge">{links.length} link{links.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Add form */}
            <div className="fav-add-card">
                <form onSubmit={addFavorite} className="fav-add-form">
                    <div className="fav-add-row">
                        <div style={{ flex: 1 }}>
                            <label className="modal-label">Title</label>
                            <input
                                className="modal-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a descriptive title"
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="modal-label">URL</label>
                            <input
                                className="modal-input"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                type="url"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="modal-error">{error}</p>}
                    <button type="submit" className="btn-primary" disabled={adding} style={{ alignSelf: 'flex-start' }}>
                        {adding ? 'Adding…' : '+ Add Favorite'}
                    </button>
                </form>
            </div>

            {/* List */}
            {loading ? (
                <p className="state-text">Loading favorites…</p>
            ) : links.length === 0 ? (
                <div className="empty-state">
                    <span style={{ fontSize: 40 }}>⭐</span>
                    <p>No favorites yet. Add one above!</p>
                </div>
            ) : (
                <div className="fav-list">
                    {links.map((l, i) => (
                        <div key={l._id} className="fav-item" style={{ animationDelay: `${i * 0.04}s` }}>
                            <div className="fav-item-left">
                                {favicon(l.url) && (
                                    <img
                                        src={favicon(l.url)}
                                        alt=""
                                        className="link-favicon"
                                        onError={(e) => (e.target.style.display = 'none')}
                                    />
                                )}
                                <div style={{ minWidth: 0 }}>
                                    <div className="fav-item-title">{l.title}</div>
                                    <a href={l.url} target="_blank" rel="noreferrer" className="link-url">
                                        <ExternalIcon /> {l.url}
                                    </a>
                                    <div className="fav-item-date">
                                        Added {new Date(l.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                            <div className="fav-item-actions">
                                <button className="btn-icon" onClick={() => setEditTarget(l)} title="Edit"><PencilIcon /></button>
                                <button className="btn-icon danger" onClick={() => deleteFav(l._id)} title="Delete"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editTarget && (
                <EditModal
                    link={editTarget}
                    token={token}
                    onClose={() => setEditTarget(null)}
                    onUpdated={(updated) => {
                        setLinks((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
                        setEditTarget(null);
                    }}
                />
            )}
        </div>
    );
}
