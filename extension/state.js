/**
 * Local UI state management
 */

class State {
  constructor() {
    this.currentView = 'favorites'; // 'favorites' | 'collections' | 'collection-detail'
    this.favorites = [];
    this.collections = [];
    this.selectedCollection = null;
    this.searchQuery = '';
    this.loading = false;
    this.error = null;
    this.apiKey = null;
  }

  setCurrentView(view) {
    this.currentView = view;
    this.notifyListeners();
  }

  setFavorites(favorites) {
    this.favorites = favorites;
    this.notifyListeners();
  }

  setCollections(collections) {
    this.collections = collections;
    this.notifyListeners();
  }

  setSelectedCollection(collection) {
    this.selectedCollection = collection;
    this.currentView = 'collection-detail';
    this.notifyListeners();
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.notifyListeners();
  }

  setLoading(loading) {
    this.loading = loading;
    this.notifyListeners();
  }

  setError(error) {
    this.error = error;
    this.notifyListeners();
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.notifyListeners();
  }

  clearError() {
    this.error = null;
    this.notifyListeners();
  }

  getFilteredFavorites() {
    if (!this.searchQuery) {
      return this.favorites;
    }
    const query = this.searchQuery.toLowerCase();
    return this.favorites.filter(fav => 
      fav.title?.toLowerCase().includes(query) || 
      fav.url?.toLowerCase().includes(query)
    );
  }

  getFilteredCollectionLinks() {
    if (!this.selectedCollection) {
      return [];
    }
    const links = this.selectedCollection.links || [];
    if (!this.searchQuery) {
      return links;
    }
    const query = this.searchQuery.toLowerCase();
    return links.filter(link => 
      link.title?.toLowerCase().includes(query) || 
      link.url?.toLowerCase().includes(query)
    );
  }

  listeners = [];

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this));
  }
}

export const state = new State();

