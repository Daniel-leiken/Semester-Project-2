import { apiRequest } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const headerMenu = document.getElementById('header-menu');
  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (accessToken && user) {
    try {
      // Fetch user profile to get credits
      const response = await apiRequest(`/auction/profiles/${user.name}`, {
        method: 'GET',
      });

      const { data } = response;

      // User is logged in
      headerMenu.innerHTML = `
        <div class="flex items-center gap-4">
          <!-- Credits Box -->
          <div class="credits-box border border-blue-600 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
            Credits: <span id="user-credits">${data.credits}</span>
          </div>
          <!-- Navigation Links -->
          <a href="index.html" class="text-blue-600 font-semibold hover:underline">Feed</a>
          <a href="profile.html" class="text-blue-600 font-semibold hover:underline">Profile</a>
          <!-- Sign Out Icon -->
          <button id="sign-out" class="text-red-600 hover:text-red-800 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="lucide lucide-log-out">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      `;

      // Add sign-out functionality
      const signOutButton = document.getElementById('sign-out');
      signOutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html'; // Redirect to front page
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert('Failed to load user credits. Please try again later.');
    }
  } else {
    // User is not logged in
    headerMenu.innerHTML = `
      <a href="login.html" class="text-blue-600 font-semibold hover:underline">Login</a>
    `;
  }
});