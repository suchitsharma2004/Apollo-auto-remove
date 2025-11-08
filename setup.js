#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Apollo Auto Remove - Configuration Setup\n');

async function promptUser(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function setup() {
    try {
        console.log('This script will help you configure your Apollo API credentials.\n');
        
        const apiKey = await promptUser('Enter your Apollo API Key: ');
        
        if (!apiKey.trim()) {
            console.log('❌ API Key is required. Exiting...');
            process.exit(1);
        }
        
        const campaignId = await promptUser('Enter your Apollo Campaign ID (press Enter for default): ');
        const port = await promptUser('Enter server port (press Enter for 3000): ');
        
        const envContent = `# Apollo API Configuration
APOLLO_API_KEY=${apiKey.trim()}
APOLLO_CAMPAIGN_ID=${campaignId.trim() || '68d1103b41c0f700155cd927'}
PORT=${port.trim() || '3000'}
`;
        
        fs.writeFileSync('.env', envContent);
        
        console.log('\n✅ Configuration saved to .env file');
        console.log('🎉 Setup complete! You can now start the application with:');
        console.log('   npm start');
        console.log('   or npm run dev (for development)');
        
    } catch (error) {
        console.error('❌ Error during setup:', error.message);
    } finally {
        rl.close();
    }
}

setup();
