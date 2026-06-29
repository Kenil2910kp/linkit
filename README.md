# 🔗 LinkIt

**LinkIt** is a full-stack link collection and sharing platform designed to help users save, organize, and share web resources effortlessly. Along with the web application, LinkIt provides a browser extension that lets users save the current webpage directly into their collections with a single click.

Whether you're collecting learning resources, project references, articles, or useful websites, LinkIt keeps everything organized and accessible from anywhere.

---

## 🚀 Features

* 🔐 Secure user authentication
* 📂 Create and manage multiple link collections
* 🌍 Public, 🔒 Private, and 🛡️ Protected collections
* ⭐ Mark important links as favorites
* 🧩 Browser extension for one-click link saving
* 🔍 Explore publicly shared collections
* 📱 Responsive web interface
* 🔑 API key support for browser extension integration

---

## 🏗️ Project Architecture

```
Browser Extension
        │
        │ Save Current Tab
        ▼
   REST API (Express)
        │
        ▼
Authentication (JWT)
        │
        ▼
MongoDB
        │
        ▼
Collections
 ├── Public
 ├── Protected
 └── Private
```

---

## 🌟 Collection Visibility

### 🌍 Public

Anyone can discover and access the collection.

### 🛡️ Protected

The collection is visible, but only users with permission can access its contents.

### 🔒 Private

Only the owner can access the collection.

---

## 🔍 Explore Collections

The **Explore** section allows users to discover collections shared publicly by the community.

Instead of managing resources individually, users can browse curated collections created by others and access valuable learning materials, tools, documentation, and references.

---

## 🧩 Browser Extension

The Chrome extension enables users to:

* Save the currently opened webpage instantly
* Select an existing collection
* Create a new collection
* Sync directly with the LinkIt platform

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* REST APIs

### Database

* MongoDB

---

## 📚 What We Learned

* REST API Design
* Authentication & Authorization
* JWT-based Security
* Browser Extension Development
* API Key Management
* Collection-based Data Modeling
* Access Control (Public / Protected / Private)
* Full-Stack Application Development
* Production Deployment
* Team Collaboration

---

## 🚀 Future Enhancements

* AI-powered collection generation
* Smart resource recommendations
* Collection search and filtering
* Resource tagging
* Collaborative collections
* Folder hierarchy
* Collection analytics
* Mobile application

---

## 🌐 Live Demo

**Website**

https://linkit-easy.vercel.app/

---

## 🧩 Chrome Extension

Available on the Chrome Web Store.

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome. Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.
