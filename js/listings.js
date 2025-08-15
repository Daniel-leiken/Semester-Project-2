import { apiRequest } from './config.js';

// Global variables for simple pagination
let allListings = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', async () => {
  const listingsContainer = document.querySelector('ul.space-y-4');
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');

  try {
    await loadAllActiveListings();
    displayCurrentPage();
    createPaginationControls();
  } catch (error) {
    console.error('Error loading listings:', error);
    listingsContainer.innerHTML = '<li class="text-red-600 text-center py-8">Failed to load listings. Please try again later.</li>';
  } finally {
    loader.classList.add('hidden');
  }
  
  // Check authentication and control Create Listing button visibility
  const accessToken = localStorage.getItem('accessToken');
  const createListingBtn = document.getElementById('open-create-listing-modal');
  
  if (!accessToken) {
    // Hide Create Listing button for unregistered users
    createListingBtn.style.display = 'none';
  } else {
    // Show Create Listing button for registered users
    createListingBtn.style.display = 'flex';
  }
});

async function loadAllActiveListings() {
  console.log('Loading all active listings...');
  
  try {
    let page = 1;
    let allData = [];
    const limit = 100; // Load 100 per API call for efficiency
    
    while (true) {
      // Use API filter for active listings and sort by expiration
      const queryParams = `_bids=true&_active=true&limit=${limit}&page=${page}&sort=endsAt&sortOrder=asc`;
      
      console.log(`Fetching page ${page} with params: ${queryParams}`);
      
      const response = await apiRequest(`/auction/listings?${queryParams}`, {
        method: 'GET',
      });

      const { data, meta } = response;
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`No more data at page ${page}`);
        break; // No more data
      }
      
      allData = allData.concat(data);
      console.log(`Page ${page}: ${data.length} active listings loaded. Total so far: ${allData.length}`);
      
      // Stop if we've reached the last page
      if (meta && page >= meta.pageCount) {
        console.log(`Reached last page: ${page} of ${meta.pageCount}`);
        break;
      }
      
      page++;
    }
    
    console.log(`Loaded ${allData.length} total active listings`);
    
    // Data is already sorted by API (expiring soon first)
    allListings = allData;
    
    return allListings;
  } catch (error) {
    console.error('Error loading active listings:', error);
    throw error;
  }
}

function sortListingsSmartly(listings) {
  const now = new Date();
  
  return [...listings].sort((a, b) => {
    const aExpired = new Date(a.endsAt) <= now;
    const bExpired = new Date(b.endsAt) <= now;
    
    // Active listings first, expired last
    if (!aExpired && bExpired) return -1;
    if (aExpired && !bExpired) return 1;
    
    // Within active listings: sort by expiration (soonest first)
    if (!aExpired && !bExpired) {
      return new Date(a.endsAt) - new Date(b.endsAt);
    }
    
    // Within expired listings: sort by end date (most recent first)
    return new Date(b.endsAt) - new Date(a.endsAt);
  });
}

function displayCurrentPage() {
  const listingsContainer = document.querySelector('ul.space-y-4');
  
  // Calculate which listings to show for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageListings = allListings.slice(startIndex, endIndex);
  
  listingsContainer.innerHTML = '';

  if (pageListings.length === 0) {
    listingsContainer.innerHTML = '<li class="text-gray-500 text-center py-8">No active listings found.</li>';
    return;
  }

  console.log(`Displaying ${pageListings.length} active listings for page ${currentPage}`);
  
  // Check if user is authenticated
  const accessToken = localStorage.getItem('accessToken');
  const isAuthenticated = !!accessToken;
  
  pageListings.forEach((listing) => {
    const { id, title, description, media, endsAt, _count } = listing;
    const highestBid = getHighestBidAmount(listing);

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

    // Different button text based on authentication status
    const buttonText = isAuthenticated ? 'Place Bid' : 'View Details';

    listingItem.innerHTML = `
      <img src="${getImageUrl(media)}" alt="${getImageAlt(media)}" class="w-24 h-20 sm:w-32 sm:h-24 lg:w-40 lg:h-28 object-cover rounded-lg flex-shrink-0" onerror="this.src='images/default-fallback-image.png'">
      <div class="flex flex-col justify-between flex-grow min-w-0">
        <div>
          <h2 class="text-base sm:text-lg lg:text-xl font-medium truncate">${title}</h2>
          <p class="text-xs sm:text-sm text-gray-500">Ends in ${timeRemaining(endsAt)}</p>
        </div>
        <div class="text-gray-700 text-xs sm:text-sm">
          Current bid: <strong>${highestBid} Credits</strong> <span class="hidden sm:inline">(${_count.bids || 0} bids)</span>
        </div>
      </div>
      <div class="ml-2 sm:ml-auto flex items-center flex-shrink-0">
        <button class="bg-blue-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded hover:bg-blue-700 transition" data-id="${id}">${buttonText}</button>
      </div>
    `;

    listingsContainer.appendChild(listingItem);

    // Add event listener for Place Bid button
    attachBidModalListener(listingItem, listing);
  });
}

