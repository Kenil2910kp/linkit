// Configuration - Backend API Base URL
const API_BASE_URL = 'http://localhost:8011'; // TODO: Update with your backend URL

// Application State
let currentUser = null;
let collections = [];
let currentCollectionId = null;
let links = [];
let apiKeys = [];
let searchTerm = '';
let favoriteLinks = [];
let favoriteMeta = { count: 0, createdAt: null };

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Check if user is authenticated
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
  
    if (!token) {
      showAuthModal();
      return;
    }
  
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!res.ok) throw new Error('Invalid token');
  
      const data = await res.json();
  
      currentUser = data.user;
      localStorage.setItem('userData', JSON.stringify(data.user));
  
      showMainApp();
      loadUserData();
  
    } catch (err) {
      // Token expired / invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      showAuthModal();
    }
  }
  

// Initialize App
function initializeApp() {
    // Hide main app initially
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authModal').classList.add('show');
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth Modal Toggle
    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });

    // Close modal on X click
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('.close-modal');
            if (target.id === 'closeApiKeyModal') {
                document.getElementById('apiKeyModal').classList.remove('show');
            } else {
                document.getElementById('authModal').classList.remove('show');
                document.getElementById('linkModal').classList.remove('show');
            }
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const authModal = document.getElementById('authModal');
        const linkModal = document.getElementById('linkModal');
        const apiKeyModal = document.getElementById('apiKeyModal');
        if (e.target === authModal) {
            authModal.classList.remove('show');
        }
        if (e.target === linkModal) {
            linkModal.classList.remove('show');
        }
        if (e.target === apiKeyModal) {
            apiKeyModal.classList.remove('show');
        }
    });

    // API Key Modal Copy Button
    document.getElementById('copyApiKeyModalBtn').addEventListener('click', handleCopyApiKeyFromModal);

    // Auth Forms
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // API Key Section
    document.getElementById('apiKeyBtn').addEventListener('click', toggleApiKeyDropdown);
    document.getElementById('generateApiKeyBtn').addEventListener('click', showApiKeyForm);
    document.getElementById('createApiKeyBtn').addEventListener('click', handleCreateApiKey);
    document.getElementById('cancelApiKeyBtn').addEventListener('click', hideApiKeyForm);

    // Collections
    document.getElementById('addCollectionBtn').addEventListener('click', showCollectionForm);
    document.getElementById('saveCollectionBtn').addEventListener('click', handleCreateCollection);
    document.getElementById('cancelCollectionBtn').addEventListener('click', hideCollectionForm);

    // Links
    document.getElementById('addLinkBtn').addEventListener('click', showAddLinkModal);
    document.getElementById('linkForm').addEventListener('submit', handleSaveLink);
    document.getElementById('cancelLinkBtn').addEventListener('click', hideLinkModal);
    document.getElementById('addToFavoritesBtn').addEventListener('click', handleAddToFavorites);

    // Favorites
    document.getElementById('addFavoriteLinkBtn').addEventListener('click', showAddFavoriteModal);
    document.getElementById('favoriteLinkForm').addEventListener('submit', handleSaveFavoriteLink);
    document.getElementById('cancelFavoriteLinkBtn').addEventListener('click', hideFavoriteModal);

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
}

// ==================== AUTHENTICATION ====================

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        // // Simulated response for now
        // const data = {
        //     token: 'mock_token_' + Date.now(),
        //     user: { id: 1, name: 'Test User', email: email }
        // };
        localStorage.removeItem('currentCollectionId');
        currentCollectionId = null;
        links = [];
        renderCollections();
        renderLinks();

        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            currentUser = data.user;
            showMainApp();
            loadUserData();
            document.getElementById('authModal').classList.remove('show');
            showToast('Login successful!', 'success');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {

        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();

        localStorage.removeItem('currentCollectionId');
        currentCollectionId = null;
        links = [];
        renderCollections();
        renderLinks();

        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            currentUser = data.user;
            showMainApp();
            loadUserData();
            document.getElementById('authModal').classList.remove('show');
            showToast('Signup successful!', 'success');
        }
    } catch (error) {
        showToast('Signup failed. Please try again.', 'error');
        console.error('Signup error:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    currentUser = null;
    collections = [];
    links = [];
    apiKeys = [];
    favoriteLinks = [];
    favoriteMeta = { count: 0, createdAt: null };
    resetAuthForms();
    showAuthModal();
    showToast('Logged out successfully', 'success');
}

function showAuthModal() {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authModal').classList.add('show');
}

function showMainApp() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('mainApp').style.display = 'block';
}

