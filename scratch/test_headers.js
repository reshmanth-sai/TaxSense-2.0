import http from 'http';
import { GoogleGenAI } from '@google/genai';

// Start a local mock server to capture the headers sent by the SDK
const server = http.createServer((req, res) => {
  console.log('\n--- Received Request ---');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ text: 'Mock Response' }));
});

server.listen(9999, async () => {
  console.log('Mock server listening on port 9999');

  try {
    // Scenario 1: Standard AI Studio key starting with AIzaSy
    console.log('\n=== Testing Scenario 1: Standard API Key (AIzaSy) ===');
    const key1 = 'AIzaSyFakeKey12345';
    const client1 = new GoogleGenAI({
      apiKey: key1,
      httpOptions: { baseUrl: 'http://localhost:9999' }
    });
    
    await client1.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello'
    }).catch(e => console.log('Request error (expected if mock response format is not fully compliant):', e.message));

    // Scenario 2: Injected Access Token starting with AQ.
    console.log('\n=== Testing Scenario 2: Injected Token (AQ.) ===');
    const key2 = 'AQ.FakeAccessToken12345';
    const client2 = new GoogleGenAI({
      apiKey: key2,
      httpOptions: { baseUrl: 'http://localhost:9999' }
    });

    // Apply our monkey patch to override addAuthHeaders
    const auth = client2.apiClient.clientOptions.auth;
    if (key2.startsWith('AQ.')) {
      auth.addAuthHeaders = async function(headers, url) {
        headers.set('Authorization', `Bearer ${key2}`);
      };
    }

    await client2.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello'
    }).catch(e => console.log('Request error:', e.message));

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
    console.log('\nTest server stopped.');
  }
});
