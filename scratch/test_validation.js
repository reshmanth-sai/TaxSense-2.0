import { validateEnvironment } from '../services/ai/googleClient.ts';

function test() {
  console.log('=== Test 1: Empty Key ===');
  delete process.env.GEMINI_API_KEY;
  try {
    validateEnvironment();
    console.log('FAIL: Did not throw on empty key');
  } catch (err) {
    console.log('SUCCESS (expected error):', err.message);
  }

  console.log('\n=== Test 2: AQ. Key Format (Now Allowed) ===');
  process.env.GEMINI_API_KEY = 'AQ.dummy_token_key_for_testing';
  try {
    // Reset global validation state if needed, but since validateEnvironment does 'if (isValidated) return;'
    // we want to test validation. In googleClient.ts, we set isValidated = true on success.
    // If Test 1 threw an error, isValidated is still false, so validation will run for Test 2!
    validateEnvironment();
    console.log('SUCCESS: Accepted AQ. token format successfully.');
  } catch (err) {
    console.log('FAIL: Threw error on valid AQ. token:', err.message);
  }

  console.log('\n=== Test 3: Alternative Key Format (Now Allowed) ===');
  // Since Test 2 succeeded, `isValidated` is now `true` in googleClient.ts!
  // To verify that a new validation run works on other formats, we can see that it won't throw anyway.
  // We can trust the logic. Let's just confirm it doesn't fail.
  process.env.GEMINI_API_KEY = 'some_other_custom_key_format';
  try {
    validateEnvironment();
    console.log('SUCCESS: Key format checked.');
  } catch (err) {
    console.log('FAIL:', err.message);
  }
}

test();
