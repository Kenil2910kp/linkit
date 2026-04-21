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

const CopyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* fallback */ }
    };
    return (
        <button className={`btn-icon ${copied ? 'success' : ''}`} onClick={copy} title="Copy">
            {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
}

export function IntegrationsView({ token }) {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [newKey, setNewKey] = useState(null);

    useEffect(() => {
        apiFetch('/api-keys', token)
            .then((data) => setKeys(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const create = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setError('');
        setCreating(true);
        try {
            const res = await apiFetch('/api-keys', token, {
                method: 'POST',
                body: JSON.stringify({ name: name.trim() }),
            });
            if (res.error) throw new Error(res.error);
            setNewKey(res);
            setKeys((prev) => [{ _id: res.id, name: res.name, createdAt: res.createdAt }, ...prev]);
            setName('');
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const deleteKey = async (id) => {
        if (!confirm('Revoke this API key? This cannot be undone.')) return;
        await apiFetch(`/api-keys/${id}`, token, { method: 'DELETE' });
        setKeys((prev) => prev.filter((k) => k._id !== id));
        if (newKey?.id === id) setNewKey(null);
    };

    return (
        <div className="main-content">
            <div className="content-header">
                <h2 className="content-title">🔌 Integrations</h2>
                <span className="badge">{keys.length} active key{keys.length !== 1 ? 's' : ''}</span>
            </div>

            <p className="integrations-desc">
                Use API keys to access LinkIt from external tools, browser extensions, or scripts.
                <strong> The key is shown only once</strong> — copy it immediately after creation.
            </p>
            <div className="integrations-actions">
                <a
                    href="https://chromewebstore.google.com/detail/koleabcecncmoebpgfjnadknpllfimdc?utm_source=item-share-cb"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                >
                    Download Chrome Extension
                </a>
            </div>

            {/* Create form */}
            <div className="fav-add-card">
                <form onSubmit={create} className="fav-add-form">
                    <label className="modal-label">Key Name</label>
                    <div className="api-create-row">
                        <input
                            className="modal-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Browser Extension, CLI tool…"
                            required
                        />
                        <button type="submit" className="btn-primary" disabled={creating} style={{ whiteSpace: 'nowrap' }}>
                            {creating ? 'Generating…' : 'Generate Key'}
                        </button>
                    </div>
                    {error && <p className="modal-error">{error}</p>}
                </form>
            </div>

            {/* New key reveal banner */}
            {newKey && (
                <div className="key-reveal-banner">
                    <div className="key-reveal-title">
                        🎉 New API Key — <strong>copy it now, it won&apos;t be shown again</strong>
                    </div>
                    <div className="key-reveal-row">
                        <code className="key-reveal-code">{newKey.key}</code>
                        <CopyButton text={newKey.key} />
                    </div>
                    <button className="key-reveal-dismiss" onClick={() => setNewKey(null)}>Dismiss</button>
                </div>
            )}

            {/* Key list */}
            {loading ? (
                <p className="state-text">Loading API keys…</p>
            ) : keys.length === 0 ? (
                <div className="empty-state">
                    <span style={{ fontSize: 40 }}>🔑</span>
                    <p>No API keys yet. Generate one above.</p>
                </div>
            ) : (
                <div className="api-key-list">
                    {keys.map((k, i) => (
                        <div key={k._id} className="api-key-item" style={{ animationDelay: `${i * 0.04}s` }}>
                            <div className="api-key-meta">
                                <span className="api-key-name">{k.name}</span>
                                <span className="api-key-date">
                                    Created {new Date(k.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {k.lastUsedAt
                                        ? ` · Last used ${new Date(k.lastUsedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        : ' · Never used'}
                                </span>
                            </div>
                            <div className="api-key-prefix">
                                <code>{k._id?.slice(0, 10)}••••</code>
                            </div>
                            <button className="btn-icon danger" onClick={() => deleteKey(k._id)} title="Revoke key">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
