import { apiRequest } from './config.js';

const signupForm = document.getElementById('signup-form');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Forhindre standard innsending av skjemaet

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const bio = document.getElementById('bio').value.trim() || null;
  const avatarUrl = document.getElementById('avatar-url').value.trim() || null;
  const avatarAlt = document.getElementById('avatar-alt').value.trim() || null;
  const bannerUrl = document.getElementById('banner-url').value.trim() || null;
  const bannerAlt = document.getElementById('banner-alt').value.trim() || null;

  // Valider e-postdomenet
  if (!email.endsWith('@stud.noroff.no')) {
    showMessage('Only users with a stud.noroff.no email address can register.');
    return;
  }

  // Valider passordlengde
  if (password.length < 8) {
    showMessage('Password must be at least 8 characters long.');
    return;
  }

  // Valider navn (ingen tegnsetting bortsett fra understrek)
  const nameRegex = /^[a-zA-Z0-9_]+$/;
  if (!nameRegex.test(name)) {
    showMessage('Name can only contain letters, numbers, and underscores (_).');
    return;
  }

  // Konstruer forespørselsbody
  const requestBody = {
    name,
    email,
    password,
    bio,
    avatar: avatarUrl ? { url: avatarUrl, alt: avatarAlt || '' } : undefined,
    banner: bannerUrl ? { url: bannerUrl, alt: bannerAlt || '' } : undefined,
  };

  try {
    // Bruk apiRequest-hjelpefunksjonen fra config.js
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    showMessage('Signup successful! Redirecting to the homepage...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html'; // Omdiriger til startsiden
    }, 2000);
  } catch (error) {
    console.error('Error during signup:', error);

    // Håndter spesifikke feilmeldinger
    if (error.message === 'Profile already exists') {
      showMessage('This email or username is already registered. Please use a different email or log in.');
    } else if (error.message === 'Invalid email format') {
      showMessage('The email address provided is invalid. Please use a valid stud.noroff.no email.');
    } else if (error.message === 'Password too weak') {
      showMessage('The password provided is too weak. Please use a stronger password.');
    } else {
      showMessage(`Signup failed: ${error.message}`);
    }
  }
});

// Funksjon for å vise meldinger
function showMessage(message, type = 'error') {
  messageText.textContent = message;
  messageBox.classList.remove('hidden', 'bg-red-100', 'bg-green-100', 'border-red-400', 'border-green-400', 'text-red-700', 'text-green-700');
  
  if (type === 'error') {
    messageBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
  } else if (type === 'success') {
    messageBox.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
  }
}