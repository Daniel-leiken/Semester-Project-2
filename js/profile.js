import { apiRequest } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('loader'); // Get the loader element
  const accessToken = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!accessToken || !user) {
    window.location.href = 'login.html'; // Redirect to login if not authenticated
    return;
  }

  const profileName = user.name;

  try {
    // Show loader
    loader.classList.remove('hidden');

    // Fetch profile data
    const response = await apiRequest(`/auction/profiles/${profileName}?_listings=true`, {
      method: 'GET',
    });

    const { data } = response;

    // Update profile banner
    const profileBanner = document.getElementById('profile-banner');
    if (data.banner?.url) {
      profileBanner.style.backgroundImage = `url(${data.banner.url})`;
      profileBanner.style.backgroundSize = 'cover';
      profileBanner.style.backgroundPosition = 'center';
    }

    // Update profile avatar
    const profileAvatar = document.getElementById('profile-avatar');
    profileAvatar.src = data.avatar?.url || 'images/default-avatar.png';
    profileAvatar.alt = data.avatar?.alt || 'Profile Avatar';

    // Update profile details
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-email').textContent = data.email;
    document.getElementById('profile-bio').textContent = data.bio || 'No bio available.';

    // Update user listings
    const userListingsContainer = document.getElementById('user-listings');
    userListingsContainer.innerHTML = '';

    const myListings = Array.isArray(data.listings)
      ? data.listings.filter(listing => new Date(listing.endsAt) > new Date())
      : [];

    myListings.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

    if (myListings.length === 0) {
      userListingsContainer.innerHTML = '<li class="text-gray-500 text-center py-8">You have no active listings.</li>';
    } else {
      myListings.forEach((listing) => {
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
            <div class="text-gray-700 text-sm">Current bid: <strong>${_count?.bids || 0} Credits</strong></div>
          </div>
          <div class="ml-auto flex items-center">
            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" data-id="${id}">Place Bid</button>
          </div>
        `;
        userListingsContainer.appendChild(listingItem);

        // Modal logic for Place Bid
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

            // Render modal content (same as index)
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
              } catch (err) {
                bidMsg.textContent = "Failed to place bid. Make sure you are logged in and have enough credits.";
                bidMsg.classList.add('text-red-600');
                console.error(err);
              } finally {
                placeBidBtn.disabled = false;
                placeBidBtn.textContent = "Place Bid";
              }
            });

            const isOwner = single.seller?.name === user.name;

            if (isOwner) {
              const deleteBtn = document.createElement('button');
              deleteBtn.textContent = "Delete Listing";
              deleteBtn.type = "button";
              deleteBtn.className = "mt-6 ml-auto block text-sm text-gray-500 hover:text-red-600 transition underline underline-offset-2";
              // Place just below the seller info
              modalBody.querySelector('.mt-6.border-t').appendChild(deleteBtn);

              deleteBtn.addEventListener('click', async () => {
                if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
                try {
                  await apiRequest(`/auction/listings/${single.id}`, { method: 'DELETE' });
                  modalBody.innerHTML = `<div class="text-green-600 p-6">Listing deleted successfully.</div>`;
                  setTimeout(() => {
                    document.getElementById('modal-overlay').classList.add('hidden');
                    document.getElementById('modal-overlay').classList.remove('flex');
                    window.location.reload();
                  }, 1200);
                } catch (err) {
                  modalBody.innerHTML += `<div class="text-red-600 mt-2">Failed to delete listing.</div>`;
                  console.error(err);
                }
              });
            }
          } catch (err) {
            modalBody.innerHTML = `<div class="text-red-600 p-6">Failed to load listing details.</div>`;
            console.error(err);
          } finally {
            modalLoader.classList.add('hidden');
          }
        });
      });
    }

    // Add edit functionality
    setupEditButtons(profileName, data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    showMessage('Failed to load profile. Please try again later.', 'error'); // Replaced alert with showMessage
  } finally {
    // Hide loader
    loader.classList.add('hidden');
  }
});

function setupEditButtons(profileName, profileData) {
  // Edit Bio
  const editBioButton = document.getElementById('edit-bio');
  const profileBio = document.getElementById('profile-bio');

  editBioButton.addEventListener('click', () => {
    const isEditing = editBioButton.textContent === 'Save';

    if (isEditing) {
      // Save the new bio
      const newBio = document.getElementById('bio-input').value.trim();
      updateProfile(profileName, { bio: newBio })
        .then(() => {
          profileBio.textContent = newBio || 'No bio available.';
          showMessage('Bio updated successfully!', 'success');
        })
        .catch((error) => {
          console.error('Error updating bio:', error);
          showMessage('Failed to update bio. Please try again.', 'error');
        })
        .finally(() => {
          editBioButton.textContent = 'Edit';
        });
    } else {
      // Switch to editing mode
      const currentBio = profileBio.textContent === 'No bio available.' ? '' : profileBio.textContent;
      profileBio.innerHTML = `<textarea id="bio-input" class="border border-gray-300 rounded px-3 py-2 w-full">${currentBio}</textarea>`;
      editBioButton.textContent = 'Save';
    }
  });

  // Edit Avatar
  const editAvatarButton = document.getElementById('edit-avatar');
  const profileAvatar = document.getElementById('profile-avatar');

  editAvatarButton.addEventListener('click', () => {
    const avatarUrl = prompt('Enter the new avatar URL:', profileData.avatar?.url || '');
    if (avatarUrl) {
      updateProfile(profileName, { avatar: { url: avatarUrl, alt: 'Updated Avatar' } })
        .then(() => {
          profileAvatar.src = avatarUrl;
          showMessage('Avatar updated successfully!', 'success');
        })
        .catch((error) => {
          console.error('Error updating avatar:', error);
          showMessage('Failed to update avatar. Please try again.', 'error');
        });
    }
  });

  // Edit Banner
  const editBannerButton = document.getElementById('edit-banner');
  const profileBanner = document.getElementById('profile-banner');

  editBannerButton.addEventListener('click', () => {
    const bannerUrl = prompt('Enter the new banner URL:', profileData.banner?.url || '');
    if (bannerUrl) {
      updateProfile(profileName, { banner: { url: bannerUrl, alt: 'Updated Banner' } })
        .then(() => {
          profileBanner.style.backgroundImage = `url(${bannerUrl})`;
          showMessage('Banner updated successfully!', 'success');
        })
        .catch((error) => {
          console.error('Error updating banner:', error);
          showMessage('Failed to update banner. Please try again.', 'error');
        });
    }
  });
}

async function updateProfile(profileName, updates) {
  try {
    await apiRequest(`/auction/profiles/${profileName}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    showMessage('Profile updated successfully!', 'success'); // Replaced alert with showMessage
  } catch (error) {
    console.error('Error updating profile:', error);
    showMessage('Failed to update profile. Please try again.', 'error'); // Replaced alert with showMessage
  }
}

function showMessage(message, type = 'error') {
  const messageBox = document.getElementById('message-box');
  const messageText = document.getElementById('message-text');

  // Set the message text
  messageText.textContent = message;

  // Update the styles based on the message type
  if (type === 'success') {
    messageBox.classList.remove('bg-red-100', 'border-red-400', 'text-red-700');
    messageBox.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
  } else {
    messageBox.classList.remove('bg-green-100', 'border-green-400', 'text-green-700');
    messageBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
  }

  // Show the message box
  messageBox.classList.remove('hidden');

  // Hide the message box after 5 seconds
  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 5000);
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

// Modal close logic
document.getElementById('modal-close').addEventListener('click', () => {
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.classList.add('hidden');
  modalOverlay.classList.remove('flex');
});
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
  }
});