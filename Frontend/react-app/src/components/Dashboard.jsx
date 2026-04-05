import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config';
import { FavoritesView } from './FavoritesView';
import { IntegrationsView } from './IntegrationsView';
import { ExploreView } from './ExploreView';
import { NotificationsView } from './NotificationsView';
import { SavedCollectionsView } from './SavedCollectionsView';

function apiFetch(path, token, opts = {}) {
    return fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    }).then(r => r.json());
}

function favicon(url) {
    try { const host = new URL(url).hostname; return `https://www.google.com/s2/favicons?domain=${host}&sz=32`; }
    catch { return null; }
}

const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0EDEA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

const Icons = {
    Folder: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    Plus: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
    External: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
    Pencil: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    Plug: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z" /></svg>,
    Bell: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Tool: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
    Compass: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    Bookmark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
    Crown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20" /><path d="m4 20 4-12 4 6 4-10 4 16" /></svg>,
    Settings: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    LogOut: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Link: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    Copy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    Mail: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
};

const VISIBILITY_ICON = { private: '🔒', protected: '🔗', public: '🌐' };

// ── ComingSoon ─────────────────────────────────────────────────────────────────
function ComingSoon({ label, icon }) {
    return (
        <div className="coming-soon-wrap">
            <div className="coming-soon-icon">{icon}</div>
            <h2 className="coming-soon-title">{label}</h2>
            <span className="coming-soon-badge">Coming Soon</span>
            <p className="coming-soon-desc">We're working hard on this feature. Stay tuned for something great!</p>
        </div>
    );
}

