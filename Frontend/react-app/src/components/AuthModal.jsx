import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';

// ── Tabi design tokens (inline — no Tailwind dependency) ──────────────────────
const T = {
  cream: '#F0EDEA',
  white: '#ffffff',
  black: '#111111',
  border: '2px solid #111111',
  shadow: '4px 4px 0 #111111',
  shadowLg: '6px 6px 0 #111111',
  yellow: '#F7E07C',
  blue: '#6BBDE8',
  green: '#BBF7D0',
  redSoft: '#FECACA',
  font: "'Inter', system-ui, sans-serif",
  radius: '18px',
  radiusSm: '11px',
};

// ── Google SVG logo ───────────────────────────────────────────────────────────
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.8 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.2-11.3-7.9l-6.5 5C9.7 40 16.3 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-0.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

// ── Shared input style ────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontFamily: T.font,
  fontSize: '14px',
  fontWeight: '500',
  color: T.black,
  background: T.cream,
  border: '2px solid #e5e7eb',
  borderRadius: T.radiusSm,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

// ── Label style ───────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#6b7280',
  marginBottom: '5px',
};

export function AuthModal({ open, onClose, onLoginSuccess }) {
  const { loginWithToken } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);
  const googleScriptLoaded = useRef(false);

  // ── Reset on modal close ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) { setError(''); setMessage(''); setMode('login'); }
  }, [open]);

  // ── Load Google Identity Services script ──────────────────────────────────
  useEffect(() => {
    if (!open || googleScriptLoaded.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) return; // No client ID configured — skip

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded.current = true;
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          ux_mode: 'popup',
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 340,
          text: 'continue_with',
        });
      }
    };
    document.head.appendChild(script);
  }, [open]);

  // Re-render Google button when mode changes
  useEffect(() => {
    if (!open || !googleScriptLoaded.current || !window.google) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: googleBtnRef.current.offsetWidth || 340,
      text: 'continue_with',
    });
  }, [mode, open]);

  // ── Google credential callback ─────────────────────────────────────────────
  const handleGoogleCredential = async ({ credential }) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      if (!data.token) throw new Error('Missing token');
      loginWithToken(data.token, data.user);
      if (onLoginSuccess) onLoginSuccess();
      else onClose();
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email/password auth ───────────────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = mode === 'login'
      ? { email: fd.get('email'), password: fd.get('password') }
      : { username: fd.get('name'), email: fd.get('email'), password: fd.get('password') };

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/auth/${mode === 'login' ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Request failed');

      if (mode === 'signup') {
        setMessage(data.message || 'Signup successful! Please verify your email, then login.');
        setMode('login');
        return;
      }

      if (!data.token) throw new Error('Missing token');
      loginWithToken(data.token, data.user);
      if (onLoginSuccess) onLoginSuccess();
      else onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(5px)',
    }}>
      <div style={{
        background: T.white,
        border: T.border,
        borderRadius: T.radius,
        boxShadow: T.shadowLg,
        width: '100%',
        maxWidth: '440px',
        margin: '0 16px',
        position: 'relative',
        fontFamily: T.font,
        animation: 'modalIn 0.2s ease both',
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
          .auth-input:focus { border-color:#111 !important; box-shadow: 3px 3px 0 #111 !important; background:#fff !important; }
          .auth-switch-btn { background:none; border:none; cursor:pointer; font-weight:800; color:#111; font-family:inherit; font-size:13px; text-decoration:underline; padding:0; }
          .auth-switch-btn:hover { color:#555; }
          .google-btn-wrap > div { width:100% !important; }
        `}</style>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', right: 14, top: 14,
            width: 32, height: 32, borderRadius: '50%',
            border: T.border, background: T.cream,
            cursor: 'pointer', fontSize: 18, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.black, lineHeight: 1, boxShadow: '2px 2px 0 #111',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 #111'; }}
        >×</button>

        <div style={{ padding: '32px 32px 28px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: T.black, border: T.border,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0EDEA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px', color: T.black }}>LinkIt</span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 24, fontWeight: 900, color: T.black, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px', fontWeight: 500 }}>
            {mode === 'login'
              ? 'Sign in to access your links and collections.'
              : 'Signup requires email verification.'}
          </p>

          {/* Google Sign-In */}
          {hasGoogleClientId ? (
            <div style={{ marginBottom: 20 }}>
              <div ref={googleBtnRef} className="google-btn-wrap" style={{ width: '100%' }} />
              {googleLoading && (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 6 }}>Signing in with Google…</p>
              )}
            </div>
          ) : (
            /* Fallback: styled button that shows info when Google isn't configured */
            <button
              type="button"
              onClick={() => setError('Configure VITE_GOOGLE_CLIENT_ID in .env to enable Google login')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '11px 18px', marginBottom: 20,
                fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.black,
                background: T.white, border: T.border, borderRadius: T.radiusSm,
                cursor: 'pointer', boxShadow: '3px 3px 0 #111',
                transition: 'transform 0.13s, box-shadow 0.13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
            >
              <GoogleLogo /> Continue with Google
            </button>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 2, background: '#e5e7eb', borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>or</span>
            <div style={{ flex: 1, height: 2, background: '#e5e7eb', borderRadius: 2 }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Name</label>
                <input name="name" type="text" required className="auth-input" style={inputStyle} placeholder="Your name" />
              </div>
            )}
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" required className="auth-input" style={inputStyle} placeholder="you@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input name="password" type="password" required className="auth-input" style={inputStyle} placeholder="••••••••" />
            </div>

            {message && (
              <div style={{ background: T.green, border: '2px solid #111', borderRadius: T.radiusSm, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: T.black }}>
                ✅ {message}
              </div>
            )}
            {error && (
              <div style={{ background: T.redSoft, border: '2px solid #111', borderRadius: T.radiusSm, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: T.black }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '13px 18px',
                fontFamily: T.font, fontSize: 14, fontWeight: 800, color: T.cream,
                background: T.black, border: T.border, borderRadius: T.radiusSm,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '3px 3px 0 #111',
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.13s, box-shadow 0.13s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '3px 3px 0 #111'; }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Login →' : 'Create Account →'}
            </button>
          </form>

          {/* Switch mode */}
          <p style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button className="auth-switch-btn" onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>Sign up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button className="auth-switch-btn" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Login</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
