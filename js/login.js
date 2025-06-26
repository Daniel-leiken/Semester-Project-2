import { apiRequest } from './config.js';

const loginForm = document.getElementById('login-form');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

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

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Forhindre standard innsending av skjemaet

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Valider at e-post og passord ikke er tomme
  if (!email || !password) {
    showMessage('Please enter both email and password.');
    return;
  }

  // Konstruer forespørselsbody
  const requestBody = {
    email,
    password,
  };

  try {
    // Bruk apiRequest-hjelpefunksjonen fra config.js
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Hent brukerdata og token fra responsen
    const { data } = response;
    const { name, email: userEmail, accessToken } = data;

    // Lagre token og brukerdata i localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify({ name, email: userEmail }));

    showMessage(`Welcome back, ${name}!`, 'success');
    setTimeout(() => {
      window.location.href = 'index.html'; // Omdiriger til startsiden
    }, 2000);
  } catch (error) {
    console.error('Login Error:', error);

    // Håndter spesifikke feilmeldinger
    if (error.message === 'Invalid email or password') {
      showMessage('Invalid email or password. Please try again.');
    } else {
      showMessage(`Login failed: ${error.message}`);
    }
  }
});