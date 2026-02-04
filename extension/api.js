/**
 * All API fetch calls with Authorization header handling
 */

import { getApiKey } from './storage.js';

const BASE_URL = 'http://localhost:8011';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
async function authenticatedFetch(endpoint, options = {}) {
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not found. Please enter your API key.');
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `ApiKey ${apiKey}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid API key. Please re-enter your API key.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * Get all favorites
 * @returns {Promise<Array>} Array of favorite links
 */
export async function getFavorites() {
  try {
    const response = await authenticatedFetch('/extension/favorites');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

/**
 * Add current tab to favorites
 * @param {string} title - Tab title
 * @param {string} url - Tab URL
 * @returns {Promise<Object>} The created favorite link
 */
export async function addCurrentTabToFavorites(title, url) {
  try {
    const response = await authenticatedFetch('/extension/add-current-tab', {
      method: 'POST',
      body: JSON.stringify({ title, url })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

/**
 * Get all collections
 * @returns {Promise<Array>} Array of collections
 */
export async function getCollections() {
  try {
    const response = await authenticatedFetch('/extension/collections');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

/**
 * Add current tab to a collection
 * @param {string} collectionId - Collection ID
 * @param {string} title - Tab title
 * @param {string} url - Tab URL
 * @returns {Promise<Object>} The created link
 */
export async function addCurrentTabToCollection(collectionId, title, url) {
  try {
    const response = await authenticatedFetch(`/extension/collections/${collectionId}/links`, {
      method: 'POST',
      body: JSON.stringify({ title, url })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to collection:', error);
    throw error;
  }
}

