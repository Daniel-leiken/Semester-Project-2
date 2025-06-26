// Add event listener to the search input
document.getElementById('search-input').addEventListener('input', function (event) {
    const searchQuery = event.target.value.toLowerCase();
    const listings = document.querySelectorAll('.listing');
  
    listings.forEach(listing => {
      const title = listing.querySelector('h2').textContent.toLowerCase();
      if (title.includes(searchQuery)) {
        listing.style.display = 'flex'; // Show matching listing
      } else {
        listing.style.display = 'none'; // Hide non-matching listing
      }
    });
  });