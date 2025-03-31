document.addEventListener('DOMContentLoaded', () => {
  // Initialize file upload handlers
  initFileUpload('id-front-upload', 'id-front', 'id-front-preview');
  initFileUpload('id-back-upload', 'id-back', 'id-back-preview');
  initFileUpload('address-upload', 'address', 'address-preview');
  initFileUpload('selfie-upload', 'selfie', 'selfie-preview');

  // Form submission
  const kycForm = document.getElementById('kyc-form');
  if (kycForm) {
    kycForm.addEventListener('submit', handleKycSubmit);
  }

  // Check current KYC status
  checkKycStatus();
});

// Initialize file upload with preview
function initFileUpload(dropZoneId, inputId, previewId) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  // Click handler
  dropZone.addEventListener('click', () => fileInput.click());

  // Drag and drop handlers
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  dropZone.addEventListener('drop', handleDrop, false);

  // File input change handler
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files, preview);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    dropZone.classList.add('border-indigo-500', 'bg-indigo-50');
  }

  function unhighlight() {
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50');
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    handleFiles(files, preview);
  }
}

// Handle uploaded files and show preview
function handleFiles(files, previewElement) {
  if (files.length === 0) return;

  const file = files[0];
  if (!validateFile(file)) {
    showAlert('Invalid file type or size (max 5MB)', 'error');
    return;
  }

  previewElement.innerHTML = '';
  previewElement.classList.remove('hidden');

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'max-h-40 mx-auto';
      previewElement.appendChild(img);
    };
    reader.readAsDataURL(file);
  } else if (file.type === 'application/pdf') {
    previewElement.innerHTML = `
      <div class="flex items-center justify-center p-4 bg-gray-100 rounded">
        <i class="fas fa-file-pdf text-4xl text-red-500 mr-3"></i>
        <span>${file.name}</span>
      </div>
    `;
  }
}

// Validate file type and size
function validateFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) return false;
  if (file.size > maxSize) return false;
  return true;
}

// Handle KYC form submission
async function handleKycSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData();
  const idFront = document.getElementById('id-front').files[0];
  const idBack = document.getElementById('id-back').files[0];
  const address = document.getElementById('address').files[0];
  const selfie = document.getElementById('selfie').files[0];

  if (!idFront || !idBack || !address || !selfie) {
    showAlert('Please upload all required documents', 'error');
    return;
  }

  formData.append('idFront', idFront);
  formData.append('idBack', idBack);
  formData.append('proofOfAddress', address);
  formData.append('selfie', selfie);

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await fetch('/api/kyc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    showAlert('Documents submitted successfully! Verification in progress.', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Check current KYC status
async function checkKycStatus() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('/api/kyc/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const statusElement = document.getElementById('kyc-status');
      if (statusElement) {
        statusElement.textContent = data.status === 'approved' ? 'Verified' : 'Pending';
        statusElement.className = `px-3 py-1 rounded-full text-xs font-medium ${
          data.status === 'approved' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`;
      }
    }
  } catch (error) {
    console.error('Failed to check KYC status:', error);
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