const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TOKEN_KEY = 'swapbay_token';
let onUnauthorized = null;

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function registerUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = { ...options };

  config.headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.body && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, config);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
      if (typeof onUnauthorized === 'function') onUnauthorized();
    }
    const message = payload?.message || `Request to ${path} failed`;
    throw new Error(message);
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      ...(typeof body !== 'undefined' ? { body: JSON.stringify(body) } : {}),
    }),
  put: (path, body) =>
    request(path, {
      method: 'PUT',
      ...(typeof body !== 'undefined' ? { body: JSON.stringify(body) } : {}),
    }),
  delete: (path) => request(path, { method: 'DELETE' }),
  setToken,
  getToken,
};

export { API_BASE_URL, registerUnauthorizedHandler };
