import { useState } from 'react';
import { Utensils, X, Info, Save } from 'lucide-react';
import axios from 'axios';

const AssignDietModal = ({ isOpen, onClose, memberName = 'SARAH CONNOR (#RC-8842)' }) => {
  const [goal, setGoal] = useState('');
  const [dietDetails, setDietDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAssignPlan = async () => {
    if (!goal || !dietDetails) {
      alert("Please select a goal and enter diet details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('https://rc-fitness-backend.vercel.app/api/diet/assign', {
        memberName,
        goal,
        dietDetails
      });
      alert('Diet plan successfully assigned!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to assign diet plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#0d0a0a] rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] border border-red-500/80 overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-red-900/40 bg-gradient-to-r from-red-950/20 to-transparent">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Utensils size={20} className="text-red-500" />
              <h2 className="text-xl font-light text-gray-200 uppercase tracking-widest">Assign Diet Plan</h2>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-8">
              Member: {memberName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">

          {/* Goal Selector */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select Diet Goal</label>
            <div className="relative">
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#151111] border border-red-900/30 text-gray-300 text-sm rounded-xl p-4 appearance-none outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-light tracking-wide"
              >
                <option value="" disabled>Select target goal...</option>
                <option value="weight_loss">Weight Loss (Deficit)</option>
                <option value="maintenance">Maintenance</option>
                <option value="muscle_gain">Muscle Gain (Surplus)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-500/70">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Details Textarea */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Enter Diet Plan Details</label>
            <textarea
              rows={8}
              value={dietDetails}
              onChange={(e) => setDietDetails(e.target.value)}
              placeholder="Paste or type the daily meal structure here...&#10;Example:&#10;Breakfast: 4 egg whites, 100g oats&#10;Lunch: 200g chicken breast, 1 cup brown rice..."
              className="w-full bg-[#151111] border border-red-900/30 text-gray-300 text-sm rounded-xl p-4 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-600 font-mono resize-none custom-scrollbar"
            ></textarea>
          </div>

          {/* Info Callout */}
          <div className="bg-[#1a1111] border border-red-900/40 rounded-xl p-4 flex gap-3 text-sm">
            <div className="mt-0.5 shrink-0 text-red-500">
              <Info size={16} />
            </div>
            <p className="text-gray-400 font-medium leading-relaxed">
              Assigning this plan will immediately update the member's mobile app dashboard. They will receive a push notification and an email summary of their new nutritional guidelines.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-red-900/40 bg-[#0a0808] flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignPlan}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all ${isSubmitting ? 'bg-red-800 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
          >
            <Save size={16} /> {isSubmitting ? 'Assigning...' : 'Assign Plan'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssignDietModal;
