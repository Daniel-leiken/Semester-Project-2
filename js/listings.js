import { apiRequest } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const listingsContainer = document.querySelector('ul.space-y-4'); // Target the listings container

  try {
    // Fetch all listings
    const response = await apiRequest('/auction/listings?_active=true&_bids=true', {
      method: 'GET',
    });

    const { data } = response;

    // Clear existing listings
    listingsContainer.innerHTML = '';

    // Populate listings
    data.forEach((listing) => {
      const { id, title, description, media, endsAt, _count } = listing;

      const listingItem = document.createElement('li');
      listingItem.classList.add(
        'listing',
        'bg-white',
        'border',
        'border-gray-200',
        'rounded-lg',
        'p-4',
        'hover:bg-gray-100',
        'transition',
        'flex',
        'gap-4'
      );

      listingItem.innerHTML = `
        <img src="${media[0]?.url || 'https://via.placeholder.com/200'}" alt="${media[0]?.alt || 'Listing Image'}" class="w-40 h-28 object-cover rounded-lg">
        <div class="flex flex-col justify-between">
          <div>
            <h2 class="text-xl font-medium">${title}</h2>
            <p class="text-sm text-gray-500">Ends in ${timeRemaining(endsAt)}</p>
          </div>
          <div class="text-gray-700 text-sm">Current bid: <strong>NOK ${_count.bids || 0}</strong></div>
        </div>
        <div class="ml-auto flex items-center">
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" data-id="${id}">Place Bid</button>
        </div>
      `;

      listingsContainer.appendChild(listingItem);
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    listingsContainer.innerHTML = '<p class="text-red-600">Failed to load listings. Please try again later.</p>';
  }
});

// Helper function to calculate time remaining
function timeRemaining(endsAt) {
  const now = new Date();
  const endDate = new Date(endsAt);
  const diff = endDate - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${minutes}m`;
}