function createPaginationControls() {
  // Remove existing pagination
  const existingPagination = document.getElementById('pagination-controls');
  if (existingPagination) {
    existingPagination.remove();
  }

  const totalPages = Math.ceil(allListings.length / itemsPerPage);
  
  if (totalPages <= 1) {
    return; // No pagination needed
  }

  const listingsContainer = document.querySelector('ul.space-y-4');
  const containerParent = listingsContainer.parentNode;

  const paginationContainer = document.createElement('div');
  paginationContainer.id = 'pagination-controls';
  paginationContainer.className = 'flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-6 sm:mt-8 mb-6 sm:mb-8 px-4 sm:px-0';

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '← Previous';
  prevButton.className = `px-3 sm:px-4 py-2 rounded border transition text-sm sm:text-base w-1/2 sm:w-auto ${
    currentPage === 1 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
  }`;
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  });

  // Page numbers
  const pageNumbersContainer = document.createElement('div');
  pageNumbersContainer.className = 'flex gap-1 sm:gap-1 order-first sm:order-none';
  
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);
  
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
  }

  // Add first page and ellipsis if needed
  if (startPage > 1) {
    addPageButton(pageNumbersContainer, 1);
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'px-2 py-2 text-gray-500';
      pageNumbersContainer.appendChild(ellipsis);
    }
  }

  // Add page number buttons
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(pageNumbersContainer, i);
  }

  // Add last page and ellipsis if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'px-1 sm:px-2 py-2 text-gray-500 text-sm sm:text-base';
      pageNumbersContainer.appendChild(ellipsis);
    }
    addPageButton(pageNumbersContainer, totalPages);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.innerHTML = 'Next →';
  nextButton.className = `px-3 sm:px-4 py-2 rounded border transition text-sm sm:text-base w-1/2 sm:w-auto ${
    currentPage === totalPages 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
  }`;
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });

  // Page info
  const pageInfo = document.createElement('div');
  pageInfo.className = 'text-xs sm:text-sm text-gray-600 sm:ml-4 order-last';
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  // Assemble pagination
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex gap-2 w-full sm:w-auto sm:contents';
  buttonContainer.appendChild(prevButton);
  buttonContainer.appendChild(nextButton);
  
  paginationContainer.appendChild(buttonContainer);
  paginationContainer.appendChild(pageNumbersContainer);
  paginationContainer.appendChild(pageInfo);

  containerParent.insertBefore(paginationContainer, listingsContainer.nextSibling);
}

function addPageButton(container, pageNumber) {
  const button = document.createElement('button');
  button.textContent = pageNumber;
  button.className = `w-8 h-8 sm:w-10 sm:h-10 rounded border transition text-sm sm:text-base ${
    pageNumber === currentPage 
      ? 'bg-blue-600 text-white border-blue-600' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
  }`;
  button.addEventListener('click', () => {
    if (pageNumber !== currentPage) {
      goToPage(pageNumber);
    }
  });
  container.appendChild(button);
}

function goToPage(pageNum) {
  console.log(`Navigating to page ${pageNum}`);
  currentPage = pageNum;
  displayCurrentPage();
  createPaginationControls();
  scrollToListings();
}

