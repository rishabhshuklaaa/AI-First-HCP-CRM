import React from 'react';
import { useSelector } from 'react-redux';
import { Database, Activity } from 'lucide-react';

const LogsTable = () => {
  const interactions = useSelector((state) => state.interactions.list);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Database size={20} className="text-blue-600"/> Interaction Logs</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{interactions.length} Total</span>
      </div>
      <div className="overflow-y-auto max-h-[500px] space-y-4">
        {interactions.map((item) => (
          <div key={item.id} className="p-4 border rounded-xl hover:bg-gray-50 transition shadow-sm">
            <div className="flex justify-between font-bold text-gray-800">
              <span>{item.hcp_name}</span>
              <span className="text-[10px] text-gray-400 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-600 my-2">{item.summary}</p>
            <span className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${item.sentiment === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              <Activity size={12} /> {item.sentiment || "Neutral"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsTable;