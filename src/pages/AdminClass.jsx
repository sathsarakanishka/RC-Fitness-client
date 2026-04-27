import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar, Clock, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import axios from 'axios';

const AdminClass = () => {
  const [activeTab, setActiveTab] = useState('TODAY');
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'CORE',
    time: '08:00 AM - 09:00 AM',
    name: '',
    intensity: 'HIGH',
    intensityColor: 'text-red-500',
    bgImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchClasses();
    fetchBookings();
  }, []);

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

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setFormData(cls);
      setEditingId(cls._id);
    } else {
      setFormData({
        type: 'CORE',
        time: '',
        name: '',
        intensity: 'HIGH',
        intensityColor: 'text-red-500',
        bgImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop'
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.time || !formData.type) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (editingId) {
        await axios.put(`https://rc-fitness-backend.vercel.app/api/classes/${editingId}`, formData, {
          headers: { 'auth-token': token }
        });
        showNotification('Class updated successfully');
      } else {
        await axios.post('https://rc-fitness-backend.vercel.app/api/classes', formData, {
          headers: { 'auth-token': token }
        });
        showNotification('Class added successfully');
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Failed to save class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/classes/${id}`, {
        headers: { 'auth-token': token }
      });
      showNotification('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      console.error(err);
      showNotification('Failed to delete class', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white font-sans">
      <Sidebar />
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-[#151111] rounded-2xl border border-red-900/40 p-6 z-10 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-light text-gray-200 tracking-wide uppercase">{editingId ? 'Edit Class' : 'Add Class'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Name</label>
                  <input type="text" placeholder="ABS TRAINING" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Type (Category)</label>
                  <input type="text" placeholder="CORE" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Time</label>
                  <input type="text" placeholder="08:00 AM - 09:00 AM" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Intensity</label>
                  <input type="text" placeholder="HIGH" value={formData.intensity} onChange={e => setFormData({ ...formData, intensity: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 block">Class Image</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const reader = new FileReader();
                        reader.onload = (evt) => setFormData({ ...formData, bgImage: evt.target.result });
                        reader.readAsDataURL(e.dataTransfer.files[0]);
                      }
                    }}
                    className="relative border-2 border-dashed border-white/20 rounded-xl h-24 flex flex-col items-center justify-center text-center hover:border-red-500/50 transition-colors bg-[#0a0808] overflow-hidden group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const reader = new FileReader();
                          reader.onload = (evt) => setFormData({ ...formData, bgImage: evt.target.result });
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    {formData.bgImage && formData.bgImage.length > 0 ? (
                      <>
                        <img src={formData.bgImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#151111]/80 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2"><Upload size={14} /> Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center pointer-events-none z-10">
                        <Upload size={20} className="mb-2 opacity-50 group-hover:opacity-100 group-hover:text-red-500 transition-colors" />
                        <span className="text-[10px] uppercase font-bold tracking-widest group-hover:text-gray-300 transition-colors">Drag & Drop or Click</span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full mt-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingId ? 'Update Class' : 'Save Class'}
                </button>
              </div>
            </div>
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
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
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
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)]"
              >
                <Plus size={14} /> Add Class
              </button>
            </div>
          </header>

          {/* Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {classes.length === 0 ? (
              <p className="text-gray-500 text-xs tracking-widest uppercase font-bold col-span-full py-6 border border-white/5 bg-[#151111] rounded-2xl text-center">
                No classes available.
              </p>
            ) : classes.map((cls, idx) => (
              <div key={cls._id || idx} className="bg-[#151111] border border-white/5 rounded-2xl overflow-hidden group hover:border-red-900/50 transition-colors flex flex-col">
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

                  <div className="mb-4 bg-red-900/20 border border-red-500/20 px-3 py-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Students Joined</span>
                    <span className="text-sm font-black text-white">{bookings.filter(b => b.className === cls.name).length}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Intensity</p>
                      <p className={`text-[10px] font-black tracking-widest uppercase ${cls.intensityColor || 'text-red-500'}`}>{cls.intensity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(cls)} className="p-2 bg-[#111] hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/5">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cls._id)} className="p-2 bg-[#111] hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-white/5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminClass;
