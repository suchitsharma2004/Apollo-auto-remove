// DOM Elements
const form = document.getElementById('removeContactForm');
const apiKeyInput = document.getElementById('apiKey');
const campaignIdInput = document.getElementById('campaignId');
const emailInput = document.getElementById('email');
const modeSelect = document.getElementById('mode');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const results = document.getElementById('results');
const apiStatus = document.getElementById('apiStatus');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// API Base URL
const API_BASE_URL = window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkApiHealth();
    setupFormHandlers();
    setupAnimations();
    loadSavedCredentials();
});

// Check API health status
async function checkApiHealth() {
    try {
        statusDot.className = 'status-dot loading';
        statusText.textContent = 'Checking API status...';
        
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            statusDot.className = 'status-dot online';
            statusText.textContent = 'API Ready - Enter Apollo credentials below';
            
            if (!data.hasApiKey) {
                showStatusMessage('Enter your Apollo API key and Campaign ID in the form below to get started.', 'info');
            }
        } else {
            throw new Error('API not responding correctly');
        }
    } catch (error) {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'API Offline';
        showStatusMessage('Unable to connect to the API. Please check if the server is running.', 'error');
    }
}

// Setup form event handlers
function setupFormHandlers() {
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time email validation
    emailInput.addEventListener('input', validateEmail);
    
    // Save credentials when they change
    apiKeyInput.addEventListener('input', debounce(saveCredentials, 500));
    campaignIdInput.addEventListener('input', debounce(saveCredentials, 500));
    
    // Clear results when form inputs change
    [apiKeyInput, campaignIdInput, emailInput, modeSelect].forEach(input => {
        input.addEventListener('input', () => {
            hideResults();
            hideStatusMessage();
        });
    });
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const apiKey = apiKeyInput.value.trim();
    const campaignId = campaignIdInput.value.trim();
    const email = emailInput.value.trim();
    const mode = modeSelect.value;
    
    // Debug logging
    console.log('Form submission:', { 
        apiKey: apiKey ? '***provided***' : 'missing',
        campaignId: campaignId,
        campaignIdLength: campaignId.length,
        email: email,
        mode: mode 
    });
    
    if (!apiKey) {
        showStatusMessage('Please enter your Apollo API key.', 'error');
        return;
    }
    
    if (!campaignId) {
        showStatusMessage('Please enter the Campaign ID.', 'error');
        return;
    }
    
    // Basic campaign ID validation (just check it's not empty)
    if (campaignId.length < 10) {
        showStatusMessage('Please enter a valid Campaign ID.', 'error');
        return;
    }
    
    if (!validateEmailFormat(email)) {
        showStatusMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Save credentials for faster future use
    saveCredentials();
    
    await removeContact(apiKey, campaignId, email, mode);
}

// Validate email format
function validateEmail() {
    const email = emailInput.value.trim();
    if (email && !validateEmailFormat(email)) {
        emailInput.style.borderColor = '#f87171';
    } else {
        emailInput.style.borderColor = '#475569';
    }
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Remove contact from Apollo sequence
async function removeContact(apiKey, campaignId, email, mode) {
    try {
        setLoadingState(true);
        hideResults();
        hideStatusMessage();
        
        showStatusMessage('Processing request...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/api/remove-contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey, campaignId, email, mode })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResults(data, mode);
            showStatusMessage(data.message, 'success');
            clearFormExceptCredentials();
        } else {
            throw new Error(data.message || 'Unknown error occurred');
        }
        
    } catch (error) {
        console.error('Error removing contact:', error);
        
        if (error.message.includes('404')) {
            showStatusMessage('Contact not found in Apollo. Please verify the email address.', 'error');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            showStatusMessage('Apollo API authentication failed. Please check your API key.', 'error');
        } else {
            showStatusMessage(error.message || 'Failed to remove contact. Please try again.', 'error');
        }
    } finally {
        setLoadingState(false);
    }
}

// Set loading state
function setLoadingState(loading) {
    submitBtn.disabled = loading;
    if (loading) {
        submitBtn.classList.add('loading');
    } else {
        submitBtn.classList.remove('loading');
    }
}

// Show status message
function showStatusMessage(message, type = 'info') {
    statusMessage.innerHTML = `
        <i class="fas ${getIconForType(type)}"></i>
        ${message}
    `;
    statusMessage.className = `status-message ${type} fade-in`;
    statusMessage.style.display = 'flex';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(hideStatusMessage, 3000);
    }
}

// Hide status message
function hideStatusMessage() {
    statusMessage.style.display = 'none';
}

// Get icon for message type
function getIconForType(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

// Show results
function showResults(data, mode) {
    const actionText = mode === 'remove' 
        ? 'Removed from sequence' 
        : 'Marked as finished';
    
    document.getElementById('contactId').textContent = data.contactId;
    document.getElementById('actionTaken').textContent = actionText;
    document.getElementById('timestamp').textContent = new Date().toLocaleString();
    
    results.classList.add('slide-up');
    results.style.display = 'block';
}

// Hide results
function hideResults() {
    results.style.display = 'none';
    results.classList.remove('slide-up');
}

// Clear form but preserve API key and campaign ID
function clearFormExceptCredentials() {
    emailInput.value = '';
    modeSelect.selectedIndex = 0;
    emailInput.style.borderColor = '#475569';
}

// Save credentials to localStorage for faster future use
function saveCredentials() {
    try {
        if (apiKeyInput.value.trim()) {
            localStorage.setItem('apollo_api_key', apiKeyInput.value.trim());
            console.log('API key saved to localStorage');
        }
        if (campaignIdInput.value.trim()) {
            localStorage.setItem('apollo_campaign_id', campaignIdInput.value.trim());
            console.log('Campaign ID saved to localStorage');
        }
    } catch (error) {
        console.error('Error saving credentials:', error);
    }
}

// Load saved credentials from localStorage
function loadSavedCredentials() {
    try {
        const savedApiKey = localStorage.getItem('apollo_api_key');
        const savedCampaignId = localStorage.getItem('apollo_campaign_id');
        
        console.log('Loading saved credentials:', { apiKey: !!savedApiKey, campaignId: !!savedCampaignId });
        
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            console.log('API key loaded from localStorage');
        }
        if (savedCampaignId) {
            campaignIdInput.value = savedCampaignId;
            console.log('Campaign ID loaded from localStorage');
        }
    } catch (error) {
        console.error('Error loading credentials:', error);
    }
}

// Setup animations
function setupAnimations() {
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.card, .api-status').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (emailInput.value.trim()) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to clear form
    if (event.key === 'Escape') {
        clearFormExceptCredentials();
        hideResults();
        hideStatusMessage();
        emailInput.focus();
    }
});

// Add focus management
emailInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmailFormat,
        removeContact,
        checkApiHealth
    };
}
