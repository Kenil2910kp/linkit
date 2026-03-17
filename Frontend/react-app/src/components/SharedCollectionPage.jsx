import { useState, useEffect } from 'react';
import { CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

const api = (path, opts = {}, token) =>
    fetch(`${CONFIG.API_BASE_URL}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
    }).then(r => r.json());

function favicon(url) {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
    catch { return null; }
}

// ── Tiny design tokens ────────────────────────────────────────────────────────
const S = {
    ctr: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0EDEA', padding: 20, fontFamily: "'Inter',system-ui,sans-serif" },
    card: { background: '#fff', border: '2px solid #111', borderRadius: 20, padding: '32px 28px', maxWidth: 460, width: '100%', boxShadow: '5px 5px 0 #111', textAlign: 'center' },
    h1: { fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-0.4px' },
    p: { fontSize: 13, color: '#6b7280', fontWeight: 500, margin: '0 0 4px' },
    label: { display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 5, textAlign: 'left' },
    inp: { width: '100%', padding: '10px 13px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#F0EDEA', boxSizing: 'border-box', color: '#111', transition: 'border-color .15s, box-shadow .15s' },
    btn: { width: '100%', padding: '12px', background: '#111', color: '#F0EDEA', border: '2px solid #111', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '3px 3px 0 #111', marginTop: 4 },
};

export function SharedCollectionPage({ token: shareToken }) {
    const { user, token: authToken, loginWithToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authOpen, setAuthOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        api(`/collections/shared/${shareToken}`, {}, authToken)
            .then(d => {
                setData(d);
                if (d.requesterEmail) setEmail(d.requesterEmail); // pre-fill from server
            })
            .finally(() => setLoading(false));
    };

    // Re-check access every time auth state changes (user logs in)
    useEffect(load, [authToken]);

    const requestAccess = async (e) => {
        e.preventDefault();
        setSubmitting(true); setError('');
        try {
            const res = await api(
                `/collections/shared/${shareToken}/request`,
                { method: 'POST', body: JSON.stringify({ email, message }) },
                authToken
            );
            if (res.error) throw new Error(res.error);
            setSubmitted(true);
        } catch (err) { setError(err.message); }
        finally { setSubmitting(false); }
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div style={S.ctr}><p style={S.p}>Loading collection…</p></div>
    );

    if (!data || data.error) return (
        <div style={S.ctr}>
            <div style={S.card}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                <h2 style={S.h1}>Collection not found</h2>
                <p style={S.p}>This link may be invalid or have expired.</p>
            </div>
        </div>
    );

    // ── Has access: show links ────────────────────────────────────────────────
    if (data.hasAccess) {
        return (
            <div style={{ ...S.ctr, alignItems: 'flex-start' }}>
                <div style={{ maxWidth: 660, width: '100%', padding: '40px 16px' }}>
                    {/* Owner info card */}
                    {data.owner && (
                        <div style={{ background: '#F7E07C', border: '2px solid #111', borderRadius: 14, padding: '14px 20px', marginBottom: 22, boxShadow: '3px 3px 0 #111', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', color: '#F0EDEA', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
                                {data.owner.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: '#666', fontWeight: 600, margin: 0 }}>Collection by</p>
                                <p style={{ fontSize: 15, fontWeight: 900, color: '#111', margin: 0 }}>{data.owner.username}</p>
                            </div>
                        </div>
                    )}

                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px', fontFamily: "'Inter',system-ui,sans-serif" }}>{data.name}</h1>
                    {data.description && <p style={{ ...S.p, marginBottom: 20 }}>{data.description}</p>}

                    {/* Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                        {(data.links || []).length === 0
                            ? <p style={S.p}>No links in this collection yet.</p>
                            : (data.links || []).map(link => (
                                <div key={link._id} style={{ background: '#fff', border: '2px solid #111', borderRadius: 13, padding: '13px 16px', boxShadow: '3px 3px 0 #111', display: 'flex', alignItems: 'center', gap: 13, transition: 'transform .12s,box-shadow .12s' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
                                >
                                    {favicon(link.url) && <img src={favicon(link.url)} alt="" width={20} height={20} style={{ borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</p>
                                        <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</p>
                                    </div>
                                    <a href={link.url} target="_blank" rel="noreferrer" style={{ padding: '6px 13px', background: '#111', color: '#F0EDEA', border: '1.5px solid #111', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', flexShrink: 0, fontFamily: 'inherit' }}>
                                        Visit →
                                    </a>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Not logged in: gate behind login ─────────────────────────────────────
    if (!user) {
        return (
            <div style={S.ctr}>
                <div style={S.card}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                    <h2 style={S.h1}>{data.name || 'Protected Collection'}</h2>
                    {data.owner && <p style={{ ...S.p, marginBottom: 4 }}>by <strong>{data.owner.username}</strong></p>}
                    {data.description && <p style={{ ...S.p, marginBottom: 16 }}>{data.description}</p>}
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '16px 0 20px' }}>
                        Sign in to check if you have access to this collection.
                    </p>
                    <button
                        onClick={() => setAuthOpen(true)}
                        style={S.btn}
                    >
                        Sign in with LinkIt →
                    </button>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 12 }}>If you're already signed in on another tab, refresh this page.</p>
                </div>
                <AuthModal
                    open={authOpen}
                    onClose={() => setAuthOpen(false)}
                    onLoginSuccess={() => { setAuthOpen(false); load(); }}
                />
            </div>
        );
    }

    // ── Logged in but no access ───────────────────────────────────────────────

    // Already submitted request in this session
    if (submitted) {
        return (
            <div style={S.ctr}>
                <div style={S.card}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <h2 style={S.h1}>Request sent!</h2>
                    <p style={S.p}>The collection owner has been notified.</p>
                    <p style={{ ...S.p, marginTop: 6 }}>You'll be able to access this collection once they approve your request.</p>
                </div>
            </div>
        );
    }

    // Already has a pending request (from a previous session)
    if (data.hasPendingRequest) {
        return (
            <div style={S.ctr}>
                <div style={S.card}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                    <h2 style={S.h1}>Request pending</h2>
                    <p style={S.p}>You've already requested access to <strong>"{data.name}"</strong>.</p>
                    <p style={{ ...S.p, marginTop: 6 }}>The owner will review it soon. Check back here after approval.</p>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 16 }}>Signed in as <strong>{user.email}</strong></p>
                </div>
            </div>
        );
    }

    // Fresh request form
    return (
        <div style={S.ctr}>
            <div style={{ ...S.card, textAlign: 'left' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
                    <h2 style={S.h1}>{data.name || 'Protected Collection'}</h2>
                    {data.owner && <p style={S.p}>by <strong>{data.owner.username}</strong></p>}
                    {data.description && <p style={{ ...S.p, marginTop: 4 }}>{data.description}</p>}
                </div>

                <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 16, textAlign: 'center' }}>
                    This collection is protected. Request access from the owner:
                </p>

                <form onSubmit={requestAccess} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <label style={S.label}>Your Email</label>
                        <input
                            type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com" style={S.inp}
                            onFocus={e => { e.target.style.borderColor = '#111'; e.target.style.boxShadow = '2px 2px 0 #111'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <div>
                        <label style={S.label}>Message (optional)</label>
                        <textarea
                            value={message} onChange={e => setMessage(e.target.value)}
                            placeholder="Why do you need access?" rows={3}
                            style={{ ...S.inp, resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = '#111'; e.target.style.boxShadow = '2px 2px 0 #111'; }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    {error && (
                        <div style={{ background: '#FECACA', border: '2px solid #111', borderRadius: 9, padding: '9px 13px', fontSize: 13, fontWeight: 600, color: '#111' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <button type="submit" disabled={submitting} style={{ ...S.btn, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                        {submitting ? 'Sending…' : 'Request Access →'}
                    </button>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                        Signed in as <strong>{user.email || user.username}</strong>
                    </p>
                </form>
            </div>
        </div>
    );
}