function resetAuthForms() {
    // Login form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  
    // Signup form
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
  
    // Always show login form by default
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  }
  

// ==================== API KEY MANAGEMENT ====================

function toggleApiKeyDropdown() {
    const dropdown = document.getElementById('apiKeyDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    
    if (dropdown.style.display === 'block') {
        loadApiKeys();
    }
}

function showApiKeyForm() {
    document.getElementById('apiKeyForm').style.display = 'block';
    document.getElementById('apiKeyName').value = '';
    document.getElementById('apiKeyName').focus();
}

function hideApiKeyForm() {
    document.getElementById('apiKeyForm').style.display = 'none';
    document.getElementById('apiKeyName').value = '';
}

async function loadApiKeys() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api-keys`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        apiKeys = data || [];

        renderApiKeys();
    } catch (error) {
        showToast('Failed to load API keys', 'error');
        console.error('Load API keys error:', error);
    }
}

async function handleCreateApiKey() {
    const name = document.getElementById('apiKeyName').value.trim();
    
    if (!name) {
        showToast('Please enter an API key name', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/api-keys`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        });
        const data = await response.json();

        // // Simulated API key generation
        // const newApiKey = {
        //     id: Date.now(),
        //     name: name,
        //     key: 'api_key_' + generateRandomString(32),
        //     createdAt: new Date().toISOString()
        // };

        // Don't push to apiKeys array here - it will be reloaded from backend
        // apiKeys.push(data);
        // localStorage.setItem('mockApiKeys', JSON.stringify(apiKeys));

        hideApiKeyForm();
        // Reload API keys from backend to get the updated list
        await loadApiKeys();
        
        // Show the API key in a modal (only time it will be visible)
        showApiKeyModal(data.name, data.key);
    } catch (error) {
        showToast('Failed to generate API key', 'error');
        console.error('Create API key error:', error);
    }
}

function showApiKeyModal(name, key) {
    document.getElementById('apiKeyDisplayName').textContent = name;
    document.getElementById('apiKeyDisplayValue').textContent = key;
    document.getElementById('apiKeyModal').classList.add('show');
    // Store the key temporarily for copying
    document.getElementById('apiKeyModal').setAttribute('data-api-key', key);
}

function handleCopyApiKeyFromModal() {
    const key = document.getElementById('apiKeyModal').getAttribute('data-api-key');
    if (key) {
        navigator.clipboard.writeText(key).then(() => {
            showToast('API key copied to clipboard!', 'success');
            // Close the modal after copying
            document.getElementById('apiKeyModal').classList.remove('show');
            document.getElementById('apiKeyModal').removeAttribute('data-api-key');
        }).catch(err => {
            showToast('Failed to copy API key', 'error');
            console.error('Copy error:', err);
        });
    }
}

function renderApiKeys() {
    const container = document.getElementById('apiKeysList');
    
    if (apiKeys.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No API keys yet. Generate one to get started.</p>';
        return;
    }

    // Only show the name and delete button - key is only shown once during creation
    container.innerHTML = apiKeys.map(apiKey => `
        <div class="api-key-item">  
            <div class="api-key-item-header">
                <span class="api-key-item-name">${escapeHtml(apiKey.name)}</span>
                <div class="api-key-item-actions">
                    <button class="btn-danger" onclick="deleteApiKey('${apiKey._id || apiKey.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function deleteApiKey(id) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Reload API keys from backend after deletion
        await loadApiKeys();
        showToast('API key deleted successfully', 'success');
    } catch (error) {
        showToast('Failed to delete API key', 'error');
        console.error('Delete API key error:', error);
    }
}

// ==================== COLLECTIONS ====================

async function loadUserData() {

        await loadCollections();
      
        const savedCollectionId =
          localStorage.getItem('currentCollectionId');
          await loadFavoriteMeta();
          await loadFavoriteLinks();
    
        if (savedCollectionId) {
          currentCollectionId = savedCollectionId;
          await loadLinks();
          showCollectionView();
        }
    // await Promise.all([
    //     loadCollections(),
    //     loadApiKeys()
    // ]);
}

async function loadCollections() {
    try {
        const token = localStorage.getItem('authToken');

        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/collections`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        collections = data;

        // Simulated data for now
        // collections = localStorage.getItem('mockCollections') ? JSON.parse(localStorage.getItem('mockCollections')) : [];

        renderCollections();
    } catch (error) {
        showToast('Failed to load collections', 'error');
        console.error('Load collections error:', error);
    }
}

