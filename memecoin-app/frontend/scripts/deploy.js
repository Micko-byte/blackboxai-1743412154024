document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const deployBtn = document.getElementById('deploy-btn');
  const saveDraftBtn = document.getElementById('save-draft');
  const templateOptions = document.querySelectorAll('.template-option');
  const coinNameInput = document.getElementById('coin-name');
  const coinSymbolInput = document.getElementById('coin-symbol');
  const totalSupplyInput = document.getElementById('total-supply');
  const liquidityInput = document.getElementById('liquidity');
  const teamAllocationInput = document.getElementById('team-allocation');
  const teamAllocationValue = document.getElementById('team-allocation-value');
  const marketingAllocationInput = document.getElementById('marketing-allocation');
  const marketingAllocationValue = document.getElementById('marketing-allocation-value');
  const liquidityLockInput = document.getElementById('liquidity-lock');
  const liquidityLockValue = document.getElementById('liquidity-lock-value');
  const antiBotCheckbox = document.getElementById('anti-bot');
  const antiSnipeCheckbox = document.getElementById('anti-snipe');
  const burnMechCheckbox = document.getElementById('burn-mech');
  const rewardsCheckbox = document.getElementById('rewards');
  const estimatedLiquidity = document.getElementById('estimated-liquidity');
  const estimatedTotal = document.getElementById('estimated-total');

  // Current deployment configuration
  let currentTemplate = 'standard';
  let deploymentConfig = {
    name: '',
    symbol: '',
    totalSupply: 1000000,
    liquidity: 1.0,
    teamAllocation: 5,
    marketingAllocation: 3,
    liquidityLock: 30,
    antiBot: true,
    antiSnipe: true,
    burnMech: false,
    rewards: false
  };

  // Initialize
  setupEventListeners();
  updateEstimates();

  function setupEventListeners() {
    // Template selection
    templateOptions.forEach(option => {
      option.addEventListener('click', () => {
        templateOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        currentTemplate = option.dataset.template;
        applyTemplate(currentTemplate);
      });
    });

    // Form inputs
    coinNameInput.addEventListener('input', (e) => {
      deploymentConfig.name = e.target.value;
    });

    coinSymbolInput.addEventListener('input', (e) => {
      deploymentConfig.symbol = e.target.value.toUpperCase();
      e.target.value = deploymentConfig.symbol;
    });

    totalSupplyInput.addEventListener('input', (e) => {
      deploymentConfig.totalSupply = parseInt(e.target.value) || 0;
    });

    liquidityInput.addEventListener('input', (e) => {
      deploymentConfig.liquidity = parseFloat(e.target.value) || 0;
      updateEstimates();
    });

    // Sliders
    teamAllocationInput.addEventListener('input', (e) => {
      deploymentConfig.teamAllocation = parseInt(e.target.value);
      teamAllocationValue.textContent = `${deploymentConfig.teamAllocation}%`;
    });

    marketingAllocationInput.addEventListener('input', (e) => {
      deploymentConfig.marketingAllocation = parseInt(e.target.value);
      marketingAllocationValue.textContent = `${deploymentConfig.marketingAllocation}%`;
    });

    liquidityLockInput.addEventListener('input', (e) => {
      deploymentConfig.liquidityLock = parseInt(e.target.value);
      liquidityLockValue.textContent = `${deploymentConfig.liquidityLock}d`;
    });

    // Checkboxes
    antiBotCheckbox.addEventListener('change', (e) => {
      deploymentConfig.antiBot = e.target.checked;
    });

    antiSnipeCheckbox.addEventListener('change', (e) => {
      deploymentConfig.antiSnipe = e.target.checked;
    });

    burnMechCheckbox.addEventListener('change', (e) => {
      deploymentConfig.burnMech = e.target.checked;
    });

    rewardsCheckbox.addEventListener('change', (e) => {
      deploymentConfig.rewards = e.target.checked;
    });

    // Buttons
    saveDraftBtn.addEventListener('click', saveDraft);
    deployBtn.addEventListener('click', deployCoin);
  }

  // Apply template settings
  function applyTemplate(template) {
    switch(template) {
      case 'standard':
        deploymentConfig = {
          ...deploymentConfig,
          teamAllocation: 5,
          marketingAllocation: 3,
          liquidityLock: 30,
          antiBot: true,
          antiSnipe: true,
          burnMech: false,
          rewards: false
        };
        break;
      case 'community':
        deploymentConfig = {
          ...deploymentConfig,
          teamAllocation: 3,
          marketingAllocation: 5,
          liquidityLock: 90,
          antiBot: true,
          antiSnipe: false,
          burnMech: true,
          rewards: true
        };
        break;
      case 'defensive':
        deploymentConfig = {
          ...deploymentConfig,
          teamAllocation: 2,
          marketingAllocation: 2,
          liquidityLock: 180,
          antiBot: true,
          antiSnipe: true,
          burnMech: false,
          rewards: false
        };
        break;
      case 'custom':
        // Keep current settings
        break;
    }

    // Update UI to match new config
    updateUIFromConfig();
  }

  // Update UI elements from config
  function updateUIFromConfig() {
    teamAllocationInput.value = deploymentConfig.teamAllocation;
    teamAllocationValue.textContent = `${deploymentConfig.teamAllocation}%`;
    marketingAllocationInput.value = deploymentConfig.marketingAllocation;
    marketingAllocationValue.textContent = `${deploymentConfig.marketingAllocation}%`;
    liquidityLockInput.value = deploymentConfig.liquidityLock;
    liquidityLockValue.textContent = `${deploymentConfig.liquidityLock}d`;
    antiBotCheckbox.checked = deploymentConfig.antiBot;
    antiSnipeCheckbox.checked = deploymentConfig.antiSnipe;
    burnMechCheckbox.checked = deploymentConfig.burnMech;
    rewardsCheckbox.checked = deploymentConfig.rewards;
  }

  // Update cost estimates
  function updateEstimates() {
    estimatedLiquidity.textContent = `${deploymentConfig.liquidity} ETH`;
    const total = (0.01 + 0.003 + deploymentConfig.liquidity).toFixed(3);
    estimatedTotal.textContent = `${total} ETH`;
  }

  // Save deployment draft
  async function saveDraft() {
    if (!deploymentConfig.name || !deploymentConfig.symbol) {
      showAlert('Please enter a coin name and symbol', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch('/api/deployments/drafts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...deploymentConfig,
          template: currentTemplate
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save draft');
      }

      showAlert('Draft saved successfully', 'success');
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }

  // Deploy new coin
  async function deployCoin() {
    if (!validateDeployment()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      deployBtn.disabled = true;
      deployBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Deploying...';

      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deploymentConfig)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Deployment failed');
      }

      const result = await response.json();
      showAlert(`Coin deployed successfully! TX: ${result.txHash}`, 'success');
      
      // Reset form
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      deployBtn.disabled = false;
      deployBtn.innerHTML = '<i class="fas fa-rocket mr-2"></i> Deploy Coin';
      showAlert(error.message, 'error');
    }
  }

  // Validate deployment configuration
  function validateDeployment() {
    if (!deploymentConfig.name) {
      showAlert('Please enter a coin name', 'error');
      return false;
    }

    if (!deploymentConfig.symbol || deploymentConfig.symbol.length < 2) {
      showAlert('Please enter a valid symbol (2-5 characters)', 'error');
      return false;
    }

    if (deploymentConfig.totalSupply <= 0) {
      showAlert('Please enter a valid total supply', 'error');
      return false;
    }

    if (deploymentConfig.liquidity <= 0) {
      showAlert('Please enter a valid liquidity amount', 'error');
      return false;
    }

    const totalAllocation = deploymentConfig.teamAllocation + deploymentConfig.marketingAllocation;
    if (totalAllocation > 20) {
      showAlert('Total allocation cannot exceed 20%', 'error');
      return false;
    }

    return true;
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