/**
 * popup.js — Tabi-styled LinkIt Extension
 * Collections tab: one-click adds current tab to a collection (no navigation)
 */

import { saveApiKey, clearApiKey, hasApiKey } from './storage.js';
import { getCurrentTab } from './tabs.js';
import { getFavorites, addCurrentTabToFavorites, getCollections, addCurrentTabToCollection } from './api.js';
import { formatDate, copyToClipboard, openUrl } from './utils.js';
import { state } from './state.js';

// ── DOM refs ────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const elements = {
  // Views
  apiKeySetup: $('apiKeySetup'),
  errorState: $('errorState'),
  loadingState: $('loadingState'),
  mainContent: $('mainContent'),
  // API Key
  apiKeyInput: $('apiKeyInput'),
  saveApiKeyBtn: $('saveApiKeyBtn'),
  apiKeyError: $('apiKeyError'),
  // Error
  errorMessage: $('errorMessage'),
  retryBtn: $('retryBtn'),
  resetApiKeyBtn: $('resetApiKeyBtn'),
  // Current Page
  currentPageTitle: $('currentPageTitle'),
  currentPageUrl: $('currentPageUrl'),
  // Navigation
  navTabs: document.querySelectorAll('.nav-tab'),
  // Search
  searchInput: $('searchInput'),
  // Favorites
  favoritesView: $('favoritesView'),
  favoritesList: $('favoritesList'),
  addToFavBtn: $('addToFavoritesBtn'),
  // Collections
  collectionsView: $('collectionsView'),
  collectionsList: $('collectionsList'),
  // Logout
  logoutBtn: $('logoutBtn'),
  // Toast
  toast: $('toast'),
};

let currentTab = null;

// ── Toast ───────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'success') {
  const t = elements.toast;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 2400);
}

// ── Screen switching ─────────────────────────────────────────────────────────
const hide = (el) => { if (el) el.style.display = 'none'; };
const show = (el, d = 'block') => { if (el) el.style.display = d; };

function showApiKeySetup() {
  show(elements.apiKeySetup);
  hide(elements.errorState);
  hide(elements.loadingState);
  hide(elements.mainContent);
}

function showError(msg) {
  elements.errorMessage.textContent = msg;
  show(elements.errorState);
  hide(elements.apiKeySetup);
  hide(elements.loadingState);
  hide(elements.mainContent);
}

function showLoading() {
  show(elements.loadingState, 'flex');
  hide(elements.errorState);
  hide(elements.apiKeySetup);
  hide(elements.mainContent);
}

function showMainContent() {
  show(elements.mainContent);
  hide(elements.loadingState);
  hide(elements.errorState);
  hide(elements.apiKeySetup);
}

// ── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  try {
    await loadCurrentTab();
    const hasKey = await hasApiKey();
    if (!hasKey) { showApiKeySetup(); return; }
    await loadData();
  } catch (err) {
    console.error('Init error:', err);
    showError(err.message);
  }
}

async function loadCurrentTab() {
  try {
    currentTab = await getCurrentTab();
    elements.currentPageTitle.textContent = currentTab.title || 'Unknown Page';
    elements.currentPageUrl.textContent = currentTab.url || '';
  } catch {
    elements.currentPageTitle.textContent = 'Unable to load tab';
    elements.currentPageUrl.textContent = '';
  }
}

