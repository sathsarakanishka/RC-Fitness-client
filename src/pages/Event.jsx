import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import EventScheduleModal from '../components/EventScheduleModal';
import { Calendar, Plus, Edit2, Trash2, Image as ImageIcon, MapPin, Clock, Tag, Megaphone, Users, Trophy, BookOpen } from 'lucide-react';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: '', location: '', description: '', image: '' });
  const [editEventId, setEditEventId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], category: 'General' });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchEventData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'auth-token': token } };
      const [eventsRes, annRes] = await Promise.all([
        axios.get('https://rc-fitness-backend.vercel.app/api/events'),
        axios.get('https://rc-fitness-backend.vercel.app/api/events/announcements/all')
      ]);
      setEvents(eventsRes.data);
      setAnnouncements(annRes.data);
    } catch (err) { console.error("Error fetching event data:", err); }
  };

  useEffect(() => { fetchEventData(); }, []);

  const eventStats = {
    totalEvents: events.length,
    activeNews: announcements.length,
    workshops: events.filter(e => e.type === 'Workshop').length,
    competitions: events.filter(e => e.type === 'Competition').length
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.type) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'auth-token': token } };
      if (editEventId) {
        const res = await axios.put(`https://rc-fitness-backend.vercel.app/api/events/update/${editEventId}`, newEvent, config);
        setEvents(events.map(ev => ev._id === editEventId ? res.data : ev));
        setEditEventId(null);
        showNotification('Event updated successfully');
      } else {
        await axios.post('https://rc-fitness-backend.vercel.app/api/events/add', newEvent, config);
        fetchEventData();
        showNotification('Event scheduled successfully');
      }
      setNewEvent({ title: '', date: '', time: '', type: '', location: '', description: '', image: '' });
      setIsFormVisible(false);
    } catch (err) {
      console.error("Error saving event:", err);
      showNotification('Failed to save event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/events/delete/${id}`, { headers: { 'auth-token': token } });
      showNotification('Event deleted successfully');
      fetchEventData();
    } catch (err) {
      console.error("Error deleting event:", err);
      showNotification('Failed to delete event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/events/announcements/add', newAnnouncement, { headers: { 'auth-token': token } });
      setNewAnnouncement({ title: '', content: '', date: new Date().toISOString().split('T')[0], category: 'General' });
      fetchEventData();
      showNotification('News published successfully');
    } catch (err) { console.error("Error adding announcement:", err); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/events/announcements/delete/${id}`, { headers: { 'auth-token': token } });
      fetchEventData();
      showNotification('Announcement removed');
    } catch (err) { console.error("Error deleting announcement:", err); }
  };

  return (
    <div className="flex bg-[#080808] min-h-screen text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 pt-24 lg:pt-12 relative overflow-hidden">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl border animate-in slide-in-from-right duration-300 shadow-lg flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-950/90 border-red-500 text-white' : 'bg-[#151111]/90 border-red-500/50 text-white'
            }`}>
            <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{notification.msg}</span>
          </div>
        )}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">Event Management</h1>
            <p className="text-gray-500 mt-1 text-[10px] font-bold uppercase tracking-widest">Manage Gym Events & Classes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-full lg:w-auto bg-[#080808] hover:bg-red-900/10 text-red-500 border border-red-900/30 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
            >
              Print Event Schedule
            </button>
            <button
              onClick={() => { setIsFormVisible(!isFormVisible); setEditEventId(null); setNewEvent({ title: '', date: '', time: '', type: '', location: '', description: '', image: '' }); }}
              className="w-full lg:w-auto bg-red-600 hover:bg-red-700 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95"
            >
              {isFormVisible ? 'Close Form' : <><Plus size={14} className="inline mr-2" /> Schedule Event</>}
            </button>
          </div>
        </header>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          <StatCard title="Total Events" value={eventStats.totalEvents} trend="Upcoming" icon={<Calendar />} colorClass="text-red-500" />
          <StatCard title="Active News" value={eventStats.activeNews} trend="Latest Updates" icon={<Megaphone />} colorClass="text-red-500" />
          <StatCard title="Workshops" value={eventStats.workshops} trend="Skill Building" icon={<BookOpen />} colorClass="text-red-500" />
          <StatCard title="Competitions" value={eventStats.competitions} trend="Special Events" icon={<Trophy />} colorClass="text-red-500" />
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('events')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'events' ? 'bg-red-600 text-white shadow-lg' : 'bg-[#080808] border border-gray-800 text-gray-400 hover:text-white'}`}>Events Schedule</button>
          <button onClick={() => setActiveTab('announcements')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'announcements' ? 'bg-red-600 text-white shadow-lg' : 'bg-[#080808] border border-gray-800 text-gray-400 hover:text-white'}`}>Latest News ({announcements.length})</button>
        </div>

        {activeTab === 'events' && (
          <>
            {isFormVisible && (
              <form onSubmit={handleSaveEvent} className="mb-12 bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest border-b border-gray-800 pb-4">
                  {editEventId ? 'Edit Event Details' : 'Create New Event'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Event Title</label>
                      <input type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Date</label>
                        <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Time</label>
                        <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Event Type</label>
                        <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400" required>
                          <option value="" disabled>Select Type</option>
                          <option value="Class">Fitness Class</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Competition">Competition</option>
                          <option value="Social">Social</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Location</label>
                        <input type="text" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" placeholder="e.g. Main Studio" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 mt-2">Event Description / Details</label>
                      <textarea value={newEvent.description || ''} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors h-24 resize-none" placeholder="Enter full event description..."></textarea>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Event Cover Image</label>
                    <div className="w-full h-full min-h-[150px] bg-black border-2 border-dashed border-gray-800 hover:border-red-600 rounded-xl flex flex-col items-center justify-center transition-colors relative overflow-hidden group">
                      {newEvent.image ? (
                        <>
                          <img src={newEvent.image} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="bg-red-600 text-white font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-lg">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-600 group-hover:text-red-500 transition-colors">
                          <ImageIcon size={32} className="mb-2" />
                          <span className="font-bold text-xs uppercase tracking-widest">Upload Cover</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase text-sm tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-red-900/20 active:scale-[0.98]"
                  >
                    {loading ? 'Processing...' : (editEventId ? 'Save Changes' : 'Schedule Event')}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div key={ev._id} className="bg-[#121212] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl group hover:border-gray-700 transition-all flex flex-col h-full">
                  <div className="relative h-48 bg-black overflow-hidden flex items-center justify-center border-b border-gray-900">
                    {ev.image ? (
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <ImageIcon size={48} className="text-gray-800" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-900/80 backdrop-blur-sm border border-red-800 text-red-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        {ev.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-black text-xl uppercase tracking-tight italic mb-4">{ev.title}</h3>

                    <div className="space-y-2 mb-6 text-gray-400 text-xs font-bold tracking-widest uppercase">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-red-500" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-red-500" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-red-500" />
                        <span>{ev.location || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-4 border-t border-gray-900">
                      <button onClick={() => { setEditEventId(ev._id); setNewEvent({ title: ev.title, date: ev.date, time: ev.time, type: ev.type, location: ev.location, description: ev.description || '', image: ev.image }); setIsFormVisible(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteEvent(ev._id)} className="flex-1 bg-red-900/20 hover:bg-red-600 hover:text-white text-red-500 border border-red-900/30 hover:border-red-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && !isFormVisible && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-900 rounded-3xl opacity-50">
                  <Calendar size={48} className="text-gray-700 mb-4" />
                  <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'announcements' && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <form onSubmit={handleSaveAnnouncement} className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8">
              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest border-b border-gray-800 pb-4">Create New Announcement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" required />
                <select value={newAnnouncement.category} onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })} className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400">
                  <option value="General">General News</option>
                  <option value="Event">Event Update</option>
                  <option value="Offer">Special Offer</option>
                </select>
              </div>
              <textarea placeholder="Announcement Content..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors h-32 resize-none mb-4" required></textarea>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl shadow-xl shadow-red-900/20 transition-all active:scale-95">Publish News</button>
            </form>

            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann._id} className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-700 transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-0.5 bg-red-900/20 text-red-500 border border-red-900/30 rounded text-[8px] font-black uppercase tracking-widest">{ann.category}</span>
                      <h4 className="font-bold text-lg">{ann.title}</h4>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">{new Date(ann.date).toLocaleDateString()} &bull; {ann.content.substring(0, 100)}...</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(ann._id)} className="p-3 bg-black rounded-xl text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-center py-10 text-gray-700 font-bold uppercase text-[10px] tracking-widest">No announcements published yet</p>}
            </div>
          </section>
        )}

        {showScheduleModal && (
          <EventScheduleModal
            events={events}
            onClose={() => setShowScheduleModal(false)}
          />
        )}

      </main>
    </div>
  );
};

export default Event;
