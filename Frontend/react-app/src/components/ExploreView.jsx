import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../config';
import { LinksModal } from './LinksModal';

const api = (path, token, opts = {}) =>
    fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
    }).then(r => r.json());

function favicon(url) {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
    catch { return null; }
}

// ─── Visibility badge ─────────────────────────────────────────────────────────
const VBadge = ({ v }) => {
    const map = { private: ['🔒', '#FECACA'], protected: ['🔗', '#FEF3C7'], public: ['🌐', '#BBF7D0'] };
    const [icon, bg] = map[v] || ['❓', '#F3F4F6'];
    return (
        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: bg, border: '1.5px solid #111', display: 'inline-flex', alignItems: 'center', gap: 3, letterSpacing: '0.02em' }}>
            {icon} {v}
        </span>
    );
};

// ─── Collection card (full-width horizontal, clickable) ───────────────────────
export function PublicCollectionCard({ col, token, myId, onOwnerClick, savedIds, onSaveToggle, likedIds, onLikeToggle }) {
    const [modalOpen, setModalOpen] = useState(false);
    const isSaved = savedIds?.includes(col._id);
    const isLiked = likedIds?.includes(col._id);
    const isOwner = myId && (col.owner?._id === myId || col.userId?._id === myId || col.userId === myId);

    return (
        <>
            <div
                onClick={() => setModalOpen(true)}
                style={{
                    background: '#fff', border: '2px solid #111', borderRadius: 16,
                    padding: '18px 22px', boxShadow: '3px 3px 0 #111',
                    display: 'flex', alignItems: 'center', gap: 18,
                    transition: 'transform .13s, box-shadow .13s', cursor: 'pointer',
                    width: '100%', boxSizing: 'border-box',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
            >
                {/* Left: info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#111', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{col.name}</span>
                        <VBadge v={col.visibility || 'public'} />
                    </div>
                    {col.description && (
                        <p style={{ fontSize: 12.5, color: '#6b7280', margin: '0 0 7px', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {col.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: '#9ca3af', fontWeight: 600, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>🔗 {col.linkCount || 0} links</span>
                        <span style={{ color: isLiked ? '#ef4444' : '#9ca3af' }}>❤️ {col.likeCount ?? 0}</span>
                        <span>🔖 {col.saveCount ?? 0}</span>
                        {col.owner && (
                            <button
                                onClick={e => { e.stopPropagation(); onOwnerClick?.(col.owner); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', fontWeight: 800, fontSize: 11.5, textDecoration: 'underline', padding: 0, fontFamily: 'inherit' }}
                            >
                                by {col.owner.username}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    {token && !isOwner && (
                        <>
                            {/* Like button — only shown when handler is provided (e.g. Explore, not Saved) */}
                            {onLikeToggle && (
                                <button
                                    onClick={() => onLikeToggle(col._id)}
                                    title={isLiked ? 'Unlike' : 'Like'}
                                    style={actionBtn(isLiked ? '#FECACA' : '#F0EDEA', isLiked)}
                                >
                                    <span style={{ fontSize: 14 }}>{isLiked ? '❤️' : '🤍'}</span>
                                </button>
                            )}
                            <button
                                onClick={() => onSaveToggle?.(col._id)}
                                title={isSaved ? 'Unsave' : 'Save'}
                                style={actionBtn(isSaved ? '#BBF7D0' : '#F0EDEA', isSaved)}
                            >
                                <span style={{ fontSize: 13 }}>{isSaved ? '🔖' : '📌'}</span>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={e => { e.stopPropagation(); setModalOpen(true); }}
                        style={{ ...actionBtn('#F0EDEA', false), fontSize: 12, padding: '7px 12px', fontWeight: 700 }}
                    >
                        View →
                    </button>
                </div>
            </div>

            {modalOpen && <LinksModal col={col} token={token} onClose={() => setModalOpen(false)} />}
        </>
    );
}

const actionBtn = (bg, active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '7px 11px', borderRadius: 10,
    border: `2px solid ${active ? '#111' : '#d1d5db'}`,
    background: bg, fontWeight: 700, fontSize: 12, cursor: 'pointer',
    boxShadow: active ? '2px 2px 0 #111' : 'none',
    transition: 'all .12s', fontFamily: 'inherit',
});

// ─── ExploreView ──────────────────────────────────────────────────────────────
export function ExploreView({ token, myId }) {
    const [cols, setCols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [savedIds, setSavedIds] = useState(new Set());
    const [likedIds, setLikedIds] = useState(new Set());
    const [profileUser, setProfileUser] = useState(null);
    const [profileCols, setProfileCols] = useState([]);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Fetch collections + saved list in parallel
        Promise.all([
            api('/collections/explore', token),
            token ? api('/collections/saved', token) : Promise.resolve([]),
        ]).then(([exploreData, savedData]) => {
            if (Array.isArray(exploreData)) {
                setCols(exploreData);
                // Initialize liked state from server (check if myId is in likedBy)
                if (myId) {
                    const liked = new Set(exploreData.filter(c =>
                        c.likedBy?.some(id => (id?._id || id)?.toString() === myId?.toString())
                    ).map(c => c._id));
                    setLikedIds(liked);
                }
            }
            if (Array.isArray(savedData)) {
                setSavedIds(new Set(savedData.map(c => c._id)));
            }
        }).finally(() => setLoading(false));
    }, [myId]);

    const filtered = cols.filter(c => {
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.owner?.username?.toLowerCase().includes(q);
    });

    const handleLike = async (colId) => {
        const res = await api(`/collections/${colId}/like`, token, { method: 'POST' });
        setLikedIds(prev => {
            const next = new Set(prev);
            res.liked ? next.add(colId) : next.delete(colId);
            return next;
        });
        setCols(prev => prev.map(c => c._id === colId ? { ...c, likeCount: res.likeCount } : c));
    };

    const handleSave = async (colId) => {
        const res = await api(`/collections/${colId}/save`, token, { method: 'POST' });
        setSavedIds(prev => {
            const next = new Set(prev);
            res.saved ? next.add(colId) : next.delete(colId);
            return next;
        });
        setCols(prev => prev.map(c => c._id === colId ? { ...c, saveCount: res.saveCount } : c));
    };

    const openOwnerProfile = async (owner) => {
        setProfileUser(owner);
        setProfileLoading(true);
        const data = await api(`/collections/user/${owner._id}/public`, token);
        if (Array.isArray(data)) setProfileCols(data);
        setProfileLoading(false);
    };

    // ── Owner profile view ─────────────────────────────────────────────────────
    if (profileUser) {
        return (
            <div style={{ padding: '28px 32px' }}>
                <button onClick={() => { setProfileUser(null); setProfileCols([]); }} style={backBtn}>← Back to Explore</button>
                <h2 style={{ ...heading, marginTop: 16 }}>@{profileUser.username}'s Public Collections</h2>
                {profileLoading ? <p style={muted}>Loading…</p> : (
                    <div style={list}>
                        {profileCols.length === 0
                            ? <p style={muted}>No public collections yet.</p>
                            : profileCols.map(c => (
                                <PublicCollectionCard key={c._id} col={c} token={token} myId={myId}
                                    savedIds={[...savedIds]} likedIds={[...likedIds]}
                                    onSaveToggle={handleSave} onLikeToggle={handleLike}
                                    onOwnerClick={() => { }}
                                />
                            ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '28px 32px' }}>
            <h2 style={heading}>🌐 Explore Collections</h2>
            <p style={{ ...muted, marginBottom: 20 }}>Discover public collections from the community. Click any card to see its links.</p>

            <div style={{ position: 'relative', marginBottom: 24 }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, description, or owner…"
                    style={{ width: '100%', padding: '11px 16px 11px 36px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#F0EDEA', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => { e.target.style.borderColor = '#111'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
            </div>

            {loading ? <p style={muted}>Loading…</p> : (
                <div style={list}>
                    {filtered.length === 0
                        ? <p style={muted}>{search ? 'No collections match.' : 'No public collections yet.'}</p>
                        : filtered.map(c => (
                            <PublicCollectionCard key={c._id} col={c} token={token} myId={myId}
                                savedIds={[...savedIds]} likedIds={[...likedIds]}
                                onSaveToggle={handleSave} onLikeToggle={handleLike}
                                onOwnerClick={openOwnerProfile}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

const heading = { fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-0.4px', fontFamily: "'Inter',system-ui,sans-serif" };
const muted = { color: '#9ca3af', fontSize: 13, fontWeight: 500, fontFamily: "'Inter',system-ui,sans-serif" };
const list = { display: 'flex', flexDirection: 'column', gap: 12 };
const backBtn = { background: '#F0EDEA', border: '2px solid #111', borderRadius: 10, padding: '7px 14px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '2px 2px 0 #111' };
