import { useState, useEffect } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { Zap, PlayCircle, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

const WorkoutPlans = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  const [expandedDays, setExpandedDays] = useState({});
  const [checkedExercises, setCheckedExercises] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedDaysList, setCompletedDaysList] = useState([]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchWorkoutPlan = async (isInitialOrSubmit = false) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'auth-token': token };

      // Fetch status first
      try {
        const { data: statusData } = await axios.get('http://localhost:5000/api/workout-plans/status', { headers });
        setRequested(statusData.workoutPlanRequested);
      } catch (err) { console.error('Status fetch error', err); }

      // Fetch plan
      try {
        const { data } = await axios.get('http://localhost:5000/api/workout-plans/me', { headers });
        setPlan(data);
        // Initialize expanded state for first day if not set
        setExpandedDays(prev => {
            if (Object.keys(prev).length === 0 && data.days && data.days.length > 0) {
                return { [data.days[0]._id || 0]: true };
            }
            return prev;
        });

        // Fetch workout history to calculate completion percentage for this plan & week
        try {
            const { data: history } = await axios.get('http://localhost:5000/api/workouts/history', { headers });
            // Filter history for this program and week
            const currentWeekLogs = history.filter(log => log.programName === data.programName && log.week === data.week);
            const completedDays = currentWeekLogs.map(log => log.day);
            setCompletedDaysList(completedDays);
            // Get all unique completed exercise names
            let allCompletedExerciseNames = [];
            currentWeekLogs.forEach(log => {
                if (log.exercisesCompleted) {
                    allCompletedExerciseNames = [...allCompletedExerciseNames, ...log.exercisesCompleted];
                }
            });
            const uniqueCompletedExercises = [...new Set(allCompletedExerciseNames)];

            // Total exercises in the plan
            const totalExercisesInPlan = data.days.reduce((total, day) => total + day.exercises.length, 0);

            // Calculate percentage based on exercises
            const percentage = totalExercisesInPlan > 0 ? Math.round((uniqueCompletedExercises.length / totalExercisesInPlan) * 100) : 0;
            setCompletionPercentage(percentage > 100 ? 100 : percentage);

            // Auto-check the exercises that were completed
            if (isInitialOrSubmit) {
                const newCheckedState = {};
                data.days.forEach(day => {
                    day.exercises.forEach(ex => {
                        if (uniqueCompletedExercises.includes(ex.name)) {
                            newCheckedState[ex._id || ex.id] = true;
                        }
                    });
                });
                setCheckedExercises(newCheckedState);
            }
        } catch (err) { console.error('History fetch error', err); }

      } catch (err) {
        // No active plan
        setPlan(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlan(true);
    const interval = setInterval(() => {
      fetchWorkoutPlan(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestPlan = async () => {
      try {
          setRequesting(true);
          const token = localStorage.getItem('authToken');
          await axios.post('http://localhost:5000/api/workout-plans/request', {}, {
              headers: { 'auth-token': token }
          });
          setRequested(true);
      } catch (err) {
          console.error('Error requesting plan:', err);
          showNotification('Failed to request plan. Please try again.', 'error');
      } finally {
          setRequesting(false);
      }
  };

  const toggleDayExpansion = (dayIndex) => {
      setExpandedDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  const toggleExercise = (exId) => {
    setCheckedExercises(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleCompleteWorkout = async (day) => {
    const completedNames = day.exercises
      .filter(ex => checkedExercises[ex._id || ex.id])
      .map(ex => ex.name);

    if (completedNames.length === 0) {
      showNotification("Please mark at least one exercise as complete.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:5000/api/workouts/complete', {
        programName: plan.programName,
        week: plan.week,
        day: day.dayName,
        exercisesCompleted: completedNames,
        completionPercentage: Math.round((completedNames.length / day.exercises.length) * 100)
      }, {
        headers: { 'auth-token': token }
      });
      showNotification('Workout successfully logged! Great job.');
      


      // Refresh plan to update percentage
      fetchWorkoutPlan(true);
      
    } catch (err) {
      console.error(err);
      showNotification('Failed to log workout.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm('Are you sure you want to reset all your progress for this week? This cannot be undone.')) return;
    
    setIsResetting(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete('http://localhost:5000/api/workouts/reset', {
        headers: { 'auth-token': token },
        data: { programName: plan.programName, week: plan.week }
      });
      showNotification('Progress reset successfully.', 'success');
      
      // Clear local states
      setCheckedExercises({});
      setCompletedDaysList([]);
      setCompletionPercentage(0);
      
      // Fetch fresh plan data
      fetchWorkoutPlan(true);
    } catch (err) {
      console.error('Reset error:', err);
      showNotification('Failed to reset progress.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-red-600 font-bold animate-pulse uppercase tracking-widest">Initialising Protocol...</div>;

  if (!plan || plan.days.length === 0) return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white">
      <MemberSidebar />
      <div className="flex-1 flex items-center justify-center p-12 lg:ml-64">
        <div className="bg-[#111] border border-red-900/20 p-10 rounded-3xl text-center max-w-md">
           <Zap size={48} className="text-red-900/50 mb-4 mx-auto" />
           <h2 className="text-xl font-bold uppercase tracking-tight mb-2">No active workout plan</h2>
           {requested ? (
              <p className="text-green-500/80 text-sm font-medium tracking-wide">Your request has been received. Our coaches are preparing your personalized workout protocol. Check back soon!</p>
           ) : (
              <>
                <p className="text-gray-500 text-sm mb-8">You don't have an active workout plan yet. Request one to get a personalized protocol from our coaches.</p>
                <button 
                  onClick={handleRequestPlan}
                  disabled={requesting}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                >
                  {requesting ? 'Requesting...' : 'Request Workout Plan'}
                </button>
              </>
           )}
        </div>
      </div>
    </div>
  );


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
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2 text-red-600">
                  <Zap size={16} className="fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/80">Active Program</span>
                </div>
                {requested ? (
                  <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-yellow-500/30 rounded bg-yellow-500/10">
                    Change Requested
                  </span>
                ) : (
                  <button 
                    onClick={handleRequestPlan}
                    disabled={requesting}
                    className="text-gray-400 hover:text-white border border-gray-600 hover:border-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {requesting ? '...' : 'Request Change'}
                  </button>
                )}
                <button
                    onClick={handleResetProgress}
                    disabled={isResetting}
                    className="text-gray-400 hover:text-red-500 border border-gray-600 hover:border-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                    title="Clear all checkmarks and start over"
                >
                    {isResetting ? '...' : 'Reset Progress'}
                </button>
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-200 font-sans mb-1 font-light">{plan.programName}</h1>
              <p className="text-gray-500 text-sm tracking-wide">Week {plan.week} &bull; Focus: {plan.focus}</p>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Plan Completion</span>
                <span className="text-red-500 font-bold text-lg">{completionPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#1a1515] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
              {plan.days.map((day, dayIndex) => {
                  const dayId = day._id || dayIndex;
                  const isExpanded = expandedDays[dayId];
                  
                  return (
                    <div key={dayId} className="bg-transparent border border-red-900/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.03)] selection-glow relative">
                        {/* Day Header */}
                        <div
                        className="p-6 border-b border-red-900/40 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => toggleDayExpansion(dayId)}
                        >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_15px_rgba(239,68,68,0.3)]">
                            {dayIndex + 1}
                            </div>
                            <div>
                            <h2 className="text-xl font-light text-gray-200 tracking-wide flex items-center gap-2">
                              {day.dayName}
                              {completedDaysList.includes(day.dayName) && <CheckCircle size={16} className="text-green-500" />}
                            </h2>
                            <p className="text-red-900 font-bold text-[11px] uppercase tracking-wider mt-0.5">
                              {day.exercises.length} Exercises {completedDaysList.includes(day.dayName) && '• COMPLETED'}
                            </p>
                            </div>
                        </div>
                        <div className="bg-[#1a1515] p-2 rounded-xl text-red-500/70 border border-red-900/30">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        </div>

                        {/* Expandable Exercise List */}
                        {isExpanded && (
                        <div className="p-6 space-y-4 bg-[#110d0d]">
                            {day.exercises.map((exercise) => {
                                const exId = exercise._id || exercise.id;
                                return (
                                <div key={exId} className="bg-[#181313] border border-red-900/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group transition-all hover:bg-[#1a1414] hover:border-red-900/40">
                                    <div className="flex items-center gap-4 sm:gap-6 flex-1 w-full">
                                    {/* Custom Checkbox */}
                                    <button
                                        onClick={() => toggleExercise(exId)}
                                        className={`w-7 h-7 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${checkedExercises[exId]
                                            ? 'bg-red-500 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                            : 'border-gray-700 hover:border-red-500/50 text-transparent'
                                        }`}
                                    >
                                        <CheckCircle size={16} className={`${checkedExercises[exId] ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg text-gray-300 font-light mb-1 truncate">{exercise.name}</h3>
                                        <div className="flex flex-wrap items-center text-[11px] font-bold text-gray-500 gap-x-4 gap-y-1 uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><span className="text-red-500/70">#</span> {exercise.sets} Sets</span>
                                        <span className="flex items-center gap-1"><span className="text-red-500/70">&#8644;</span> {exercise.reps} Reps</span>
                                        <span className="flex items-center gap-1"><span className="text-red-500/70">&#9201;</span> {exercise.rest} Rest</span>
                                        </div>
                                    </div>
                                    </div>


                                </div>
                                );
                            })}

                            {/* Complete/Update Button */}
                            {day.exercises.length > 0 && (
                                <button
                                onClick={() => handleCompleteWorkout(day)}
                                disabled={isSubmitting}
                                className={`w-full mt-4 text-white p-5 rounded-2xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
                                  completedDaysList.includes(day.dayName)
                                  ? 'bg-green-600 hover:bg-green-700 shadow-[0_4px_20px_rgba(22,163,74,0.25)] border border-green-400/30'
                                  : 'bg-red-500 hover:bg-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.25)] border border-red-400/30'
                                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                <CheckCircle size={20} /> {isSubmitting ? 'Logging...' : (completedDaysList.includes(day.dayName) ? 'Update Log' : 'Complete Workout')}
                                </button>
                            )}
                        </div>
                        )}
                    </div>
                  );
              })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default WorkoutPlans;
