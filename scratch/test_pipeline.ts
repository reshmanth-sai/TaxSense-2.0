import handler from '../api/extract';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Setup Mock Req/Res helpers
function mockRequest(body: any): VercelRequest {
  return {
    method: 'POST',
    body,
  } as any;
}

function mockResponse(): VercelResponse & { _json: any, _status: number } {
  const res: any = {
    _status: 200,
    _json: null,
    status(code: number) {
      this._status = code;
      return this;
    },
    json(data: any) {
      this._json = data;
      return this;
    },
    setHeader() {},
    end() {}
  };
  return res;
}

async function runTests() {
  console.log('--- STARTING INGESTION PIPELINE INTEGRATION TEST MATRIX ---');

  const testCases = [
    {
      name: 'Normal Text Payload',
      text: 'Gross Salary: Rs. 14,50,000, Employee: Ramesh Sharma, PAN: ABCDE1234F, HRA exemption: Rs. 45,000, 80C deductions: Rs. 1,20,000, 80D: Rs. 15,000',
    },
    {
      name: 'Missing PAN & Missing HRA',
      text: 'Gross Salary: Rs. 8,20,000, Employee: Amit Verma, 80C: Rs. 90,000',
    },
    {
      name: 'Partial Deductions & Invalid Negative Values',
      text: 'Gross Salary: Rs. 12,00,000, Employee: John Doe, 80C: Rs. -50,000, 80D: Rs. 30,000, Standalone NPS: Rs. 10,000',
    },
    {
      name: 'OCR With Noise and Typos',
      text: 'Gr0ss Sal@ry: 22,00,000, Emp1oyee: Priya Patel, P-A-N: BQTPS9999L, HR_A: 1,20,000, Sec 80C: 2,00,000, Sec 24: 2,50,000'
    }
  ];

  for (const tc of testCases) {
    console.log(`\nRunning test case: "${tc.name}"`);
    const req = mockRequest({ text: tc.text });
    const res = mockResponse();

    try {
      await handler(req, res);
      console.log(`HTTP Status: ${res._status}`);
      if (res._status === 200) {
        console.log('Extracted Structured Data:', JSON.stringify(res._json.data, null, 2));
      } else {
        console.error('Failed response payload:', res._json);
      }
    } catch (error) {
      console.error('Exception during execution:', error);
    }
  }

  console.log('\n--- PIPELINE TEST MATRIX COMPLETED ---');
}

runTests();
