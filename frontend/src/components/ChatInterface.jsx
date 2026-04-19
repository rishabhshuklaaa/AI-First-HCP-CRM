import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader2, User, Bot, AlertCircle, CheckCircle } from 'lucide-react';

const ChatInterface = ({ setFormData, setSearchResult, onRefresh }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your HCP Assistant. Describe an interaction, and I will draft the form for you.' }
  ]);
  
  const scrollRef = useRef(null);

  // Auto-scroll 
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChat = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", { message: currentInput });
      const aiResponse = res.data; 

      // 1. AI Text Reply
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse.response || "Task processed." }]);

      // 2. FEATURE 1 & 2: Smart Drafting/Editing (Merging States)
      if (aiResponse.action === "UPDATE_FORM") {
        setFormData(prev => ({ 
          ...prev, 
          ...aiResponse.data // Merge AI extracted fields with existing manual edits
        }));
      }

      // 3. FEATURE 3: View Data (Search Result)
      if (aiResponse.action === "VIEW_DATA") {
        setSearchResult(aiResponse.data);
        if(aiResponse.data.length > 0) {
            setMessages(prev => [...prev, { role: 'ai', text: `Found ${aiResponse.data.length} records in history. You can view them in the search panel.` }]);
        } else {
            setMessages(prev => [...prev, { role: 'ai', text: "No matching records found in the database." }]);
        }
      }

      // 4. FEATURE 4: Delete logic
      if (aiResponse.action === "DELETE_SUCCESS") {
        setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `🗑️ Successfully deleted record for: ${aiResponse.hcp_name}` 
        }]);
        if (onRefresh) onRefresh();
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "⚠️ Backend connection failed. Please ensure the FastAPI server is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* CHAT HISTORY AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-red-600' : 'bg-white border border-slate-200'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-red-600" />}
              </div>
              
              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-red-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the meeting..."
            className="w-full p-4 pr-16 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none h-28 resize-none text-slate-700 transition-all text-sm shadow-inner"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChat();
              }
            }}
          />
          <button
            onClick={handleChat}
            disabled={loading}
            className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all hover:shadow-lg hover:shadow-red-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
        
        {/* Subtle Branding */}
        <div className="flex items-center justify-center gap-2 mt-3 opacity-40">
           <div className="h-[1px] w-8 bg-slate-300"></div>
           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
             Agentic CRM Engine
           </p>
           <div className="h-[1px] w-8 bg-slate-300"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;