import { useState, useEffect } from 'react';
import { CONFIG } from '../config';

const api = (path, token, opts = {}) =>
    fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
    }).then(r => r.json());

function favicon(url) {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
    catch { return null; }
}

export function LinksModal({ col, token, onClose }) {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api(`/collections/${col._id}/links`, token)
            .then(data => { if (Array.isArray(data)) setLinks(data); })
            .finally(() => setLoading(false));
    }, [col._id]);

    return (
        <div onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.45)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()}
                style={{ background: '#fff', border: '2px solid #111', borderRadius: 20, boxShadow: '6px 6px 0 #111', width: '100%', maxWidth: 520, maxHeight: '82vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter',system-ui,sans-serif" }}>
                {/* Header */}
                <div style={{ padding: '18px 22px 14px', borderBottom: '2px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111', margin: '0 0 3px', letterSpacing: '-0.3px' }}>{col.name}</h3>
                        {col.owner && <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, margin: 0 }}>by {col.owner.username}</p>}
                        {col.description && <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.4 }}>{col.description}</p>}
                    </div>
                    <button onClick={onClose}
                        style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #111', background: '#F0EDEA', cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '2px 2px 0 #111' }}>
                        ×
                    </button>
                </div>

                {/* Links */}
                <div style={{ overflowY: 'auto', padding: '12px 18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {loading
                        ? <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading links…</p>
                        : links.length === 0
                            ? <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No links in this collection yet.</p>
                            : links.map(link => (
                                <div key={link._id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0EDEA', border: '2px solid #e5e7eb', borderRadius: 12, padding: '11px 14px', transition: 'border-color .13s, box-shadow .13s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {favicon(link.url) && (
                                        <img src={favicon(link.url)} alt="" width={18} height={18} style={{ borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</p>
                                        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</p>
                                    </div>
                                    <a href={link.url} target="_blank" rel="noreferrer"
                                        style={{ padding: '5px 11px', background: '#111', color: '#F0EDEA', border: '1.5px solid #111', borderRadius: 8, fontSize: 11.5, fontWeight: 700, textDecoration: 'none', flexShrink: 0, fontFamily: 'inherit' }}>
                                        Visit →
                                    </a>
                                </div>
                            ))
                    }
                </div>
            </div>
        </div>
    );
}
