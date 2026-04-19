import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InteractionForm from './components/InteractionForm';
import ChatInterface from './components/ChatInterface';
import { Layers, Bot, History, X, Users, ClipboardList } from 'lucide-react';

const getNowForInput = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const initialFormState = {
  hcp_name: '',
  interaction_type: 'In-Person',
  date_time: getNowForInput(),
  attendees: '',
  topic_discussion: '',
  material_shared: '',
  sample_distributed: '',
  sentiment: 'Neutral',
  outcome: '',
  follow_up: ''
};

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [searchResult, setSearchResult] = useState(null); 
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/interactions");
      setLogs(res.data);
    } catch (e) {
      console.error("Error fetching logs", e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="h-screen w-screen flex bg-white font-inter overflow-hidden">
      
      {/* LEFT SIDE: FORM & DASHBOARD */}
      <div className="w-[60%] h-full overflow-y-auto px-12 py-10 border-r border-slate-100 bg-slate-50/30">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
              <Layers className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">CRM Terminal</h1>
              <p className="text-slate-400 text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">Enterprise AI Sync</p>
            </div>
          </div>
        </header>

        {/* FEATURE: SMART SEARCH/HISTORY RESULTS */}
        {searchResult && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg"><History size={16} className="text-white"/></div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Target Report: {searchResult[0]?.hcp_name || "Global"}</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Database Match Found</p>
                  </div>
                </div>
                <button onClick={() => setSearchResult(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                    <tr>
                      <th className="p-4">Topic</th>
                      <th className="p-4">Sentiment</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {searchResult.map((item, index) => (
                      <tr key={index} className="text-white/80 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-xs font-medium">{item.topic_discussion || item.topic}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                            {item.sentiment}
                          </span>
                        </td>
                        <td className="p-4 text-[10px] font-mono">{item.date_time || item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTION FORM SECTION */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <ClipboardList size={14} className="text-red-600" /> New Interaction Entry
          </h2>
          <InteractionForm 
            formData={formData} 
            setFormData={setFormData} 
            initialFormState={initialFormState}
            onRefresh={fetchLogs} 
          />
        </div>

        {/* GLOBAL INTERACTION LOGS TABLE */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} className="text-red-600" /> Interaction Registry
            </h2>
            <div className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full">
              {logs.length} Total Records
            </div>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="p-5">HCP Professional</th>
                  <th className="p-5">Summary</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-red-50/30 transition-all group">
                    <td className="p-5">
                      <p className="text-sm font-bold text-slate-800">{log.hcp_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{log.interaction_type}</p>
                    </td>
                    <td className="p-5 text-xs text-slate-600 italic">
                      {log.topic_discussion?.substring(0, 60)}...
                    </td>
                    <td className="p-5 text-[10px] font-mono text-slate-400">{log.date_time?.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: AI BOT */}
      <div className="w-[40%] h-full bg-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
            <Bot className="text-white" size={22} />
          </div>
          <h2 className="text-slate-900 font-black text-sm uppercase tracking-tight">Drafting Assistant</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            setFormData={setFormData} 
            setSearchResult={setSearchResult}
            onRefresh={fetchLogs}
          />
        </div>
      </div>
    </div>
  );
}

export default App;