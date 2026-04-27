import { useState } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { Zap, PlayCircle, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

const WorkoutPlans = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [checkedExercises, setCheckedExercises] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleExercise = (id) => {
    setCheckedExercises(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exercises = [
    { id: 1, name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '120s' },
    { id: 2, name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s' },
    { id: 3, name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '90s' },
    { id: 4, name: 'Calf Raises', sets: 4, reps: '15-20', rest: '60s' },
  ];

  const handleCompleteWorkout = async () => {
    const completedNames = exercises
      .filter(ex => checkedExercises[ex.id])
      .map(ex => ex.name);

    if (completedNames.length === 0) {
      showNotification("Please mark at least one exercise as complete.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/workouts/complete', {
        programName: 'Hypertrophy Phase 1',
        week: 3,
        day: 'Monday: Leg Day',
        exercisesCompleted: completedNames,
        completionPercentage: Math.round((completedNames.length / exercises.length) * 100)
      }, {
        headers: { 'auth-token': token }
      });
      showNotification('Workout successfully logged! Great job.');
      // Reset checkbox state
      setCheckedExercises({});
    } catch (err) {
      console.error(err);
      showNotification('Failed to log workout.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white">
      <MemberSidebar />
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 relative overflow-hidden">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl border animate-in slide-in-from-right duration-300 shadow-lg flex items-center gap-3 ${
            notification.type === 'error' ? 'bg-red-950/90 border-red-500 text-white' : 'bg-[#151111]/90 border-red-500/50 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{notification.msg}</span>
          </div>
        )}

        {/* Subtle background glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto pt-16 lg:pt-0 relative z-10">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Zap size={16} className="fill-current" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/80">Active Program</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-200 font-sans mb-1 font-light">Hypertrophy Phase 1</h1>
              <p className="text-gray-500 text-sm tracking-wide">Week 3 of 8 &bull; Focus: Strength & Size</p>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Plan Completion</span>
                <span className="text-red-500 font-bold text-lg">65%</span>
              </div>
              <div className="w-full h-2.5 bg-[#1a1515] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-red-500 rounded-full w-[65%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              </div>
            </div>
          </div>

          {/* Workout Day Container */}
          <div className="bg-transparent border border-red-900/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.03)] selection-glow relative">

            {/* Day Header - Clickable to expand/collapse */}
            <div
              className="p-6 border-b border-red-900/40 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
                  M
                </div>
                <div>
                  <h2 className="text-xl font-light text-gray-200 tracking-wide">Monday: Leg Day</h2>
                  <p className="text-red-900 font-bold text-[11px] uppercase tracking-wider mt-0.5">4 Exercises &bull; 45 Mins</p>
                </div>
              </div>
              <div className="bg-[#1a1515] p-2 rounded-xl text-red-500/70 border border-red-900/30">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Expandable Exercise List */}
            {isExpanded && (
              <div className="p-6 space-y-4 bg-[#110d0d]">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-[#181313] border border-red-900/20 rounded-2xl p-5 flex items-center justify-between gap-4 group transition-all hover:bg-[#1a1414] hover:border-red-900/40">
                    <div className="flex items-center gap-5 sm:gap-6 flex-1">
                      {/* Custom Checkbox */}
                      <button
                        onClick={() => toggleExercise(exercise.id)}
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${checkedExercises[exercise.id]
                            ? 'bg-red-500 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                            : 'border-gray-700 hover:border-red-500/50 text-transparent'
                          }`}
                      >
                        <CheckCircle size={16} className={`${checkedExercises[exercise.id] ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                      </button>

                      <div className="flex-1">
                        <h3 className="text-lg text-gray-300 font-light mb-1">{exercise.name}</h3>
                        <div className="flex flex-wrap items-center text-[11px] font-bold text-gray-500 gap-x-4 gap-y-1 uppercase tracking-wider">
                          <span className="flex items-center gap-1"><span className="text-red-500/70">#</span> {exercise.sets} Sets</span>
                          <span className="flex items-center gap-1"><span className="text-red-500/70">&#8644;</span> {exercise.reps} Reps</span>
                          <span className="flex items-center gap-1"><span className="text-red-500/70">&#9201;</span> {exercise.rest} Rest</span>
                        </div>
                      </div>
                    </div>

                    {/* Demo Button */}
                    <button className="flex items-center gap-2 bg-[#1f1818] hover:bg-[#251d1d] text-gray-400 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
                      <PlayCircle size={16} className="text-red-500" />
                      <span className="hidden sm:inline">Demo</span>
                    </button>
                  </div>
                ))}

                {/* Complete Button */}
                <button
                  onClick={handleCompleteWorkout}
                  disabled={isSubmitting}
                  className={`w-full mt-4 text-white p-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.25)] border border-red-400/30 ${isSubmitting ? 'bg-red-800 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 hover:shadow-[0_4px_30px_rgba(239,68,68,0.4)]'
                    }`}
                >
                  <CheckCircle size={20} /> {isSubmitting ? 'Logging...' : 'Complete Workout'}
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default WorkoutPlans;
