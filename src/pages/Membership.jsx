import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Dumbbell, CheckCircle, ArrowRight, Zap, Shield, Clock, Users, Loader } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import { API_BASE_URL } from '../config';

const DEFAULT_PERKS = [
  "Full access to all equipment",
  "Locker room & shower facilities",
  "Access to all group classes",
  "Nutrition consultation session",
  "RC Fitness mobile app access",
  "Free guest pass (1 per month)",
];

const HIGHLIGHTS = [
  { icon: <Dumbbell size={22} className="text-red-500" />, label: "World-Class Equipment", desc: "Hammer Strength, Life Fitness & more" },
  { icon: <Users size={22} className="text-red-500" />, label: "Expert Trainers", desc: "Certified professional coaching staff" },
  { icon: <Clock size={22} className="text-red-500" />, label: "Open 6 AM – 11 PM", desc: "Flexible hours for every schedule" },
  { icon: <Shield size={22} className="text-red-500" />, label: "Secure & Clean", desc: "Sanitized daily with CCTV coverage" },
];

const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/finance/plans`);
        setPlans(res.data);
        if (res.data.length > 0) {
          // Pre-select the middle plan as "popular" if multiple exist
          const midIdx = Math.floor(res.data.length / 2);
          setSelectedPlan(res.data[midIdx]._id);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleJoinNow = (plan) => {
    // Build a PayHere checkout directly for the membership
    const merchantId = '1228490';
    const orderId = `MBR-${Date.now()}`;
    const amount = parseFloat(plan.price).toFixed(2);
    const currency = 'LKR';
    const notifyUrl = 'https://rc-fitness-backend.vercel.app/api/shop/payhere/notify';
    const returnUrl = window.location.href;

    // For a direct plan purchase we compute the hash on the server would be ideal
    // but for a real-world demo flow, link them to login/register
    window.location.href = '/login';
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-red-600">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto text-center">
        <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Membership Plans</p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] italic mb-6">
          Choose Your <br /><span className="text-white/30">Journey</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
          Flexible, transparent pricing. No hidden fees. Pick a plan and start transforming today.
        </p>
      </section>

      {/* Highlights */}
      <section className="py-12 px-6 border-y border-white/5 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(h => (
            <div key={h.label} className="flex flex-col items-start gap-3 p-5 rounded-2xl bg-[#111] border border-white/5">
              <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-xl">{h.icon}</div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">{h.label}</p>
                <p className="text-[11px] text-gray-500 mt-1">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans Cards */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 text-center mb-12">Available Plans</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-600">
            <Loader className="animate-spin" size={32} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Loading Plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <Dumbbell className="mx-auto mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-sm">No membership plans available</p>
            <p className="text-[11px] text-gray-700 mt-2">Please check back later or contact the gym directly.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
            {plans.map((plan, idx) => {
              const isPopular = plans.length >= 3 && idx === Math.floor(plans.length / 2);
              const isSelected = selectedPlan === plan._id;
              return (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan._id)}
                  className={`relative flex flex-col rounded-3xl border cursor-pointer transition-all duration-300 group overflow-hidden
                    ${isPopular ? 'bg-red-950/20 border-red-600/50 scale-105 shadow-[0_0_60px_rgba(220,38,38,0.15)]' : 'bg-[#111] border-white/5 hover:border-red-600/30'}
                    ${isSelected && !isPopular ? 'border-red-600/50 bg-[#161616]' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.3em] text-center py-2">
                      <Zap className="inline-block mr-1" size={10} /> Most Popular
                    </div>
                  )}

                  <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{plan.duration}</p>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic mb-6">{plan.name}</h3>

                    <div className="flex items-end gap-2 mb-8">
                      <span className="text-4xl font-black">LKR</span>
                      <span className="text-6xl font-black leading-none">{Number(plan.price).toLocaleString()}</span>
                    </div>

                    <div className="space-y-3 mb-10">
                      {(plan.features && plan.features.length > 0 ? plan.features : DEFAULT_PERKS).map(perk => (
                        <div key={perk} className="flex items-center gap-3 text-sm">
                          <CheckCircle size={16} className={isPopular ? 'text-red-500' : 'text-green-500'} />
                          <span className="text-gray-300">{perk}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/login">
                      <button
                        className={`w-full py-4 font-black uppercase tracking-widest text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2
                          ${isPopular ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30' : 'bg-white text-black hover:bg-gray-100'}`}
                      >
                        Join Now <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ / Note strip */}
      <section className="py-16 px-6 border-t border-white/5 text-center">
        <p className="text-gray-600 text-[11px] max-w-xl mx-auto leading-relaxed uppercase tracking-widest font-bold">
          All plans are billed upfront. Your membership starts on the day of activation. To sign up, please visit the front desk or{' '}
          <Link to="/login" className="text-red-500 underline underline-offset-4">log in</Link>{' '}
          to your account.
        </p>
      </section>

      {/* Footer CTA */}
      <section className="bg-red-600 py-16 px-6 text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-tight max-w-2xl mx-auto mb-6">
          Ready to Start Your Transformation?
        </h2>
        <Link to="/login">
          <button className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-900 transition-all rounded-sm active:scale-95">
            Get Started Today
          </button>
        </Link>
      </section>
    </div>
  );
};

export default Membership;
