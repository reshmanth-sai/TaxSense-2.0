import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Sparkles, ChevronDown, Plus } from 'lucide-react';
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

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isChatLoading || isSubmittingRef.current) return;
    
    const userMsg = text.trim();
    isSubmittingRef.current = true;
    setQuery('');
    
    // Read the synchronous snapshot of history before appending
    const historySnapshot = useTaxStore.getState().chatHistory || [];
    
    addChatMessage({ role: 'user', content: userMsg });
    setIsChatLoading(true);
    setStreamingMessage('');

    try {
      // Build context and payload
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
          // Complete: Append the final accumulated model message safely
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
      className={`fixed top-0 right-0 h-screen bg-[#06080A]/95 backdrop-blur-2xl border-l border-white/[0.04] flex flex-col z-50 transition-all duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'w-full sm:w-[450px] translate-x-0' : 'w-full sm:w-[450px] translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.04] bg-[#040608]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              TaxSense Copilot
              <span className="bg-blue-500/10 text-blue-400 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border border-blue-500/20">Beta</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Context: Aware of your deductions</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-blue-500/10">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200">How can I help optimize your taxes?</h3>
              <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                I automatically analyze your Form 16, deductions, and salary to provide personalized financial advice.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[300px]">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(q)}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <span>{q}</span>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
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
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                 <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 border-slate-700 text-slate-300' 
                    : 'bg-[#16E27A]/10 border-[#16E27A]/25 text-[#16E27A]'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                
                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/90 text-white rounded-tr-none border border-blue-500/20' 
                      : 'bg-[#0E131B] border border-white/[0.06] text-slate-300 rounded-tl-none prose prose-invert prose-p:my-1 prose-a:text-[#16E27A] prose-strong:text-[#F6F7F8] prose-strong:font-extrabold prose-ul:my-1 prose-li:my-0'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1 px-1">
                    {msg.role === 'user' ? 'You' : 'TaxSense AI'}
                  </span>
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
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#16E27A]/10 border border-[#16E27A]/25 text-[#16E27A]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col max-w-[85%] items-start">
                    <div className="px-4 py-3 rounded-2xl text-[13px] leading-relaxed bg-[#0E131B] border border-white/[0.06] text-slate-300 rounded-tl-none prose prose-invert min-w-[60px]">
                      {streamingMessage ? (
                        <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                      ) : (
                        <div className="flex items-center gap-1 h-5">
                          <span className="w-1.5 h-1.5 bg-[#16E27A]/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-[#16E27A]/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-[#16E27A]/80 rounded-full animate-bounce" />
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
      <div className="p-4 bg-[#040608] border-t border-white/[0.04]">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(query);
            }}
            placeholder="Ask anything about your taxes..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            disabled={isChatLoading}
          />
          <button
            onClick={() => handleSubmit(query)}
            disabled={!query.trim() || isChatLoading}
            className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition-all disabled:opacity-50 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-slate-500 text-center mt-3 font-medium">
          TaxSense AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
};
