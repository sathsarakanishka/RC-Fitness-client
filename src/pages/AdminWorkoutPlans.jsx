import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Edit2, Trash2, X, Zap } from 'lucide-react';
import axios from 'axios';

const AdminWorkoutPlans = () => {
  const [members, setMembers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating/editing a workout plan
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    programName: '',
    week: 1,
    focus: 'General Fitness',
    days: []
  });

  const fetchUsersAndPlans = async () => {
    try {
      if (members.length === 0) setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers = { 'auth-token': token };

      // Fetch all members
      const { data: usersData } = await axios.get('http://localhost:5000/api/user/all', { headers });
      setMembers(usersData);

      // Fetch all existing workout plans
      const { data: plansData } = await axios.get('http://localhost:5000/api/workout-plans/all', { headers });
      setWorkoutPlans(plansData);

      // Fetch all workout logs to calculate completion dynamically
      const { data: historyData } = await axios.get('http://localhost:5000/api/workouts/all-history', { headers });
      setAllHistory(historyData);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndPlans();
    const interval = setInterval(() => {
      fetchUsersAndPlans();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getMemberStatus = (memberId, requested) => {
    const hasPlan = workoutPlans.some(plan => plan.userId === memberId);
    if (requested && hasPlan) return { label: 'Change Requested', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (requested) return { label: 'Requested', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (hasPlan) return { label: 'Active Plan', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    return { label: 'No Plan', color: 'text-gray-500', bg: 'bg-gray-800' };
  };

  const calculateMemberProgress = (memberId) => {
      const plan = workoutPlans.find(p => p.userId === memberId);
      if (!plan) return null;

      const currentWeekLogs = allHistory.filter(log => log.userId === memberId && log.programName === plan.programName && log.week === plan.week);
      
      let allCompletedExerciseNames = [];
      currentWeekLogs.forEach(log => {
          if (log.exercisesCompleted) {
              allCompletedExerciseNames = [...allCompletedExerciseNames, ...log.exercisesCompleted];
          }
      });
      const uniqueCompletedExercises = [...new Set(allCompletedExerciseNames)];
      const totalExercisesInPlan = plan.days.reduce((total, day) => total + day.exercises.length, 0);

      const percentage = totalExercisesInPlan > 0 ? Math.round((uniqueCompletedExercises.length / totalExercisesInPlan) * 100) : 0;
      return percentage > 100 ? 100 : percentage;
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    const existingPlan = workoutPlans.find(p => p.userId === user._id);
    if (existingPlan) {
      setEditingPlan(existingPlan);
      setFormData({
        programName: existingPlan.programName || '',
        week: existingPlan.week || 1,
        focus: existingPlan.focus || 'General Fitness',
        days: existingPlan.days || []
      });
    } else {
      setEditingPlan(null);
      setFormData({
        programName: 'Hypertrophy Phase 1',
        week: 1,
        focus: 'Strength & Size',
        days: [
          {
             dayName: 'Monday: Leg Day',
             exercises: [
                 { id: Date.now().toString(), name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '120s' }
             ]
          }
        ]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setEditingPlan(null);
  };

  const handleAddDay = () => {
    const newDay = {
        dayName: 'New Workout Day',
        exercises: []
    };
    setFormData(prev => ({ ...prev, days: [...prev.days, newDay] }));
  };

  const handleRemoveDay = (dayIndex) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        newDays.splice(dayIndex, 1);
        return { ...prev, days: newDays };
    });
  };

  const handleDayNameChange = (dayIndex, value) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        newDays[dayIndex].dayName = value;
        return { ...prev, days: newDays };
    });
  };

  const handleAddExercise = (dayIndex) => {
    const newExercise = {
        id: Date.now().toString() + Math.random().toString(),
        name: 'New Exercise',
        sets: 3,
        reps: '10-12',
        rest: '90s'
    };
    setFormData(prev => {
        const newDays = [...prev.days];
        newDays[dayIndex].exercises.push(newExercise);
        return { ...prev, days: newDays };
    });
  };

  const handleRemoveExercise = (dayIndex, exIndex) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        newDays[dayIndex].exercises.splice(exIndex, 1);
        return { ...prev, days: newDays };
    });
  };

  const handleExerciseChange = (dayIndex, exIndex, field, value) => {
    setFormData(prev => {
        const newDays = [...prev.days];
        newDays[dayIndex].exercises[exIndex][field] = value;
        return { ...prev, days: newDays };
    });
  };

  const handleSavePlan = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        userId: selectedUser._id,
        ...formData
      };

      await axios.post('http://localhost:5000/api/workout-plans/update', payload, {
        headers: { 'auth-token': token }
      });

      alert('Workout plan saved successfully!');
      handleCloseModal();
      fetchUsersAndPlans(); // Refresh lists
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Failed to save workout plan.');
    }
  };

  const handleDeletePlan = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/workout-plans/delete/${userId}`, {
        headers: { 'auth-token': token }
      });
      alert('Workout plan deleted.');
      fetchUsersAndPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white font-sans">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-10 lg:ml-64">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Workout Plan Management</h1>
          <p className="text-gray-500 text-sm">Manage member workout protocols and requests.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-red-500 animate-pulse">Loading members...</div>
        ) : (
          <div className="bg-[#111] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/50 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                    <th className="p-5 font-bold">Member Name</th>
                    <th className="p-5 font-bold">Email</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold">Progress</th>
                    <th className="p-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map(member => {
                    const status = getMemberStatus(member._id, member.workoutPlanRequested);
                    const hasPlan = workoutPlans.some(p => p.userId === member._id);
                    
                    return (
                      <tr key={member._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-5">
                          <div className="font-bold text-gray-200">{member.fullName}</div>
                        </td>
                        <td className="p-5 text-gray-400 text-sm">
                          {member.email}
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-5 w-48">
                          {hasPlan ? (
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Completion</span>
                                    <span className="text-[10px] text-red-500 font-bold">{calculateMemberProgress(member._id)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#1a1515] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${calculateMemberProgress(member._id)}%` }}></div>
                                </div>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(member)}
                              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                              title={hasPlan ? "Edit Plan" : "Create Plan"}
                            >
                              {hasPlan ? <Edit2 size={16} /> : <Plus size={16} />}
                            </button>
                            {hasPlan && (
                              <button 
                                onClick={() => handleDeletePlan(member._id)}
                                className="p-2 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors"
                                title="Delete Plan"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Creating / Editing Plan */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
             <div className="bg-[#1a1414] border border-red-900/30 rounded-2xl w-full max-w-4xl p-6 md:p-8 my-8 relative max-h-[90vh] flex flex-col">
               <button onClick={handleCloseModal} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                 <X size={24} />
               </button>
               
               <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white shrink-0">
                 {editingPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}
               </h2>
               <div className="mb-6 text-sm text-gray-400 shrink-0">
                 Member: <span className="font-bold text-white">{selectedUser?.fullName}</span>
               </div>

               <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Program Name</label>
                     <input 
                       type="text" 
                       value={formData.programName}
                       onChange={(e) => setFormData({...formData, programName: e.target.value})}
                       className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                       placeholder="e.g. Hypertrophy Phase 1"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Week</label>
                     <input 
                       type="number" 
                       value={formData.week}
                       onChange={(e) => setFormData({...formData, week: Number(e.target.value)})}
                       className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                       placeholder="e.g. 1"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Focus</label>
                     <input 
                       type="text" 
                       value={formData.focus}
                       onChange={(e) => setFormData({...formData, focus: e.target.value})}
                       className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                       placeholder="e.g. Strength & Size"
                     />
                   </div>
                 </div>

                 <div className="pt-4 border-t border-white/10">
                   <div className="flex items-center justify-between mb-4">
                     <label className="text-sm font-black uppercase tracking-widest text-white">Workout Days</label>
                     <button onClick={handleAddDay} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
                       <Plus size={14} /> Add Day
                     </button>
                   </div>
                   
                   <div className="space-y-6">
                     {formData.days.map((day, dayIndex) => (
                       <div key={dayIndex} className="bg-[#111] border border-white/5 p-4 md:p-6 rounded-xl relative">
                         <button onClick={() => handleRemoveDay(dayIndex)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
                           <Trash2 size={16} />
                         </button>
                         
                         <div className="mb-4 pr-8">
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Day Name</label>
                           <input 
                             type="text" 
                             value={day.dayName} 
                             onChange={(e) => handleDayNameChange(dayIndex, e.target.value)} 
                             className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-sm" 
                             placeholder="e.g. Monday: Leg Day" 
                           />
                         </div>

                         <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Exercises</label>
                                <button onClick={() => handleAddExercise(dayIndex)} className="text-[10px] text-blue-500 hover:text-blue-400 uppercase tracking-widest font-bold flex items-center gap-1">
                                    <Plus size={12} /> Add Exercise
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                {day.exercises.map((ex, exIndex) => (
                                    <div key={ex.id} className="grid grid-cols-12 gap-2 items-center bg-black/50 p-2 rounded-lg border border-white/5">
                                        <div className="col-span-12 md:col-span-4">
                                            <input type="text" value={ex.name} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)} placeholder="Exercise Name" className="w-full bg-transparent border-none text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 rounded p-1" />
                                        </div>
                                        <div className="col-span-4 md:col-span-2 flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500 uppercase">Sets</span>
                                            <input type="number" value={ex.sets} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'sets', Number(e.target.value))} className="w-full bg-transparent border-none text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 rounded p-1 text-center" />
                                        </div>
                                        <div className="col-span-4 md:col-span-2 flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500 uppercase">Reps</span>
                                            <input type="text" value={ex.reps} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)} className="w-full bg-transparent border-none text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 rounded p-1 text-center" placeholder="e.g. 10-12" />
                                        </div>
                                        <div className="col-span-3 md:col-span-3 flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500 uppercase">Rest</span>
                                            <input type="text" value={ex.rest} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'rest', e.target.value)} className="w-full bg-transparent border-none text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 rounded p-1 text-center" placeholder="e.g. 90s" />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button onClick={() => handleRemoveExercise(dayIndex, exIndex)} className="text-gray-600 hover:text-red-500 p-1">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {day.exercises.length === 0 && (
                                    <div className="text-center text-[10px] text-gray-600 py-2">No exercises added.</div>
                                )}
                            </div>
                         </div>
                       </div>
                     ))}
                     {formData.days.length === 0 && (
                       <div className="text-center py-6 text-gray-500 text-sm italic">No days added yet.</div>
                     )}
                   </div>
                 </div>
               </div>

               <div className="mt-6 pt-6 border-t border-white/5 flex justify-end gap-4 shrink-0">
                 <button onClick={handleCloseModal} className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-400 hover:text-white transition-colors">
                   Cancel
                 </button>
                 <button onClick={handleSavePlan} className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-900/50">
                   Save Protocol
                 </button>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminWorkoutPlans;
