import fetch from 'node-fetch'; // wait, node 25 has native fetch, but let's just use native fetch first
async function check() {
  try {
    console.log('Fetching google.com...');
    const res = await fetch('https://www.google.com');
    console.log('google.com status:', res.status);
  } catch (err) {
    console.error('google.com failed:', err);
  }
  
  try {
    console.log('Fetching generativelanguage.googleapis.com...');
    const res = await fetch('https://generativelanguage.googleapis.com');
    console.log('generativelanguage status:', res.status);
  } catch (err) {
    console.error('generativelanguage failed:', err);
  }
}
check();
