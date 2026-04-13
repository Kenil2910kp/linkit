export const CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? 'https://linkit-30hi.onrender.com'
      : 'http://localhost:8011'),
};

