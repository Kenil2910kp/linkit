import { useState, useEffect } from 'react';
import { CONFIG } from '../config';
import { LinksModal } from './LinksModal';

const api = (path, token, opts = {}) =>
    fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    }).then(r => r.json());

function favicon(url) {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
    catch { return null; }
}

const VBadge = ({ v }) => {
    const map = { private: ['🔒', '#FECACA'], protected: ['🔗', '#FEF3C7'], public: ['🌐', '#BBF7D0'] };
    const [icon, bg] = map[v] || ['❓', '#F3F4F6'];
    return (
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: bg, border: '1.5px solid #111', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {icon} {v}
        </span>
    );
};

// ── Small collection card (2-per-row grid) ────────────────────────────────────
function SavedCard({ col, token, myId, onUnsave }) {
    const [modalOpen, setModalOpen] = useState(false);
    const isOwner = myId && (col.owner?._id === myId || col.userId === myId);

    return (
        <>
            <div
                onClick={() => setModalOpen(true)}
                style={{
                    background: '#fff', border: '2px solid #111', borderRadius: 16,
                    padding: '18px 18px 14px', boxShadow: '3px 3px 0 #111',
                    cursor: 'pointer', transition: 'transform .13s, box-shadow .13s',
                    display: 'flex', flexDirection: 'column', gap: 8,
                    minHeight: 130,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
            >
                {/* Top row: name + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 900, color: '#111', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.2px' }}>
                            {col.name}
                        </p>
                        <VBadge v={col.visibility || 'public'} />
                    </div>
                    {/* Unsave button */}
                    {token && !isOwner && (
                        <button
                            title="Remove from saved"
                            onClick={e => { e.stopPropagation(); onUnsave(col._id); }}
                            style={{ padding: '4px 9px', border: '1.5px solid #d1d5db', borderRadius: 8, background: '#F0EDEA', fontSize: 12, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', flexShrink: 0, transition: 'border-color .12s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#FECACA'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#F0EDEA'; }}
                        >
                            🔖 Remove
                        </button>
                    )}
                </div>

                {/* Description */}
                {col.description && (
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {col.description}
                    </p>
                )}

                {/* Footer: meta + owner */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11.5, color: '#9ca3af', fontWeight: 600 }}>
                        <span>🔗 {col.linkCount || 0}</span>
                        <span>🔖 {col.saveCount ?? 0}</span>
                    </div>
                    {col.owner && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>by {col.owner.username}</span>
                    )}
                </div>
            </div>

            {modalOpen && <LinksModal col={col} token={token} onClose={() => setModalOpen(false)} />}
        </>
    );
}

// ── SavedCollectionsView ──────────────────────────────────────────────────────
export function SavedCollectionsView({ token, myId }) {
    const [cols, setCols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api('/collections/saved', token)
            .then(data => { if (Array.isArray(data)) setCols(data); })
            .finally(() => setLoading(false));
    }, []);

    const handleUnsave = async (colId) => {
        await api(`/collections/${colId}/save`, token, { method: 'POST' }); // toggle off
        setCols(prev => prev.filter(c => c._id !== colId));
    };

    const filtered = cols.filter(c => {
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.owner?.username?.toLowerCase().includes(q);
    });

    return (
        <div style={{ padding: '28px 32px', fontFamily: "'Inter',system-ui,sans-serif" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
                🔖 Saved Collections
            </h2>
            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, marginBottom: 20 }}>
                Collections you've saved · click a card to browse its links.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 22 }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search saved collections…"
                    style={{ width: '100%', padding: '10px 16px 10px 36px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#F0EDEA', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = '#111'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>

            {loading ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
                    <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>
                        {search ? 'No saved collections match.' : 'No saved collections yet — explore and save some!'}
                    </p>
                </div>
            ) : (
                /* 2-column grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                    {filtered.map(c => (
                        <SavedCard key={c._id} col={c} token={token} myId={myId} onUnsave={handleUnsave} />
                    ))}
                </div>
            )}
        </div>
    );
}
