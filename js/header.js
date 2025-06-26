document.addEventListener('DOMContentLoaded', () => {
  const headerMenu = document.getElementById('header-menu');
  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (accessToken && user) {
    // User is logged in
    headerMenu.innerHTML = `
      <a href="index.html" class="text-blue-600 font-semibold hover:underline">Feed</a>
      <a href="profile.html" class="text-blue-600 font-semibold hover:underline ml-4">Profile</a>
      <button id="sign-out" class="text-red-600 font-semibold hover:underline ml-4">Sign Out</button>
    `;

    // Add sign-out functionality
    const signOutButton = document.getElementById('sign-out');
    signOutButton.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = 'index.html'; // Redirect to front page
    });
  } else {
    // User is not logged in
    headerMenu.innerHTML = `
      <a href="login.html" class="text-blue-600 font-semibold hover:underline">Login</a>
    `;
  }
});