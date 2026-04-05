import { useAuth } from '../context/AuthContext';

/* ─── Google Fonts (Inter Black) ─── */
const FontLink = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
  </>
);

/* ─── Tiny inline SVGs ─── */
const Svg = ({ children, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/* ─── Pastel icon box (matches Tabi feature cards) ─── */
function IconBox({ bg, children }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: bg, display: 'grid', placeItems: 'center',
      marginBottom: 18, border: '1.5px solid rgba(0,0,0,0.08)',
    }}>
      {children}
    </div>
  );
}

/* ─── Pill tag at bottom of feature card ─── */
function Tag({ color, textColor, children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px',
      borderRadius: 999, background: color, color: textColor,
      fontSize: 12, fontWeight: 700, border: '1.5px solid rgba(0,0,0,0.12)',
      letterSpacing: '0.01em',
    }}>{children}</span>
  );
}

/* ─── Feature card (Tabi grid style) ─── */
function FeatureCard({ iconBg, icon, title, desc, tag, tagBg, tagColor }) {
  return (
    <div style={{
      background: '#fff', border: '2px solid #111', borderRadius: 20,
      padding: '24px 22px', display: 'flex', flexDirection: 'column',
      boxShadow: '3px 3px 0 #111', cursor: 'default',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}>
      <IconBox bg={iconBg}>{icon}</IconBox>
      <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>{title}</h3>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: '#555', lineHeight: 1.65, flex: 1 }}>{desc}</p>
      <Tag color={tagBg} textColor={tagColor}>{tag}</Tag>
    </div>
  );
}

