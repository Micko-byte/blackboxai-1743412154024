document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard
  loadUserData();
  setupPortfolioChart();
  loadRecentActivity();

  // Check auth status
  checkAuthStatus();

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
      
      const user = await response.json();
      updateUserInfo(user);
    } catch (error) {
      redirectToLogin();
    }
  }

  function updateUserInfo(user) {
    const emailElement = document.getElementById('user-email');
    if (emailElement) emailElement.textContent = user.email;
  }

  async function loadUserData() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        updateStats(stats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  function updateStats(stats) {
    document.getElementById('portfolio-value').textContent = `$${stats.portfolioValue.toLocaleString()}`;
    document.getElementById('active-snipes').textContent = stats.activeSnipes;
    document.getElementById('total-bundles').textContent = stats.totalBundles;
    document.getElementById('deployed-coins').textContent = stats.deployedCoins;
  }

  function setupPortfolioChart() {
    const ctx = document.getElementById('portfolio-chart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Portfolio Value',
          data: [500, 1200, 1800, 2500, 3200, 4000, 4800],
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  async function loadRecentActivity() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const activities = await response.json();
        renderActivities(activities);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }

  function renderActivities(activities) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    container.innerHTML = activities.map(activity => `
      <div class="activity-item p-4 flex items-center">
        <div class="w-10 h-10 rounded-full ${getActivityColor(activity.type).bg} flex items-center justify-center mr-4">
          <i class="fas ${getActivityIcon(activity.type)} ${getActivityColor(activity.type).text}"></i>
        </div>
        <div>
          <p class="font-medium">${activity.description}</p>
          <p class="text-sm text-gray-500">${new Date(activity.timestamp).toLocaleString()}</p>
        </div>
        <div class="ml-auto ${activity.amount >= 0 ? 'text-green-500' : 'text-red-500'} font-medium">
          ${activity.amount >= 0 ? '+' : ''}$${Math.abs(activity.amount).toLocaleString()}
        </div>
      </div>
    `).join('');
  }

  // Helper functions
  function getActivityIcon(type) {
    const icons = {
      'snipe': 'fa-bolt',
      'bundle': 'fa-layer-group',
      'deploy': 'fa-rocket',
      'purchase': 'fa-shopping-cart',
      'sale': 'fa-money-bill-wave'
    };
    return icons[type] || 'fa-info-circle';
  }

  function getActivityColor(type) {
    const colors = {
      'snipe': { bg: 'bg-blue-100', text: 'text-blue-500' },
      'bundle': { bg: 'bg-purple-100', text: 'text-purple-500' },
      'deploy': { bg: 'bg-yellow-100', text: 'text-yellow-500' },
      'purchase': { bg: 'bg-green-100', text: 'text-green-500' },
      'sale': { bg: 'bg-red-100', text: 'text-red-500' }
    };
    return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-500' };
  }

  function redirectToLogin() {
    window.location.href = 'login.html';
  }
});