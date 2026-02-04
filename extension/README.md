# Linkit Chrome Extension

A Chrome Extension (Manifest V3) for saving and organizing favorite links and collections.

## Setup Instructions

### 1. Create Icon Files

The extension requires icon files. Create three PNG files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor or online tool to create these icons. Place them in the `extension` directory.

### 2. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` directory

### 3. Configure API Key

1. Click the extension icon in your browser toolbar
2. Enter your API key when prompted
3. The extension will save it securely using `chrome.storage.sync`

### 4. Backend Setup

Make sure your backend is running at `http://localhost:8011` with the following endpoints:

- `GET /extension/favorites` - Get all favorites
- `POST /extension/add-current-tab` - Add current tab to favorites
- `GET /extension/collections` - Get all collections
- `POST /extension/collections/:collectionId/links` - Add link to collection

All requests require the `Authorization: ApiKey <API_KEY>` header.

## Features

- **Favorites**: Special system collection for quick access to favorite links
- **Collections**: View and manage all your collections
- **One-click Save**: Add current tab to favorites or collections with one click
- **Search**: Filter links by title or URL
- **Refresh**: Refresh collections to get latest data
- **Open/Copy**: Quick actions for each link

## File Structure

```
extension/
├── manifest.json        # Extension manifest (Manifest V3)
├── popup.html          # Main popup UI
├── popup.css           # Styles
├── popup.js            # Main UI logic
├── api.js              # API calls
├── storage.js          # API key storage
├── tabs.js             # Current tab extraction
├── state.js            # State management
├── utils.js            # Utility functions
└── README.md           # This file
```

## API Endpoints

### Favorites
- `GET /extension/favorites` - Returns array of favorite links
- `POST /extension/add-current-tab` - Body: `{ title: string, url: string }`

### Collections
- `GET /extension/collections` - Returns array of collections (each with `links` array)
- `POST /extension/collections/:collectionId/links` - Body: `{ title: string, url: string }`

## Authentication

The extension uses API Key authentication only (no JWT, no login UI). The API key is stored securely using `chrome.storage.sync` and sent with every request as:

```
Authorization: ApiKey <API_KEY>
```

## Error Handling

- Invalid API key: Shows error message with option to re-enter
- Network errors: Shows error message with retry option
- Missing API key: Shows setup screen

## Development

The extension uses ES6 modules. All files are in the `extension` directory and can be edited directly. After making changes:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the extension card
3. Test your changes

