// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Event Listeners
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}

// API base URL
const API_BASE_URL = 'http://localhost:3001';

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  const rememberMe = loginForm['remember-me'].checked;

  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    window.location.href = 'index.html';
  } catch (error) {
    console.error('Login error:', error);
    showAlert(error.message, 'error');
  }
}


// Handle Registration
async function handleRegister(e) {
  e.preventDefault();
  
  if (registerForm.password.value !== registerForm.confirmPassword.value) {
    return showAlert('Passwords do not match', 'error');
  }

  const userData = {
    email: registerForm.email.value,
    password: registerForm.password.value
  };

  try {
    // Validate inputs
    if (!userData.email || !userData.password) {
      throw new Error('Please fill in all fields');
    }

    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    showAlert('Registration successful! You can now log in.', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (error) {
    console.error('Registration error:', error);
    showAlert(error.message, 'error');
  }
}


// Show alert message
function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
    type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  }`;
  alertDiv.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
      alertDiv.remove();
    }, 300);
  }, 5000);
}

// Check if user is already logged in
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  if (token && window.location.pathname.includes('login.html')) {
    window.location.href = 'index.html';
  }
}

// Initialize auth check
checkAuthStatus();