async function loadData() {
  showLoading();
  try {
    const normalize = (res) => {
      if (Array.isArray(res)) return res;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.collections && Array.isArray(res.collections)) return res.collections;
      return [];
    };

    const [favRes, colRes] = await Promise.all([
      getFavorites().catch(() => null),
      getCollections().catch(() => null),
    ]);

    state.setFavorites(Array.isArray(favRes?.links) ? favRes.links : []);
    state.setCollections(normalize(colRes));

    showMainContent();
    renderCurrentView();
  } catch (err) {
    showError(err.message);
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderCurrentView() {
  if (state.currentView === 'favorites') renderFavorites();
  else if (state.currentView === 'collections') renderCollections();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function faviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
  catch { return ''; }
}

// ── Favorites ─────────────────────────────────────────────────────────────────
function renderFavorites() {
  const list = state.getFilteredFavorites();
  if (list.length === 0) {
    elements.favoritesList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⭐</span>
        No favorites yet. Add this tab!
      </div>`;
    return;
  }

  elements.favoritesList.innerHTML = list.map((fav, i) => `
    <div class="link-item" style="animation-delay:${i * 0.04}s">
      <div class="link-item-header">
        ${faviconUrl(fav.url) ? `<img class="link-favicon" src="${faviconUrl(fav.url)}" onerror="this.style.display='none'" alt="">` : ''}
        <div class="link-title">${escapeHtml(fav.title || 'Untitled')}</div>
      </div>
      <div class="link-url">${escapeHtml(fav.url || '')}</div>
      <div class="link-actions">
        <button class="btn-link" data-action="open"  data-url="${escapeHtml(fav.url || '')}">Open</button>
        <button class="btn-link" data-action="copy"  data-url="${escapeHtml(fav.url || '')}">Copy</button>
      </div>
    </div>
  `).join('');

  elements.favoritesList.querySelectorAll('[data-action]').forEach(btn =>
    btn.addEventListener('click', handleLinkAction)
  );
}

async function addToFavorites() {
  if (!currentTab) await loadCurrentTab();
  if (!currentTab?.url) { showToast('Cannot get current tab', 'error'); return; }

  elements.addToFavBtn.disabled = true;
  elements.addToFavBtn.textContent = 'Adding…';

  try {
    const newFav = await addCurrentTabToFavorites(currentTab.title, currentTab.url);
    state.setFavorites([newFav, ...state.favorites]);
    renderFavorites();
    showToast('✅ Added to Favorites!');
  } catch (err) {
    showToast(err.message || 'Failed to add', 'error');
  } finally {
    elements.addToFavBtn.disabled = false;
    elements.addToFavBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Add Current Tab to Favorites`;
  }
}

// ── Collections — ONE CLICK = INSTANT ADD ─────────────────────────────────────
function renderCollections() {
  const cols = state.getFilteredCollections();
  if (cols.length === 0) {
    const emptyMsg =
      state.collections.length > 0 && state.searchQuery.trim()
        ? 'No collections match your search.'
        : 'No collections yet. Create one in the dashboard!';
    elements.collectionsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📁</span>
        ${emptyMsg}
      </div>`;
    return;
  }

  elements.collectionsList.innerHTML = cols.map((col, i) => `
    <div class="collection-item" data-col-id="${col.id || col._id}" data-col-name="${escapeHtml(col.name || '')}" style="animation-delay:${i * 0.04}s">
      <div class="collection-item-info">
        <div class="collection-name">${escapeHtml(col.name || 'Unnamed')}</div>
        <div class="collection-meta">
          <span>${formatDate(col.createdAt || col.created_at)}</span>
        </div>
      </div>
      <button class="collection-add-btn" title="Add current tab to this collection">+</button>
    </div>
  `).join('');

  // Clicking the card OR the + button both trigger one-click add
  elements.collectionsList.querySelectorAll('.collection-item').forEach(card => {
    card.addEventListener('click', async () => {
      const colId = card.dataset.colId;
      const colName = card.dataset.colName;
      await addTabToCollection(colId, colName, card);
    });
  });
}

async function addTabToCollection(colId, colName, cardEl) {
  if (!currentTab) await loadCurrentTab();
  if (!currentTab?.url) { showToast('Cannot get current tab', 'error'); return; }

  // Visual feedback — add .adding class
  cardEl.classList.add('adding');
  const addBtn = cardEl.querySelector('.collection-add-btn');
  if (addBtn) addBtn.textContent = '…';

  try {
    await addCurrentTabToCollection(colId, currentTab.title, currentTab.url);
    showToast(`✅ Link added to "${colName}"!`);
  } catch (err) {
    showToast(err.message || 'Failed to add link', 'error');
  } finally {
    cardEl.classList.remove('adding');
    if (addBtn) addBtn.textContent = '+';
    renderCollections();
  }
}

// ── Link actions ──────────────────────────────────────────────────────────────
async function handleLinkAction(e) {
  e.stopPropagation();
  const { action, url } = e.target.dataset;
  if (action === 'open') { openUrl(url); }
  else if (action === 'copy') {
    try { await copyToClipboard(url); showToast('📋 Link copied!'); }
    catch { showToast('Failed to copy', 'error'); }
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────
function setupEventListeners() {
  // API key save
  elements.saveApiKeyBtn.addEventListener('click', async () => {
    const key = elements.apiKeyInput.value.trim();
    if (!key) { elements.apiKeyError.textContent = 'Please enter an API key'; return; }
    try {
      await saveApiKey(key);
      elements.apiKeyError.textContent = '';
      await loadData();
    } catch (err) { elements.apiKeyError.textContent = err.message || 'Failed to save API key'; }
  });

  elements.apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.saveApiKeyBtn.click();
  });

  // Error state
  elements.retryBtn.addEventListener('click', loadData);
  elements.resetApiKeyBtn.addEventListener('click', async () => {
    await clearApiKey();
    showApiKeySetup();
  });

  // Nav tabs
  elements.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const view = tab.dataset.view;

      if (view === 'favorites') {
        state.setCurrentView('favorites');
        show(elements.favoritesView);
        hide(elements.collectionsView);
        elements.searchInput.placeholder = 'Search favorites…';
        state.setSearchQuery('');
        elements.searchInput.value = '';
        renderFavorites();
      } else if (view === 'collections') {
        state.setCurrentView('collections');
        hide(elements.favoritesView);
        show(elements.collectionsView);
        elements.searchInput.placeholder = 'Search collections…';
        state.setSearchQuery('');
        elements.searchInput.value = '';
        renderCollections();
      }
    });
  });

  // Search
  elements.searchInput.addEventListener('input', (e) => {
    state.setSearchQuery(e.target.value);
    renderCurrentView();
  });

  // Add to favorites
  elements.addToFavBtn.addEventListener('click', addToFavorites);

  // Logout
  elements.logoutBtn.addEventListener('click', async () => {
    try {
      await clearApiKey();
      state.setFavorites([]);
      state.setCollections([]);
      elements.searchInput.value = '';
      showToast('Logged out!');
      setTimeout(showApiKeySetup, 700);
    } catch {
      showToast('Logout failed', 'error');
    }
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setupEventListeners(); init(); });
} else {
  setupEventListeners();
  init();
}
