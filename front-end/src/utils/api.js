const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = { ...options };

  config.headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

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
};

export { API_BASE_URL };

