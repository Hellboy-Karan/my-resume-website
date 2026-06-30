const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    });
  } catch (_error) {
    throw new Error('Unable to connect to the server. Please make sure the backend is running and try again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const labels = {
      400: 'Validation error',
      401: 'Unauthorized. Please login again.',
      403: 'Forbidden. You do not have permission for this action.',
      404: 'Not found.',
      500: 'Server error. Please try again.'
    };
    throw new Error(error.message || labels[response.status] || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

export { API_URL };
