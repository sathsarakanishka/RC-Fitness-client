import { useState, useEffect } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { Download, Flame, MapPin } from 'lucide-react';
import axios from 'axios';

const DietPlans = () => {
  const [meals, setMeals] = useState([]);
  const [targetCals, setTargetCals] = useState(0);
  const [goal, setGoal] = useState('Weight Loss');
  const [coachNote, setCoachNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDietPlan = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/diet-plans/me', {
          headers: { 'auth-token': token }
        });
        setMeals(data.meals);
        setTargetCals(data.targetCalories);
        setGoal(data.goal);
        setCoachNote(data.coachNote);
      } catch (err) {
        console.error('No diet plan found or error fetching:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDietPlan();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-red-600 font-bold animate-pulse uppercase tracking-widest">Initialising Nutrition Protocol...</div>;

  if (meals.length === 0) return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white">
      <MemberSidebar />
      <div className="flex-1 flex items-center justify-center p-12 lg:ml-64">
        <div className="bg-[#111] border border-red-900/20 p-10 rounded-3xl text-center max-w-md">
           <Flame size={48} className="text-red-900/50 mb-4 mx-auto" />
           <h2 className="text-xl font-bold uppercase tracking-tight mb-2">No active diet plan</h2>
           <p className="text-gray-500 text-sm">Your personalized nutrition protocol is currently being prepared by our coaches. Check back soon!</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white">
      <MemberSidebar />
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto pt-16 lg:pt-0 relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-200 font-sans mb-2 font-light">Diet Plan</h1>
              <p className="text-gray-500 text-sm tracking-wide uppercase font-bold text-[10px]">Fuel your performance. Master your nutrition.</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-red-500/80">
                <span className="text-sm font-bold uppercase tracking-widest">({goal})</span>
                <Flame size={18} className="fill-current" />
              </div>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Left Column: Meals */}
            <div className="flex-[2] space-y-6">
              {meals.map((meal) => (
                <div key={meal.id} className="bg-[#241c1c] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg shadow-black/20">
                  
                  {/* Meal Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded shadow-[0_0_10px_rgba(239,68,68,0.4)] tracking-widest uppercase">
                        {meal.time}
                      </span>
                      <h2 className="text-2xl font-light tracking-wide text-gray-200">{meal.name}</h2>
                    </div>
                    
                    <ul className="space-y-2.5">
                      {meal.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500/60"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Calories & Macros Card */}
                  <div className="bg-[#181212] rounded-xl p-5 w-full md:w-56 shadow-inner border border-white/5 shrink-0">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-light text-red-500">{meal.cals}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kcal</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold tracking-widest">
                        <span className="text-gray-500">P: {meal.macros.p}g</span>
                        <span className="text-gray-500">C: {meal.macros.c}g</span>
                        <span className="text-gray-500">F: {meal.macros.f}g</span>
                      </div>
                      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-black/50">
                        <div className="bg-blue-500 h-full" style={{ width: meal.macroPercents.p }}></div>
                        <div className="bg-yellow-500 h-full" style={{ width: meal.macroPercents.c }}></div>
                        <div className="bg-red-500 h-full" style={{ width: meal.macroPercents.f }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Daily Macros Sidebar */}
            <div className="flex-1 space-y-6">
              
              {/* Macros Panel */}
              <div className="bg-transparent border border-red-900/40 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </div>
                  <h3 className="text-sm font-light uppercase tracking-widest text-gray-300">Daily Macros</h3>
                </div>

                <div className="text-center mb-12">
                  <h2 className="text-5xl font-light text-gray-200 mb-1">{targetCals?.toLocaleString()}</h2>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Target Kcal</p>
                </div>

                <div className="space-y-6">
                  {/* Protein */}
                  <div className="bg-[#181212] border border-white/5 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4 text-xs font-bold tracking-widest uppercase">
                      <span className="text-gray-500">Protein</span>
                      <span className="text-gray-300">180g</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[75%] shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                    </div>
                  </div>
                  
                  {/* Carbs */}
                  <div className="bg-[#181212] border border-white/5 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4 text-xs font-bold tracking-widest uppercase">
                      <span className="text-gray-500">Carbs</span>
                      <span className="text-gray-300">150g</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-[80%] shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="bg-[#181212] border border-white/5 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4 text-xs font-bold tracking-widest uppercase">
                      <span className="text-gray-500">Fats</span>
                      <span className="text-gray-300">60g</span>
                    </div>
                    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[60%] shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach's Note */}
              <div className="bg-[#1e1414] border border-red-900/30 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50"></div>
                <div className="flex items-center gap-2 mb-4 text-red-500 text-xs font-bold tracking-widest uppercase">
                  <MapPin size={14} />
                  <span>Coach's Note</span>
                </div>
                <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                  "{coachNote || "Stay focused on your goals. Proper nutrition is 70% of the battle."}"
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DietPlans;
