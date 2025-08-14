export const API_BASE_URL = 'https://v2.api.noroff.dev';

export const API_HEADERS = {
  'Content-Type': 'application/json',
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

  const headers = {
    ...API_HEADERS,
  };

  // Only add Authorization header if we have a token
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const fetchOptions = {
    headers,
    ...options,
  };

  console.log('Making API request:', {
    url,
    method: fetchOptions.method || 'GET',
    hasToken: !!accessToken,
    headers: { ...headers, Authorization: accessToken ? 'Bearer [HIDDEN]' : 'None' }
  });

  const response = await fetch(url, fetchOptions);

  if (response.status === 204) return null;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    // Handle specific authentication errors
    if (response.status === 401) {
      console.error('Authentication failed. Token may be expired.');
      // Optionally redirect to login
      // window.location.href = 'Login.html';
    }
    
    throw new Error(errorData.errors?.[0]?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}