function showCollectionForm() {
    document.getElementById('collectionForm').style.display = 'block';
    document.getElementById('collectionNameInput').value = '';
    document.getElementById('collectionNameInput').focus();
}

function hideCollectionForm() {
    document.getElementById('collectionForm').style.display = 'none';
    document.getElementById('collectionNameInput').value = '';
}

async function handleCreateCollection() {
    const name = document.getElementById('collectionNameInput').value.trim();
    
    if (!name) {
        showToast('Please enter a collection name', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/collections`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        collections.unshift(data);

        // Simulated collection creation
        // const newCollection = {
        //     id: Date.now(),
        //     name: name,
        //     userId: currentUser.id,
        //     createdAt: new Date().toISOString()
        // };

        hideCollectionForm();
        renderCollections();
        showToast('Collection created successfully!', 'success');
    } catch (error) {
        showToast('Failed to create collection', 'error');
        console.error('Create collection error:', error);
    }
}

function renderCollections() {
    const container = document.getElementById('collectionsList');
    if (collections.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No collections yet. Create one to get started.</p>';
        return;
    }

    container.innerHTML = collections.map(collection => `
        <div class="collection-item ${collection._id === currentCollectionId ? 'active' : ''}"
             onclick="selectCollection('${collection._id}')">
            <span class="collection-item-name">${escapeHtml(collection.name)}</span>
            <div class="collection-item-actions" onclick="event.stopPropagation()">
                <button onclick="editCollection('${collection._id}')">✏️</button>
                <button onclick="deleteCollection('${collection._id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function selectCollection(id) {
    // 🔁 Toggle logic
    if (currentCollectionId === id) {
      // Unselect
      currentCollectionId = null;
      localStorage.removeItem('currentCollectionId');
  
      links = [];
      renderCollections();
      renderLinks();
  
      document.getElementById('collectionView').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
  
      return;
    }
  
    // Select new collection
    currentCollectionId = id;
    localStorage.setItem('currentCollectionId', id);
  
    renderCollections();
    await loadLinks();
    showCollectionView();
  }

function showCollectionView() {
    const collection = collections.find(c => c._id === currentCollectionId);
    if (collection) {
        document.getElementById('collectionTitle').textContent = collection.name;
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('collectionView').style.display = 'block';
    }
}

async function editCollection(id) {
    const collection = collections.find(c => c.id === id);
    if (!collection) return;

    const newName = prompt('Enter new collection name:', collection.name);
    if (!newName || newName.trim() === '') return;

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName.trim() })
        });

        collection.name = newName.trim();
        localStorage.setItem('mockCollections', JSON.stringify(collections));
        renderCollections();
        
        if (currentCollectionId === id) {
            document.getElementById('collectionTitle').textContent = collection.name;
        }
        
        showToast('Collection updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update collection', 'error');
        console.error('Update collection error:', error);
    }
}

async function deleteCollection(id) {
    if (!confirm('Are you sure you want to delete this collection? All links in this collection will also be deleted.')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        collections = collections.filter(c => c.id !== id);
        localStorage.setItem('mockCollections', JSON.stringify(collections));

        if (currentCollectionId === id) {
            currentCollectionId = null;
            document.getElementById('emptyState').style.display = 'block';
            document.getElementById('collectionView').style.display = 'none';
            links = [];
        }

        renderCollections();
        showToast('Collection deleted successfully', 'success');
    } catch (error) {
        showToast('Failed to delete collection', 'error');
        console.error('Delete collection error:', error);
    }
}

// ==================== LINKS ====================

