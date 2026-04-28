import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Flame, UtensilsCrossed, Edit2, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import AssignDietModal from '../components/AssignDietModal';

const AdminDietPlans = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/diet-plans/all', {
        headers: { 'auth-token': token }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (dietPlanId) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/diet-plans/${dietPlanId}`, {
        headers: { 'auth-token': token }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete diet plan.');
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => 
    item.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white font-sans">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-10 lg:ml-64 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto pt-16 lg:pt-0 relative z-10">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <UtensilsCrossed size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Nutrition Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-200 mb-2 leading-none">Diet Plans</h1>
              <p className="text-gray-500 text-sm tracking-wide">Manage member nutritional protocols.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#151111] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 w-full md:w-64"
                />
              </div>
            </div>
          </header>

          {/* Members List */}
          <div className="bg-[#151111] border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
            {loading ? (
              <div className="p-10 text-center text-gray-500 text-sm uppercase tracking-widest font-bold animate-pulse">Loading members...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm uppercase tracking-widest font-bold">No members found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0a0808] text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                      <th className="p-5 font-bold">Member</th>
                      <th className="p-5 font-bold">Status</th>
                      <th className="p-5 font-bold">Current Goal</th>
                      <th className="p-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredData.map((item) => (
                      <tr key={item.user._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-900/20 text-red-500 flex items-center justify-center font-bold text-lg border border-red-500/20">
                              {item.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-200">{item.user.fullName}</p>
                              <p className="text-[10px] text-gray-500">{item.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          {item.user.dietPlanRequested ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                              <Flame size={12} className="animate-pulse" /> Requested
                            </span>
                          ) : item.dietPlan ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 text-[10px] font-bold uppercase tracking-widest border border-gray-500/20">
                              No Plan
                            </span>
                          )}
                        </td>
                        <td className="p-5">
                          <span className="text-xs text-gray-300 font-medium tracking-wide">
                            {item.dietPlan ? item.dietPlan.goal : '-'}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleOpenModal(item.user)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                item.dietPlan 
                                  ? 'bg-[#111] hover:bg-white/10 text-gray-300 hover:text-white border border-white/5' 
                                  : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_15px_rgba(239,68,68,0.2)]'
                              }`}
                            >
                              {item.dietPlan ? <><Edit2 size={14} /> Edit</> : <><Plus size={14} /> Assign</>}
                            </button>
                            
                            {item.dietPlan && (
                              <button 
                                onClick={() => handleDelete(item.dietPlan._id)}
                                className="p-2 bg-[#111] hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-white/5"
                                title="Delete Plan"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Diet Modal */}
      {selectedUser && (
        <AssignDietModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }} 
          memberName={selectedUser.fullName}
          userId={selectedUser._id}
          refreshData={fetchData}
        />
      )}

    </div>
  );
};

export default AdminDietPlans;
