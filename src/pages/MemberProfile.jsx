import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, CreditCard, LogOut, Weight, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemberSidebar from '../components/MemberSidebar';

const MemberProfile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // We'll create this "me" route in the backend next
        const res = await axios.get('https://rc-fitness-backend.vercel.app/api/user/me', {
          headers: { 'auth-token': token }
        });
        setProfile(res.data);
      } catch (err) { navigate('/'); }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!profile) return <div className="h-screen bg-black flex items-center justify-center text-red-600 font-bold animate-pulse">LOADING PROFILE...</div>;

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white">
      <MemberSidebar />
      <div className="flex-1 p-6 lg:p-12 lg:ml-64 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto pt-16 lg:pt-0 relative z-10">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">Member Profile</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Welcome back, {profile.fullName}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-bold uppercase text-xs">
              <LogOut size={18} /> Logout
            </button>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Details Card */}
        <div className="bg-[#111] border border-gray-900 rounded-[2.5rem] p-10 space-y-8">
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 font-black text-4xl border border-red-900/20 mb-4 uppercase">
                {profile.fullName[0]}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">{profile.fullName}</h2>
              <p className="text-gray-500 text-xs">{profile.email}</p>
           </div>
           
           <div className="space-y-4 pt-4 border-t border-gray-900">
              <DetailRow label="NIC Number" value={profile.nic} />
              <DetailRow label="Membership" value={profile.membershipType} color="text-red-500" />
              <DetailRow label="Treadmill Access" value={profile.treadmillAccess ? "GRANTED" : "NONE"} />
           </div>
        </div>

        {/* Physical Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
           <StatCard label="Current Weight" value={`${profile.physicalStats?.weight} kg`} icon={<Weight size={20}/>} />
           <StatCard label="Body Height" value={`${profile.physicalStats?.height} cm`} icon={<Ruler size={20}/>} />
           <StatCard label="Current BMI" value={profile.physicalStats?.bmi} icon={<Activity size={20}/>} highlight />
           <div className="bg-[#111] border border-gray-900 rounded-[2rem] p-8 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Fingerprint Status</p>
                <div className="bg-green-900/10 text-green-500 px-4 py-2 rounded-full text-xs font-bold border border-green-900/20 uppercase tracking-widest">
                  Verified Device
                </div>
              </div>
           </div>
        </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] text-gray-600 font-black uppercase">{label}</span>
    <span className={`text-xs font-bold ${color || 'text-gray-300'}`}>{value}</span>
  </div>
);

const StatCard = ({ label, value, icon, highlight }) => (
  <div className={`bg-[#111] border ${highlight ? 'border-red-600/30' : 'border-gray-900'} rounded-[2rem] p-8 relative overflow-hidden`}>
    <div className="text-gray-500 mb-6">{icon}</div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{label}</p>
    <h3 className="text-4xl font-black italic">{value}</h3>
    {highlight && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600"></div>}
  </div>
);

export default MemberProfile;
