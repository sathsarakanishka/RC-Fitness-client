import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Users, DollarSign, UserCheck, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, totalStaff: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('https://rc-fitness-backend.vercel.app/api/user/stats', { headers: { 'auth-token': token } });
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex bg-[#080808] min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 lg:ml-64 pt-24 lg:pt-10">
        <header className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-[10px] font-bold uppercase tracking-widest">Real-time facility overview</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Total Members" value={stats.totalMembers} trend="Total Enrolled" icon={<Users />} colorClass="text-red-500" />
          <StatCard title="Active Members" value={stats.activeMembers} trend="Currently Active" icon={<Activity />} colorClass="text-red-500" />
          <StatCard title="Total Staff" value={stats.totalStaff} trend="Trainers & Admin" icon={<UserCheck />} colorClass="text-red-500" />
          <StatCard title="Est. Revenue" value={`Rs. ${stats.revenue?.toLocaleString()}`} trend="Monthly Target" icon={<DollarSign />} colorClass="text-red-500" />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
