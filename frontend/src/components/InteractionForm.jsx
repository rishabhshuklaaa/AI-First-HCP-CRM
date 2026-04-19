import React from 'react';
import axios from 'axios';
import { Save, User, Calendar, MessageSquare, ClipboardCheck, Users, Package } from 'lucide-react';

const InteractionForm = ({ formData, setFormData, initialFormState, onRefresh }) => {
  
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Feature: Commit to Database
  const handleCommit = async (e) => {
    e.preventDefault();
    
    // Safety Check: Name ke bina save nahi hoga
    if (!formData.hcp_name || formData.hcp_name.trim() === "") {
      alert("⚠️ HCP Name is required to save the interaction!");
      return;
    }

    try {
      // API call to save in PostgreSQL
      const response = await axios.post("http://127.0.0.1:8000/interactions/commit", formData);
      
      if (response.data.status === "SUCCESS") {
        alert("✅ Interaction successfully committed to PostgreSQL!");
        
        
        setFormData(initialFormState); 
        
        
        if (onRefresh) onRefresh(); 
      } else {
        alert("❌ Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("❌ Critical Error: Backend is not responding. Check your terminal.");
    }
  };

  const inputClass = "w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-slate-800 text-sm shadow-sm hover:border-slate-300";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1 flex items-center gap-2";

  return (
    <form onSubmit={handleCommit} className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 gap-6">
        
        {/* 1. HCP Name (Manual + AI) */}
        <div className="col-span-2">
          <label className={labelClass}><User size={14}/> HCP Full Name</label>
          <input 
            name="hcp_name" 
            value={formData.hcp_name || ""} 
            onChange={handleChange} 
            className={inputClass} 
            placeholder="AI will extract this or you can type..." 
          />
        </div>

        {/* 2. Interaction Type */}
        <div>
          <label className={labelClass}>Interaction Type</label>
          <select name="interaction_type" value={formData.interaction_type || "In-Person"} onChange={handleChange} className={inputClass}>
            <option value="In-Person">In-Person</option>
            <option value="Virtual">Virtual</option>
            <option value="Email">Email</option>
            <option value="Phone Call">Phone Call</option>
          </select>
        </div>

        {/* 3. Date & Time (ISO Format YYYY-MM-DDTHH:MM) */}
        <div>
          <label className={labelClass}><Calendar size={14}/> Date & Time</label>
          <input 
            type="datetime-local" 
            name="date_time" 
            value={formData.date_time || ""} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </div>

        {/* 4. Attendees */}
        <div className="col-span-2">
          <label className={labelClass}><Users size={14}/> Attendees</label>
          <input 
            name="attendees" 
            value={formData.attendees || ""} 
            onChange={handleChange} 
            className={inputClass} 
            placeholder="Who else was there?" 
          />
        </div>

        {/* 5. Topic Discussion */}
        <div className="col-span-2">
          <label className={labelClass}><MessageSquare size={14}/> Topic of Discussion</label>
          <textarea 
            name="topic_discussion" 
            value={formData.topic_discussion || ""} 
            onChange={handleChange} 
            className={`${inputClass} h-28 resize-none`} 
            placeholder="Key points discussed during the meeting..."
          />
        </div>

        {/* 6. Material Shared */}
        <div>
          <label className={labelClass}><Package size={14}/> Material Shared</label>
          <input name="material_shared" value={formData.material_shared || ""} onChange={handleChange} className={inputClass} placeholder="Brochures, PPTs..." />
        </div>

        {/* 7. Samples Distributed */}
        <div>
          <label className={labelClass}>Samples Distributed</label>
          <input name="sample_distributed" value={formData.sample_distributed || ""} onChange={handleChange} className={inputClass} placeholder="E.g. 5 kits" />
        </div>

        {/* 8. Sentiment & Outcome */}
        <div>
          <label className={labelClass}>Sentiment</label>
          <select 
            name="sentiment" 
            value={formData.sentiment || "Neutral"} 
            onChange={handleChange} 
            className={`${inputClass} ${formData.sentiment === 'Positive' ? 'text-green-600 font-bold' : formData.sentiment === 'Negative' ? 'text-red-600 font-bold' : ''}`}
          >
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>

        <div>
          <label className={labelClass}><ClipboardCheck size={14}/> Outcome</label>
          <input name="outcome" value={formData.outcome || ""} onChange={handleChange} className={inputClass} placeholder="Next steps agreed upon..." />
        </div>

        {/* FEATURE 5: AI Strategic Follow-up (Auto-generated by AI) */}
        <div className="col-span-2 bg-gradient-to-r from-red-50 to-white p-5 rounded-2xl border border-red-100 border-dashed">
          <label className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-2">
            ✨ AI Strategic Follow-up Guide
          </label>
          <p className="text-sm text-slate-600 italic leading-relaxed">
            {formData.follow_up && formData.follow_up !== "None" 
              ? formData.follow_up 
              : "Describe the meeting in the chat, and I will generate a multi-step follow-up strategy here."}
          </p>
        </div>
      </div>

      {/* FINAL SAVE BUTTON */}
      <button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-200 active:scale-[0.98] mt-4"
      >
        <Save size={20} />
        Save Full Interaction
      </button>
    </form>
  );
};

export default InteractionForm;