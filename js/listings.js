import { apiRequest } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const listingsContainer = document.querySelector('ul.space-y-4');
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');

  try {
    // Fetch all listings
    const response = await apiRequest('/auction/listings?_bids=true', {
      method: 'GET',
    });

    const { data } = response;

    listingsContainer.innerHTML = '';

    if (!data || data.length === 0) {
      listingsContainer.innerHTML = '<li class="text-gray-500 text-center py-8">No listings found.</li>';
    } else {
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

        // Add event listener for Place Bid button
        listingItem.querySelector('button[data-id]').addEventListener('click', async (e) => {
          e.preventDefault();
          const modalOverlay = document.getElementById('modal-overlay');
          const modalBody = document.getElementById('modal-body');
          const modalLoader = document.getElementById('modal-loader');

          modalOverlay.classList.remove('hidden');
          modalOverlay.classList.add('flex');
          modalLoader.classList.remove('hidden');

          try {
            // Fetch single listing details
            const singleRes = await apiRequest(`/auction/listings/${id}?_seller=true&_bids=true`, { method: 'GET' });
            const { data: single } = singleRes;

            // Render modal content
            modalBody.innerHTML = `
              <div class="bg-gray-200 h-80 w-full flex items-center justify-center text-gray-500 mb-4">
                <img src="${single.media[0]?.url || 'https://via.placeholder.com/600x300'}" alt="${single.media[0]?.alt || 'Listing Image'}" class="w-full h-full object-cover">
              </div>
              <div class="p-6">
                <h1 class="text-3xl font-semibold mb-2">${single.title}</h1>
                <p class="text-sm text-red-600 mb-4">Ends in: <span class="font-medium">${timeRemaining(single.endsAt)}</span></p>
                <div class="mb-6">
                  <h2 class="text-xl font-medium mb-2">Description</h2>
                  <p class="text-gray-700 leading-relaxed">${single.description || 'No description.'}</p>
                </div>
                <div class="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-200 pt-4">
                  <div class="text-lg">
                    Current Bid: <strong class="text-blue-600">NOK ${single._count?.bids || 0}</strong>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="number" placeholder="Your Bid (NOK)" class="border border-gray-300 rounded px-3 py-2 w-36 focus:outline-blue-500">
                    <button class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Place Bid</button>
                  </div>
                </div>
                <div class="mt-6 border-t border-gray-200 pt-4">
                  <p class="text-sm text-gray-600">Seller: <span class="font-medium">${single.seller?.name || 'Unknown'}</span></p>
                </div>
              </div>
            `;
          } catch (err) {
            modalBody.innerHTML = `<div class="text-red-600 p-6">Failed to load listing details.</div>`;
          } finally {
            modalLoader.classList.add('hidden');
          }
        });
      });
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
    listingsContainer.innerHTML = '<li class="text-red-600 text-center py-8">Failed to load listings. Please try again later.</li>';
  } finally {
    loader.classList.add('hidden');
  }
});

// Modal close logic
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
});
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    document.getElementById('modal-overlay').classList.add('hidden');
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