async function loadLinks() {
    if (!currentCollectionId) {
        links = [];
        renderLinks();
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/links/collection/${currentCollectionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log(data);
        links = data;

        // Simulated data for now
        // const storedLinks = localStorage.getItem('mockLinks') ? JSON.parse(localStorage.getItem('mockLinks')) : [];
        // links = storedLinks.filter(link => link.collectionId === currentCollectionId);

        renderLinks();
    } catch (error) {
        showToast('Failed to load links', 'error');
        console.error('Load links error:', error);
    }
}

function showAddLinkModal() {
    document.getElementById('linkModalTitle').textContent = 'Add Link';
    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkForm').setAttribute('data-link-id', '');
    document.getElementById('linkModal').classList.add('show');
}

function showEditLinkModal(link) {
    document.getElementById('linkModalTitle').textContent = 'Edit Link';
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkForm').setAttribute('data-link-id', link._id);
    document.getElementById('linkModal').classList.add('show');
}

function hideLinkModal() {
    document.getElementById('linkModal').classList.remove('show');
    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkForm').setAttribute('data-link-id', '');
}

async function handleSaveLink(e) {
    e.preventDefault();
    const linkId = document.getElementById('linkForm').getAttribute('data-link-id');
    const title = document.getElementById('linkTitle').value.trim();
    const url = document.getElementById('linkUrl').value.trim();

    if (!title || !url) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (!currentCollectionId) {
        showToast('Please select a collection first', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        
        if (linkId) {
            // Update existing link
            // TODO: Replace with actual backend API call
            const response = await fetch(`${API_BASE_URL}/links/${linkId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, url })
            });

            const link = links.find(l => l._id === linkId);
            if (link) {
                link.title = title;
                link.url = url;
                link.updatedAt = new Date().toISOString();
            }
            links = links.filter(l => l._id !== linkId);
            links.unshift(link);

            showToast('Link updated successfully!', 'success');
        } else {
            // Create new link
            // TODO: Replace with actual backend API call
            const response = await fetch(`${API_BASE_URL}/links/${currentCollectionId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, url })
            });
            const data = await response.json();

            // const newLink = {
            //     id: Date.now(),
            //     collectionId: currentCollectionId,
            //     title: title,
            //     url: url,
            //     createdAt: new Date().toISOString()
            // };

            links.unshift(data);
            showToast('Link added successfully!', 'success');
        }

        // const allLinks = localStorage.getItem('mockLinks') ? JSON.parse(localStorage.getItem('mockLinks')) : [];
        // const otherLinks = allLinks.filter(l => l.collectionId !== currentCollectionId);
        // localStorage.setItem('mockLinks', JSON.stringify([...otherLinks, ...links]));

        hideLinkModal();
        renderLinks();
    } catch (error) {
        showToast('Failed to save link', 'error');
        console.error('Save link error:', error);
    }
}

function renderLinks() {
    const container = document.getElementById('linksList');
    let filteredLinks = links;

    // Apply search filter
    if (searchTerm.trim()) {
        filteredLinks = links.filter(link => 
            link.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (filteredLinks.length === 0) {
        container.innerHTML = searchTerm.trim() 
            ? '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No links found matching your search.</p>'
            : '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No links yet. Add one to get started.</p>';
        return;
    }

    container.innerHTML = filteredLinks.map(link => `
        <div class="link-item">
            <div class="link-item-header">
                <div>
                    <div class="link-item-title">${escapeHtml(link.title)}</div>
                    <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-item-url">${escapeHtml(link.url)}</a>
                </div>
                <div class="link-item-actions">
                    <button class="btn-secondary-small" onclick="editLink('${link._id}')" title="Edit">✏️</button>
                    <button class="btn-danger" onclick="deleteLink('${link._id}')" title="Delete">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
    console.log("rerender");
}

function editLink(id) {
    const link = links.find(l => l._id === id);
    if (link) {
        showEditLinkModal(link);
    }
}

async function deleteLink(id) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        // TODO: Replace with actual backend API call
        const response = await fetch(`${API_BASE_URL}/links/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        links = links.filter(l => l._id !== id);
        // const allLinks = localStorage.getItem('mockLinks') ? JSON.parse(localStorage.getItem('mockLinks')) : [];
        // const updatedLinks = allLinks.filter(l => l.id !== id);
        // localStorage.setItem('mockLinks', JSON.stringify(updatedLinks));

        renderLinks();
        showToast('Link deleted successfully', 'success');
    } catch (error) {
        showToast('Failed to delete link', 'error');
        console.error('Delete link error:', error);
    }
}

// ==================== SEARCH ====================

function handleSearch() {
    searchTerm = document.getElementById('searchInput').value;
    renderLinks();
}

// ==================== UTILITY FUNCTIONS ====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ==================== FAVORITES ====================

async function loadFavoriteMeta() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load favorites meta');
        
        const data = await response.json();
        favoriteMeta = data;
        
        // Update count display
        document.getElementById('favoritesCount').textContent = favoriteMeta.count || 0;
    } catch (error) {
        console.error('Load favorites meta error:', error);
        // Don't show toast for meta, just log error
    }
}

