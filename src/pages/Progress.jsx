import { useState, useEffect } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { Plus, Dumbbell, ArrowUp, Activity, Flame, Trophy, TrendingUp, ArrowRight, Save, History, Calendar, X, Trash2 } from 'lucide-react';
import axios from 'axios';

const Progress = () => {
  const [isLoggingPR, setIsLoggingPR] = useState(false);
  const [prForm, setPrForm] = useState({ liftName: '', weight: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/prs', {
        headers: { 'auth-token': token }
      });
      setPrs(data);
    } catch (err) {
      console.error('Failed to fetch PRs:', err);
    }
  };

  const handleDeletePR = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PR?")) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/prs/${id}`, {
        headers: { 'auth-token': token }
      });
      fetchPRs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete PR.');
    }
  };

  const getIconForLift = (name) => {
    const n = name?.toUpperCase() || '';
    if (n.includes('BENCH')) return <Dumbbell size={40} className="text-gray-800" />;
    if (n.includes('DEADLIFT')) return <Activity size={40} className="text-gray-800" />;
    if (n.includes('SQUAT')) return <svg className="w-10 h-10 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" /></svg>;
    if (n.includes('PRESS')) return <ArrowUp size={40} className="text-gray-800" />;
    return <TrendingUp size={40} className="text-gray-800" />;
  };

  const milestones = [
    {
      id: 1,
      title: 'New Deadlift PR!',
      description: 'You crushed your previous record by 4.5 kg.',
      value: '183.7 kg',
      time: '2 days ago',
      icon: <Flame size={20} className="text-red-500" />,
      bgClass: 'bg-red-500/10'
    },
    {
      id: 2,
      title: '500kg Club Entry',
      description: 'Total combined weight of Squat, Bench, and Deadlift.',
      value: '437.7 / 500',
      time: 'Almost there!',
      icon: <Trophy size={20} className="text-yellow-500" />,
      bgClass: 'bg-yellow-500/10'
    },
    {
      id: 3,
      title: 'Bench Press Update',
      description: 'Matched previous PR of 111.1 kg.',
      value: '111.1 kg',
      time: 'Oct 12, 2023',
      icon: <TrendingUp size={20} className="text-gray-400" />,
      bgClass: 'bg-gray-500/10'
    }
  ];

  const handleLogPR = async () => {
    if (!prForm.liftName || !prForm.weight) {
      alert("Please enter a lift name and weight.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/prs/log', {
        liftName: prForm.liftName.toUpperCase(),
        weight: Number(prForm.weight),
        unit: 'kg'
      }, {
        headers: { 'auth-token': token }
      });
      alert('Personal Record logged successfully!');
      setIsLoggingPR(false);
      setPrForm({ liftName: '', weight: '' });
      fetchPRs();
    } catch (err) {
      console.error(err);
      alert('Failed to log PR.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white">
      <MemberSidebar />
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 relative overflow-hidden">

        {/* Subtle background glow */}
        <div className="absolute top-[-10%] right-[10%] w-[30%] h-[30%] bg-red-900/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* PR Logging Modal Overlay */}
        {isLoggingPR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLoggingPR(false)}></div>
            <div className="relative w-full max-w-sm bg-[#151111] rounded-2xl border border-red-900/40 p-6 z-10 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-light text-gray-200 tracking-wide uppercase">New PR</h3>
                <button onClick={() => setIsLoggingPR(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lift Name</label>
                  <input type="text" placeholder="e.g. Bench Press" value={prForm.liftName} onChange={e => setPrForm({ ...prForm, liftName: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Weight (kg)</label>
                  <input type="number" placeholder="0.0" value={prForm.weight} onChange={e => setPrForm({ ...prForm, weight: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <button onClick={handleLogPR} disabled={isSubmitting} className={`w-full mt-2 text-white p-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)] border border-red-500/30 ${isSubmitting ? 'bg-red-800 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
                  <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto pt-16 lg:pt-0 relative z-10">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 text-red-500/80 mb-2">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Strength Metrics</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-200 font-sans mb-1 font-light">Personal Records</h1>
              <p className="text-gray-500 text-sm tracking-wide">Track your 1-Rep Max progress across main compound lifts.</p>
            </div>

            <button
              onClick={() => setIsLoggingPR(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
            >
              <Plus size={16} /> Log New PR
            </button>
          </div>

          {/* PR Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {prs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-bold tracking-widest uppercase text-xs">
                No Personal Records logged yet. Add one above!
              </div>
            ) : prs.map((pr, index) => (
              <div key={pr._id} className="bg-[#181212] flex flex-col justify-between border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-red-900/40 transition-colors">

                {/* Background Icon */}
                <div className="absolute top-4 right-4 opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                  {getIconForLift(pr.liftName)}
                </div>

                {index === 0 && (
                  <div className="absolute top-4 right-4 bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded border border-red-500/30 uppercase tracking-widest z-10">
                    New
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-6 drop-shadow-md">
                    {pr.liftName}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className={`text-5xl font-light ${index === 0 ? 'text-red-500' : 'text-gray-200'}`}>
                      {pr.weight}
                    </span>
                    <span className="text-sm font-bold text-gray-600 uppercase">{pr.unit}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-6 uppercase tracking-widest">
                    <Calendar size={14} />
                    {new Date(pr.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#1f1717] hover:bg-[#251d1d] text-gray-400 border border-white/5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                    <History size={14} /> History
                  </button>
                  <button
                    onClick={() => handleDeletePR(pr._id)}
                    className="flex-shrink-0 flex items-center justify-center bg-red-900/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 border border-red-900/20 p-3 rounded-xl transition-colors"
                    title="Delete PR"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Milestones Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-red-500" />
                <h2 className="text-xl font-light tracking-wide text-gray-200">Recent Milestones</h2>
              </div>
              <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map(milestone => (
                <div key={milestone.id} className="bg-[#181212] border border-white/5 hover:border-red-900/30 transition-colors rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5 sm:gap-6 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 shrink-0 shadow-inner ${milestone.bgClass}`}>
                      {milestone.icon}
                    </div>
                    <div>
                      <h3 className="text-gray-200 font-medium tracking-wide mb-1">{milestone.title}</h3>
                      <p className="text-gray-500 text-xs font-medium">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 w-full md:w-auto mt-4 md:mt-0 text-right">
                    <span className={`text-xl font-light mb-1 ${milestone.id === 1 ? 'text-red-500' : 'text-gray-300'}`}>
                      {milestone.value}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-gray-600 tracking-widest">{milestone.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Progress;
