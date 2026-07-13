import { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { generateContentWithRetryAndFallback, mapError } from '../services/ai/googleClient.ts';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content from Form 16 is required.' });
      return;
    }

    const response = await generateContentWithRetryAndFallback({
      contents: `Please extract standard tax parameters from the following Form 16 text and return it strictly as JSON according to the schema.
      Extract ALL deduction fields visible in Part B of the Form 16. For any field not explicitly present in the document, return null — do not guess or assume values.
      Look for standard terms:
      - "Gross Salary" or "Section 17(1)" or "Salary as per provisions contained in section 17(1)" for gross salary.
      - "HRA" or "House Rent Allowance" or "10(13A)" for HRA exemption.
      - "Standard Deduction" or "Section 16(ia)" for standard deduction (usually 50,000 in old regimes).
      - "80C" or "Provident Fund" or "PPF" or "ELSS" or "Life Insurance" or "Section 80C" for 80C.
      - "80D" or "Health Insurance" or "Section 80D" for 80D.
      - "80CCD(1B)" or "NPS" for standalone NPS.
      - "80E" or "Education Loan" for education loan interest.
      - "80G" or "Donation" or "Charitable" for charitable donations.
      - "80TTA" or "Savings Bank Interest" for 80TTA.
      - "Section 24" or "24(b)" or "Interest on Borrowed Capital" or "Home Loan Interest" for section 24b.
      - "Basic" or "Basic Salary" or "Basic Pay" for basicSalary.
      - "Other Income" or "Income from Other Sources" or "Section 56" for otherIncome.
      - "TDS" or "Tax Deducted at Source" or "Total tax deducted" or "Section 192" for TDS.

      Here is the Form 16 text:
      ${text}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessmentYear: { type: Type.STRING, description: 'The assessment year e.g. "2025-26"' },
            employeeName: { type: Type.STRING, description: 'Full name of the employee/taxpayer', nullable: true },
            pan: { type: Type.STRING, description: 'PAN of the employee/taxpayer', nullable: true },
            grossSalary: { type: Type.INTEGER, description: 'Gross Salary amount in INR' },
            hraExemption: { type: Type.INTEGER, description: 'HRA exemption amount computed and shown in Form 16 Part B.', nullable: true },
            ltaExemption: { type: Type.INTEGER, description: 'LTA exemption in INR', nullable: true },
            otherIncome: { type: Type.INTEGER, description: 'Any other income declared.', nullable: true },
            deduction80C: { type: Type.INTEGER, description: 'Total 80C deductions (EPF+PPF+ELSS+LIC+home loan principal). Cap ₹1,50,000.', nullable: true },
            deduction80D: { type: Type.INTEGER, description: 'Health insurance premium paid. Cap ₹25,000 self / ₹50,000 parents.', nullable: true },
            deduction80CCD1B: { type: Type.INTEGER, description: 'Standalone NPS contribution under 80CCD(1B). Cap ₹50,000.', nullable: true },
            deduction80E: { type: Type.INTEGER, description: 'Education loan interest paid under Section 80E.', nullable: true },
            deduction80G: { type: Type.INTEGER, description: 'Charitable donations under Section 80G.', nullable: true },
            deduction80TTA: { type: Type.INTEGER, description: 'Savings bank interest under 80TTA. Cap ₹10,000.', nullable: true },
            section24b: { type: Type.INTEGER, description: 'Home loan interest under Section 24(b). Cap ₹2,00,000.', nullable: true },
            basicSalary: { type: Type.INTEGER, description: 'Basic salary component.', nullable: true },
            tdsDeducted: { type: Type.INTEGER, description: 'Tax Deducted at Source (TDS) in INR', nullable: true },
            employerName: { type: Type.STRING, description: 'Name of the employer company', nullable: true },
            pfContribution: { type: Type.INTEGER, description: 'Provident Fund (PF) contribution amount', nullable: true }
          },
          required: ['grossSalary'],
        },
      },
      requestId,
      correlationId,
    });

    const jsonStr = response.text?.trim() || '{}';
    const parsedData = JSON.parse(jsonStr);

    // Sanitize numerical inputs to ensure no negatives or NaN
    const safeData: any = { ...parsedData };
    for (const key in safeData) {
      if (typeof safeData[key] === 'number') {
        safeData[key] = Math.max(0, safeData[key] || 0);
      }
    }
    
    // Apply statutory caps on deductions
    if (safeData.deduction80C != null) safeData.deduction80C = Math.min(safeData.deduction80C, 150000);
    if (safeData.deduction80D != null) safeData.deduction80D = Math.min(safeData.deduction80D, 75000);
    if (safeData.deduction80CCD1B != null) safeData.deduction80CCD1B = Math.min(safeData.deduction80CCD1B, 50000);
    if (safeData.deduction80TTA != null) safeData.deduction80TTA = Math.min(safeData.deduction80TTA, 10000);
    if (safeData.section24b != null) safeData.section24b = Math.min(safeData.section24b, 200000);

    res.status(200).json({ success: true, data: safeData });
  } catch (error: any) {
    const appErr = mapError(error);
    res.status(appErr.status).json({ error: appErr.message });
  }
}
