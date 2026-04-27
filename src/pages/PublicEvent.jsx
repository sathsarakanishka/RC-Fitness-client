import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, Filter, MapPin, Clock, ArrowRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import { API_BASE_URL } from '../config';

const PublicEvent = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/events`);
        setEvents(res.data);
      } catch (err) { console.error("Error fetching events:", err); }
    };
    fetchEvents();
  }, []);

  const categories = ['All', 'Class', 'Workshop', 'Competition', 'Social'];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || e.type === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-red-600">
      <PublicNavbar />

      {/* Hero Strip */}
      <section className="pt-32 pb-12 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-3">RC Fitness Events</p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">Classes & Events</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em] mt-3">Book your next session</p>
          </div>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{filteredEvents.length} Upcoming</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="sticky top-28 border border-white/5 bg-[#111111] p-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
              <Filter size={14} /> Filters
            </h2>

            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Search Event</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find classes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-black border border-white/10 px-4 py-3 pl-10 text-sm focus:outline-none focus:border-red-600 transition-colors"
                />
                <Search size={16} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Categories</label>
              <div className="flex flex-col gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left px-3 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all ${category === cat ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Events Grid */}
        <section className="flex-1">
          {filteredEvents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 opacity-50">
              <Calendar size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">No scheduled events right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map(event => (
                <Link
                  to={`/events/${event._id}`}
                  key={event._id}
                  className="bg-[#111111] border border-white/5 group hover:border-red-600/30 transition-all duration-500 flex flex-col h-full"
                >
                  <div className="relative h-52 bg-black overflow-hidden flex items-center justify-center border-b border-white/5 shrink-0">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <Calendar size={48} className="text-gray-800" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5">
                        {event.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-black text-xl uppercase tracking-tight italic mb-4 line-clamp-2 group-hover:text-red-500 transition-colors">{event.title}</h3>

                    <div className="space-y-2 mt-auto text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-red-600 flex-shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-red-600 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-red-600 flex-shrink-0" />
                        <span className="truncate">{event.location || 'RC Fitness Center'}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">View Details</span>
                      <ArrowRight size={14} className="text-red-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PublicEvent;
