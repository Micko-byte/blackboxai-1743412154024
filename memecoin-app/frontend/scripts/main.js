// Global state
let currentUser = null;
let authToken = null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const dashboardStats = document.getElementById('dashboard-stats');
const recentActivity = document.getElementById('recent-activity');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadDashboardData();
});

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return redirectToLogin();

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Not authenticated');
    
    currentUser = await response.json();
    authToken = token;
    updateUIForLoggedInUser();
  } catch (error) {
    redirectToLogin();
  }
}

// Load dashboard data
async function loadDashboardData() {
  if (!authToken) return;

  try {
    // Fetch stats
    const statsResponse = await fetch('/api/coins/stats', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const stats = await statsResponse.json();
    renderStats(stats);

    // Fetch recent activity
    const activityResponse = await fetch('/api/activity', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const activities = await activityResponse.json();
    renderActivities(activities);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

// UI Update functions
function updateUIForLoggedInUser() {
  document.querySelectorAll('.auth-only').forEach(el => {
    el.classList.remove('hidden');
  });
  document.querySelectorAll('.guest-only').forEach(el => {
    el.classList.add('hidden');
  });
  
  if (currentUser) {
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('kyc-status').textContent = 
      currentUser.kycStatus === 'approved' ? 'Verified' : 'Not Verified';
  }
}

function renderStats(stats) {
  if (!dashboardStats) return;
  
  dashboardStats.innerHTML = `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500">Total Volume</p>
          <h3 class="text-2xl font-bold">$${stats.totalVolume.toLocaleString()}</h3>
        </div>
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <i class="fas fa-chart-bar text-green-500"></i>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500">Coins Bundled</p>
          <h3 class="text-2xl font-bold">${stats.coinsBundled}</h3>
        </div>
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fas fa-layer-group text-blue-500"></i>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-gray-500">Successful Snipes</p>
          <h3 class="text-2xl font-bold">${stats.successfulSnipes}</h3>
        </div>
        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <i class="fas fa-bolt text-purple-500"></i>
        </div>
      </div>
    </div>
  `;
}

function renderActivities(activities) {
  if (!recentActivity) return;

  recentActivity.innerHTML = activities.map(activity => `
    <div class="p-4 flex items-center">
      <div class="w-10 h-10 rounded-full ${getActivityColor(activity.type).bg} flex items-center justify-center mr-4">
        <i class="fas ${getActivityIcon(activity.type)} ${getActivityColor(activity.type).text}"></i>
      </div>
      <div>
        <p class="font-medium">${activity.description}</p>
        <p class="text-sm text-gray-500">${new Date(activity.timestamp).toLocaleString()}</p>
      </div>
      <div class="ml-auto ${activity.amount > 0 ? 'text-green-500' : 'text-red-500'} font-medium">
        ${activity.amount > 0 ? '+' : ''}${activity.amount}
      </div>
    </div>
  `).join('');
}

// Helper functions
function getActivityIcon(type) {
  const icons = {
    'snipe': 'fa-bolt',
    'bundle': 'fa-layer-group',
    'deploy': 'fa-rocket'
  };
  return icons[type] || 'fa-info-circle';
}

function getActivityColor(type) {
  const colors = {
    'snipe': { bg: 'bg-yellow-100', text: 'text-yellow-500' },
    'bundle': { bg: 'bg-blue-100', text: 'text-blue-500' },
    'deploy': { bg: 'bg-purple-100', text: 'text-purple-500' }
  };
  return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-500' };
}

function redirectToLogin() {
  if (!window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
}