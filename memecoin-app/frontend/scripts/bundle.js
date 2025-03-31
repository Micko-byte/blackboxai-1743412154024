document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const coinSelection = document.getElementById('coin-selection');
  const selectedCoins = document.getElementById('selected-coins');
  const createBundleBtn = document.getElementById('create-bundle-btn');
  const bundleList = document.getElementById('bundle-list');
  const searchInput = document.querySelector('input[type="text"]');

  // State
  let availableCoins = [];
  let selectedCoinIds = new Set();
  let userBundles = [];

  // Initialize
  loadAvailableCoins();
  loadUserBundles();
  setupEventListeners();

  function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      renderCoinSelection(availableCoins.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) || 
        coin.symbol.toLowerCase().includes(searchTerm)
      ));
    });

    // Create bundle button
    createBundleBtn.addEventListener('click', createBundle);
  }

  // Load available coins for bundling
  async function loadAvailableCoins() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/coins/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to load coins');
      
      availableCoins = await response.json();
      renderCoinSelection(availableCoins);
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  // Load user's existing bundles
  async function loadUserBundles() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/bundles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        userBundles = await response.json();
        renderBundleList();
      }
    } catch (error) {
      console.error('Failed to load bundles:', error);
    }
  }

  // Render available coins
  function renderCoinSelection(coins) {
    coinSelection.innerHTML = coins.map(coin => `
      <div class="coin-card bg-white rounded-lg shadow p-4 flex items-center justify-between cursor-pointer ${
        selectedCoinIds.has(coin.id) ? 'ring-2 ring-indigo-500' : ''
      }" data-id="${coin.id}">
        <div>
          <h4 class="font-medium">${coin.symbol}</h4>
          <p class="text-sm text-gray-500">${coin.name}</p>
        </div>
        <div class="text-right">
          <p class="font-medium">${coin.price} ETH</p>
          <p class="text-sm ${
            coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'
          }">
            ${coin.change24h >= 0 ? '+' : ''}${coin.change24h}%
          </p>
        </div>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.coin-card').forEach(card => {
      card.addEventListener('click', () => {
        const coinId = card.dataset.id;
        if (selectedCoinIds.has(coinId)) {
          selectedCoinIds.delete(coinId);
          card.classList.remove('ring-2', 'ring-indigo-500');
        } else {
          selectedCoinIds.add(coinId);
          card.classList.add('ring-2', 'ring-indigo-500');
        }
        renderSelectedCoins();
      });
    });
  }

  // Render selected coins
  function renderSelectedCoins() {
    if (selectedCoinIds.size === 0) {
      selectedCoins.innerHTML = '<div class="text-gray-500">No coins selected</div>';
      return;
    }

    const selected = availableCoins.filter(coin => selectedCoinIds.has(coin.id));
    selectedCoins.innerHTML = selected.map(coin => `
      <div class="coin-pill flex items-center bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm">
        ${coin.symbol}
        <button class="ml-2 text-indigo-600 hover:text-indigo-800" data-id="${coin.id}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');

    // Add remove button handlers
    selectedCoins.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const coinId = btn.dataset.id;
        selectedCoinIds.delete(coinId);
        renderSelectedCoins();
        renderCoinSelection(availableCoins);
      });
    });
  }

  // Create new bundle
  async function createBundle() {
    if (selectedCoinIds.size === 0) {
      showAlert('Please select at least one coin', 'error');
      return;
    }

    const bundleName = document.querySelector('input[type="text"]').value || 'Unnamed Bundle';
    const allocation = document.querySelector('select').value;
    const amount = document.querySelector('input[type="number"]').value;

    if (!amount || parseFloat(amount) <= 0) {
      showAlert('Please enter a valid investment amount', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: bundleName,
          coinIds: Array.from(selectedCoinIds),
          allocationStrategy: allocation,
          amount: parseFloat(amount)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create bundle');
      }

      const newBundle = await response.json();
      showAlert(`Bundle "${newBundle.name}" created successfully!`, 'success');
      selectedCoinIds.clear();
      renderSelectedCoins();
      loadUserBundles();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  // Render user's bundles
  function renderBundleList() {
    bundleList.innerHTML = userBundles.map(bundle => `
      <div class="bundle-card bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h3 class="font-bold">${bundle.name}</h3>
            <span class="px-2 py-1 text-xs rounded-full ${
              bundle.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }">
              ${bundle.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p class="text-sm text-gray-500">Created ${formatDate(bundle.createdAt)}</p>
        </div>
        <div class="p-4">
          <div class="flex justify-between mb-3">
            <span class="text-sm text-gray-500">Value</span>
            <span class="font-medium">${bundle.value} ETH</span>
          </div>
          <div class="flex justify-between mb-3">
            <span class="text-sm text-gray-500">24h Change</span>
            <span class="font-medium ${
              bundle.change24h >= 0 ? 'text-green-600' : 'text-red-600'
            }">
              ${bundle.change24h >= 0 ? '+' : ''}${bundle.change24h}%
            </span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="text-sm text-gray-500">Coins</span>
            <span class="font-medium">${bundle.coins.length}</span>
          </div>
          <div class="flex space-x-2">
            <button class="flex-1 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm view-bundle" 
              data-id="${bundle.id}">
              <i class="fas fa-chart-line mr-1"></i> View
            </button>
            <button class="flex-1 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm edit-bundle"
              data-id="${bundle.id}">
              <i class="fas fa-edit mr-1"></i> Edit
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.view-bundle').forEach(btn => {
      btn.addEventListener('click', () => {
        const bundleId = btn.dataset.id;
        // Implement view functionality
      });
    });

    document.querySelectorAll('.edit-bundle').forEach(btn => {
      btn.addEventListener('click', () => {
        const bundleId = btn.dataset.id;
        // Implement edit functionality
      });
    });
  }

  // Helper functions
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

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
});