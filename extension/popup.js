/**
 * Main popup.js - UI logic and event handlers
 */

import { getApiKey, saveApiKey, clearApiKey, hasApiKey } from './storage.js';
import { getCurrentTab } from './tabs.js';
import { 
  getFavorites, 
  addCurrentTabToFavorites, 
  getCollections, 
  addCurrentTabToCollection 
} from './api.js';
import { formatDate, copyToClipboard, openUrl, showNotification } from './utils.js';
import { state } from './state.js';

// DOM Elements
const elements = {
  // Views
  apiKeySetup: document.getElementById('apiKeySetup'),
  errorState: document.getElementById('errorState'),
  loadingState: document.getElementById('loadingState'),
  mainContent: document.getElementById('mainContent'),
  
  // API Key
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  apiKeyError: document.getElementById('apiKeyError'),
  
  // Error
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  resetApiKeyBtn: document.getElementById('resetApiKeyBtn'),
  
  // Current Page
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageUrl: document.getElementById('currentPageUrl'),
  
  // Navigation
  navTabs: document.querySelectorAll('.nav-tab'),
  
  // Search
  searchInput: document.getElementById('searchInput'),
  collectionSearchInput: document.getElementById('collectionSearchInput'),
  
  // Favorites
  favoritesView: document.getElementById('favoritesView'),
  favoritesList: document.getElementById('favoritesList'),
  addToFavoritesBtn: document.getElementById('addToFavoritesBtn'),
  
  // Collections
  collectionsView: document.getElementById('collectionsView'),
  collectionsList: document.getElementById('collectionsList'),
  
  // Collection Detail
  collectionDetailView: document.getElementById('collectionDetailView'),
  backToCollectionsBtn: document.getElementById('backToCollectionsBtn'),
  collectionDetailName: document.getElementById('collectionDetailName'),
  collectionDetailDate: document.getElementById('collectionDetailDate'),
  collectionDetailCount: document.getElementById('collectionDetailCount'),
  refreshCollectionBtn: document.getElementById('refreshCollectionBtn'),
  collectionLinksList: document.getElementById('collectionLinksList'),
  addToCollectionBtn: document.getElementById('addToCollectionBtn'),
  
  // Other
  saveAllBtn: document.getElementById('saveAllBtn')
};

let currentTab = null;

/**
 * Initialize the extension
 */
async function init() {
  try {
    // Load current tab info
    await loadCurrentTab();
    
    // Check API key
    const hasKey = await hasApiKey();
    if (!hasKey) {
      showApiKeySetup();
      return;
    }
    
    // Load data
    await loadData();
  } catch (error) {
    console.error('Init error:', error);
    showError(error.message);
  }
}

/**
 * Load current tab information
 */
async function loadCurrentTab() {
  try {
    currentTab = await getCurrentTab();
    elements.currentPageTitle.textContent = currentTab.title;
    elements.currentPageUrl.textContent = currentTab.url;
  } catch (error) {
    console.error('Error loading current tab:', error);
    elements.currentPageTitle.textContent = 'Unable to load tab';
    elements.currentPageUrl.textContent = '';
  }
}

/**
 * Show API key setup screen
 */
function showApiKeySetup() {
  elements.apiKeySetup.style.display = 'block';
  elements.errorState.style.display = 'none';
  elements.loadingState.style.display = 'none';
  elements.mainContent.style.display = 'none';
}

/**
 * Show error state
 */
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorState.style.display = 'block';
  elements.apiKeySetup.style.display = 'none';
  elements.loadingState.style.display = 'none';
  elements.mainContent.style.display = 'none';
}

/**
 * Show loading state
 */
function showLoading() {
  elements.loadingState.style.display = 'block';
  elements.errorState.style.display = 'none';
  elements.apiKeySetup.style.display = 'none';
  elements.mainContent.style.display = 'none';
}

/**
 * Show main content
 */
function showMainContent() {
  elements.mainContent.style.display = 'block';
  elements.loadingState.style.display = 'none';
  elements.errorState.style.display = 'none';
  elements.apiKeySetup.style.display = 'none';
}

/**
 * Load all data (favorites and collections)
 */
