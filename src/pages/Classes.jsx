import { useState, useEffect } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { Calendar, Bell, Clock, XCircle, BarChart2 } from 'lucide-react';
import axios from 'axios';

const Classes = () => {
  const [activeTab, setActiveTab] = useState('TODAY');
  const [bookings, setBookings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchBookings();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/classes', {
        headers: { 'auth-token': token }
      });
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/classes/bookings', {
        headers: { 'auth-token': token }
      });
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (cls) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/classes/book', {
        className: cls.name,
        time: cls.time,
        studioLocation: 'Main Studio'
      }, {
        headers: { 'auth-token': token }
      });
      fetchBookings();
      showNotification(`Booked ${cls.name} successfully!`);
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Failed to book class.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/classes/bookings/${id}`, {
        headers: { 'auth-token': token }
      });
      showNotification('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      console.error(err);
      showNotification('Failed to cancel booking', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white font-sans">
      <MemberSidebar />
      <div className="flex-1 p-6 lg:p-10 lg:ml-64 relative overflow-hidden">

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl border animate-in slide-in-from-right duration-300 shadow-lg flex items-center gap-3 ${
            notification.type === 'error' ? 'bg-red-950/90 border-red-500 text-white' : 'bg-[#151111]/90 border-red-500/50 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{notification.msg}</span>
          </div>
        )}

        {/* Subtle Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto pt-16 lg:pt-0 relative z-10">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <Calendar size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Available Sessions</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2 leading-none">Group Classes</h1>
              <p className="text-gray-400 text-sm tracking-wide">Book your spot in today's high-intensity training sessions.</p>
            </div>

            <div className="flex bg-[#111] border border-white/5 rounded-xl overflow-hidden p-1 shadow-inner">
              <button
                onClick={() => setActiveTab('TODAY')}
                className={`px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'TODAY' ? 'bg-[#221818] text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab('CALENDAR')}
                className={`px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'CALENDAR' ? 'bg-[#221818] text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                Calendar
              </button>
            </div>
          </header>

          {/* Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {classes.map((cls, idx) => (
              <div key={idx} className="bg-[#151111] border border-white/5 rounded-2xl overflow-hidden group hover:border-red-900/50 transition-colors flex flex-col">
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

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Intensity</p>
                      <p className={`text-[10px] font-black tracking-widest uppercase ${cls.intensityColor || 'text-red-500'}`}>{cls.intensity}</p>
                    </div>
                    <button
                      onClick={() => handleJoin(cls)}
                      disabled={loading}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)]"
                    >
                      {loading ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Grid: Upcoming Bookings & Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Upcoming Bookings */}
            <div className="xl:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Bell size={20} className="text-red-500" />
                <h2 className="text-xl font-bold tracking-wide text-white">My Upcoming Bookings</h2>
              </div>

              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-xs tracking-widest uppercase font-bold text-center py-6 border border-white/5 bg-[#151111] rounded-2xl">
                    No upcoming bookings.
                  </p>
                ) : bookings.map((booking) => (
                  <div key={booking._id} className="bg-[#151111] border border-red-900/20 rounded-2xl p-4 flex items-center justify-between group hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-900/30">
                        <Clock size={20} className="text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-gray-300 font-light tracking-wide text-lg mb-0.5">{booking.className}</h4>
                        <p className="text-gray-500 text-xs tracking-wide">Tomorrow at {booking.time} • {booking.studioLocation}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCancelBooking(booking._id)} 
                      disabled={loading}
                      className="text-gray-600 hover:text-red-500 disabled:opacity-30 p-2 transition-colors" 
                      title="Cancel Booking"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Statistics */}
            <div className="bg-[#151111] border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart2 size={20} className="text-red-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Class Statistics</h2>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">Monthly<br />Attendance</span>
                  <span className="text-xs font-black text-white uppercase tracking-widest text-right leading-tight">12 / 20<br />Sessions</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full w-[60%] shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="text-center w-1/2 border-r border-white/5 pr-4">
                  <span className="block text-2xl font-black text-white mb-1 tracking-tight">4.8k</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Calories Burnt</span>
                </div>
                <div className="text-center w-1/2 pl-4">
                  <span className="block text-2xl font-black text-red-500 mb-1 tracking-tight">18</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Hours Logged</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Classes;
