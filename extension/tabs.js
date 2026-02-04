/**
 * Current tab extraction using chrome.tabs.query
 */

/**
 * Get the current active tab information
 * @returns {Promise<{title: string, url: string}>}
 */
export async function getCurrentTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      throw new Error('No active tab found');
    }
    
    const tab = tabs[0];
    return {
      title: tab.title || 'Untitled',
      url: tab.url || ''
    };
  } catch (error) {
    console.error('Error getting current tab:', error);
    throw error;
  }
}

/**
 * Check if current tab has a valid URL
 * @returns {Promise<boolean>}
 */
export async function hasValidTab() {
  try {
    const tab = await getCurrentTab();
    return tab.url && tab.url.startsWith('http');
  } catch (error) {
    return false;
  }
}

