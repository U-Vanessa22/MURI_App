// API Configuration - Handles both Production and Development modes

// Production (Single port 8000): 
//   - Frontend built into backend, accessed at http://localhost:8000
//   - API calls to /auth, /vouchers, etc (same origin)
//
// Development (Two ports):
//   - Frontend dev on port 3001
//   - Backend on port 8000
//   - API calls to http://localhost:8000/auth, /vouchers, etc

const getAPIUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Development: Frontend on 3001, Backend on 8000
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  // Production: Both on same port, use root
  // (FastAPI will handle routing)
  return '';
};

export const API_CONFIG = {
  baseURL: getAPIUrl(),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default API_CONFIG;
