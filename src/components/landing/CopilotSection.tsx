import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumCard } from './helpers/PremiumCard';
import { ThinkingDots } from './helpers/ThinkingDots';
import { audioPool } from '../../utils/audioPool';
import { Sparkles, Bot, User, CheckCircle2, ChevronDown, ChevronUp, Languages } from 'lucide-react';

interface PromptResponse {
  q: string;
  a: string;
  steps: string[];
  citations: string;
  tools: string[];
  confidence: string;
  reasoning: string;
}

const promptResponsesMap: Record<string, PromptResponse[]> = {
  en: [
    {
      q: "Which tax regime is better for ₹18.5L CTC?",
      a: "The **New Tax Regime** is better for your **₹18,50,000** gross salary. You save **₹24,850** compared to the Old Regime, even after taking into account standard deductions of ₹75,000 and standard Section 80C exemptions.",
      steps: ["Parsing Gross Salary: ₹18,50,000...", "Applying New Regime Slabs (Sec 115BAC)...", "Computing Old Regime with 80C + 80D...", "Determining Net Rupee Difference..."],
      citations: "Sec 115BAC(1A) & Sec 16(ia)",
      tools: ["regime_comparator", "slab_engine"],
      confidence: "99.9%",
      reasoning: "Old Regime: Taxable ₹16,25,000 → Tax: **₹1,73,050**.\nNew Regime: Taxable ₹17,75,000 → Tax: **₹1,48,200**.\nNet Tax Saved: **₹24,850** under New Regime."
    },
    {
      q: "How does Section 80D claim work?",
      a: "Section 80D allows a deduction of up to **₹25,000** for medical insurance premiums paid for yourself and family. You can claim an additional **₹25,000** (or **₹50,000** if senior citizen) for parents' health policies under Old Regime.",
      steps: ["Checking Section 80D parameters...", "Scanning family age profile...", "Applying maximum parent premium limits"],
      citations: "Sec 80D of Income Tax Act",
      tools: ["deduction_lookup", "limit_validator"],
      confidence: "99.8%",
      reasoning: "For ₹18.5L CTC (30% slab), claiming ₹25,000 health insurance premium reduces tax liability by **₹7,800**."
    },
    {
      q: "Is Standard Deduction automatic?",
      a: "Yes! For FY 2025-26 (AY 2026-27), a standard deduction of **₹75,000** under New Regime (and **₹50,000** under Old Regime) is applied automatically with zero proof required.",
      steps: ["Verifying Finance Act updates...", "Applying ITR slab standard deductions...", "Recalculating net taxable income"],
      citations: "Sec 16(ia) of Income Tax Act",
      tools: ["slab_engine", "rebate_applicator"],
      confidence: "99.8%",
      reasoning: "Under Sec 16(ia), standard deduction reduces taxable salary directly by **₹75,000** without requiring bills."
    },
    {
      q: "Can I claim HRA with Home Loan Interest?",
      a: "Yes! You can claim both **HRA (Sec 10(13A))** and **Home Loan Interest (Sec 24(b) up to ₹2 Lakhs)** simultaneously under the Old Tax Regime, provided you actually reside in the rented home while the owned property is elsewhere or let out.",
      steps: ["Scanning dual property eligibility...", "Evaluating Sec 24(b) ceiling limits...", "Computing combined exemption value"],
      citations: "Sec 10(13A) & Sec 24(b)",
      tools: ["hra_calculator", "home_loan_engine"],
      confidence: "99.7%",
      reasoning: "Provided rent receipt & home loan interest certificate proofs are valid, claiming both optimizes tax savings under Old Regime."
    }
  ],
  hi: [
    {
      q: "Kya ₹18.5L CTC par New Tax Regime behtar hai?",
      a: "Haan! **₹18,50,000** gross salary ke liye **New Tax Regime** behtar hai. Aap Old Regime ki tulna me **₹24,850** ki shuddh bachat karte hain.",
      steps: ["Gross Salary ₹18,50,000 parse ho raha hai...", "Sec 115BAC slabs apply ho rahe hain...", "Bachat ka hisaab lagaya ja raha hai..."],
      citations: "Sec 115BAC(1A) & Sec 16(ia)",
      tools: ["regime_comparator", "hindi_nlp_engine"],
      confidence: "99.9%",
      reasoning: "Old Regime Tax: **₹1,73,050**.\nNew Regime Tax: **₹1,48,200**.\nNet Bachat: **₹24,850** New Regime me."
    },
    {
      q: "Section 80D me kitna tax bachtaa hai?",
      a: "Section 80D ke andar swasthya bima par **₹25,000** tak ki deduction milti hai. Senior citizen parents ke liye additional **₹50,000** claim kar sakte hain.",
      steps: ["80D limits check ho rahi hain...", "Senior citizen status verify ho raha hai..."],
      citations: "Sec 80D Income Tax Act",
      tools: ["deduction_lookup"],
      confidence: "99.8%",
      reasoning: "₹25,000 premium par 30% slab me kul **₹7,800** ka tax bachtaa hai."
    },
    {
      q: "Kya Standard Deduction ke liye proofs chahiye?",
      a: "Nahi! New Tax Regime me **₹75,000** (aur Old Regime me **₹50,000**) ki Standard Deduction bina kisi bill ya proof ke swatah apply hoti hai.",
      steps: ["Finance Act rules check ho rahe hain...", "Standard deduction auto-apply ho raha hai..."],
      citations: "Sec 16(ia) Income Tax Act",
      tools: ["slab_engine"],
      confidence: "99.8%",
      reasoning: "Bina kisi document ke **₹75,000** seedhe taxable income se ghata diye jaate hain."
    },
    {
      q: "HRA aur Home Loan interest dono claim kar sakte hain?",
      a: "Haan! Agar aap rented ghar me rehte hain aur aapka apna ghar kisi doosre shahar me hai, toh Old Regime me **HRA (Sec 10(13A))** aur **Home Loan Interest (Sec 24(b))** dono claim kar sakte hain.",
      steps: ["Rent receipt & Home loan certificate verify ho raha hai...", "Dual exemption rules apply ho rahe hain..."],
      citations: "Sec 10(13A) & Sec 24(b)",
      tools: ["hra_calculator"],
      confidence: "99.7%",
      reasoning: "Dono exemptions sath me claim karne par Old Regime me zyaada tax bachat ho sakti hai."
    }
  ],
  ta: [
    {
      q: "₹18.5L CTC-க்கு எந்த வரி முறை சிறந்தது?",
      a: "**₹18,50,000** சம்பளத்திற்கு **New Tax Regime** சிறந்தது. Old Regime-ஐ விட **₹24,850** வரி சேமிக்கலாம்.",
      steps: ["வருமானம் கணக்கிடப்படுகிறது...", "புதிய வரி விகிதம் பயன்படுத்தப்படுகிறது...", "சேமிப்பு கணக்கிடப்பட்டது..."],
      citations: "Sec 115BAC(1A)",
      tools: ["regime_comparator"],
      confidence: "99.9%",
      reasoning: "New Regime வரி: **₹1,48,200**. மொத்தம் சேமிப்பு: **₹24,850**."
    },
    {
      q: "Section 80D மூலம் எவ்வளவு வரி சேமிக்க முடியும்?",
      a: "Section 80D இன் கீழ் மருத்துவக் காப்பீட்டிற்கு **₹25,000** வரை வரி விலக்கு பெறலாம். பெற்றோருக்கு கூடுதலாக **₹25,000** (மூத்த குடிமக்களுக்கு **₹50,000**) பெறலாம்.",
      steps: ["80D மருத்துவக் காப்பீடு சரிபார்க்கப்படுகிறது...", "வயது வரம்பு கணக்கிடப்படுகிறது..."],
      citations: "Sec 80D Income Tax Act",
      tools: ["deduction_lookup"],
      confidence: "99.8%",
      reasoning: "₹25,000 காப்பீட்டுத் தொகையில் 30% ஸ்லேபில் **₹7,800** வரி சேமிப்பு கிடைக்கும்."
    },
    {
      q: "ரூ. 75,000 Standard Deduction பெற ஆதாரம் தேவையா?",
      a: "தேவையில்லை! New Tax Regime-ல் **₹75,000** (Old Regime-ல் **₹50,000**) Standard Deduction எவ்வித ஆதாரமும் இன்றி தானாகவே வழங்கப்படும்.",
      steps: ["வரிச் சட்டங்கள் சரிபார்க்கப்படுகின்றன...", "Standard Deduction சேர்க்கப்படுகிறது..."],
      citations: "Sec 16(ia) Income Tax Act",
      tools: ["slab_engine"],
      confidence: "99.8%",
      reasoning: "ஆவணங்கள் எதுவும் தேவைப்படாமல் **₹75,000** நேரடியாக மொத்த வருமானத்தில் குறையும்."
    },
    {
      q: "HRA மற்றும் வீட்டுக் கடன் வட்டி இரண்டையும் கோர முடியுமா?",
      a: "ஆம்! வாடகை வீட்டில் வசித்துக்கொண்டு மற்றொரு நகரில் சொந்த வீடு இருந்தால், Old Regime-ல் **HRA (Sec 10(13A))** மற்றும் **வீட்டுக் கடன் வட்டி (Sec 24(b))** இரண்டையும் பெறலாம்.",
      steps: ["வாடகை ரசீது மற்றும் வீட்டுக் கடன் விவரங்கள் சரிபார்க்கப்படுகின்றன..."],
      citations: "Sec 10(13A) & Sec 24(b)",
      tools: ["hra_calculator"],
      confidence: "99.7%",
      reasoning: "இரண்டு விலக்குகளையும் ஒன்றாகக் கோருவதன் மூலம் அதிக வரி சேமிக்க முடியும்."
    }
  ],
  te: [
    {
      q: "₹18.5L CTCకి ఏ పన్ను విధానం మంచిది?",
      a: "**₹18,50,000** ఆదాయానికి **New Tax Regime** చాలా మంచిది. Old Regime కంటే **₹24,850** ఆదా అవుతుంది.",
      steps: ["ఆదాయం విశ్లేషిస్తోంది...", "పన్ను లెక్కింపు పూర్తయింది...", "నెట్ ఆదా నిర్ధారించబడింది..."],
      citations: "Sec 115BAC(1A)",
      tools: ["regime_comparator"],
      confidence: "99.9%",
      reasoning: "New Regime పన్ను: **₹1,48,200**. పన్ను ఆదా: **₹24,850**."
    },
    {
      q: "Section 80D కింద ఎంత టాక్స్ ఆదా చేయవచ్చు?",
      a: "Section 80D కింద మెడికల్ ఇన్సూరెన్స్ ప్రీమియంపై **₹25,000** వరకు పన్ను మినహాయింపు లభిస్తుంది. సీనియర్ సిటిజన్ తల్లిదండ్రుల కోసం అదనంగా **₹50,000** క్లెయిమ్ చేయవచ్చు.",
      steps: ["80D పరిమితులు పరిశీలిస్తోంది...", "తల్లిదండ్రుల వయోపరిమితి తనిఖీ పూర్తయింది..."],
      citations: "Sec 80D Income Tax Act",
      tools: ["deduction_lookup"],
      confidence: "99.8%",
      reasoning: "₹25,000 ప్రీమియంపై 30% స్లాబ్‌లో **₹7,800** వరకు పన్ను ఆదా అవుతుంది."
    },
    {
      q: "రూ. 75,000 Standard Deduction కి ఆధారాలు అవసరమా?",
      a: "అవసరం లేదు! New Tax Regime లో **₹75,000** (Old Regime లో **₹50,000**) Standard Deduction ఎలాంటి బిల్లులు లేకపోయినా ఆటోమేటిక్‌గా వర్తిస్తుంది.",
      steps: ["ఆదాయపు పన్ను నిబంధనలు వర్తింపజేస్తోంది...", "స్టాండర్డ్ డిడక్షన్ వర్తించబడింది..."],
      citations: "Sec 16(ia) Income Tax Act",
      tools: ["slab_engine"],
      confidence: "99.8%",
      reasoning: "ఏ ఆధారాలు సమర్పించనవసరం లేకుండా **₹75,000** నేరుగా ఆదాయం నుండి మినహాయించబడుతుంది."
    },
    {
      q: "HRA మరియు హోమ్ లోన్ వడ్డీ రెంటినీ క్లెయిమ్ చేయవచ్చా?",
      a: "అవును! మీరు అద్దె ఇంట్లో ఉంటూ, సొంత ఇల్లు వేరే ఊరిలో ఉన్నట్లయితే Old Regime లో **HRA (Sec 10(13A))** మరియు **హోమ్ లోన్ వడ్డీ (Sec 24(b) రూ. 2 లక్షల వరకు)** రెంటినీ క్లెయిమ్ చేయవచ్చు.",
      steps: ["రెంటు రసీదులు మరియు లోన్ సర్టిఫికెట్ విశ్లేషిస్తోంది..."],
      citations: "Sec 10(13A) & Sec 24(b)",
      tools: ["hra_calculator"],
      confidence: "99.7%",
      reasoning: "రెండు మినహాయింపులు కలిపి క్లెయిమ్ చేయడం వల్ల అత్యధిక పన్ను ఆదా సాధించవచ్చు."
    }
  ]
};

