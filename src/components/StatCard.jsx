import React from 'react';

const StatCard = ({ title, value, trend, icon, colorClass = "text-red-500" }) => (
  <div className="bg-[#121212] p-6 rounded-3xl border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <div className="bg-black p-2 rounded-lg border border-gray-800">
        {React.cloneElement(icon, { className: `${icon.props.className || ''} ${colorClass}` })}
      </div>
    </div>
    <div className="flex items-baseline gap-3">
      <h3 className="text-3xl lg:text-4xl font-black">{value}</h3>
      <span className="text-gray-500 text-[9px] font-bold uppercase">{trend}</span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 opacity-30 group-hover:opacity-60 transition-opacity"></div>
  </div>
);

export default StatCard;