function scrollToListings() {
  const listingsContainer = document.querySelector('ul.space-y-4');
  if (listingsContainer) {
    listingsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function attachBidModalListener(listingItem, listing) {
  const { id } = listing;
  
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
      
      const highestBid = getHighestBidAmount(single);
      
      // Check if user is authenticated (registered)
      const accessToken = localStorage.getItem('accessToken');
      const isAuthenticated = !!accessToken;

      // Render modal content
      modalBody.innerHTML = `
        <div class="bg-gray-200 h-48 sm:h-64 lg:h-80 w-full flex items-center justify-center text-gray-500 mb-3 sm:mb-4">
          <img src="${getImageUrl(single.media)}" alt="${getImageAlt(single.media)}" class="w-full h-full object-cover" onerror="this.src='images/default-fallback-image.png'">
        </div>
        <div class="p-3 sm:p-4 lg:p-6">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">${single.title}</h1>
          <p class="text-sm text-red-600 mb-3 sm:mb-4">Ends in: <span class="font-medium">${timeRemaining(single.endsAt)}</span></p>
          <div class="mb-4 sm:mb-6">
            <h2 class="text-lg sm:text-xl font-medium mb-2">Description</h2>
            <p class="text-gray-700 leading-relaxed text-sm sm:text-base">${single.description || 'No description.'}</p>
          </div>
          
          <!-- Bids Section - Only for registered users -->
          ${isAuthenticated ? `
            <div class="mb-4 sm:mb-6 border-t border-gray-200 pt-3 sm:pt-4">
              <h3 class="text-base sm:text-lg font-medium mb-2 sm:mb-3">Bid History</h3>
              ${single.bids && single.bids.length > 0 ? `
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 max-h-32 sm:max-h-48 overflow-y-auto">
                  <div class="space-y-1 sm:space-y-2">
                    ${single.bids.slice().sort((a, b) => b.amount - a.amount).map((bid, index) => `
                      <div class="flex justify-between items-center py-2 px-2 sm:px-3 ${index === 0 ? 'bg-green-100 border border-green-300 rounded' : 'border-b border-gray-200 last:border-b-0'}">
                        <div class="flex items-center gap-1 sm:gap-2">
                          <span class="text-xs sm:text-sm font-medium">${bid.bidder?.name || 'Anonymous'}</span>
                          ${index === 0 ? '<span class="text-xs bg-green-600 text-white px-1 sm:px-2 py-1 rounded">HIGH</span>' : ''}
                        </div>
                        <div class="text-right">
                          <div class="text-xs sm:text-sm font-medium ${index === 0 ? 'text-green-700' : 'text-gray-700'}">${bid.amount} Credits</div>
                          <div class="text-xs text-gray-500">${new Date(bid.created).toLocaleDateString()} ${new Date(bid.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : '<p class="text-gray-500 text-xs sm:text-sm bg-gray-50 rounded-lg p-3 sm:p-4">No bids have been placed on this item yet.</p>'}
            </div>
          ` : `
            <div class="mb-4 sm:mb-6 border-t border-gray-200 pt-3 sm:pt-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p class="text-blue-800 text-xs sm:text-sm">
                  <span class="font-medium">🔒 Bid History</span><br>
                  <a href="login.html" class="text-blue-600 hover:text-blue-800 underline">Login</a> or <a href="signup.html" class="text-blue-600 hover:text-blue-800 underline">register</a> to view all bids on this listing.
                </p>
              </div>
            </div>
          `}
          
          <div class="flex flex-col gap-3 sm:gap-4 border-t border-gray-200 pt-3 sm:pt-4">
            <div class="text-sm sm:text-base lg:text-lg">
              Current Bid: <strong class="text-blue-600">${highestBid} Credits</strong>
              <br><small class="text-gray-500">(${single._count?.bids || 0} total bids)</small>
            </div>
            ${isAuthenticated ? `
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                <input id="bid-amount" type="number" min="${highestBid + 1}" placeholder="Min: ${highestBid + 1}" class="border border-gray-300 rounded px-3 py-2 text-sm sm:text-base flex-1 sm:w-36 sm:flex-none focus:outline-blue-500">
                <button id="place-bid-btn" class="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-blue-700 transition text-sm sm:text-base font-medium">Place Bid</button>
              </div>
            ` : `
              <div class="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                <p class="text-blue-800 text-xs sm:text-sm text-center">
                  <a href="login.html" class="text-blue-600 hover:text-blue-800 underline font-medium">Login</a> or 
                  <a href="signup.html" class="text-blue-600 hover:text-blue-800 underline font-medium">register</a> to place bids
                </p>
              </div>
            `}
          </div>
          <div class="mt-3 sm:mt-6 border-t border-gray-200 pt-3 sm:pt-4">
            <p class="text-xs sm:text-sm text-gray-600">Seller: <span class="font-medium">${single.seller?.name || 'Unknown'}</span></p>
          </div>
        </div>
      `;

      // Only add bidding functionality for authenticated users
      if (isAuthenticated) {
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

          if (amount <= highestBid) {
            bidMsg.textContent = `Your bid must be higher than the current bid of ${highestBid} credits.`;
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
            
            // Refresh listings after successful bid
            setTimeout(() => {
              modalOverlay.classList.add('hidden');
              modalOverlay.classList.remove('flex');
              // Reload all active listings to show updated bid
              loadAllActiveListings().then(() => {
                displayCurrentPage();
                createPaginationControls();
              });
            }, 1500);
          } catch (err) {
            console.error('Bid placement error:', err);
            
            if (err.message.includes('401')) {
              bidMsg.textContent = "You need to be logged in to place a bid.";
            } else if (err.message.includes('403')) {
              bidMsg.textContent = "You don't have enough credits for this bid.";
            } else if (err.message.includes('400')) {
              bidMsg.textContent = "Invalid bid amount or you cannot bid on your own listing.";
            } else {
              bidMsg.textContent = `Failed to place bid: ${err.message}`;
            }
            bidMsg.classList.add('text-red-600');
          } finally {
            placeBidBtn.disabled = false;
            placeBidBtn.textContent = "Place Bid";
          }
        });
      }
    } catch (err) {
      modalBody.innerHTML = `<div class="text-red-600 p-6">Failed to load listing details.</div>`;
    } finally {
      modalLoader.classList.add('hidden');
    }
  });
}

