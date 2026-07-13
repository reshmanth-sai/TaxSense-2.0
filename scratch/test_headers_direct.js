import { GoogleGenAI } from '@google/genai';

async function test() {
  const key1 = 'AIzaSyFakeKey12345';
  const client1 = new GoogleGenAI({ apiKey: key1 });
  
  // Call internal method to generate headers
  const url = new URL('https://generativelanguage.googleapis.com');
  const headers1 = await client1.apiClient.getHeadersInternal(client1.apiClient.clientOptions.httpOptions, url);
  console.log('=== Scenario 1: Standard Key (AIzaSy) ===');
  for (const [k, v] of headers1.entries()) {
    console.log(`${k}: ${v}`);
  }

  const key2 = 'AQ.FakeAccessToken12345';
  const client2 = new GoogleGenAI({ apiKey: key2 });

  // Apply our monkey patch
  const auth = client2.apiClient.clientOptions.auth;
  if (key2.startsWith('AQ.')) {
    auth.addAuthHeaders = async function(headers, url) {
      headers.set('Authorization', `Bearer ${key2}`);
    };
  }

  const headers2 = await client2.apiClient.getHeadersInternal(client2.apiClient.clientOptions.httpOptions, url);
  console.log('\n=== Scenario 2: Access Token (AQ.) ===');
  for (const [k, v] of headers2.entries()) {
    console.log(`${k}: ${v}`);
  }
}

test();
