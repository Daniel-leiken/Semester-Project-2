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

    // Filter out expired listings
    let filteredData = Array.isArray(data)
      ? data.filter(listing => new Date(listing.endsAt) > new Date())
      : [];

    // Sort by endsAt (soonest first)
    filteredData.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

    listingsContainer.innerHTML = '';

    if (filteredData.length === 0) {
      listingsContainer.innerHTML = '<li class="text-gray-500 text-center py-8">No listings found.</li>';
    } else {
      filteredData.forEach((listing) => {
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
            <div class="text-gray-700 text-sm">Current bid: <strong>${_count.bids || 0} Credits</strong></div>
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
                    Current Bid: <strong class="text-blue-600">${single._count?.bids || 0} Credits</strong>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input id="bid-amount" type="number" min="1" placeholder="Your Bid (NOK)" class="border border-gray-300 rounded px-3 py-2 w-36 focus:outline-blue-500">
                    <button id="place-bid-btn" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Place Bid</button>
                  </div>
                </div>
                <div class="mt-6 border-t border-gray-200 pt-4">
                  <p class="text-sm text-gray-600">Seller: <span class="font-medium">${single.seller?.name || 'Unknown'}</span></p>
                </div>
              </div>
            `;

            const placeBidBtn = document.getElementById('place-bid-btn');
            const bidAmountInput = document.getElementById('bid-amount');
            const bidMsg = document.createElement('div');
            bidMsg.className = "mt-2 text-sm";
            bidAmountInput.parentNode.appendChild(bidMsg);

            placeBidBtn.addEventListener('click', async () => {
              const amount = parseInt(bidAmountInput.value, 10);
              bidMsg.textContent = '';
              bidMsg.classList.remove('text-green-600', 'text-red-600');

              if (!amount || amount <= 0) {
                bidMsg.textContent = "Please enter a valid bid amount.";
                bidMsg.classList.add('text-red-600');
                return;
              }

              placeBidBtn.disabled = true;
              placeBidBtn.textContent = "Placing...";

              try {
                const res = await apiRequest(`/auction/listings/${single.id}/bids`, {
                  method: 'POST',
                  body: JSON.stringify({ amount })
                });

                bidMsg.textContent = "Bid placed successfully!";
                bidMsg.classList.add('text-green-600');
                // Optionally, refresh the modal with updated bid info here
              } catch (err) {
                bidMsg.textContent = "Failed to place bid. Make sure you are logged in and have enough credits.";
                bidMsg.classList.add('text-red-600');
              } finally {
                placeBidBtn.disabled = false;
                placeBidBtn.textContent = "Place Bid";
              }
            });
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

// Create Listing Modal Logic
const createListingModalOverlay = document.getElementById('create-listing-modal-overlay');
const openCreateListingBtn = document.getElementById('open-create-listing-modal');
const closeCreateListingBtn = document.getElementById('create-listing-modal-close');
const createListingForm = document.getElementById('create-listing-form');
const createListingMsg = document.getElementById('create-listing-message');

// Open modal
openCreateListingBtn.addEventListener('click', () => {
  createListingModalOverlay.classList.remove('hidden');
  createListingModalOverlay.classList.add('flex');
  createListingMsg.classList.add('hidden');
  createListingForm.reset();
});

// Close modal
closeCreateListingBtn.addEventListener('click', () => {
  createListingModalOverlay.classList.add('hidden');
  createListingModalOverlay.classList.remove('flex');
});
createListingModalOverlay.addEventListener('click', (e) => {
  if (e.target === createListingModalOverlay) {
    createListingModalOverlay.classList.add('hidden');
    createListingModalOverlay.classList.remove('flex');
  }
});

// Handle form submit
createListingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  createListingMsg.classList.remove('text-green-600', 'text-red-600');
  createListingMsg.classList.add('hidden');
  const title = document.getElementById('listing-title').value.trim();
  const description = document.getElementById('listing-description').value.trim();
  const tags = document.getElementById('listing-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);
  const mediaUrl = document.getElementById('listing-media-url').value.trim();
  const mediaAlt = document.getElementById('listing-media-alt').value.trim();
  const endsAt = document.getElementById('listing-endsAt').value;

  if (!title || !endsAt) {
    createListingMsg.textContent = "Title and end date/time are required.";
    createListingMsg.classList.remove('hidden');
    createListingMsg.classList.add('text-red-600');
    return;
  }

  // Format media array if URL is provided
  const media = mediaUrl ? [{ url: mediaUrl, alt: mediaAlt }] : [];

  try {
    const res = await apiRequest('/auction/listings', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        tags,
        media,
        endsAt: new Date(endsAt).toISOString()
      })
    });

    createListingMsg.textContent = "Listing created successfully!";
    createListingMsg.classList.remove('hidden', 'text-red-600');
    createListingMsg.classList.add('text-green-600');
    createListingForm.reset();

    // Optionally, close modal and refresh listings after a short delay
    setTimeout(() => {
      createListingModalOverlay.classList.add('hidden');
      createListingModalOverlay.classList.remove('flex');
      window.location.reload(); // Or re-fetch listings dynamically
    }, 1200);

  } catch (err) {
    createListingMsg.textContent = "Failed to create listing. Please check your input and try again.";
    createListingMsg.classList.remove('hidden', 'text-green-600');
    createListingMsg.classList.add('text-red-600');
    console.error(err);
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