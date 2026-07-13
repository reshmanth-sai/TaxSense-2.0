import { useTaxStore } from '../../store/useTaxStore';
import { calculateTax } from '../../utils/taxCalculator';
import { TAX_CONFIG } from '../../config';

export interface AIContextPayload {
  grossSalary: number;
  tdsDeducted: number;
  deductions: Record<string, number>;
  regime: 'NEW' | 'OLD';
  formType: 'ITR-1' | 'ITR-2';
  hasCapitalGains: boolean;
  uploadedFilesCount: number;
  currentStep: string;
  rawForm16Text?: string;
  employeeName?: string;
  employerName?: string;
  pan?: string;
  oldRegimeTax: number;
  newRegimeTax: number;
  recommendedRegime: 'OLD' | 'NEW';
  savings: number;
  otherIncome: number;
}

export class ContextService {
  /**
   * Captures the current snapshot of the user's financial profile
   * to build a highly contextual prompt for the AI.
   */
  static getCurrentContext(): AIContextPayload {
    const state = useTaxStore.getState();
    const income = state.incomeProfile;
    const deductions = state.confirmedDeductions;
    
    const hasCapitalGains = (income.stcg || 0) > 0 || (income.ltcg || 0) > 0;
    const formType = hasCapitalGains ? 'ITR-2' : state.formType || 'ITR-1';

    // Construct full TaxData snapshot for taxEngine run
    const taxData = {
      assessmentYear: TAX_CONFIG.assessmentYear,
      grossSalary: income.grossSalary || 0,
      basicSalary: income.basicSalary || Math.round((income.grossSalary || 0) * 0.4),
      hraExemption: deductions['HRA exemption'] || deductions.hraExemption || 0,
      ltaExemption: 0,
      standardDeductionOld: TAX_CONFIG.standardDeductionOld,
      standardDeductionNew: TAX_CONFIG.standardDeductionNew,
      otherIncome: income.otherIncome || 0,
      deduction80C: deductions['80C'] || 0,
      deduction80D: deductions['80D'] || 0,
      deduction80TTA: deductions['80TTA'] || 0,
      deduction80G: deductions['80G'] || 0,
      section24b: deductions.section24b || 0,
      tdsDeducted: income.tdsDeducted || 0,
      stcg: income.stcg || 0,
      ltcg: income.ltcg || 0,
      deduction80CCD1B: deductions['80CCD(1B)'] || 0,
      deduction80CCD2: deductions['80CCD(2)'] || 0,
      deduction80DD: deductions['80DD'] || 0,
      deduction80U: deductions['80U'] || 0,
      deduction80DDB: deductions['80DDB'] || 0,
      deduction80E: deductions['80E'] || 0,
      deduction80EEA: deductions['80EEA'] || 0,
      deduction80GG: deductions['80GG'] || 0,
      deduction80TTB: deductions['80TTB'] || 0,
      deduction80CCH: deductions['80CCH'] || 0,
      section24bLetOut: deductions.section24bLetOut || 0,
    };

    const calculation = calculateTax(taxData);

    return {
      grossSalary: income.grossSalary || 0,
      tdsDeducted: income.tdsDeducted || 0,
      otherIncome: income.otherIncome || 0,
      deductions: {
        '80C': deductions['80C'] || 0,
        '80D': deductions['80D'] || 0,
        'HRA': deductions['HRA exemption'] || deductions.hraExemption || 0,
        '80CCD(1B)': deductions['80CCD(1B)'] || 0,
        '80CCD(2)': deductions['80CCD(2)'] || 0,
        'Section 24b': deductions.section24b || 0,
      },
      regime: calculation.recommendedRegime,
      formType,
      hasCapitalGains,
      uploadedFilesCount: state.uploadedFiles?.length || 0,
      currentStep: state.currentStep,
      rawForm16Text: state.rawForm16Text || '',
      employeeName: income.employeeName || 'Mohit Kumar',
      employerName: income.employerName || 'Acme Corp Technologies',
      pan: income.pan || 'MK*****32F',
      oldRegimeTax: calculation.oldRegime.totalTaxPayable,
      newRegimeTax: calculation.newRegime.totalTaxPayable,
      recommendedRegime: calculation.recommendedRegime,
      savings: calculation.savings
    };
  }
}