async function loadFavoriteLinks() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/favorites/links`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load favorite links');
        
        const data = await response.json();
        // Sort by createdAt DESC (newest first)
        favoriteLinks = data.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA; // DESC order
        });
        console.log(favoriteLinks);
        
        renderFavorites();
    } catch (error) {
        showToast('Failed to load favorite links', 'error');
        console.error('Load favorite links error:', error);
    }
}

function renderFavorites() {
    const container = document.getElementById('favoritesList');
    
    if (favoriteLinks.length === 0) {
        container.innerHTML = '<p class="favorites-empty">No favorite links yet.</p>';
        return;
    }

    container.innerHTML = favoriteLinks.map(link => `
        <div class="favorite-item">
            <div class="favorite-item-content">
                <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="favorite-link">
                    <div class="favorite-link-title">${escapeHtml(link.title)}</div>
                    <div class="favorite-link-url">${escapeHtml(link.url)}</div>
                </a>
            </div>
            <button class="btn-danger btn-small" onclick="deleteFavoriteLink('${link._id}')" title="Delete">🗑️</button>
        </div>
    `).join('');
}

async function deleteFavoriteLink(id) {
    if (!confirm('Are you sure you want to remove this link from favorites?')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/favorites/links/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to delete favorite link');

        // Remove from local state immediately
        favoriteLinks = favoriteLinks.filter(link => link._id !== id);
        favoriteMeta.count = Math.max(0, favoriteMeta.count - 1);
        
        // Update UI without refresh
        renderFavorites();
        document.getElementById('favoritesCount').textContent = favoriteMeta.count;
        
        showToast('Removed from favorites', 'success');
    } catch (error) {
        showToast('Failed to remove from favorites', 'error');
        console.error('Delete favorite link error:', error);
    }
}

function showAddFavoriteModal() {
    document.getElementById('favoriteLinkTitle').value = '';
    document.getElementById('favoriteLinkUrl').value = '';
    document.getElementById('favoriteLinkModal').classList.add('show');
}

function hideFavoriteModal() {
    document.getElementById('favoriteLinkModal').classList.remove('show');
    document.getElementById('favoriteLinkTitle').value = '';
    document.getElementById('favoriteLinkUrl').value = '';
}

async function handleSaveFavoriteLink(e) {
    e.preventDefault();
    const title = document.getElementById('favoriteLinkTitle').value.trim();
    const url = document.getElementById('favoriteLinkUrl').value.trim();

    if (!title || !url) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    await addLinkToFavorites(title, url);
}

async function handleAddToFavorites() {
    const title = document.getElementById('linkTitle').value.trim();
    const url = document.getElementById('linkUrl').value.trim();

    if (!title || !url) {
        showToast('Please fill in title and URL first', 'error');
        return;
    }

    await addLinkToFavorites(title, url);
    hideLinkModal();
}

async function addLinkToFavorites(title, url) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/favorites/links`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, url })
        });

        if (!response.ok) throw new Error('Failed to add to favorites');

        const data = await response.json();
        
        // Add to local state (prepend since newest first)
        favoriteLinks.unshift(data);
        favoriteMeta.count = favoriteMeta.count + 1;
        
        // Update UI without refresh
        renderFavorites();
        document.getElementById('favoritesCount').textContent = favoriteMeta.count;
        
        // Close modal
        hideFavoriteModal();
        
        showToast('Added to favorites!', 'success');
    } catch (error) {
        showToast('Failed to add to favorites', 'error');
        console.error('Add to favorites error:', error);
    }
}

// Make functions available globally for onclick handlers
window.deleteApiKey = deleteApiKey;
window.selectCollection = selectCollection;
window.editCollection = editCollection;
window.deleteCollection = deleteCollection;
window.editLink = editLink;
window.deleteLink = deleteLink;
window.deleteFavoriteLink = deleteFavoriteLink;
