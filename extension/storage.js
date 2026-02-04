/**
 * API Key storage management using chrome.storage.sync
 */

const STORAGE_KEY = 'linkit_api_key';

/**
 * Get the stored API key
 * @returns {Promise<string|null>} The API key or null if not set
 */
export async function getApiKey() {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

/**
 * Save the API key
 * @param {string} apiKey - The API key to save
 * @returns {Promise<void>}
 */
export async function saveApiKey(apiKey) {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: apiKey });
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
}

/**
 * Remove the API key
 * @returns {Promise<void>}
 */
export async function clearApiKey() {
  try {
    await chrome.storage.sync.remove(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing API key:', error);
    throw error;
  }
}

/**
 * Check if API key exists
 * @returns {Promise<boolean>}
 */
export async function hasApiKey() {
  const apiKey = await getApiKey();
  return apiKey !== null && apiKey.trim() !== '';
}

