import { apiRequest } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const headerMenu = document.getElementById('header-menu');
  const mobileHeaderMenu = document.getElementById('mobile-header-menu');
  const mobileCredits = document.getElementById('mobile-credits');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user'));

  // Mobile menu toggle functionality - only for logged-in users
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  if (accessToken && user) {
    // Show hamburger menu for logged-in users
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove('hidden');
    }
    
    try {
      // Fetch user profile to get credits
      const response = await apiRequest(`/auction/profiles/${user.name}`, {
        method: 'GET',
      });

      const { data } = response;

      // Desktop logged-in menu
      if (headerMenu) {
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
      }

      // Mobile logged-in menu
      if (mobileCredits) {
        mobileCredits.innerHTML = `
          <div class="text-sm text-blue-600 font-semibold">
            ${data.credits} Credits
          </div>
        `;
        mobileCredits.classList.remove('hidden');
      }

      // Hide mobile auth buttons for logged-in users
      const mobileAuthContainer = document.getElementById('mobile-auth-buttons');
      if (mobileAuthContainer) {
        mobileAuthContainer.classList.add('hidden');
      }

      if (mobileHeaderMenu) {
        mobileHeaderMenu.innerHTML = `
          <div class="flex flex-col gap-2">
            <a href="index.html" class="text-blue-600 font-medium text-sm py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition">Feed</a>
            <a href="profile.html" class="text-blue-600 font-medium text-sm py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition">Profile</a>
            <button id="mobile-sign-out" class="text-red-600 font-medium text-sm py-2 text-left hover:bg-red-50 px-2 rounded transition">
              Sign Out
            </button>
          </div>
        `;
      }

      // Add sign-out functionality for both desktop and mobile
      const signOutButton = document.getElementById('sign-out');
      const mobileSignOutButton = document.getElementById('mobile-sign-out');
      
      const handleSignOut = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      };

      if (signOutButton) {
        signOutButton.addEventListener('click', handleSignOut);
      }
      if (mobileSignOutButton) {
        mobileSignOutButton.addEventListener('click', handleSignOut);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert('Failed to load user credits. Please try again later.');
    }
  } else {
    // Hide hamburger menu for non-logged-in users
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('hidden');
    }

    // User is not logged in - Desktop
    if (headerMenu) {
      headerMenu.innerHTML = `
        <div class="flex items-center gap-4">
          <a href="login.html" class="text-blue-600 font-semibold hover:underline">Login</a>
          <a href="signup.html" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Sign Up</a>
        </div>
      `;
    }

    // Add mobile auth buttons directly to the mobile header area
    const mobileAuthContainer = document.getElementById('mobile-auth-buttons');
    if (mobileAuthContainer) {
      mobileAuthContainer.innerHTML = `
        <div class="flex items-center gap-2">
          <a href="login.html" class="text-blue-600 font-medium text-sm px-3 py-1 hover:bg-blue-50 rounded transition">Login</a>
          <a href="signup.html" class="bg-blue-600 text-white font-medium text-sm px-3 py-1 rounded hover:bg-blue-700 transition">Sign Up</a>
        </div>
      `;
      mobileAuthContainer.classList.remove('hidden');
    }

    // Hide mobile menu dropdown for non-logged in users
    if (mobileMenu) {
      mobileMenu.classList.add('hidden');
    }

    // Hide mobile credits for non-logged in users
    if (mobileCredits) {
      mobileCredits.classList.add('hidden');
    }
  }
});