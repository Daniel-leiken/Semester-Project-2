// Function to handle search functionality
function handleSearch(searchQuery) {
  const listings = document.querySelectorAll('.listing');

  listings.forEach(listing => {
    const title = listing.querySelector('h2').textContent.toLowerCase();
    if (title.includes(searchQuery)) {
      listing.style.display = 'flex'; // Show matching listing
    } else {
      listing.style.display = 'none'; // Hide non-matching listing
    }
  });
}

// Add event listener to both desktop and mobile search inputs
document.addEventListener('DOMContentLoaded', () => {
  const desktopSearchInput = document.getElementById('search-input');
  const mobileSearchInput = document.getElementById('search-input-mobile');

  if (desktopSearchInput) {
    desktopSearchInput.addEventListener('input', function (event) {
      const searchQuery = event.target.value.toLowerCase();
      handleSearch(searchQuery);
      
      // Sync with mobile search input
      if (mobileSearchInput) {
        mobileSearchInput.value = event.target.value;
      }
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', function (event) {
      const searchQuery = event.target.value.toLowerCase();
      handleSearch(searchQuery);
      
      // Sync with desktop search input
      if (desktopSearchInput) {
        desktopSearchInput.value = event.target.value;
      }
    });
  }
});