// Modal close logic
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-overlay').classList.remove('flex');
});
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').classList.remove('flex');
  }
});

// Create Listing Modal Logic
const createListingModalOverlay = document.getElementById('create-listing-modal-overlay');
const openCreateListingBtn = document.getElementById('open-create-listing-modal');
const closeCreateListingBtn = document.getElementById('create-listing-modal-close');
const createListingForm = document.getElementById('create-listing-form');
const createListingMsg = document.getElementById('create-listing-message');

// Only add event listeners if elements exist and user is authenticated
if (openCreateListingBtn && closeCreateListingBtn && createListingForm) {
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
}

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

    setTimeout(() => {
      createListingModalOverlay.classList.add('hidden');
      createListingModalOverlay.classList.remove('flex');
      // Reload all active listings to show new listing
      loadAllActiveListings().then(() => {
        currentPage = 1; // Go to first page to see new listing
        displayCurrentPage();
        createPaginationControls();
      });
    }, 1200);

  } catch (err) {
    createListingMsg.textContent = "Failed to create listing. Please check your input and try again.";
    createListingMsg.classList.remove('hidden', 'text-green-600');
    createListingMsg.classList.add('text-red-600');
    console.error(err);
  }
});

// Helper functions
function getImageUrl(media, fallbackPath = 'images/default-fallback-image.png') {
  // Check if media exists and has a valid URL
  if (media && media[0] && media[0].url) {
    const url = media[0].url.trim();
    // Check if it's a valid URL (not empty and not just whitespace)
    if (url.length > 0) {
      // Basic URL validation - check if it looks like a URL
      try {
        // Check if it's a valid URL format
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
          return url;
        }
        // If it doesn't start with protocol, assume it might be a relative path
        if (!url.includes(' ') && (url.includes('.') || url.includes('/'))) {
          return url;
        }
      } catch (e) {
        // If any error occurs, fall back to default
        console.log('Invalid URL format:', url);
      }
    }
  }
  
  // Return fallback image
  return fallbackPath;
}

function getImageAlt(media, defaultAlt = 'Listing Image') {
  if (media && media[0] && media[0].alt) {
    return media[0].alt;
  }
  return defaultAlt;
}

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

function formatTimeAgo(endsAt) {
  const now = new Date();
  const endDate = new Date(endsAt);
  const diff = now - endDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

function getHighestBidAmount(listing) {
  if (!listing.bids || !Array.isArray(listing.bids) || listing.bids.length === 0) {
    return 0;
  }
  
  return Math.max(...listing.bids.map(bid => bid.amount));
}
