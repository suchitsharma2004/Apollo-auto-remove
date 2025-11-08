const axios = require('axios');

const APOLLO_BASE_URL = 'https://api.apollo.io/api/v1';

// Headers for Apollo API
const getHeaders = (apiKey) => ({
  'x-api-key': apiKey,
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
          'emailer_campaign_ids[]': campaignId,
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { apiKey, campaignId, email, mode } = req.body;
    
    if (!apiKey) {
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

    if (!campaignId) {
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
}
