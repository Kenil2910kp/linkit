import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LandingHero } from './components/LandingHero';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { SharedCollectionPage } from './components/SharedCollectionPage';
import './dashboard.css';

export default function App() {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(() => !!localStorage.getItem('authToken'));

  // ── Handle /shared/:token or /#/shared/:token route ──────────────────────
  const pathParts = window.location.pathname.split('/');
  const hashParts = window.location.hash.replace(/^#/, '').split('/');
  const sharedToken = (pathParts[1] === 'shared' && pathParts[2])
    ? pathParts[2]
    : (hashParts[1] === 'shared' && hashParts[2] ? hashParts[2] : null);
  if (sharedToken) {
    return <SharedCollectionPage token={sharedToken} />;
  }

  useEffect(() => {
    if (!loading) {
      if (user) setShowDashboard(true);
      else setShowDashboard(false);
    }
  }, [loading, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') setAuthOpen(true);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F7FB', color: '#64748b', fontSize: 14 }}>
        Checking your session…
      </div>
    );
  }

  if (showDashboard) {
    return <Dashboard onBackToHome={() => setShowDashboard(false)} />;
  }

  return (
    <>
      <LandingHero
        onOpenAuth={() => setAuthOpen(true)}
        onOpenDashboard={() => {
          if (user) setShowDashboard(true);
          else setAuthOpen(true);
        }}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => {
          setAuthOpen(false);
          setShowDashboard(true);
        }}
      />
    </>
  );
}
