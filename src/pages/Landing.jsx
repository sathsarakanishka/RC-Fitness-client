import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Dumbbell, Users, ShoppingBag, Instagram, Globe, Twitter, ArrowRight, Calendar } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PromotionBanner from '../components/PromotionBanner';

const Landing = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('https://rc-fitness-backend.vercel.app/api/events/announcements/all');
        setNews(res.data.slice(0, 3)); // Show only latest 3
      } catch (err) { console.error("Error fetching news:", err); }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-black text-white font-sans selection:bg-red-600">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Redefine your limits</p>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic mb-8">
            Forge Your <br /> <span className="text-white/40">Legacy</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed font-medium">
            Experience the ultimate fitness transformation with elite trainers, state-of-the-art equipment, and a community built for performance.
          </p>
          <button className="bg-red-600 hover:bg-red-700 px-10 py-4 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-red-900/20 active:scale-95">
            Join Now +
          </button>
        </div>
      </section>

      <PromotionBanner />

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="max-w-xl">
            <p className="text-red-600 font-bold uppercase tracking-widest text-[10px] mb-2">Why RC Fitness?</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Premium Amenities for Peak Performance</h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs md:text-right">
            Experience the difference with equipment and support designed to help you break through plateaus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Dumbbell className="text-red-600" size={32} />}
            title="State-of-the-art Equipment"
            desc="Access the latest Hammer Strength resistance machines and Life Fitness cardio equipment."
          />
          <FeatureCard
            icon={<Users className="text-red-600" size={32} />}
            title="Expert Trainers"
            desc="Work 1-on-1 with certified professionals who build custom periodization plans for you."
          />
          <FeatureCard
            icon={<ShoppingBag className="text-red-600" size={32} />}
            title="Supplement Store"
            desc="Fuel your body with high-quality whey, creatine, and pre-workouts available right here."
          />
        </div>
      </section>

      {/* Latest News Section */}
      {news.length > 0 && (
        <section className="py-24 bg-[#050505] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-red-600 font-bold uppercase tracking-widest text-[10px] mb-2">Internal Updates</p>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Latest <span className="text-white/40">News</span></h2>
              </div>
              <Link to="/events" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2 group transition-colors">
                View All Announcements <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map(item => (
                <div key={item._id} className="group">
                  <div className="bg-[#111] p-8 border border-white/5 hover:border-red-600/30 transition-all duration-500 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-red-950/30 text-red-500 border border-red-900/40 text-[9px] font-black uppercase tracking-widest rounded-full">{item.category}</span>
                      <span className="text-gray-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic mb-4 leading-tight group-hover:text-red-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{item.content.substring(0, 120)}...</p>
                    <Link to="/events" className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 group/btn">
                      Read Story <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-red-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote Banner */}
      <section className="bg-red-600 py-16 px-6 text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-tight max-w-4xl mx-auto">
          "The only bad workout is the one that didn't happen."
        </h2>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-12">
            <a href="#" className="hover:text-white">About</a>
            <a href="#" className="hover:text-white">Classes</a>
            <Link to="/events" className="hover:text-white">Events</Link>
            <a href="#" className="hover:text-white">Membership</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
            <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">
              © 2026 RC Fitness. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-500">
              <Instagram size={20} className="hover:text-white cursor-pointer transition-colors" />
              <Globe size={20} className="hover:text-white cursor-pointer transition-colors" />
              <Twitter size={20} className="hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-[#111111] p-10 rounded-sm border border-white/5 group hover:border-red-600/30 transition-all duration-500">
    <div className="mb-8 opacity-60 group-hover:opacity-100 transition-opacity transform group-hover:-translate-y-1 duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
