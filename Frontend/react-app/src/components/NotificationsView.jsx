import { useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../config';

const api = (path, token, opts = {}) =>
    fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    }).then(r => r.json());

export function NotificationsView({ token }) {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        api('/collections/notifications', token)
            .then(data => { if (Array.isArray(data)) setNotifs(data); })
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(load, [load]);

    const markRead = async (id) => {
        await api(`/collections/notifications/${id}`, token, { method: 'PATCH' });
        setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    };

    const markAll = async () => {
        await api('/collections/notifications/read-all', token, { method: 'PATCH' });
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Approve: remove from list immediately, then reload
    const approve = async (requestId, notifId) => {
        const res = await api(`/collections/requests/${requestId}/approve`, token, { method: 'POST' });
        if (res.error) { alert('Error: ' + res.error); return; }
        setNotifs(prev => prev.filter(n => n._id !== notifId));
    };

    // Reject: remove from list immediately
    const reject = async (requestId, notifId) => {
        const res = await api(`/collections/requests/${requestId}/reject`, token, { method: 'POST' });
        if (res.error) { alert('Error: ' + res.error); return; }
        setNotifs(prev => prev.filter(n => n._id !== notifId));
    };

    const unread = notifs.filter(n => !n.read).length;

    // ── Styles ────────────────────────────────────────────────────────────────
    const card = (read) => ({
        background: read ? '#fafafa' : '#fff',
        border: `2px solid ${read ? '#e5e7eb' : '#111'}`,
        borderRadius: 14, padding: '16px 20px',
        boxShadow: read ? 'none' : '3px 3px 0 #111',
        cursor: read ? 'default' : 'pointer',
        transition: 'box-shadow .13s',
    });

    return (
        <div style={{ padding: '28px 32px', fontFamily: "'Inter',system-ui,sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-0.4px' }}>
                        🔔 Notifications
                    </h2>
                    {unread > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#FECACA', border: '1.5px solid #111', display: 'inline-block', marginTop: 4 }}>
                            {unread} unread
                        </span>
                    )}
                </div>
                {unread > 0 && (
                    <button onClick={markAll} style={{ background: '#F0EDEA', border: '2px solid #111', borderRadius: 9, padding: '7px 13px', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '2px 2px 0 #111' }}>
                        Mark all read
                    </button>
                )}
            </div>

            {loading ? <p style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</p>
                : notifs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                        <p style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>All clear — no notifications.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {notifs.map(n => (
                            <div key={n._id}
                                style={card(n.read)}
                                onClick={() => !n.read && n.type !== 'access_request' && markRead(n._id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1 }}>

                                        {/* Access request card */}
                                        {n.type === 'access_request' && (
                                            <>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>
                                                    🔑 Access request for <strong>"{n.data?.collectionName}"</strong>
                                                </p>
                                                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px' }}>
                                                    From: <strong>{n.data?.requesterEmail}</strong>
                                                    {n.data?.message && (
                                                        <span style={{ display: 'block', marginTop: 3, fontStyle: 'italic', color: '#9ca3af' }}>
                                                            "{n.data.message}"
                                                        </span>
                                                    )}
                                                </p>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button
                                                        onClick={() => approve(n.data?.requestId, n._id)}
                                                        style={{ padding: '7px 14px', background: '#BBF7D0', border: '2px solid #111', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '2px 2px 0 #111', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => reject(n.data?.requestId, n._id)}
                                                        style={{ padding: '7px 14px', background: '#FECACA', border: '2px solid #111', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '2px 2px 0 #111', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Other notification types */}
                                        {n.type !== 'access_request' && (
                                            <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>
                                                {n.type === 'access_approved' ? '✅ Access approved' : '❌ Access rejected'}
                                                {n.data?.collectionName && <> for <strong>"{n.data.collectionName}"</strong></>}
                                            </p>
                                        )}

                                    </div>
                                    {!n.read && (
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 4 }} />
                                    )}
                                </div>
                                <p style={{ fontSize: 11, color: '#d1d5db', margin: '10px 0 0', fontWeight: 500 }}>
                                    {new Date(n.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
