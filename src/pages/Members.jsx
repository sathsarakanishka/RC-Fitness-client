import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import RegisterModal from '../components/RegisterModal';
import MemberRosterModal from '../components/MemberRosterModal';
import { Search, Edit2, Trash2, UserPlus, Printer } from 'lucide-react';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('https://rc-fitness-backend.vercel.app/api/user/all', { headers: { 'auth-token': token } });
      setMembers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const deleteMember = async (id) => {
    if (window.confirm("Delete this member?")) {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/user/delete/${id}`, { headers: { 'auth-token': token } });
      fetchMembers();
    }
  };

  const filtered = members.filter(m => m.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex bg-[#080808] min-h-screen text-white font-sans">
      <Sidebar />
      
      {/* THE FIX: Added `min-w-0` and `w-full` here. 
        This stops the table from stretching the entire screen! 
      */}
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-12 lg:ml-64 pt-24 lg:pt-12 overflow-x-hidden">
        
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 mb-8 w-full">
          <div className="w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter italic leading-tight">Member Directory</h1>
            <p className="text-gray-500 mt-1 font-bold text-[10px] uppercase tracking-widest">Manage memberships</p>
          </div>
          <div className="w-full xl:w-auto flex flex-row flex-wrap items-center gap-4 mt-4 xl:mt-0 justify-start xl:justify-end">
            <button 
              onClick={() => setShowRosterModal(true)} 
              className="flex-1 sm:flex-none flex items-center justify-center bg-[#111] hover:bg-red-900/20 text-red-500 border border-red-900/30 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 whitespace-nowrap"
            >
              <Printer size={16} className="mr-2" /> Print Roster
            </button>
            <button 
              onClick={() => { setSelectedMember(null); setIsModalOpen(true); }} 
              className="flex-1 sm:flex-none flex items-center justify-center bg-red-600 hover:bg-red-700 px-6 py-4 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-2xl transition-all active:scale-95 whitespace-nowrap"
            >
              <UserPlus size={18} className="mr-2" /> Register Member
            </button>
          </div>
        </header>

        <div className="bg-[#111] border border-gray-900 rounded-2xl flex items-center px-4 mb-8 focus-within:border-red-600 transition-colors w-full">
          <Search className="text-gray-600 flex-shrink-0" size={20} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent w-full p-4 outline-none text-sm" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* TABLE CONTAINER: 
          Now safely contained. You will be able to swipe left/right on the table 
          without the whole app moving around.
        */}
        <div className="bg-[#111] rounded-[2rem] border border-gray-900 overflow-hidden shadow-2xl w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-[#161616] text-gray-600 text-[10px] font-black uppercase tracking-widest border-b border-gray-900">
                <tr>
                  <th className="p-4 sm:p-6">Member</th>
                  <th className="p-4 sm:p-6">NIC</th>
                  <th className="p-4 sm:p-6">Package</th>
                  <th className="p-4 sm:p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/50">
                {filtered.map((m) => (
                  <tr key={m._id} className="hover:bg-red-600/[0.02] transition-colors">
                    <td className="p-4 sm:p-6">
                      <p className="font-black text-sm uppercase tracking-tight truncate max-w-[150px] sm:max-w-[250px]">{m.fullName}</p>
                      <p className="text-gray-600 text-[10px] font-bold truncate max-w-[150px] sm:max-w-[250px]">{m.email}</p>
                    </td>
                    <td className="p-4 sm:p-6 text-gray-400 text-xs font-black tracking-widest">{m.nic}</td>
                    <td className="p-4 sm:p-6 text-[10px] font-black whitespace-nowrap">
                      {m.membershipType ? (
                        <span className="px-3 py-1.5 bg-red-900/10 text-red-500 border border-red-900/20 rounded-lg uppercase tracking-widest">
                          {m.membershipType}
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg uppercase tracking-widest">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6 text-right space-x-2 sm:space-x-4 whitespace-nowrap">
                      <button onClick={() => { setSelectedMember(m); setIsModalOpen(true); }} className="text-gray-600 hover:text-white transition-colors p-2"><Edit2 size={16}/></button>
                      <button onClick={() => deleteMember(m._id)} className="text-gray-600 hover:text-red-600 transition-colors p-2"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {isModalOpen && <RegisterModal close={() => setIsModalOpen(false)} refresh={fetchMembers} member={selectedMember} />}
      
      {showRosterModal && (
        <MemberRosterModal 
          members={members} 
          onClose={() => setShowRosterModal(false)} 
        />
      )}
    </div>
  );
};

export default Members;