// ── LinkCard ──────────────────────────────────────────────────────────────────
function LinkCard({ link, token, onDeleted, onUpdated }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(link.title);
    const [url, setUrl] = useState(link.url);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        await apiFetch(`/links/${link._id}`, token, { method: 'PUT', body: JSON.stringify({ title, url }) });
        setSaving(false); setEditing(false);
        onUpdated({ ...link, title, url });
    };

    const del = async () => {
        if (!confirm('Delete this link?')) return;
        await apiFetch(`/links/${link._id}`, token, { method: 'DELETE' });
        onDeleted(link._id);
    };

    return (
        <div className="link-card">
            {editing ? (
                <div className="link-card-edit">
                    <input className="edit-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
                    <input className="edit-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" />
                    <div className="edit-actions">
                        <button className="btn-save" onClick={save} disabled={saving}>{saving ? '…' : <><Icons.Check /> Save</>}</button>
                        <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="link-card-header">
                        {favicon(link.url) && <img src={favicon(link.url)} alt="" className="link-favicon" onError={e => (e.target.style.display = 'none')} />}
                        <span className="link-title">{link.title}</span>
                    </div>
                    <a href={link.url} target="_blank" rel="noreferrer" className="link-url">
                        <Icons.External /> {link.url}
                    </a>
                    <div className="link-card-actions">
                        <a href={link.url} target="_blank" rel="noreferrer" className="btn-visit"><Icons.External /> Visit</a>
                        <button className="btn-icon" onClick={() => setEditing(true)} title="Edit"><Icons.Pencil /></button>
                        <button className="btn-icon danger" onClick={del} title="Delete"><Icons.Trash /></button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── AddLinkModal ──────────────────────────────────────────────────────────────
function AddLinkModal({ collectionId, token, onAdded, onClose }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const link = await apiFetch(`/links/${collectionId}`, token, { method: 'POST', body: JSON.stringify({ title, url }) });
            if (link.error) throw new Error(link.error);
            onAdded(link); onClose();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Add Link</h3>
                <form onSubmit={submit} className="modal-form">
                    <div><label className="modal-label">Title</label><input className="modal-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. My Link" /></div>
                    <div><label className="modal-label">URL</label><input className="modal-input" value={url} onChange={e => setUrl(e.target.value)} required type="url" placeholder="https://example.com" /></div>
                    {error && <p className="modal-error">{error}</p>}
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add Link'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── VisibilitySelector ────────────────────────────────────────────────────────
function VisibilitySelector({ collection, token, onUpdate }) {
    const [current, setCurrent] = useState(collection.visibility || 'private');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [allowedEmails, setAllowedEmails] = useState(collection.allowedEmails || []);
    const shareUrl = `${window.location.origin}/shared/${collection.sharedToken}`;

    const setVis = async (v) => {
        setSaving(true);
        const res = await apiFetch(`/collections/${collection._id}/visibility`, token, { method: 'PATCH', body: JSON.stringify({ visibility: v }) });
        setSaving(false);
        if (!res.error) {
            setCurrent(v);
            onUpdate({ ...collection, ...res });
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const addEmail = async () => {
        if (!emailInput.trim()) return;
        const res = await apiFetch(`/collections/${collection._id}/allowed-emails`, token, { method: 'PATCH', body: JSON.stringify({ add: [emailInput.trim()] }) });
        if (res.allowedEmails) { setAllowedEmails(res.allowedEmails); setEmailInput(''); }
    };

    const removeEmail = async (email) => {
        const res = await apiFetch(`/collections/${collection._id}/allowed-emails`, token, { method: 'PATCH', body: JSON.stringify({ remove: [email] }) });
        if (res.allowedEmails) setAllowedEmails(res.allowedEmails);
    };

    const pills = [
        { v: 'private', icon: '🔒', label: 'Private', color: '#FECACA' },
        { v: 'protected', icon: '🔗', label: 'Protected', color: '#FEF3C7' },
        { v: 'public', icon: '🌐', label: 'Public', color: '#BBF7D0' },
    ];

    return (
        <div style={{ background: '#F0EDEA', border: '2px solid #e5e7eb', borderRadius: 14, padding: '16px 18px', marginTop: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>Visibility</p>

            {/* Pill selector */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {pills.map(p => (
                    <button key={p.v} onClick={() => setVis(p.v)} disabled={saving}
                        style={{
                            padding: '7px 14px', borderRadius: 999, border: '2px solid #111',
                            background: current === p.v ? p.color : '#fff',
                            fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: current === p.v ? '2px 2px 0 #111' : 'none',
                            transform: current === p.v ? 'translate(-1px,-1px)' : '',
                            transition: 'all .13s',
                        }}
                    >
                        {p.icon} {p.label}
                    </button>
                ))}
            </div>

            {/* Protected: share link + email management */}
            {current === 'protected' && collection.sharedToken && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input readOnly value={shareUrl}
                            style={{ flex: 1, padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 12, background: '#fff', color: '#555', fontFamily: 'inherit', outline: 'none' }}
                        />
                        <button onClick={copyLink} style={{ padding: '8px 13px', border: '2px solid #111', borderRadius: 9, background: copied ? '#BBF7D0' : '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '2px 2px 0 #111', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Icons.Copy /> {copied ? 'Copied!' : 'Copy link'}
                        </button>
                    </div>

                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 6px' }}>ALLOWED EMAILS</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input value={emailInput} onChange={e => setEmailInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                                placeholder="Add email…" type="email"
                                style={{ flex: 1, padding: '7px 11px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
                                onFocus={e => e.target.style.borderColor = '#111'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <button onClick={addEmail} style={{ padding: '7px 12px', border: '2px solid #111', borderRadius: 8, background: '#111', color: '#F0EDEA', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                                <Icons.Plus />
                            </button>
                        </div>
                        {allowedEmails.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {allowedEmails.map(email => (
                                    <span key={email} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: '#fff', border: '1.5px solid #111', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                                        <Icons.Mail /> {email}
                                        <button onClick={() => removeEmail(email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {current === 'public' && (
                <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, margin: 0 }}>
                    🌐 This collection is visible to everyone in <strong>Explore Collections</strong>.
                </p>
            )}
            {current === 'private' && (
                <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, margin: 0 }}>
                    🔒 Only you can see this collection.
                </p>
            )}
        </div>
    );
}

// ── CollectionView ────────────────────────────────────────────────────────────
function CollectionView({ collection: initialCol, token }) {
    const [col, setCol] = useState(initialCol);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [showVis, setShowVis] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiFetch(`/links/collection/${col._id}`, token).then(setLinks).finally(() => setLoading(false));
    }, [col._id]);

    return (
        <div className="main-content">
            <div className="content-header">
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h2 className="content-title">{col.name}</h2>
                        <span style={{ fontSize: 14 }}>{VISIBILITY_ICON[col.visibility || 'private']}</span>
                        <button onClick={() => setShowVis(v => !v)}
                            style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, border: '1.5px solid #e5e7eb', background: showVis ? '#111' : '#F0EDEA', color: showVis ? '#fff' : '#111', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {showVis ? '↑ Hide' : '⚙ Settings'}
                        </button>
                    </div>
                    {col.description && <p className="content-desc">{col.description}</p>}
                    {showVis && <VisibilitySelector collection={col} token={token} onUpdate={setCol} />}
                </div>
                <button className="btn-primary" onClick={() => setAddOpen(true)}><Icons.Plus /> Add Link</button>
            </div>

            {loading ? <p className="state-text">Loading links…</p>
                : links.length === 0 ? (
                    <div className="empty-state">
                        <span style={{ fontSize: 36 }}>🔗</span>
                        <p>No links yet. Add your first one!</p>
                        <button className="btn-primary" onClick={() => setAddOpen(true)}><Icons.Plus /> Add your first link</button>
                    </div>
                ) : (
                    <div className="link-grid">
                        {links.map(l => (
                            <LinkCard key={l._id} link={l} token={token}
                                onDeleted={id => setLinks(p => p.filter(x => x._id !== id))}
                                onUpdated={upd => setLinks(p => p.map(x => x._id === upd._id ? upd : x))}
                            />
                        ))}
                    </div>
                )}

            {addOpen && (
                <AddLinkModal collectionId={col._id} token={token}
                    onAdded={link => setLinks(p => [link, ...p])}
                    onClose={() => setAddOpen(false)}
                />
            )}
        </div>
    );
}

// ── BOTTOM_NAV ────────────────────────────────────────────────────────────────
const BOTTOM_NAV = [
    { key: 'favorites', label: 'Favorites', icon: <Icons.Star /> },
    { key: 'integrations', label: 'Integrations', icon: <Icons.Plug /> },
    { key: 'notifications', label: 'Notifications', icon: <Icons.Bell /> },
    { key: 'explore', label: 'Explore Collections', icon: <Icons.Compass /> },
    { key: 'saved', label: 'Saved Collections', icon: <Icons.Bookmark /> },
    { key: 'tools', label: 'Tools & Agents', icon: <Icons.Tool /> },
    { key: 'subscription', label: 'Manage Subscription', icon: <Icons.Crown /> },
    // { key: 'settings', label: 'Settings', icon: <Icons.Settings /> },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function Dashboard() {
    const { user, token, logout } = useAuth();
    const [collections, setCollections] = useState([]);
    const [activeCollectionId, setActiveCollectionId] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [loadingCols, setLoadingCols] = useState(true);
    const [newColName, setNewColName] = useState('');
    const [addingCol, setAddingCol] = useState(false);
    const [showNewColInput, setShowNewColInput] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const newColInputRef = useRef(null);

    useEffect(() => {
        apiFetch('/collections', token).then(data => {
            const arr = Array.isArray(data) ? data : [];
            setCollections(arr);
            if (arr.length > 0) setActiveCollectionId(arr[0]._id);
        }).finally(() => setLoadingCols(false));

        // Poll unread notifications count
        const fetchUnread = () => apiFetch('/collections/notifications', token)
            .then(data => { if (Array.isArray(data)) setUnreadCount(data.filter(n => !n.read).length); });
        fetchUnread();
        const timer = setInterval(fetchUnread, 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => { if (showNewColInput) newColInputRef.current?.focus(); }, [showNewColInput]);

    const createCollection = async (e) => {
        e.preventDefault();
        if (!newColName.trim()) return;
        setAddingCol(true);
        const col = await apiFetch('/collections', token, { method: 'POST', body: JSON.stringify({ name: newColName.trim() }) });
        setCollections(prev => [...prev, col]);
        setActiveCollectionId(col._id);
        setActiveSection(null);
        setNewColName(''); setShowNewColInput(false); setAddingCol(false);
    };

    const deleteCollection = async (id) => {
        if (!confirm('Delete this collection and all its links?')) return;
        await apiFetch(`/collections/${id}`, token, { method: 'DELETE' });
        setCollections(prev => {
            const next = prev.filter(c => c._id !== id);
            setActiveCollectionId(next[0]?._id || null);
            return next;
        });
    };

    const navTo = (section) => {
        setActiveSection(section);
        setActiveCollectionId(null);
        if (section === 'notifications') setUnreadCount(0);
    };
    const navToCollection = (id) => { setActiveCollectionId(id); setActiveSection(null); };
    const activeCollection = collections.find(c => c._id === activeCollectionId);

    const renderMain = () => {
        if (activeSection === 'favorites') return <FavoritesView token={token} />;
        if (activeSection === 'integrations') return <IntegrationsView token={token} />;
        if (activeSection === 'explore') return <ExploreView token={token} myId={user?._id} />;
        if (activeSection === 'notifications') return <NotificationsView token={token} />;
        if (activeSection === 'saved') return <SavedCollectionsView token={token} myId={user?._id} />;
        const comingSoon = BOTTOM_NAV.find(n => n.key === activeSection);
        if (comingSoon) return <ComingSoon label={comingSoon.label} icon={comingSoon.icon} />;
        if (activeCollection) return <CollectionView key={activeCollection._id} collection={activeCollection} token={token} />;
        if (!loadingCols) return (
            <div className="empty-state center">
                <span style={{ fontSize: 48 }}>📁</span>
                <p>Create a collection to get started.</p>
                <button className="btn-primary" onClick={() => setShowNewColInput(true)}><Icons.Plus /> New Collection</button>
            </div>
        );
        return null;
    };

    return (
        <div className="db-root">
            {/* ── Sidebar ── */}
            <aside className="db-sidebar">
                <div className="db-sidebar-brand">
                    <div className="db-brand-logo"><LinkIcon /></div>
                    <span className="db-brand-name">LinkIt</span>
                </div>

                <div className="db-sidebar-section-label">Collections</div>
                <div className="db-col-list">
                    {loadingCols ? <span className="db-sidebar-hint">Loading…</span>
                        : collections.map(col => (
                            <div key={col._id}
                                className={`db-col-item ${activeCollectionId === col._id && !activeSection ? 'active' : ''}`}
                                onClick={() => navToCollection(col._id)}
                            >
                                <Icons.Folder />
                                <span className="db-col-name">{col.name}</span>
                                <span style={{ fontSize: 11, opacity: 0.7 }} title={col.visibility || 'private'}>
                                    {VISIBILITY_ICON[col.visibility || 'private']}
                                </span>
                                <button className="db-col-delete" onClick={e => { e.stopPropagation(); deleteCollection(col._id); }} title="Delete">
                                    <Icons.Trash />
                                </button>
                            </div>
                        ))
                    }
                </div>

                {showNewColInput ? (
                    <form onSubmit={createCollection} className="db-new-col-form">
                        <input ref={newColInputRef} value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Collection name" className="db-new-col-input" />
                        <button type="submit" className="btn-primary" disabled={addingCol} style={{ width: '100%', justifyContent: 'center' }}>{addingCol ? 'Creating…' : 'Create'}</button>
                        <button type="button" className="btn-cancel" style={{ width: '100%', textAlign: 'center' }} onClick={() => setShowNewColInput(false)}>Cancel</button>
                    </form>
                ) : (
                    <button className="db-add-col-btn" onClick={() => setShowNewColInput(true)}><Icons.Plus /> New Collection</button>
                )}

                <div className="db-sidebar-divider" />

                <nav className="db-nav">
                    {BOTTOM_NAV.map(({ key, label, icon }) => (
                        <button key={key} className={`db-nav-item ${activeSection === key ? 'active' : ''}`} onClick={() => navTo(key)}>
                            {icon}
                            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                            {key === 'notifications' && unreadCount > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999, background: '#FECACA', border: '1.5px solid #111', color: '#111' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="db-sidebar-bottom">
                    <div className="db-user-info">
                        <div className="db-avatar">{user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</div>
                        <div className="db-user-meta">
                            <div className="db-user-name">{user?.username || 'User'}</div>
                            <div className="db-user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button className="db-logout-btn" onClick={logout} title="Logout"><Icons.LogOut /></button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="db-main">{renderMain()}</main>
        </div>
    );
}