interface CopilotSectionProps {
  soundEnabled: boolean;
}

export const CopilotSection: React.FC<CopilotSectionProps> = React.memo(({ soundEnabled }) => {
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const currentPrompts = promptResponsesMap[selectedLang] || promptResponsesMap['en'];

  const [copilotQuery, setCopilotQuery] = useState(currentPrompts[0].q);
  const [copilotResponse, setCopilotResponse] = useState(currentPrompts[0].a);
  const [isTyping, setIsTyping] = useState(false);
  const [copilotIsThinking, setCopilotIsThinking] = useState(false);
  const [copilotReasoning, setCopilotReasoning] = useState<string[]>(currentPrompts[0].steps);
  const [copilotCitations, setCopilotCitations] = useState(currentPrompts[0].citations);
  const [copilotTools, setCopilotTools] = useState<string[]>(currentPrompts[0].tools);
  const [copilotConfidence, setCopilotConfidence] = useState(currentPrompts[0].confidence);
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [copilotReasoningText, setCopilotReasoningText] = useState(currentPrompts[0].reasoning);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    const prompts = promptResponsesMap[lang] || promptResponsesMap['en'];
    handleTriggerPrompt(0, prompts);
  };

  const handleTriggerPrompt = (idx: number, customPrompts = currentPrompts) => {
    if (isTyping || copilotIsThinking) return;
    if (soundEnabled) {
      audioPool.playBeep(600, 'sine', 0.06, 0.02);
    }
    const prompt = customPrompts[idx] || customPrompts[0];
    setCopilotQuery(prompt.q);
    setIsTyping(false);
    setCopilotResponse("");
    setCopilotReasoning([]);
    setCopilotIsThinking(true);
    setReasoningExpanded(false);
    setCopilotReasoningText(prompt.reasoning);

    let stepIdx = 0;
    const streamSteps = () => {
      if (stepIdx < prompt.steps.length) {
        setCopilotReasoning(prev => [...prev, prompt.steps[stepIdx]]);
        stepIdx++;
        setTimeout(streamSteps, 400);
      } else {
        setCopilotIsThinking(false);
        setCopilotCitations(prompt.citations);
        setCopilotTools(prompt.tools);
        setCopilotConfidence(prompt.confidence);
        setIsTyping(true);

        let currentText = "";
        const targetText = prompt.a;
        let charIndex = 0;

        const interval = setInterval(() => {
          if (charIndex < targetText.length) {
            currentText = targetText.substring(0, charIndex + 2);
            setCopilotResponse(currentText);
            charIndex += 2;
          } else {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 15);
      }
    };

    setTimeout(streamSteps, 250);
  };

  return (
    <section id="copilot" className="py-24 md:py-28 border-y border-slate-200/60 dark:border-white/[0.04] bg-transparent px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold font-mono uppercase tracking-widest mx-auto">
            <Bot className="w-3.5 h-3.5" />
            <span>Multilingual AI Copilot</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            Conversational Tax Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Select your language and click preset prompts to watch the AI engine calculate tax savings.
          </p>

          {/* Multilingual Selector Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'en', name: 'English' },
              { id: 'hi', name: 'Hindi / Hinglish' },
              { id: 'ta', name: 'Tamil (தமிழ்)' },
              { id: 'te', name: 'Telugu (తెలుగు)' }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedLang === lang.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100/90 dark:bg-slate-900/90 hover:bg-blue-500/20 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Languages className="w-3 h-3 inline mr-1" />
                {lang.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Prompt Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
          {currentPrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={isTyping || copilotIsThinking}
              onClick={() => handleTriggerPrompt(idx)}
              className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-full text-slate-800 dark:text-slate-200 transition-all text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-98"
            >
              💬 {p.q}
            </button>
          ))}
        </div>

        {/* Copilot Chat Stage */}
        <PremiumCard className="p-6 sm:p-8 bg-white dark:bg-[#0E131B] border border-slate-200 dark:border-white/[0.06] rounded-3xl space-y-6 text-left max-w-2xl mx-auto shadow-xl relative overflow-hidden">
          {/* User Turn */}
          <div className="flex gap-3.5 items-start flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-md">
              U
            </div>
            <div className="flex flex-col items-end max-w-[85%]">
              <div className="px-4 py-3 rounded-2xl bg-blue-600 text-white rounded-tr-none text-xs sm:text-sm font-medium shadow-md">
                {copilotQuery}
              </div>
            </div>
          </div>

          {/* AI Turn */}
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-[#16E27A] font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-emerald-600 dark:text-[#16E27A]" />
            </div>
            <div className="flex flex-col items-start max-w-[88%] w-full space-y-4">
              {/* Reasoning Chain */}
              {copilotReasoning.length > 0 && (
                <div className="w-full space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-white/[0.04] rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mb-1">Reasoning Trace</div>
                  {copilotReasoning.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  {copilotIsThinking && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono pt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span>Analyzing tax clauses<ThinkingDots /></span>
                    </div>
                  )}
                </div>
              )}

              {/* Response Bubble */}
              {(copilotResponse || isTyping) && (
                <div className="px-5 py-4 rounded-2xl bg-slate-50 dark:bg-[#050607] border border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed min-h-[60px] shadow-inner w-full">
                  {copilotResponse.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.replace(/\*\*/g, '')}</strong>;
                    }
                    return part;
                  })}
                  {isTyping && (
                    <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse" />
                  )}
                </div>
              )}

              {/* Metadata Badges & Reasoning Toggle */}
              {!copilotIsThinking && copilotResponse && (
                <div className="flex flex-col w-full gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 px-2 py-0.5 rounded-md font-bold uppercase font-mono">
                      Confidence: {copilotConfidence}
                    </span>
                    <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.04] px-2 py-0.5 rounded-md font-bold uppercase font-mono">
                      📜 {copilotCitations}
                    </span>
                    {copilotTools.map((tool, i) => (
                      <span key={i} className="text-[9px] bg-emerald-50 dark:bg-[#16E27A]/10 text-emerald-600 dark:text-[#16E27A] border border-emerald-200 dark:border-[#16E27A]/20 px-2 py-0.5 rounded-md font-bold uppercase font-mono">
                        ⚙ {tool}
                      </span>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setReasoningExpanded(!reasoningExpanded)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{reasoningExpanded ? "Hide Tax Computation Details" : "View Tax Computation Details"}</span>
                      {reasoningExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                      {reasoningExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-4 bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-white/[0.04] rounded-xl text-xs leading-relaxed font-mono text-slate-700 dark:text-slate-300 space-y-2 border-l-4 border-l-emerald-500">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Rupee-by-Rupee Breakdown</div>
                            <p className="whitespace-pre-line">
                              {copilotReasoningText.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={idx} className="text-slate-900 dark:text-[#16E27A] font-bold">{part.replace(/\*\*/g, '')}</strong>;
                                }
                                return part;
                              })}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>
    </section>
  );
});
CopilotSection.displayName = "CopilotSection";