async function loadData() {
  showLoading();

  try {
    const normalize = (res) => {
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      return [];
    };

    const [favoritesRes, collectionsRes] = await Promise.all([
      getFavorites().catch(err => {
        console.error('Error loading favorites:', err);
        return null;
      }),
      getCollections().catch(err => {
        console.error('Error loading collections:', err);
        return null;
      })
    ]);
    console.log('RAW favorites response:', favoritesRes);
console.log('RAW collections response:', collectionsRes);


state.setFavorites(
  Array.isArray(favoritesRes?.links) ? favoritesRes.links : []
);

    state.setCollections(normalize(collectionsRes));

    showMainContent();
    renderCurrentView();
  } catch (error) {
    console.error('Error loading data:', error);
    showError(error.message);
  }
}


/**
 * Render the current view based on state
 */
function renderCurrentView() {
  if (state.currentView === 'favorites') {
    renderFavorites();
  } else if (state.currentView === 'collections') {
    renderCollections();
  } else if (state.currentView === 'collection-detail') {
    renderCollectionDetail();
  }
}

/**
 * Render favorites list
 */
function renderFavorites() {
  const filtered = state.getFilteredFavorites();
  
  if (filtered.length === 0) {
    elements.favoritesList.innerHTML = '<div class="empty-state">No favorites yet. Add your first favorite!</div>';
    return;
  }
  
  elements.favoritesList.innerHTML = filtered.map(fav => `
    <div class="link-item">
      <div class="link-title">${escapeHtml(fav.title || 'Untitled')}</div>
      <div class="link-url">${escapeHtml(fav.url || '')}</div>
      <div class="link-actions">
        <button class="btn-link" data-action="open" data-url="${escapeHtml(fav.url || '')}">Open</button>
        <button class="btn-link" data-action="copy" data-url="${escapeHtml(fav.url || '')}">Copy</button>
      </div>
    </div>
  `).join('');
  
  // Attach event listeners
  elements.favoritesList.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleLinkAction);
  });
}

/**
 * Render collections list
 */
function renderCollections() {
  const collections = state.collections;
  
  if (collections.length === 0) {
    elements.collectionsList.innerHTML = '<div class="empty-state">No collections yet.</div>';
    return;
  }
  
  elements.collectionsList.innerHTML = collections.map(collection => `
    <div class="collection-item" data-collection-id="${collection.id || collection._id}">
      <div class="collection-item-header">
        <div class="collection-name">${escapeHtml(collection.name || 'Unnamed Collection')}</div>
        <button class="collection-refresh" data-action="refresh-collection" data-collection-id="${collection.id || collection._id}" title="Refresh">↻</button>
      </div>
      <div class="collection-meta">
        <span>${formatDate(collection.createdAt || collection.created_at)}</span>
        <span>${collection.linkCount || collection.links?.length || 0} links</span>
      </div>
    </div>
  `).join('');
  
  // Attach event listeners
  elements.collectionsList.querySelectorAll('.collection-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('collection-refresh')) return;
      const collectionId = item.dataset.collectionId;
      const collection = collections.find(c => (c.id || c._id) === collectionId);
      if (collection) {
        openCollectionDetail(collection);
      }
    });
  });
  
  elements.collectionsList.querySelectorAll('[data-action="refresh-collection"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const collectionId = btn.dataset.collectionId;
      await refreshCollection(collectionId);
    });
  });
}

/**
 * Open collection detail view
 */
async function openCollectionDetail(collection) {
  state.setSelectedCollection(collection);
  
  // Fetch full collection data if links not loaded
  if (!collection.links) {
    try {
      // Re-fetch collections to get updated data
      const collections = await getCollections();
      const updatedCollection = collections.find(c => (c.id || c._id) === (collection.id || collection._id));
      if (updatedCollection) {
        state.setSelectedCollection(updatedCollection);
      }
    } catch (error) {
      console.error('Error loading collection details:', error);
    }
  }
  
  // Show collection detail view and hide others
  elements.favoritesView.style.display = 'none';
  elements.collectionsView.style.display = 'none';
  elements.collectionDetailView.style.display = 'block';
  elements.searchInput.parentElement.style.display = 'none';
  elements.collectionSearchInput.parentElement.style.display = 'block';
  state.setSearchQuery('');
  elements.collectionSearchInput.value = '';
  
  renderCollectionDetail();
}

/**
 * Render collection detail view
 */
