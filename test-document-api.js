// Quick test script to check document API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test with a sample token (you'll need to get this from the browser)
const TEST_TOKEN = 'your_token_here';

async function testDocumentAPI() {
    try {
        console.log('🔍 Testing Document API...');
        
        // Test debug endpoint
        const debugResponse = await axios.get(`${BASE_URL}/documents/debug/count`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log('📊 Debug Response:', debugResponse.data);
        
        // Test user documents endpoint
        const userDocsResponse = await axios.get(`${BASE_URL}/documents/repository/my-documents`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log('📁 User Documents:', userDocsResponse.data);
        
        // Test stats endpoint
        const statsResponse = await axios.get(`${BASE_URL}/documents/stats/overview`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        });
        
        console.log('📈 Stats:', statsResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Run the test
if (require.main === module) {
    console.log('⚠️  Please update TEST_TOKEN with a valid JWT token from the browser');
    console.log('💡 You can get it from localStorage.getItem("token") in browser console');
    // testDocumentAPI();
}

module.exports = { testDocumentAPI };
