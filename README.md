# Apollo Auto Remove

A web application that allows you to automatically remove contacts from Apollo sequences by email address.

## Features

- 🚀 **Easy Contact Removal**: Remove contacts from Apollo sequences with just an email address
- 🎯 **Two Removal Modes**: Choose between "remove" and "mark as finished"
- 🌐 **Modern Web Interface**: Clean, responsive UI with real-time feedback
- 🔍 **Contact Search**: Automatically finds contacts in Apollo using email as primary key
- 📊 **Status Monitoring**: Real-time API health checks and connection status
- ✅ **Success Feedback**: Detailed results showing contact ID and action taken

## Prerequisites

- Node.js (v14 or higher)
- Apollo API Key
- Apollo Campaign/Sequence ID

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Apollo-auto-remove
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Apollo credentials:
   ```env
   APOLLO_API_KEY=your_apollo_api_key_here
   APOLLO_CAMPAIGN_ID=68d1103b41c0f700155cd927
   PORT=3000
   ```

## Usage

### Starting the Application

1. **Development mode** (with auto-restart):
   ```bash
   npm run dev
   ```

2. **Production mode**:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Using the Web Interface

1. **Enter Apollo API Key**: Type your Apollo API key (this is stored temporarily for the request only)
2. **Enter Campaign ID**: Type the Apollo Campaign/Sequence ID you want to manage
3. **Enter Email**: Type the email address of the contact you want to remove
4. **Select Mode**: Choose between:
   - `Remove from sequence`: Permanently removes the contact
   - `Mark as finished`: Marks the contact as completed in the sequence
5. **Submit**: Click the "Remove Contact" button
6. **View Results**: See the contact ID and confirmation of the action taken

**Note**: The API key and Campaign ID are now entered directly in the web interface, making the application more flexible and eliminating the need for environment variable configuration in many cases.

## API Endpoints

The application exposes the following REST API endpoints:

### Health Check
```
GET /api/health
```
Returns the API status and configuration info.

### Remove Contact
```
POST /api/remove-contact
Content-Type: application/json

{
  "apiKey": "your_apollo_api_key",
  "campaignId": "68d1103b41c0f700155cd927", 
  "email": "contact@example.com",
  "mode": "remove"  // or "mark_as_finished"
}
```

**Parameters:**
- `apiKey` (optional): Apollo API key. If not provided, uses environment variable
- `campaignId` (optional): Campaign ID. If not provided, uses environment variable  
- `email` (required): Email address of the contact to remove
- `mode` (optional): Either "remove" or "mark_as_finished" (defaults to "remove")

## Apollo API Integration

This application uses two Apollo API endpoints:

1. **Contact Search**: `GET /api/v1/contacts/search`
   - Searches for contacts using email as the primary key
   - Returns contact information including the Contact ID

2. **Remove from Sequence**: `POST /api/v1/emailer_campaigns/remove_or_stop_contact_ids`
   - Removes or marks contacts as finished in the specified campaign
   - Uses the Contact ID from the search step

## Configuration

### Environment Variables

- `APOLLO_API_KEY`: Your Apollo API key (required)
- `APOLLO_CAMPAIGN_ID`: The ID of the Apollo sequence/campaign (required)
- `PORT`: Server port (optional, defaults to 3000)

### Getting Your Apollo API Key

1. Log in to your Apollo account
2. Go to Settings > Integrations > API
3. Generate or copy your API key
4. Add it to your `.env` file

### Finding Your Campaign ID

1. In Apollo, go to your email sequences
2. Open the sequence you want to manage
3. The Campaign ID is in the URL: `...emailer_campaigns/[CAMPAIGN_ID]`
4. Add it to your `.env` file

## Project Structure

```
Apollo-auto-remove/
├── server.js              # Express server and API routes
├── package.json           # Node.js dependencies and scripts
├── .env.example          # Environment variables template
├── .env                  # Your environment variables (not in git)
└── public/               # Frontend files
    ├── index.html        # Main HTML page
    ├── styles.css        # Styling and responsive design
    └── script.js         # Frontend JavaScript logic
```

## Error Handling

The application includes comprehensive error handling for:

- **Invalid Email Formats**: Client-side validation
- **Contact Not Found**: When email doesn't exist in Apollo
- **API Authentication**: Invalid or missing API keys
- **Network Issues**: Connection problems with Apollo API
- **Server Errors**: Backend processing issues

## Security Notes

- Never commit your `.env` file with real API keys
- Keep your Apollo API key secure and rotate it regularly
- The application validates email formats before making API calls
- All API requests include proper authentication headers

## Troubleshooting

### Common Issues

1. **"Apollo API key not configured"**
   - Make sure your `.env` file exists and contains `APOLLO_API_KEY`
   - Restart the server after updating environment variables

2. **"Contact not found in Apollo"**
   - Verify the email address is correct
   - Ensure the contact exists in your Apollo account
   - Check that the contact is in the specified campaign

3. **"API authentication failed"**
   - Verify your Apollo API key is valid and active
   - Check that your Apollo account has API access enabled

4. **Server won't start**
   - Make sure the port isn't already in use
   - Check that all dependencies are installed (`npm install`)
   - Verify Node.js version is 14 or higher

### Debug Mode

To enable detailed logging, you can modify the server to log more information by uncommenting console.log statements in `server.js`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Apollo API documentation
3. Create an issue in the repository
