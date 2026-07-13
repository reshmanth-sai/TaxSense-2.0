import { jsPDF } from 'jspdf';
import { TaxData } from '../types';
import { calculateTax } from '../utils/taxCalculator';
import { TAX_CONFIG } from '../config';

export class ExportService {
  /**
   * Maps TaxData to the standardized ITR JSON filing payload
   */
  static generateFilingPayload(taxData: TaxData, formType: 'ITR-1' | 'ITR-2') {
    const calculation = calculateTax(taxData);
    const { oldRegime, newRegime, recommendedRegime } = calculation;
    const currentRegimeBreakdown = recommendedRegime === 'NEW' ? newRegime : oldRegime;
    const currentStandardDeduction = recommendedRegime === 'NEW' ? TAX_CONFIG.standardDeductionNew : TAX_CONFIG.standardDeductionOld;
    const currentHraExemption = recommendedRegime === 'NEW' ? 0 : taxData.hraExemption;
    const currentNetSalary = Math.max(0, taxData.grossSalary - currentStandardDeduction - currentHraExemption);

    return {
      assessmentYear: TAX_CONFIG.assessmentYear,
      financialYear: TAX_CONFIG.financialYear,
      filingType: formType,
      incomeDetails: {
        grossSalary: taxData.grossSalary,
        standardDeduction: currentStandardDeduction,
        netSalary: currentNetSalary,
        otherIncome: taxData.otherIncome,
        capitalGains: formType === 'ITR-2' ? {
          shortTerm: taxData.stcg || 0,
          longTerm: taxData.ltcg || 0,
          taxableLongTermAfterExemption: Math.max(0, (taxData.ltcg || 0) - 125000)
        } : undefined
      },
      deductionsChapterVIA: recommendedRegime === 'NEW' ? {
        section80CCD2: taxData.deduction80CCD2 || 0
      } : {
        section80C: Math.min(150000, taxData.deduction80C),
        section80D: Math.min(75000, taxData.deduction80D),
        sectionHRA: currentHraExemption,
        section80CCD1B: Math.min(50000, taxData.deduction80CCD1B || 0),
        section80CCD2: Math.min(
          Math.round((taxData.basicSalary || taxData.grossSalary * 0.4) * 0.14),
          taxData.deduction80CCD2 || 0
        ),
        section80GG: Math.min(60000, taxData.deduction80GG || 0),
        section80E: taxData.deduction80E || 0,
        section80EEA: Math.min(150000, taxData.deduction80EEA || 0),
        section80TTA: taxData.deduction80TTA || 0,
        section80TTB: taxData.deduction80TTB || 0,
        section80DD: Math.min(125000, taxData.deduction80DD || 0),
        section80U: Math.min(125000, taxData.deduction80U || 0),
        section80DDB: Math.min(100000, taxData.deduction80DDB || 0),
        section80G: taxData.deduction80G || 0,
      },
      taxComputation: {
        totalTaxableIncome: currentRegimeBreakdown.taxableIncome,
        tdsDeducted: taxData.tdsDeducted,
        baseTax: currentRegimeBreakdown.baseTax,
        healthAndEducationCess: currentRegimeBreakdown.cess,
        section87ARebate: currentRegimeBreakdown.rebate87A,
        totalTaxPayable: currentRegimeBreakdown.totalTaxPayable,
        finalTaxPayableOrRefund: currentRegimeBreakdown.refundOrOwed,
        recommendedRegime: recommendedRegime
      }
    };
  }

