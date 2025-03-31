document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const newSnipeBtn = document.getElementById('new-snipe-btn');
  const snipeModal = document.getElementById('snipe-modal');
  const closeModal = document.getElementById('close-modal');
  const snipeForm = document.getElementById('snipe-form');
  const platformTabs = document.querySelectorAll('.platform-tab');
  const coinList = document.getElementById('coin-list');

  // Current state
  let currentPlatform = 'pump.fun';
  let activeSnipes = [];
  let coinData = [];

  // Initialize
  loadActiveSnipes();
  fetchCoinData(currentPlatform);
  setupEventListeners();

  function setupEventListeners() {
    // Modal controls
    newSnipeBtn.addEventListener('click', () => snipeModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => snipeModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
      if (e.target === snipeModal) snipeModal.classList.add('hidden');
    });

    // Platform tabs
    platformTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        platformTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentPlatform = tab.dataset.platform;
        fetchCoinData(currentPlatform);
      });
    });

    // Snipe form submission
    snipeForm.addEventListener('submit', handleSnipeSubmit);
  }

  // Fetch coin data for platform
  async function fetchCoinData(platform) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`/api/coins/list?platform=${platform}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch coin data');

      coinData = await response.json();
      renderCoinList();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  // Load user's active snipes
  async function loadActiveSnipes() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/snipes/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        activeSnipes = await response.json();
      }
    } catch (error) {
      console.error('Failed to load active snipes:', error);
    }
  }

  // Handle new snipe creation
  async function handleSnipeSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(snipeForm);
    const snipeData = {
      platform: currentPlatform,
      coinAddress: formData.get('coinAddress'),
      amount: formData.get('amount'),
      slippage: formData.get('slippage'),
      gasPrice: formData.get('gasPrice') || 'auto'
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/snipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(snipeData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create snipe');
      }

      const result = await response.json();
      showAlert(`Snipe created successfully! TX: ${result.txHash}`, 'success');
      snipeModal.classList.add('hidden');
      snipeForm.reset();
      loadActiveSnipes();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  // Render coin list
  function renderCoinList() {
    coinList.innerHTML = coinData.map(coin => `
      <div class="coin-card bg-white rounded-lg shadow overflow-hidden transition-all">
        <div class="p-4 border-b flex justify-between items-center">
          <div>
            <h3 class="font-bold">${coin.name} (${coin.symbol})</h3>
            <p class="text-sm text-gray-500">${coin.address.substring(0, 6)}...${coin.address.substring(38)}</p>
          </div>
          <span class="px-2 py-1 text-xs rounded-full ${
            coin.age < 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }">
            ${coin.age}m old
          </span>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-500">Liquidity</p>
              <p class="font-medium">${coin.liquidity} ETH</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Volume</p>
              <p class="font-medium">${coin.volume} ETH</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Price</p>
              <p class="font-medium">${coin.price} ETH</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Change</p>
              <p class="font-medium ${
                coin.change >= 0 ? 'text-green-600' : 'text-red-600'
              }">
                ${coin.change >= 0 ? '+' : ''}${coin.change}%
              </p>
            </div>
          </div>
          <button class="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 snipe-btn" 
            data-address="${coin.address}">
            Snipe
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners to snipe buttons
    document.querySelectorAll('.snipe-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const address = e.target.dataset.address;
        const coin = coinData.find(c => c.address === address);
        if (coin) {
          snipeForm.querySelector('input[type="text"]').value = address;
          snipeModal.classList.remove('hidden');
        }
      });
    });
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
});