function renderCollectionDetail() {
  const collection = state.selectedCollection;
  if (!collection) {
    return;
  }
  
  elements.collectionDetailName.textContent = collection.name || 'Unnamed Collection';
  elements.collectionDetailDate.textContent = formatDate(collection.createdAt || collection.created_at);
  const linkCount = collection.links?.length || collection.linkCount || 0;
  elements.collectionDetailCount.textContent = `${linkCount} links`;
  
  const filtered = state.getFilteredCollectionLinks();
  
  if (filtered.length === 0) {
    elements.collectionLinksList.innerHTML = '<div class="empty-state">No links in this collection yet. Add your first link!</div>';
    return;
  }
  
  elements.collectionLinksList.innerHTML = filtered.map(link => `
    <div class="link-item">
      <div class="link-title">${escapeHtml(link.title || 'Untitled')}</div>
      <div class="link-url">${escapeHtml(link.url || '')}</div>
      <div class="link-actions">
        <button class="btn-link" data-action="open" data-url="${escapeHtml(link.url || '')}">Open</button>
        <button class="btn-link" data-action="copy" data-url="${escapeHtml(link.url || '')}">Copy</button>
      </div>
    </div>
  `).join('');
  
  // Attach event listeners
  elements.collectionLinksList.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleLinkAction);
  });
}

/**
 * Handle link actions (open/copy)
 */
async function handleLinkAction(e) {
  const action = e.target.dataset.action;
  const url = e.target.dataset.url;
  
  if (action === 'open') {
    openUrl(url);
  } else if (action === 'copy') {
    try {
      await copyToClipboard(url);
      showNotification('Link copied to clipboard!');
    } catch (error) {
      showNotification('Failed to copy link', 'error');
    }
  }
}

/**
 * Add current tab to favorites
 */
async function addToFavorites() {
  if (!currentTab) {
    await loadCurrentTab();
  }
  
  if (!currentTab || !currentTab.url) {
    showNotification('Unable to get current tab information', 'error');
    return;
  }
  
  try {
    elements.addToFavoritesBtn.disabled = true;
    elements.addToFavoritesBtn.textContent = 'Adding...';
    
    const newFavorite = await addCurrentTabToFavorites(currentTab.title, currentTab.url);
    
    // Add to top of favorites list
    state.setFavorites([newFavorite, ...state.favorites]);
    renderFavorites();
    
    showNotification('Added to favorites!');
  } catch (error) {
    console.error('Error adding to favorites:', error);
    showNotification(error.message || 'Failed to add to favorites', 'error');
  } finally {
    elements.addToFavoritesBtn.disabled = false;
    elements.addToFavoritesBtn.textContent = '+ Add Current Tab to Favorites';
  }
}

/**
 * Add current tab to collection
 */
async function addToCollection() {
  if (!currentTab) {
    await loadCurrentTab();
  }
  
  if (!currentTab || !currentTab.url) {
    showNotification('Unable to get current tab information', 'error');
    return;
  }
  
  const collection = state.selectedCollection;
  if (!collection) {
    showNotification('No collection selected', 'error');
    return;
  }
  
  const collectionId = collection.id || collection._id;
  if (!collectionId) {
    showNotification('Invalid collection', 'error');
    return;
  }
  
  try {
    elements.addToCollectionBtn.disabled = true;
    elements.addToCollectionBtn.textContent = 'Adding...';
    
    const newLink = await addCurrentTabToCollection(collectionId, currentTab.title, currentTab.url);
    
    // Add to top of collection links
    if (!collection.links) {
      collection.links = [];
    }
    collection.links = [newLink, ...collection.links];
    state.setSelectedCollection(collection);
    renderCollectionDetail();
    
    showNotification('Added to collection!');
  } catch (error) {
    console.error('Error adding to collection:', error);
    showNotification(error.message || 'Failed to add to collection', 'error');
  } finally {
    elements.addToCollectionBtn.disabled = false;
    elements.addToCollectionBtn.textContent = '+ Add Current Tab';
  }
}

/**
 * Refresh a specific collection
 */
async function refreshCollection(collectionId) {
  try {
    const collections = await getCollections();
    const collection = collections.find(c => (c.id || c._id) === collectionId);
    
    if (collection) {
      // Update in state
      const updatedCollections = state.collections.map(c => 
        (c.id || c._id) === collectionId ? collection : c
      );
      state.setCollections(updatedCollections);
      
      // If this is the currently selected collection, update it
      if (state.selectedCollection && (state.selectedCollection.id || state.selectedCollection._id) === collectionId) {
        state.setSelectedCollection(collection);
        renderCollectionDetail();
      } else {
        renderCollections();
      }
      
      showNotification('Collection refreshed!');
    }
  } catch (error) {
    console.error('Error refreshing collection:', error);
    showNotification('Failed to refresh collection', 'error');
  }
}