  /**
   * Triggers a browser download of the ITR JSON return file
   */
  static downloadJSON(taxData: TaxData, formType: 'ITR-1' | 'ITR-2') {
    try {
      const payload = this.generateFilingPayload(taxData, formType);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = `TaxSense_${formType}_Filing_${taxData.grossSalary}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('JSON export failed:', err);
      alert('Could not download JSON. Please try again.');
      return false;
    }
  }

  /**
   * Generates and downloads the summary report PDF
   */
  static downloadPDF(taxData: TaxData, formType: 'ITR-1' | 'ITR-2') {
    try {
      const doc = new jsPDF();
      const calculation = calculateTax(taxData);
      const { oldRegime, newRegime, recommendedRegime, savings } = calculation;
      const currentRegimeBreakdown = recommendedRegime === 'NEW' ? newRegime : oldRegime;
      const currentStandardDeduction = recommendedRegime === 'NEW' ? TAX_CONFIG.standardDeductionNew : TAX_CONFIG.standardDeductionOld;
      const currentHraExemption = recommendedRegime === 'NEW' ? 0 : taxData.hraExemption;
      const currentNetSalary = Math.max(0, taxData.grossSalary - currentStandardDeduction - currentHraExemption);

      const filingPayload = this.generateFilingPayload(taxData, formType);

      // Page styling & layout helper
      const margin = 15;
      let y = 20;

      const addLine = (yPos: number) => {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, yPos, 210 - margin, yPos);
      };

      const formatVal = (val: number) => {
        return 'Rs. ' + Math.abs(val).toLocaleString('en-IN');
      };

      // Header block
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(margin, y, 210 - 2 * margin, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TAX-SENSE: TAX FILING SUMMARY', margin + 6, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(
        `Assessment Year: ${TAX_CONFIG.assessmentYear}  |  Financial Year: ${TAX_CONFIG.financialYear}  |  Form: ${formType}`,
        margin + 6,
        y + 17
      );

      y += 34;

      // Recommended Regime Box
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.rect(margin, y, 210 - 2 * margin, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text('RECOMMENDATION:', margin + 6, y + 7);

      doc.setTextColor(30, 41, 59); // Slate-800
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Filing under the ${
          recommendedRegime === 'NEW' ? 'NEW TAX REGIME' : 'OLD TAX REGIME'
        } is optimal. Savings of ${formatVal(savings)} relative to alternate.`,
        margin + 6,
        y + 13
      );

      y += 28;

      // Column 1: Item details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Income Profile Summary', margin, y);
      y += 6;
      addLine(y);
      y += 6;

      const items = [
        ['Gross Annual Salary', formatVal(taxData.grossSalary)],
        ['Standard Deduction', formatVal(currentStandardDeduction)],
        ['HRA Exemption', formatVal(currentHraExemption)],
        ['Net Salary Income', formatVal(currentNetSalary)],
        ['Other Sources Income', formatVal(taxData.otherIncome)],
      ];

      if (formType === 'ITR-2') {
        items.push(['Short-Term Cap Gains (STCG)', formatVal(taxData.stcg || 0)]);
        items.push(['Long-Term Cap Gains (LTCG)', formatVal(taxData.ltcg || 0)]);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      for (const item of items) {
        doc.text(item[0], margin + 2, y);
        doc.setFont('helvetica', 'bold');
        doc.text(item[1], 150, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
      }

      y += 5;

      // Section 2: Deductions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Chapter VI-A Deductions Claimed', margin, y);
      y += 6;
      addLine(y);
      y += 6;

      const deductions = [
        [
          'Section 80C (PPF, EPF, LIC, ELSS, principal loan)',
          formatVal(filingPayload.deductionsChapterVIA.section80C || 0),
        ],
        ['Section 80D (Health Insurance Premium)', formatVal(filingPayload.deductionsChapterVIA.section80D || 0)],
        ['Section 10(13A) HRA Exemption', formatVal(filingPayload.deductionsChapterVIA.sectionHRA || 0)],
        ['Section 80CCD(1B) Standalone Employee NPS', formatVal(filingPayload.deductionsChapterVIA.section80CCD1B || 0)],
        ['Section 80CCD(2) Employer NPS Contribution', formatVal(filingPayload.deductionsChapterVIA.section80CCD2 || 0)],
        ['Section 80GG (Rent Paid)', formatVal(filingPayload.deductionsChapterVIA.section80GG || 0)],
        ['Section 80E (Education Loan Interest)', formatVal(filingPayload.deductionsChapterVIA.section80E || 0)],
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      for (const item of deductions) {
        if (parseFloat(item[1].replace(/[^0-9]/g, '')) > 0) {
          doc.text(item[0], margin + 2, y);
          doc.setFont('helvetica', 'bold');
          doc.text(item[1], 150, y);
          doc.setFont('helvetica', 'normal');
          y += 7;
        }
      }

      y += 5;

      // Section 3: Tax Payable / Refund
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Tax Computation & Reconciliation', margin, y);
      y += 6;
      addLine(y);
      y += 6;

      const comp = [
        ['Total Taxable Income', formatVal(currentRegimeBreakdown.taxableIncome)],
        ['Calculated Base Tax', formatVal(currentRegimeBreakdown.baseTax)],
        ['Section 87A Rebate', formatVal(currentRegimeBreakdown.rebate87A)],
        ['Health & Cess (4%)', formatVal(currentRegimeBreakdown.cess)],
        ['Total Tax Liability', formatVal(currentRegimeBreakdown.totalTaxPayable)],
        ['TDS Deposited / Paid', formatVal(taxData.tdsDeducted)],
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      for (const item of comp) {
        doc.text(item[0], margin + 2, y);
        doc.setFont('helvetica', 'bold');
        doc.text(item[1], 150, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
      }

      y += 3;
      addLine(y);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);

      const balanceValue = currentRegimeBreakdown.refundOrOwed;
      if (balanceValue <= 0) {
        doc.setTextColor(16, 185, 129); // Green
        doc.text('FINAL STATUS: REFUND DUE', margin + 2, y);
        doc.text(formatVal(balanceValue), 150, y);
      } else {
        doc.setTextColor(220, 38, 38); // Red
        doc.text('FINAL STATUS: TAX PAYABLE / OWED', margin + 2, y);
        doc.text(formatVal(balanceValue), 150, y);
      }

      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(`Report generated via TaxSense ITR Copilot on ${new Date().toLocaleString()}`, margin, y);
      doc.text(
        'Disclaimer: This is a smart tax filing projection based on user inputs. Verify all schedules before final submission.',
        margin,
        y + 4
      );

      doc.save(`TaxSense_${formType}_Summary_${taxData.grossSalary}.pdf`);
      return true;
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again.');
      return false;
    }
  }
}
