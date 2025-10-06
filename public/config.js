// Konfigurasi domain dan port API
const API_BASE_URL = (window.location.hostname === 'tracker.posma-pakpahan.me')
  ? 'https://tracker.posma-pakpahan.me/api'
  : 'http://localhost:3001/api';

window.API_BASE_URL = API_BASE_URL;