/**
 * Refresh current collection detail
 */
async function refreshCurrentCollection() {
  const collection = state.selectedCollection;
  if (collection) {
    await refreshCollection(collection.id || collection._id);
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // API Key setup
  elements.saveApiKeyBtn.addEventListener('click', async () => {
    const apiKey = elements.apiKeyInput.value.trim();
    if (!apiKey) {
      elements.apiKeyError.textContent = 'Please enter an API key';
      return;
    }
    
    try {
      await saveApiKey(apiKey);
      elements.apiKeyError.textContent = '';
      await loadData();
    } catch (error) {
      elements.apiKeyError.textContent = error.message || 'Failed to save API key';
    }
  });
  
  elements.apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      elements.saveApiKeyBtn.click();
    }
  });
  
  // Error state
  elements.retryBtn.addEventListener('click', async () => {
    await loadData();
  });
  
  elements.resetApiKeyBtn.addEventListener('click', async () => {
    await clearApiKey();
    showApiKeySetup();
  });
  
  // Navigation tabs
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      elements.navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      if (view === 'favorites') {
        state.setCurrentView('favorites');
        state.setSelectedCollection(null);
        elements.favoritesView.style.display = 'block';
        elements.collectionsView.style.display = 'none';
        elements.collectionDetailView.style.display = 'none';
        elements.searchInput.parentElement.style.display = 'block';
        elements.collectionSearchInput.parentElement.style.display = 'none';
        elements.searchInput.placeholder = 'Search favorites...';
        state.setSearchQuery('');
        elements.searchInput.value = '';
        renderFavorites();
      } else if (view === 'collections') {
        state.setCurrentView('collections');
        state.setSelectedCollection(null);
        elements.favoritesView.style.display = 'none';
        elements.collectionsView.style.display = 'block';
        elements.collectionDetailView.style.display = 'none';
        elements.searchInput.parentElement.style.display = 'block';
        elements.collectionSearchInput.parentElement.style.display = 'none';
        elements.searchInput.placeholder = 'Search collections...';
        state.setSearchQuery('');
        elements.searchInput.value = '';
        renderCollections();
      }
    });
  });
  
  // Search
  elements.searchInput.addEventListener('input', (e) => {
    state.setSearchQuery(e.target.value);
    if (state.currentView === 'favorites') {
      renderFavorites();
    }
  });
  
  elements.collectionSearchInput.addEventListener('input', (e) => {
    state.setSearchQuery(e.target.value);
    if (state.currentView === 'collection-detail') {
      renderCollectionDetail();
    }
  });
  
  // Add to favorites
  elements.addToFavoritesBtn.addEventListener('click', addToFavorites);
  
  // Add to collection
  elements.addToCollectionBtn.addEventListener('click', addToCollection);
  
  // Back to collections
  elements.backToCollectionsBtn.addEventListener('click', () => {
    state.setCurrentView('collections');
    state.setSelectedCollection(null);
    elements.favoritesView.style.display = 'none';
    elements.collectionsView.style.display = 'block';
    elements.collectionDetailView.style.display = 'none';
    elements.searchInput.parentElement.style.display = 'block';
    elements.collectionSearchInput.parentElement.style.display = 'none';
    elements.navTabs.forEach(t => {
      if (t.dataset.view === 'collections') {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    state.setSearchQuery('');
    elements.searchInput.value = '';
    renderCollections();
  });
  
  // Refresh collection
  elements.refreshCollectionBtn.addEventListener('click', refreshCurrentCollection);
  
  // Save All (placeholder - can be implemented later)
  elements.saveAllBtn.addEventListener('click', () => {
    showNotification('Save All feature coming soon!');
  });
  
  // Subscribe to state changes
  state.subscribe((newState) => {
    // Update search placeholder based on view
    if (newState.currentView === 'favorites') {
      elements.searchInput.placeholder = 'Search favorites...';
    } else if (newState.currentView === 'collections') {
      elements.searchInput.placeholder = 'Search collections...';
    }
  });
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    init();
  });
} else {
  setupEventListeners();
  init();
}

