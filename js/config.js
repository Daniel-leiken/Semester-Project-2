export const API_BASE_URL = 'https://v2.api.noroff.dev';

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTGVpa2VuIiwiZW1haWwiOiJEYW5TdHIxNjIyMUBzdHVkLm5vcm9mZi5ubyIsImlhdCI6MTc1MDkyNzYwM30.HvSnh9DMUJyqvIakvwpuE4-TeoUniDPX9ozw7931y1g',
  'X-Noroff-API-Key': 'e3234ae6-950d-4fcb-9c01-f2721b2ca931',
};

/**
 * Helper function to make API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/register').
 * @param {object} options - Additional fetch options (e.g., method, body).
 * @returns {Promise<object>} - The JSON response from the API.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const accessToken = localStorage.getItem('accessToken');

  const fetchOptions = {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${accessToken}`, // Add token to headers
    },
    ...options,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors?.[0]?.message || 'Unknown error occurred.');
  }

  return response.json();
}