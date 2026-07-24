import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Sparkles, ChevronDown, Plus, Copy, Check, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTaxStore } from '../../store/useTaxStore';
import { ContextService } from '../../services/ai/ContextService';
import { PromptBuilder } from '../../services/ai/PromptBuilder';
import { StreamingService } from '../../services/ai/StreamingService';
import { ConversationMemory } from '../../services/ai/ConversationMemory';

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { chatHistory, addChatMessage, isChatLoading, setIsChatLoading } = useTaxStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Streaming state
  const [streamingMessage, setStreamingMessage] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const isSubmittingRef = useRef(false);
  
  const suggestedQuestions = [
    "How can I save more tax?",
    "Should I switch regimes?",
    "Explain my current deductions",
    "How much can I invest in NPS?"
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingMessage]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isChatLoading || isSubmittingRef.current) return;
    
    const userMsg = text.trim();
    isSubmittingRef.current = true;
    setQuery('');
    
    const historySnapshot = useTaxStore.getState().chatHistory || [];
    
    addChatMessage({ role: 'user', content: userMsg });
    setIsChatLoading(true);
    setStreamingMessage('');

    try {
      const context = ContextService.getCurrentContext();
      const systemPrompt = PromptBuilder.buildSystemPrompt(context);
      
      const payload = {
        messages: ConversationMemory.formatForAPI([...historySnapshot, { role: 'user', content: userMsg }]),
        systemPrompt
      };

      await StreamingService.streamResponse(
        '/api/chat',
        payload,
        (chunk) => {
          setStreamingMessage(chunk);
        },
        (finalText) => {
          addChatMessage({ role: 'assistant', content: finalText || "No response received from model." });
          setStreamingMessage('');
          setIsChatLoading(false);
        },
        (err) => {
          console.error(err);
          addChatMessage({ role: 'assistant', content: "I'm sorry, I encountered a network error while analyzing your data. Please try again." });
          setIsChatLoading(false);
          setStreamingMessage('');
        }
      );
    } catch (err) {
      console.error(err);
      setIsChatLoading(false);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleQuickAction = (action: string) => {
    handleSubmit(action);
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-screen bg-white/95 dark:bg-[#06080A]/95 backdrop-blur-2xl border-l border-slate-200 dark:border-white/[0.05] flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'w-full sm:w-[460px] translate-x-0' : 'w-full sm:w-[460px] translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/[0.05] bg-slate-50/80 dark:bg-[#040608]/90 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-12 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600/20 via-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-[#A78BFA]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              TaxSense Copilot
              <span className="bg-purple-500/10 text-purple-600 dark:text-[#A78BFA] text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold border border-purple-500/20">Beta</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Context-aware tax intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-1 z-10">
          {chatHistory.length > 0 && (
            <button 
              onClick={() => useTaxStore.setState({ chatHistory: [] })}
              title="Clear chat history"
              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            title="Close copilot"
            className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/15 border border-purple-500/25 flex items-center justify-center shadow-2xl shadow-purple-500/10 relative group">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-[#A78BFA] transition-transform group-hover:scale-110 duration-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">How can I optimize your taxes today?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[290px] mx-auto leading-relaxed font-medium">
                I continuously analyze your Form 16, deductions, and salary to discover additional tax savings.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[320px]">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(q)}
                  className="px-4 py-3 bg-slate-50/80 hover:bg-purple-50/50 dark:bg-slate-900/60 dark:hover:bg-purple-950/20 border border-slate-200 dark:border-white/[0.05] hover:border-purple-500/30 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-medium transition-all text-left flex items-center justify-between cursor-pointer group shadow-xs"
                >
                  <span>{q}</span>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-[#A78BFA] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 group/msg ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                 <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-600 dark:text-blue-400' 
                    : 'bg-purple-500/10 border-purple-500/25 text-purple-600 dark:text-[#A78BFA]'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                
                <div className={`flex flex-col max-w-[85%] relative ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-xs relative group/bubble ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border border-blue-500/20' 
                      : 'bg-slate-50 dark:bg-[#0E131B] border border-slate-200/80 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 rounded-tl-none prose dark:prose-invert prose-p:my-1 prose-a:text-purple-600 dark:prose-a:text-[#A78BFA] prose-a:font-bold prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold prose-ul:my-1 prose-li:my-0'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'TaxSense AI'}
                    </span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.content, i)}
                        title="Copy text"
                        className="opacity-0 group-hover/msg:opacity-100 text-slate-400 hover:text-purple-600 dark:hover:text-[#A78BFA] transition-all p-0.5 rounded cursor-pointer"
                      >
                        {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Streaming Indicator */}
            <AnimatePresence>
              {(isChatLoading || streamingMessage) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-3 flex-row"
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/10 border border-purple-500/25 text-purple-600 dark:text-[#A78BFA]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col max-w-[85%] items-start">
                    <div className="px-4 py-3 rounded-2xl text-[13px] leading-relaxed bg-slate-50 dark:bg-[#0E131B] border border-slate-200/80 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 rounded-tl-none prose dark:prose-invert min-w-[60px]">
                      {streamingMessage ? (
                        <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-1.5 h-5 px-1">
                          <span className="w-1.5 h-1.5 bg-purple-500/90 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-purple-500/90 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-purple-500/90 rounded-full animate-bounce" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-50/80 dark:bg-[#040608]/90 border-t border-slate-200 dark:border-white/[0.05]">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(query);
            }}
            placeholder="Ask anything about your taxes..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl py-3 pl-4 pr-12 text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:outline-none focus-visible:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus-visible:ring-2 focus-visible:ring-purple-500/20 transition-all shadow-inner"
            disabled={isChatLoading}
          />
          <button
            onClick={() => handleSubmit(query)}
            disabled={!query.trim() || isChatLoading}
            className="absolute right-2 w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-purple-500/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-3 font-medium">
          TaxSense AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};
