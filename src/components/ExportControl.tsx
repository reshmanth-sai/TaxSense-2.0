import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Copy, 
  Download, 
  Check, 
  FileText, 
  CheckCircle2, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { useTaxStore } from '../store/useTaxStore';
import { calculateTax, formatINR } from '../utils/taxCalculator';
import { TaxData } from '../types';
import { TAX_CONFIG } from '../config';
import { ExportService } from '../services/ExportService';

export default function ExportControl() {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const incomeProfile = useTaxStore((state) => state.incomeProfile);
  const confirmedDeductions = useTaxStore((state) => state.confirmedDeductions);
  const formType = useTaxStore((state) => state.formType);

  // Derive tax input parameters
  const taxData: TaxData = {
    assessmentYear: TAX_CONFIG.assessmentYear,
    grossSalary: incomeProfile?.grossSalary || 0,
    hraExemption: confirmedDeductions?.['HRA exemption'] || confirmedDeductions?.hraExemption || 0,
    ltaExemption: 0,
    standardDeductionOld: TAX_CONFIG.standardDeductionOld,
    standardDeductionNew: TAX_CONFIG.standardDeductionNew,
    otherIncome: incomeProfile?.otherIncome || 0,
    deduction80C: confirmedDeductions?.['80C'] || 0,
    deduction80D: confirmedDeductions?.['80D'] || 0,
    deduction80TTA: confirmedDeductions?.['80TTA'] || 0,
    deduction80G: confirmedDeductions?.['80G'] || 0,
    section24b: confirmedDeductions?.['section24b'] || 0,
    tdsDeducted: incomeProfile?.tdsDeducted || 0,
    // Capital Gains
    stcg: incomeProfile?.stcg || 0,
    ltcg: incomeProfile?.ltcg || 0,
    // Advanced & Portfolio fields
    deduction80CCD1B: confirmedDeductions?.['80CCD(1B)'] || 0,
    deduction80CCD2: confirmedDeductions?.['80CCD(2)'] || 0,
    deduction80DD: confirmedDeductions?.['80DD'] || 0,
    deduction80U: confirmedDeductions?.['80U'] || 0,
    deduction80DDB: confirmedDeductions?.['80DDB'] || 0,
    deduction80E: confirmedDeductions?.['80E'] || 0,
    deduction80EEA: confirmedDeductions?.['80EEA'] || 0,
    deduction80GG: confirmedDeductions?.['80GG'] || 0,
    deduction80TTB: confirmedDeductions?.['80TTB'] || 0,
    deduction80CCH: confirmedDeductions?.['80CCH'] || 0,
    section24bLetOut: confirmedDeductions?.['section24bLetOut'] || 0,
  };

  // Run the tax calculations
  const calculation = calculateTax(taxData);
  const { oldRegime, newRegime, recommendedRegime, savings } = calculation;

  const currentRegimeBreakdown = recommendedRegime === 'NEW' ? newRegime : oldRegime;
  const currentStandardDeduction = recommendedRegime === 'NEW' ? TAX_CONFIG.standardDeductionNew : TAX_CONFIG.standardDeductionOld;
  const currentHraExemption = recommendedRegime === 'NEW' ? 0 : taxData.hraExemption;
  const currentNetSalary = Math.max(0, taxData.grossSalary - currentStandardDeduction - currentHraExemption);

  // Map to the requested JSON schema dynamically
  const filingPayload = {
    assessmentYear: TAX_CONFIG.assessmentYear,
    financialYear: TAX_CONFIG.financialYear,
    filingType: formType,
    incomeDetails: {
      grossSalary: taxData.grossSalary,
      standardDeduction: currentStandardDeduction,
      netSalary: currentNetSalary,
      otherIncome: taxData.otherIncome,
      capitalGains: formType === 'ITR-2' ? {
        shortTerm: taxData.stcg,
        longTerm: taxData.ltcg,
        taxableLongTermAfterExemption: Math.max(0, (taxData.ltcg || 0) - 125000)
      } : undefined
    },
    deductionsChapterVIA: recommendedRegime === 'NEW' ? {
      section80CCD2: confirmedDeductions['80CCD(2)'] || 0
    } : {
      section80C: Math.min(150000, taxData.deduction80C),
      section80D: Math.min(75000, taxData.deduction80D),
      sectionHRA: currentHraExemption,
      section80CCD1B: Math.min(50000, confirmedDeductions['80CCD(1B)'] || 0),
      section80CCD2: Math.min(Math.round(taxData.grossSalary * 0.10), confirmedDeductions['80CCD(2)'] || 0),
      section80GG: Math.min(60000, confirmedDeductions['80GG'] || 0),
      section80E: confirmedDeductions['80E'] || 0,
      section80EEA: Math.min(150000, confirmedDeductions['80EEA'] || 0),
      section80TTA: confirmedDeductions['80TTA'] || 0,
      section80TTB: confirmedDeductions['80TTB'] || 0,
      section80DD: Math.min(125000, confirmedDeductions['80DD'] || 0),
      section80U: Math.min(125000, confirmedDeductions['80U'] || 0),
      section80DDB: Math.min(100000, confirmedDeductions['80DDB'] || 0),
      section80G: confirmedDeductions['80G'] || 0,
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

  const payloadString = JSON.stringify(filingPayload, null, 2);

  // Handle copying JSON to clipboard
  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(payloadString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Generate dynamic, beautiful PDF download
  const handleDownloadSummary = () => {
    const success = ExportService.downloadPDF(taxData, formType);
    if (success) {
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  // pure client-side WhatsApp summary share link
  const handleWhatsAppShare = () => {
    const formattedIncome = recommendedRegime === 'NEW' ? newRegime.taxableIncome : oldRegime.taxableIncome;
    const formattedTax = recommendedRegime === 'NEW' ? newRegime.totalTaxPayable : oldRegime.totalTaxPayable;
    const balanceVal = recommendedRegime === 'NEW' ? newRegime.refundOrOwed : oldRegime.refundOrOwed;
    
    let statusText = '';
    if (balanceVal <= 0) {
      statusText = `Estimated Refund: ₹${Math.abs(balanceVal).toLocaleString('en-IN')}`;
    } else {
      statusText = `Tax Owed: ₹${balanceVal.toLocaleString('en-IN')}`;
    }

    const text = `*TaxSense ITR Summary (AY 2026-27)* 🇮🇳
----------------------------------
• *Recommended Regime:* ${recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}
• *Taxable Income:* ₹${formattedIncome.toLocaleString('en-IN')}
• *Total Tax Payable:* ₹${formattedTax.toLocaleString('en-IN')}
• *${statusText}*
• *Estimated Savings:* ₹${savings.toLocaleString('en-IN')}

_Generated via TaxSense ITR Copilot_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };



  return (
    <div 
      id="export-hub-container" 
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 text-slate-800 transition-all duration-300"
    >
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filing Export Hub</h3>
            <p className="text-[10px] text-slate-400 font-medium">Export returns & trigger reminders</p>
          </div>
        </div>
        <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md">
          {formType} Active
        </span>
      </div>

      {/* Recommended Route Summary */}
      <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommendation</span>
          <p className="text-xs font-bold text-slate-800">
            {recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            Saves ₹{savings.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Document Options & JSON Copy Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Save Summary & Print Report */}
        <div className="border border-slate-150 rounded-xl p-3 bg-white space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Download className="h-3 w-3 text-blue-500" />
            <span>ITR Exports</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {/* Download Text Summary */}
            <button
              id="btn-download-summary"
              onClick={handleDownloadSummary}
              className={`w-full h-8 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95 border ${
                downloaded
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {downloaded ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 text-slate-400" />
                  <span>Download</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <button
              id="btn-whatsapp-share"
              onClick={handleWhatsAppShare}
              className="w-full h-8 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95 border border-transparent shadow-xs"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-11.336c-.137-.228-.508-.376-1.066-.656-.558-.28-2.617-1.291-3.024-1.439-.406-.148-.7-.223-.997.223-.296.445-1.15 1.45-1.408 1.748-.258.297-.516.335-1.074.055-.558-.28-2.355-.867-4.486-2.768-1.658-1.479-2.778-3.306-3.105-3.866-.327-.559-.035-.861.245-1.139.251-.251.558-.65.837-.975.279-.327.373-.559.558-.93.186-.373.093-.7-.046-.976-.14-.28-1.22-2.94-1.671-4.021-.439-1.055-.885-.913-1.22-.929-.317-.016-.68-.019-1.044-.019-.364 0-.957.137-1.457.683-.5 1.055-1.91 1.865-1.91 4.544 0 2.68 1.956 5.268 2.228 5.632.273.364 3.85 5.876 9.324 8.235 1.3.561 2.316.897 3.105 1.148 1.305.414 2.493.356 3.432.215.957-.14 2.617-1.07 2.99-2.102.373-1.031.373-1.91.26-2.102-.113-.19-.414-.303-.973-.583z" />
              </svg>
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* JSON Payload Copy Box */}
        <div className="border border-slate-150 rounded-xl p-3 bg-white space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>ITR Schema</span>
            </div>
            
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-[9px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
            >
              {showRawJson ? 'Hide' : 'Preview'}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Copy Button */}
            <button
              id="btn-copy-itr1-json"
              onClick={handleCopyJSON}
              className={`w-full h-8 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95 border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-950'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-white animate-pulse" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-slate-400" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              id="btn-download-json-direct"
              onClick={() => ExportService.downloadJSON(taxData, formType)}
              className="w-full h-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-95"
            >
              <Download className="h-3 w-3 text-slate-400" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>

      {showRawJson && (
        <div 
          id="preview-json-payload"
          className="border border-slate-200 rounded-lg p-2.5 bg-slate-950 font-mono text-[9px] text-emerald-400 leading-relaxed max-h-32 overflow-y-auto select-all"
        >
          <pre>{payloadString}</pre>
        </div>
      )}



      {/* Hidden Print-Only Layout Integration */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-section, #print-section * {
            visibility: visible !important;
          }
          #print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Hidden Print-Only Tax Statement Report */}
      <div id="print-section" className="hidden font-sans p-10 max-w-4xl mx-auto bg-white text-slate-900 leading-relaxed">
        {/* Header Block */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">TAX-SENSE</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Official Session Summary Report</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-bold px-3 py-1 rounded">
              AY 2026-27 (FY 2025-26)
            </span>
            <p className="text-[9px] text-slate-400 font-mono mt-1">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Executive summary block */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filing Path Route</p>
            <p className="text-sm font-extrabold text-slate-800">
              {formType} under {recommendedRegime === 'NEW' ? 'New Tax Regime (Optimal)' : 'Old Tax Regime (Optimal)'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Tax Saved</p>
            <p className="text-sm font-extrabold text-emerald-600">
              ₹{savings.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Detailed Financial Breakdown Tables */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-250 pb-1.5 mb-3">
              1. Income Details
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                  <th className="py-2">Line Item Description</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5">Gross Annual Salary</td>
                  <td className="py-2.5 text-right font-mono">{taxData.grossSalary.toLocaleString('en-IN')}</td>
                </tr>
                {formType === 'ITR-2' && (
                  <>
                    <tr>
                      <td className="py-2.5">Short-Term Capital Gains (STCG)</td>
                      <td className="py-2.5 text-right font-mono">{taxData.stcg.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold">Long-Term Capital Gains (LTCG)</td>
                      <td className="py-2.5 text-right font-mono font-semibold">{taxData.ltcg.toLocaleString('en-IN')}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="py-2.5">Standard Deduction</td>
                  <td className="py-2.5 text-right font-mono text-slate-500">-{currentStandardDeduction.toLocaleString('en-IN')}</td>
                </tr>
                {currentHraExemption > 0 && (
                  <tr>
                    <td className="py-2.5">HRA Exemption (Section 10(13A))</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">-{currentHraExemption.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="font-semibold text-slate-900 bg-slate-50/50">
                  <td className="py-2.5">Net Salary Income</td>
                  <td className="py-2.5 text-right font-mono">{currentNetSalary.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-2.5">Income from Other Sources (FD Interest, etc.)</td>
                  <td className="py-2.5 text-right font-mono">{taxData.otherIncome.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-250 pb-1.5 mb-3">
              2. Chapter VI-A Deductions
            </h3>
            {recommendedRegime === 'NEW' ? (
              <p className="text-xs text-slate-500 italic">No deductions are permitted under the simplified New Tax Regime (except 80CCD(2) if applicable).</p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="py-2">Section Reference</th>
                    <th className="py-2 text-right">Deducted (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {taxData.deduction80C > 0 && (
                    <tr>
                      <td className="py-2.5 font-sans">Section 80C (PPF, EPF, LIC, ELSS, etc.)</td>
                      <td className="py-2.5 text-right">{Math.min(150000, taxData.deduction80C).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {taxData.deduction80D > 0 && (
                    <tr>
                      <td className="py-2.5 font-sans">Section 80D (Medical Insurance Premium)</td>
                      <td className="py-2.5 text-right">{Math.min(75000, taxData.deduction80D).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {confirmedDeductions['80CCD(1B)'] > 0 && (
                    <tr>
                      <td className="py-2.5 font-sans">Section 80CCD(1B) (Additional NPS)</td>
                      <td className="py-2.5 text-right">{Math.min(50000, confirmedDeductions['80CCD(1B)']).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {confirmedDeductions['80GG'] > 0 && (
                    <tr>
                      <td className="py-2.5 font-sans">Section 80GG (Rent Paid)</td>
                      <td className="py-2.5 text-right">{Math.min(60000, confirmedDeductions['80GG']).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {taxData.deduction80TTA > 0 && (
                    <tr>
                      <td className="py-2.5 font-sans">Section 80TTA (Savings Bank Interest Exemption)</td>
                      <td className="py-2.5 text-right">{taxData.deduction80TTA.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-250 pb-1.5 mb-3">
              3. Tax Computation & Liability
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                  <th className="py-2">Line Item</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                <tr>
                  <td className="py-2.5 font-sans text-slate-900 font-semibold">Total Taxable Income</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">{currentRegimeBreakdown.taxableIncome.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans">Calculated Base Tax</td>
                  <td className="py-2.5 text-right">{currentRegimeBreakdown.baseTax.toLocaleString('en-IN')}</td>
                </tr>
                {currentRegimeBreakdown.rebate87A > 0 && (
                  <tr>
                    <td className="py-2.5 font-sans text-emerald-600 font-medium">Section 87A Rebate</td>
                    <td className="py-2.5 text-right text-emerald-600">-{currentRegimeBreakdown.rebate87A.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 font-sans">Health & Education Cess (4%)</td>
                  <td className="py-2.5 text-right">{currentRegimeBreakdown.cess.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="border-t-2 border-slate-300 font-bold text-slate-900 bg-slate-50">
                  <td className="py-2.5 font-sans">Total Gross Tax Payable</td>
                  <td className="py-2.5 text-right">{currentRegimeBreakdown.totalTaxPayable.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans text-blue-600">Total TDS Deposited (per Form 16 / AIS)</td>
                  <td className="py-2.5 text-right text-blue-600">-{taxData.tdsDeducted.toLocaleString('en-IN')}</td>
                </tr>
                <tr className={`border-t-2 border-slate-900 font-black text-xs ${
                  currentRegimeBreakdown.refundOrOwed <= 0 ? 'text-emerald-700' : 'text-amber-800'
                }`}>
                  <td className="py-3 font-sans uppercase tracking-wider">
                    {currentRegimeBreakdown.refundOrOwed <= 0 ? 'Net Refund Owed to You ✓' : 'Net Tax Balance Payable to Gov ⚠'}
                  </td>
                  <td className="py-3 text-right text-sm">
                    ₹{Math.abs(currentRegimeBreakdown.refundOrOwed).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer / Sign block */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-[10px] text-slate-400 leading-normal">
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">System Declaration</p>
            <p>
              This is an auto-generated computational summary based entirely on data supplied by the session operator. 
              The algorithms adhere precisely to standard Indian tax schedules for AY 2026-27.
            </p>
          </div>
          <div className="flex flex-col justify-end items-end">
            <div className="w-32 border-b border-slate-300 h-8 mb-1"></div>
            <p className="font-bold text-slate-500 uppercase tracking-wider">Operator Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
