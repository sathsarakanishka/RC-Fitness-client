import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const PublicClasses = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/classes');
        setClasses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="bg-[#0d0a0a] min-h-screen text-white font-sans selection:bg-red-600">
      <PublicNavbar />

      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto pt-32 pb-12 px-6 relative z-10">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Calendar size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Available Sessions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 leading-none">Group Classes</h1>
          <p className="text-gray-400 text-sm tracking-wide">Explore our high-intensity training sessions. Register to book your spot.</p>
        </header>

        {/* Classes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classes.length === 0 ? (
            <p className="text-gray-500 text-xs tracking-widest uppercase font-bold col-span-full py-12 border border-white/5 bg-[#151111] rounded-2xl text-center">
              No classes available.
            </p>
          ) : classes.map((cls, idx) => (
            <div key={cls._id || idx} className="bg-[#151111] border border-white/5 rounded-2xl overflow-hidden group hover:border-red-900/50 transition-colors flex flex-col">
              {/* Image Section */}
              <div className="h-48 relative overflow-hidden bg-[#0d0a0a]">
                <img src={cls.bgImage} alt={cls.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151111] via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded tracking-widest uppercase shadow-md">
                  {cls.type}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-red-500 mb-3">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold tracking-widest">{cls.time}</span>
                </div>
                <h3 className="text-lg font-light tracking-wide text-gray-200 mb-6 uppercase">{cls.name}</h3>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Intensity</p>
                    <p className={`text-[10px] font-black tracking-widest uppercase ${cls.intensityColor || 'text-red-500'}`}>{cls.intensity}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicClasses;
