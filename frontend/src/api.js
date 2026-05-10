const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Request failed.';
    throw new Error(errorMessage);
  }

  return data;
}

export async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Request failed.';
    throw new Error(errorMessage);
  }
  return data;
}

export { API_BASE_URL };
