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