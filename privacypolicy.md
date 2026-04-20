# LinkIt Extension Privacy Policy

Last updated: 2026-04-20

## Overview

LinkIt is a Chrome extension that lets users save links to favorites and collections in their own LinkIt account.

## Data We Collect and Process

The extension processes the following data only to provide core functionality:

- **API key** provided by the user to authenticate requests.
- **Backend base URL** (fixed to LinkIt production API).
- **Current tab metadata** (title and URL) when the user chooses to save a page.
- **Favorites and collection data** returned from the LinkIt backend for the authenticated user.

## Where Data Is Stored

- The user API key is stored in `chrome.storage.sync` so it can be used for authenticated requests.
- Link and collection records are stored on the LinkIt backend associated with the user account represented by the API key.
- The extension does not use cookies for tracking.

## How Data Is Used

Data is used only to:

- Authenticate extension requests.
- Fetch favorites and collections.
- Save the current tab to favorites or a selected collection.
- Render extension UI and enable search/filter in the popup.

## Data Sharing

- The extension sends data only to the LinkIt backend API: `https://linkit-30hi.onrender.com`.
- The extension may request favicon images from `https://www.google.com` for display purposes.
- We do not sell personal data.

## User Control

Users can:

- Remove the API key at any time using the extension logout/reset flow.
- Stop all data transmission by disabling or uninstalling the extension.

## Security

The extension uses HTTPS endpoints for network requests. API keys are required for access to user data.

## Changes to This Policy

This policy may be updated from time to time. Updates will be reflected by the “Last updated” date.

## Contact

For questions about this privacy policy, contact the LinkIt project maintainer through the repository issue tracker.

