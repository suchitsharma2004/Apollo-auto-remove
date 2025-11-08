const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Apollo API configuration
const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_CAMPAIGN_ID = process.env.APOLLO_CAMPAIGN_ID;
const APOLLO_BASE_URL = 'https://api.apollo.io/api/v1';

// Headers for Apollo API
const getHeaders = (apiKey) => ({
  'x-api-key': apiKey || APOLLO_API_KEY,
  'Content-Type': 'application/json'
});

// Function to search for contact by email
async function searchContactByEmail(email, apiKey) {
  try {
    const response = await axios.get(`${APOLLO_BASE_URL}/contacts/search`, {
      headers: getHeaders(apiKey),
      params: {
        q_keywords: email
      }
    });
    
    if (response.data.contacts && response.data.contacts.length > 0) {
      return response.data.contacts[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching for contact:', error.response?.data || error.message);
    throw new Error('Failed to search for contact');
  }
}

// Function to remove contact from sequence
async function removeContactFromSequence(contactId, campaignId, mode = 'remove', apiKey) {
  try {
    const response = await axios.post(
      `${APOLLO_BASE_URL}/emailer_campaigns/remove_or_stop_contact_ids`,
      {},
      {
        headers: getHeaders(apiKey),
        params: {
          'emailer_campaign_ids[]': campaignId || APOLLO_CAMPAIGN_ID,
          'contact_ids[]': contactId,
          mode: mode
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error removing contact from sequence:', error.response?.data || error.message);
    throw new Error('Failed to remove contact from sequence');
  }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Apollo Auto Remove API is running',
    hasApiKey: !!APOLLO_API_KEY,
    campaignId: APOLLO_CAMPAIGN_ID,
    note: 'API key and Campaign ID can now be provided via the frontend form'
  });
});

// Remove contact from sequence endpoint
app.post('/api/remove-contact', async (req, res) => {
  try {
    const { apiKey, campaignId, email, mode } = req.body;
    
    if (!apiKey && !APOLLO_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        message: 'Apollo API key is required' 
      });
    }
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    if (!campaignId && !APOLLO_CAMPAIGN_ID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Campaign ID is required' 
      });
    }

    // Step 1: Search for contact by email
    const contactId = await searchContactByEmail(email, apiKey);
    
    if (!contactId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found in Apollo' 
      });
    }
    
    // Step 2: Remove contact from sequence
    const removeMode = mode || 'remove';
    const result = await removeContactFromSequence(contactId, campaignId, removeMode, apiKey);
    
    res.json({
      success: true,
      message: `Contact successfully ${removeMode === 'remove' ? 'removed from' : 'marked as finished in'} sequence`,
      contactId: contactId,
      result: result
    });
    
  } catch (error) {
    console.error('Error in remove-contact endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only in local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Apollo API Key configured: ${!!APOLLO_API_KEY}`);
    console.log(`Campaign ID: ${APOLLO_CAMPAIGN_ID}`);
  });
}

// Export for Vercel
module.exports = app;
