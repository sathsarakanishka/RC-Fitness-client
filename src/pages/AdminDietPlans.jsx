import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Utensils, AlertCircle, CheckCircle2, User, ChevronRight, Edit2, Trash2, FileText } from 'lucide-react';
import axios from 'axios';
import AssignDietModal from '../components/AssignDietModal';

const AdminDietPlans = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [dietPlans, setDietPlans] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [membersRes, plansRes] = await Promise.all([
        axios.get('http://localhost:5000/api/user/all', { headers: { 'auth-token': token } }),
        axios.get('http://localhost:5000/api/diet-plans/all', { headers: { 'auth-token': token } })
      ]);
      setMembers(membersRes.data);
      setDietPlans(plansRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePlan = async (userId) => {
    if(window.confirm("Are you sure you want to delete this diet plan?")) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5000/api/diet-plans/delete/${userId}`, {
          headers: { 'auth-token': token }
        });
        fetchData();
      } catch (err) { console.error(err); alert("Failed to delete plan."); }
    }
  };

  const filteredMembers = members.filter(member => 
    member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.nic?.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(member => {
    const plan = dietPlans.find(p => p.userId === member._id);
    return { ...member, dietPlan: plan };
  });

  return (
    <div className="flex bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-red-500/30">
      <Sidebar />
      <div className="flex-1 lg:ml-64 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto p-6 lg:p-12 relative z-10 pt-24 lg:pt-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="text-red-500" size={28} />
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">Diet Plans</h1>
              </div>
              <p className="text-gray-400 text-sm font-medium tracking-wide">Manage member nutrition protocols</p>
            </div>
            
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by Name or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Roster...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMembers.map(member => (
                <div 
                  key={member._id} 
                  className={`bg-[#111] border rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col h-full relative overflow-hidden group ${
                    member.dietPlanRequested 
                      ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {member.dietPlanRequested && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        Action Required
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      member.dietPlanRequested ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400'
                    }`}>
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{member.fullName}</h3>
                      <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-widest">NIC: {member.nic}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {member.dietPlanRequested ? (
                          <>
                            <AlertCircle size={16} className="text-red-500" />
                            <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Plan Requested</span>
                          </>
                        ) : member.dietPlan ? (
                          <>
                            <FileText size={16} className="text-green-500" />
                            <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Active Plan</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="text-gray-600" />
                            <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">No Request</span>
                          </>
                        )}
                      </div>
                      
                      {member.dietPlanRequested && (
                        <button 
                          onClick={() => { setSelectedMember(member); setIsModalOpen(true); }}
                          className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 group-hover:pr-3"
                        >
                          Create Plan <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        </button>
                      )}
                      
                      {!member.dietPlanRequested && !member.dietPlan && (
                        <button 
                          onClick={() => { setSelectedMember(member); setIsModalOpen(true); }}
                          className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                          Assign Plan
                        </button>
                      )}
                    </div>

                    {member.dietPlan && (
                      <div className="flex items-center gap-2 w-full pt-2 border-t border-white/5">
                        <button 
                          onClick={() => { setSelectedMember(member); setIsModalOpen(true); }}
                          className="flex-1 flex justify-center items-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                          <Edit2 size={14} /> Edit Plan
                        </button>
                        <button 
                          onClick={() => handleDeletePlan(member._id)}
                          className="flex items-center gap-2 text-red-500/50 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredMembers.length === 0 && (
                <div className="col-span-full bg-[#111] border border-white/5 rounded-3xl p-16 text-center">
                  <User size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Members Found</h3>
                  <p className="text-gray-500">We couldn't find any members matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AssignDietModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchData(); // refresh
        }} 
        memberId={selectedMember?._id} 
        memberName={selectedMember?.fullName} 
        existingPlan={selectedMember?.dietPlan}
      />
    </div>
  );
};

export default AdminDietPlans;
