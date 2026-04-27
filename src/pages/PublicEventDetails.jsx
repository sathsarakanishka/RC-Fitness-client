import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Dumbbell, Clock, MapPin, Users } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PublicEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [regData, setRegData] = useState({ userName: '', userEmail: '' });
  const [regStatus, setRegStatus] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/events/${id}`);
        setEvent(res.data);
      } catch (err) { console.error("Error fetching event:", err); } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setRegStatus(null);
    try {
      await axios.post(`https://rc-fitness-backend.vercel.app/api/events/register/${id}`, regData);
      setRegStatus('success');
      setRegData({ userName: '', userEmail: '' });
    } catch (err) {
      console.error("Registration error:", err);
      setRegStatus('error');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 text-sm font-black uppercase tracking-widest">Loading...</div>;
  if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-sm font-black uppercase tracking-widest">Event Not Found</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-red-600">
      {/* Minimal Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-sm"><Dumbbell className="text-white" size={20} /></div>
            <span className="font-black text-xl tracking-tighter uppercase italic">RC Fitness</span>
          </Link>
          <Link to="/events" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors">
            <ArrowLeft size={16} /> Back to Events
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Image */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#111111] border border-white/5 min-h-[400px] overflow-hidden">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover min-h-[400px] animate-in zoom-in duration-700" />
            ) : (
              <Calendar size={64} className="text-gray-800" />
            )}
          </div>

          {/* Details */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-8 border-b border-white/5 pb-8">
              <span className="inline-block px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest mb-4">
                {event.type}
              </span>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-6 text-white">
                {event.title}
              </h1>

              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-4 bg-[#111111] border border-white/5 p-4 text-sm font-bold tracking-widest uppercase">
                  <div className="bg-red-950/30 p-3"><Calendar className="text-red-600" size={22} /></div>
                  <div>
                    <span className="block text-gray-600 text-[9px] mb-1">Date</span>
                    <span className="text-white">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-[#111111] border border-white/5 p-4 text-[10px] font-bold tracking-widest uppercase">
                    <div className="bg-red-950/30 p-2"><Clock className="text-red-600" size={18} /></div>
                    <div>
                      <span className="block text-gray-600 text-[9px] mb-1">Time</span>
                      <span className="text-white">{event.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#111111] border border-white/5 p-4 text-[10px] font-bold tracking-widest uppercase">
                    <div className="bg-red-950/30 p-2"><MapPin className="text-red-600" size={18} /></div>
                    <div>
                      <span className="block text-gray-600 text-[9px] mb-1">Location</span>
                      <span className="text-white truncate max-w-[100px] lg:max-w-full block">{event.location || 'RC Fitness Center'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Event Details</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {event.description || "No specific details provided for this session. Contact front-desk for prerequisites."}
              </p>
            </div>

            {/* Registration Form */}
            <div className="bg-[#111111] border border-white/5 p-6 lg:p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6 flex items-center gap-2">
                <Users size={14} /> Reserve Your Spot Online
              </h3>

              {regStatus === 'success' ? (
                <div className="text-center py-6 animate-in zoom-in duration-300">
                  <div className="bg-red-950/20 text-red-400 p-4 border border-red-900/30 mb-4 font-bold text-sm">
                    ✓ Registration successful! Check your email for confirmation.
                  </div>
                  <button onClick={() => setRegStatus(null)} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Register another person</button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={regData.userName}
                      onChange={e => setRegData({ ...regData, userName: e.target.value })}
                      className="bg-black border border-white/10 px-4 py-4 text-sm focus:outline-none focus:border-red-600 transition-colors text-white"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={regData.userEmail}
                      onChange={e => setRegData({ ...regData, userEmail: e.target.value })}
                      className="bg-black border border-white/10 px-4 py-4 text-sm focus:outline-none focus:border-red-600 transition-colors text-white"
                    />
                  </div>

                  {regStatus === 'error' && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">Failed to register. Please try again.</p>}

                  <button
                    disabled={registering}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-5 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:-translate-y-1 active:scale-95"
                  >
                    {registering ? 'Validating...' : <><Users size={20} /> Confirm Registration</>}
                  </button>
                </form>
              )}

              <p className="text-center text-gray-700 text-[9px] font-bold uppercase tracking-widest mt-6 pb-2 border-b border-white/5">
                Instant confirmation via email. Secure your spot now.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PublicEventDetails;