/* ─── Step card (Tabi vertical list style) ─── */
function StepCard({ num, circleGradient, title, desc }) {
  return (
    <div style={{
      background: '#fff', border: '2px solid #111', borderRadius: 20,
      padding: '22px 26px', display: 'flex', gap: 22, alignItems: 'flex-start',
      boxShadow: '3px 3px 0 #111', transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: circleGradient, display: 'grid', placeItems: 'center',
        color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '0.02em',
        border: '2px solid rgba(0,0,0,0.15)',
      }}>{num}</div>
      <div style={{ paddingTop: 2 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#111' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: '#666', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export function LandingHero({ onOpenAuth, onOpenDashboard }) {
  const { user } = useAuth();

  /* Shared section wrapper */
  const wrap = { maxWidth: 1060, margin: '0 auto', padding: '0 28px' };

  return (
    <div style={{ background: '#F0EDEA', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#111' }}>
      <FontLink />

      {/* ══════════ NAVBAR ══════════ */}
      <header style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#F0EDEA', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ ...wrap, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 19, letterSpacing: '-0.5px', color: '#111' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#111', display: 'grid', placeItems: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0EDEA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            LinkIt
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* {[
              { label: 'Features', action: null },
              { label: 'Explore', action: onOpenAuth },
              { label: 'FAQ', action: null },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px', borderRadius: 10, fontSize: 14,
                  fontWeight: 600, color: '#444', transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#111'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'none'; }}>
                {label}
              </button>
            ))} */}
            {/* Login btn */}
            <button onClick={onOpenAuth}
              style={{
                marginLeft: 8, padding: '9px 20px', borderRadius: 12,
                background: 'transparent', color: '#111', fontSize: 14,
                fontWeight: 700, border: '2px solid #111', cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; }}>
              Log In
            </button>
            {/* Primary CTA */}
            <button onClick={onOpenAuth}
              style={{
                marginLeft: 6, padding: '9px 20px', borderRadius: 12,
                background: '#6BBDE8', color: '#111', fontSize: 14,
                fontWeight: 700, border: '2px solid #111', cursor: 'pointer',
                boxShadow: '2px 2px 0 #111', transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 #111'; }}>
              {user ? 'Dashboard →' : 'Start for free →'}
            </button>
          </nav>
        </div>
      </header >

      {/* ══════════ HERO ══════════ */}
      < section style={{ ...wrap, paddingTop: 72, paddingBottom: 80 }
      }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* ── Left ── */}
          <div>
            {/* Yellow badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: '#F7E07C', border: '2px solid #111',
              fontSize: 13, fontWeight: 700, color: '#111',
              marginBottom: 28, boxShadow: '2px 2px 0 #111',
            }}>
              🔗 Your personal link hub
            </div>

            {/* Big headline — matches Tabi's style */}
            <h1 style={{ margin: '0 0 4px', fontWeight: 900, fontSize: 'clamp(44px,5.5vw,64px)', letterSpacing: '-2.5px', lineHeight: 1.0, color: '#111', textTransform: 'uppercase' }}>
              SAVE LINKS.
            </h1>
            <h1 style={{
              margin: '0 0 4px', fontWeight: 900, fontSize: 'clamp(44px,5.5vw,64px)',
              letterSpacing: '-2.5px', lineHeight: 1.0, color: 'transparent',
              WebkitTextStroke: '3px #111', textTransform: 'uppercase',
            }}>
              BUILD COLLECTIONS.
            </h1>
            <h1 style={{
              margin: '0 0 28px', fontWeight: 900, fontSize: 'clamp(44px,5.5vw,64px)',
              letterSpacing: '-2.5px', lineHeight: 1.0, color: '#6BBDE8',
              textTransform: 'uppercase',
            }}>
              SHARE FREELY.
            </h1>

            <p style={{ fontSize: 15.5, color: '#555', lineHeight: 1.7, maxWidth: 430, margin: '0 0 32px' }}>
              LinkIt is your personal link hub — organize resources into collections,
              control who sees them with Private, Protected, or Public modes, and let AI
              auto-curate topic-specific collections for you.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <button onClick={onOpenAuth}
                style={{
                  padding: '13px 28px', borderRadius: 14,
                  background: '#6BBDE8', color: '#111',
                  fontSize: 15, fontWeight: 800, border: '2px solid #111',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '3px 3px 0 #111', transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}>
                {user ? 'Go to dashboard' : 'Start saving links'} →
              </button>
              <button onClick={onOpenDashboard}
                style={{
                  padding: '13px 28px', borderRadius: 14,
                  background: '#fff', color: '#111',
                  fontSize: 15, fontWeight: 700, border: '2px solid #111',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0 #111', transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}>
                View dashboard
              </button>
            </div>

            {/* Proof line */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Free to start', 'No credit card', 'Browser extension included'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#555', fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Floating mock UI ── */}
          <div style={{ position: 'relative', height: 380 }}>
            {/* Main card */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%) rotate(-1deg)',
              width: 300, background: '#fff', border: '2px solid #111',
              borderRadius: 20, padding: 20, boxShadow: '5px 5px 0 #111',
            }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Collections</div>

              {[
                { name: 'DSA Resources', count: '34 links', emoji: '🧠', color: '#EEF2FF' },
                { name: 'React Patterns', count: '21 links', emoji: '⚛️', color: '#F0FDF4' },
                { name: 'System Design', count: '18 links', emoji: '🏗️', color: '#FFF7ED' },
              ].map(c => (
                <div key={c.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12, background: c.color,
                  border: '1.5px solid #e5e7eb', marginBottom: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{c.count}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget-style card (top right) */}
            <div style={{
              position: 'absolute', top: 20, right: 0,
              background: '#FCD34D', border: '2px solid #111',
              borderRadius: 16, padding: '14px 18px', boxShadow: '4px 4px 0 #111', width: 160,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Visibility</div>
              {[
                { label: '🔒 Private', pct: '60%', bg: '#111' },
                { label: '📧 Protected', pct: '25%', bg: '#6BBDE8' },
                { label: '🌐 Public', pct: '15%', bg: '#86EFAC' },
              ].map(v => (
                <div key={v.label} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#444', marginBottom: 3 }}>{v.label}</div>
                  <div style={{ height: 7, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden' }}>
                    <div style={{ width: v.pct, height: '100%', background: v.bg, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Members badge */}
            <div style={{
              position: 'absolute', bottom: 30, right: 10,
              background: '#fff', border: '2px solid #111',
              borderRadius: 14, padding: '10px 16px', boxShadow: '3px 3px 0 #111',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ display: 'flex' }}>
                {['#6BBDE8', '#F7E07C', '#86EFAC', '#FCA5A5'].map((c, i) => (
                  <div key={c} style={{
                    width: 26, height: 26, borderRadius: '50%', background: c,
                    border: '2px solid #111', marginLeft: i > 0 ? -8 : 0,
                  }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>246 users</div>
                <div style={{ fontSize: 10, color: '#888' }}>collecting links</div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ══════════ FEATURE GRID — "YOUR LINKS, HANDLED." ══════════ */}
      < section style={{ background: '#F0EDEA', padding: '0 0 72px' }}>
        <div style={wrap}>
          <h2 style={{
            textAlign: 'center', fontWeight: 900, fontSize: 'clamp(28px,4vw,46px)',
            letterSpacing: '-1.5px', textTransform: 'uppercase',
            margin: '0 0 48px', color: '#111',
          }}>
            YOUR LINKS, HANDLED.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            <FeatureCard
              iconBg="#DBEAFE"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" /></svg>}
              title="Smart Collections"
              desc="Group links by topic, project, or theme. Add tags, descriptions, and custom covers. Your knowledge, beautifully organized."
              tag="Organize & tag"
              tagBg="#DBEAFE"
              tagColor="#1d4ed8"
            />
            <FeatureCard
              iconBg="#FED7AA"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" /><path d="M16 8L2 22" /><path d="M17.5 15H9" /></svg>}
              title="Browser Extension"
              desc="Save any link from any webpage with one click. Lands straight in your chosen collection — no copy-paste, no tab switching."
              tag="One-click capture"
              tagBg="#FED7AA"
              tagColor="#c2410c"
            />
            <FeatureCard
              iconBg="#BBF7D0"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
              title="Explore Feed"
              desc="Discover public collections from the community. Browse curated resources by topic and save gems straight to your library."
              tag="Community discovery"
              tagBg="#BBF7D0"
              tagColor="#15803d"
            />
            <FeatureCard
              iconBg="#FDE68A"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              title="Granular Sharing"
              desc="Private, Protected by email, or Public. Grant or revoke access any time. You're always in full control of who views what."
              tag="3 privacy levels"
              tagBg="#FDE68A"
              tagColor="#92400e"
            />
            <FeatureCard
              iconBg="#E9D5FF"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
              title="AI Collection Builder"
              desc="Point AI at any collection, name a topic, and it automatically extracts the relevant links and creates a focused new collection."
              tag="✨ AI-powered"
              tagBg="#E9D5FF"
              tagColor="#6d28d9"
            />
            <FeatureCard
              iconBg="#FECACA"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
              title="Favourites & Pins"
              desc="Bookmark your most-visited collections. Pin daily links to the top of your dashboard for instant access with no hunting around."
              tag="Quick access"
              tagBg="#FECACA"
              tagColor="#b91c1c"
            />
          </div>
        </div>
      </section >

      {/* ══════════ HOW IT WORKS — 3 STEPS ══════════ */}
      < section style={{ background: '#fff', borderTop: '2px solid #111', borderBottom: '2px solid #111', padding: '72px 0' }}>
        <div style={wrap}>
          <h2 style={{
            textAlign: 'center', fontWeight: 900, fontSize: 'clamp(28px,4vw,46px)',
            letterSpacing: '-1.5px', textTransform: 'uppercase',
            margin: '0 0 48px', color: '#111',
          }}>
            UP IN THREE STEPS.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, margin: '0 auto' }}>
            <StepCard
              num="01"
              circleGradient="linear-gradient(135deg, #93C5FD, #3B82F6)"
              title="Create a collection"
              desc="Name it, set visibility (Private, Protected, or Public), and pick a theme. Your collection dashboard is ready instantly — takes about 30 seconds."
            />
            <StepCard
              num="02"
              circleGradient="linear-gradient(135deg, #6EE7B7, #10B981)"
              title="Save links from anywhere"
              desc="Install the LinkIt browser extension and link your account. Click the extension on any webpage to save a link directly to the right collection with tags."
            />
            <StepCard
              num="03"
              circleGradient="linear-gradient(135deg, #FCA5A5, #EF4444)"
              title="Share & explore"
              desc="Share protected collections via email, publish public ones to the Explore feed, or use AI to split a big collection into focused topic-based ones automatically."
            />
          </div>
        </div>
      </section >

      {/* ══════════ SHARING MODES ══════════ */}
      < section style={{ padding: '72px 0', background: '#F0EDEA' }}>
        <div style={wrap}>
          <h2 style={{
            textAlign: 'center', fontWeight: 900, fontSize: 'clamp(28px,4vw,46px)',
            letterSpacing: '-1.5px', textTransform: 'uppercase',
            margin: '0 0 12px', color: '#111',
          }}>
            THREE SHARING MODES.
          </h2>
          <p style={{ textAlign: 'center', fontSize: 15, color: '#666', margin: '0 0 44px' }}>
            Every collection has its own privacy level — you decide exactly who gets in.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {[
              {
                emoji: '🔒', title: 'Private',
                desc: 'Only you can see it. Your personal research vault, bookmarks, and notes — completely hidden from the world.',
                tag: 'Only you', tagBg: '#E2E8F0', tagColor: '#334155',
                border: '#111', bg: '#fff',
              },
              {
                emoji: '📧', title: 'Protected',
                desc: 'Share with specific people by email. Perfect for teams, study groups, or client resources. Revoke access any time.',
                tag: 'Email access', tagBg: '#FDE68A', tagColor: '#92400e',
                border: '#111', bg: '#FFFBEB',
              },
              {
                emoji: '🌐', title: 'Public',
                desc: "Anyone can discover and browse your collection in the Explore feed. Share your expertise with the whole community.",
                tag: 'Visible in Explore', tagBg: '#BBF7D0', tagColor: '#15803d',
                border: '#111', bg: '#F0FDF4',
              },
            ].map(m => (
              <div key={m.title} style={{
                background: m.bg, border: `2px solid ${m.border}`, borderRadius: 20,
                padding: '28px 24px', boxShadow: '3px 3px 0 #111',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{m.emoji}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: '#111' }}>{m.title}</h3>
                <p style={{ margin: '0 0 18px', fontSize: 13.5, color: '#555', lineHeight: 1.65 }}>{m.desc}</p>
                <Tag color={m.tagBg} textColor={m.tagColor}>{m.tag}</Tag>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* ══════════ AI SECTION ══════════ */}
      < section style={{ background: '#fff', borderTop: '2px solid #111', borderBottom: '2px solid #111', padding: '72px 0' }}>
        <div style={wrap}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 999,
                background: '#E9D5FF', border: '2px solid #111',
                fontSize: 13, fontWeight: 700, color: '#6d28d9',
                marginBottom: 22, boxShadow: '2px 2px 0 #111',
              }}>
                ✨ AI-Powered
              </div>
              <h2 style={{
                fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 900, letterSpacing: '-1.2px',
                textTransform: 'uppercase', margin: '0 0 18px', color: '#111', lineHeight: 1.1,
              }}>
                LET AI BUILD<br />YOUR NEXT<br />COLLECTION.
              </h2>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.72, margin: '0 0 26px' }}>
                Have a huge "General" collection? Tell LinkIt AI what topic you want — say <strong>DSA</strong> or <strong>Machine Learning</strong> — and it scans every link, identifies the relevant ones, and builds a brand-new focused collection for you in seconds.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Scans all links in a source collection',
                  'Identifies topic relevance using AI',
                  'Creates a new focused collection instantly',
                  'Works across multiple source collections',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#BBF7D0',
                      border: '2px solid #111', display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI mock card */}
            <div>
              <div style={{ background: '#fff', border: '2px solid #111', borderRadius: 22, padding: 24, boxShadow: '5px 5px 0 #111' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1.5px solid #e5e7eb' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#E9D5FF', border: '2px solid #111', display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>✨</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>AI Collection Builder</div>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Powered by LinkIt AI</div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source collection</div>
                  <div style={{ fontSize: 14, color: '#111', fontWeight: 700 }}>📚 General Resources <span style={{ color: '#888', fontWeight: 500 }}>(147 links)</span></div>
                </div>

                <div style={{ background: '#F5F3FF', border: '1.5px solid #ddd6fe', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Topic to extract</div>
                  <div style={{ fontSize: 14, color: '#6d28d9', fontWeight: 700 }}>🧠 Data Structures & Algorithms</div>
                </div>

                <div style={{ background: '#F0FDF4', border: '2px solid #86efac', borderRadius: 12, padding: '14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>✅ New Collection Created!</div>
                  <div style={{ fontSize: 14, color: '#111', fontWeight: 700, marginBottom: 4 }}>🔐 DSA Resources</div>
                  <div style={{ fontSize: 12, color: '#555' }}>34 relevant links extracted & organized</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ══════════ CTA BANNER (light blue — exact Tabi style) ══════════ */}
      < section style={{ padding: '72px 0', background: '#F0EDEA' }}>
        <div style={wrap}>
          <div style={{
            background: '#6BBDE8', border: '2px solid #111', borderRadius: 22,
            padding: 'clamp(36px,5vw,56px) clamp(32px,5vw,64px)',
            boxShadow: '5px 5px 0 #111',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 28,
          }}>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px,3.5vw,38px)', letterSpacing: '-1.2px', textTransform: 'uppercase', color: '#111', margin: '0 0 10px', lineHeight: 1.1 }}>
                YOUR NEXT COLLECTION<br />STARTS HERE.
              </h2>
              <p style={{ fontSize: 15, color: '#1e3a5f', margin: 0, fontWeight: 500 }}>
                Free to create. Free to share. No credit card. Just save and organize.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={onOpenAuth}
                style={{
                  padding: '13px 28px', borderRadius: 14, fontSize: 15, fontWeight: 800,
                  background: '#111', color: '#fff', border: '2px solid #111',
                  cursor: 'pointer', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.3)'; }}>
                Create your Collection →
              </button>
              <button onClick={onOpenAuth}
                style={{
                  padding: '13px 28px', borderRadius: 14, fontSize: 15, fontWeight: 700,
                  background: '#fff', color: '#111', border: '2px solid #111',
                  cursor: 'pointer', boxShadow: '3px 3px 0 #111',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #111'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}>
                Log In
              </button>
            </div>
          </div>
        </div>
      </section >

      {/* ══════════ FOOTER ══════════ */}
      < footer style={{ background: '#F0EDEA', borderTop: '2px solid #111', padding: '28px 0' }}>
        <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 17, color: '#111' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#111', display: 'grid', placeItems: 'center', border: '2px solid #111' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0EDEA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            LinkIt
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'The Story ❤️'].map(l => (
              <button key={l}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, fontWeight: 600, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#111'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                {l}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#888', margin: 0, fontWeight: 500 }}>
            © 2025 LinkIt. Built for curious minds.
          </p>
        </div>
      </footer >
    </div >
  );
}
