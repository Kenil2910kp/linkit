# Backend API Endpoints Reference

This document lists all the API endpoints that need to be implemented in the backend. All endpoints requiring authentication should use the `Authorization: Bearer <token>` header.

## Base URL
Update `API_BASE_URL` in `script.js` with your actual backend URL:
```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // Change this
```

## Authentication Endpoints

### 1. User Signup
- **Endpoint:** `POST /api/auth/signup`
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string"
    }
  }
  ```
- **Location in code:** `script.js` - `handleSignup()` function

### 2. User Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string"
    }
  }
  ```
- **Location in code:** `script.js` - `handleLogin()` function

## API Key Management Endpoints

### 3. Get All API Keys
- **Endpoint:** `GET /api/api-keys`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "apiKeys": [
      {
        "id": "number",
        "name": "string",
        "key": "string",
        "createdAt": "string (ISO date)"
      }
    ]
  }
  ```
- **Location in code:** `script.js` - `loadApiKeys()` function

### 4. Create API Key
- **Endpoint:** `POST /api/api-keys`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "name": "string",
    "key": "string (generated API key)",
    "createdAt": "string (ISO date)"
  }
  ```
- **Location in code:** `script.js` - `handleCreateApiKey()` function

### 5. Delete API Key
- **Endpoint:** `DELETE /api/api-keys/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "API key deleted successfully"
  }
  ```
- **Location in code:** `script.js` - `deleteApiKey()` function

## Collections Endpoints

### 6. Get All Collections
- **Endpoint:** `GET /api/collections`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "collections": [
      {
        "id": "number",
        "name": "string",
        "userId": "number",
        "createdAt": "string (ISO date)"
      }
    ]
  }
  ```
- **Location in code:** `script.js` - `loadCollections()` function

### 7. Create Collection
- **Endpoint:** `POST /api/collections`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "name": "string",
    "userId": "number",
    "createdAt": "string (ISO date)"
  }
  ```
- **Location in code:** `script.js` - `handleCreateCollection()` function

### 8. Update Collection
- **Endpoint:** `PUT /api/collections/:id`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "name": "string",
    "userId": "number",
    "updatedAt": "string (ISO date)"
  }
  ```
- **Location in code:** `script.js` - `editCollection()` function

### 9. Delete Collection
- **Endpoint:** `DELETE /api/collections/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Collection deleted successfully"
  }
  ```
- **Location in code:** `script.js` - `deleteCollection()` function

## Links Endpoints

### 10. Get Links in Collection
- **Endpoint:** `GET /api/collections/:collectionId/links`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "links": [
      {
        "id": "number",
        "collectionId": "number",
        "title": "string",
        "url": "string",
        "createdAt": "string (ISO date)"
      }
    ]
  }
  ```
- **Location in code:** `script.js` - `loadLinks()` function

### 11. Create Link
- **Endpoint:** `POST /api/collections/:collectionId/links`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "string",
    "url": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "collectionId": "number",
    "title": "string",
    "url": "string",
    "createdAt": "string (ISO date)"
  }
  ```
- **Location in code:** `script.js` - `handleSaveLink()` function (create case)

### 12. Update Link
- **Endpoint:** `PUT /api/links/:id`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "string",
    "url": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "number",
    "collectionId": "number",
    "title": "string",
    "url": "string",
    "updatedAt": "string (ISO date)"
  }
  ```
- **Location in code:** `script.js` - `handleSaveLink()` function (update case)

### 13. Delete Link
- **Endpoint:** `DELETE /api/links/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "message": "Link deleted successfully"
  }
  ```
- **Location in code:** `script.js` - `deleteLink()` function

## Notes

1. All authentication tokens should be validated on protected routes
2. Users should only be able to access their own collections, links, and API keys
3. When deleting a collection, all associated links should also be deleted
4. API keys should be generated securely (use crypto library)
5. Passwords should be hashed before storing in the database
6. All date fields should be in ISO 8601 format
7. Error responses should follow a consistent format:
   ```json
   {
     "error": "Error message",
     "statusCode": 400
   }
   ```

## Implementation Status

Currently, all endpoints are using mock data stored in localStorage. To connect to a real backend:

1. Update `API_BASE_URL` in `script.js`
2. Uncomment the fetch calls in each function
3. Remove the mock data simulation code
4. Implement proper error handling for network failures

