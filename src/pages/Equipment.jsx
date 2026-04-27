import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Bell, Package, AlertTriangle, CalendarDays, Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [equipmentList, setEquipmentList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEqForm, setNewEqForm] = useState({ id_tag: '', name: '', location: '', daysUntilService: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/equipment', {
        headers: { 'auth-token': token }
      });
      setEquipmentList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (eq) => {
    const newStatus = eq.status === 'WORKING' ? 'UNDER MAINTAINING' : 'WORKING';
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`https://rc-fitness-backend.vercel.app/api/equipment/${eq._id}`, { status: newStatus }, {
        headers: { 'auth-token': token }
      });
      showNotification(`Equipment marked as ${newStatus.toLowerCase()}`);
      fetchEquipment();
    } catch (err) {
      console.error(err);
      showNotification('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete equipment?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/equipment/${id}`, {
        headers: { 'auth-token': token }
      });
      showNotification('Equipment deleted successfully');
      fetchEquipment();
    } catch (err) {
      console.error(err);
      showNotification('Failed to delete equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!newEqForm.name || !newEqForm.location) {
      showNotification('Please fill in Name and Location', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/equipment', {
        id_tag: newEqForm.id_tag || "EQ-XXX",
        name: newEqForm.name,
        location: newEqForm.location,
        daysUntilService: Number(newEqForm.daysUntilService) || 30
      }, {
        headers: { 'auth-token': token }
      });
      showNotification('Equipment added successfully');
      setIsAdding(false);
      setNewEqForm({ id_tag: '', name: '', location: '', daysUntilService: '' });
      fetchEquipment();
    } catch (err) {
      console.error(err);
      showNotification('Failed to add equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipmentList.filter(eq => 
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.id_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEqProps = (eq) => {
    const isWorking = eq.status === 'WORKING';
    return {
      statusColor: isWorking ? 'text-green-500 bg-green-500' : 'text-red-500 bg-red-500',
      actionType: isWorking ? 'normal' : 'danger',
      actionText: isWorking ? 'SCHEDULE SERVICE' : 'MARK AS FIXED',
      countdownText: eq.daysUntilService > 0 ? `${eq.daysUntilService} Days` : `EXPIRED (${eq.daysUntilService} DAYS)`,
      countdownColor: eq.daysUntilService > 0 ? (eq.daysUntilService < 15 ? 'text-yellow-500' : 'text-white') : 'text-red-500',
      barWidth: eq.daysUntilService > 0 ? `${Math.min(100, (eq.daysUntilService / 90) * 100)}%` : null,
      barColor: eq.daysUntilService < 15 ? 'bg-yellow-500' : 'bg-green-500'
    };
  };

  const stats = [
    { label: 'TOTAL UNITS', value: equipmentList.length.toString(), change: '+2.4%', changeColor: 'text-green-500', icon: <Package size={20} className="text-red-500" /> },
    { label: 'UNDER MAINTENANCE', value: equipmentList.filter(e => e.status !== 'WORKING').length.toString(), change: '+15.0%', changeColor: 'text-red-500', icon: <AlertTriangle size={20} className="text-red-500" />, borderHighlight: true },
    { label: 'SERVICES (NEXT 7D)', value: equipmentList.filter(e => e.status === 'WORKING' && e.daysUntilService <= 7).length.toString(), change: '-5.2%', changeColor: 'text-yellow-500', icon: <CalendarDays size={20} className="text-red-500" /> }
  ];

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
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
            <div className="relative w-full max-w-sm bg-[#151111] rounded-2xl border border-red-900/40 p-6 z-10 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-light text-gray-200 tracking-wide uppercase">Add Equipment</h3>
                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID Tag</label>
                  <input type="text" placeholder="EQ-001" value={newEqForm.id_tag} onChange={e => setNewEqForm({ ...newEqForm, id_tag: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Name</label>
                  <input type="text" placeholder="Treadmill Matrix X1" value={newEqForm.name} onChange={e => setNewEqForm({ ...newEqForm, name: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Location</label>
                  <input type="text" placeholder="Cardio Zone • Floor 1" value={newEqForm.location} onChange={e => setNewEqForm({ ...newEqForm, location: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Days Until Service</label>
                  <input type="number" placeholder="90" value={newEqForm.daysUntilService} onChange={e => setNewEqForm({ ...newEqForm, daysUntilService: e.target.value })} className="w-full bg-[#0a0808] border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-red-500/50 mt-1" />
                </div>
                <button 
                  onClick={handleAddSubmit} 
                  disabled={loading}
                  className="w-full mt-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Plus size={16} />
                  )}
                  Save Equipment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">Equipment Maintenance</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                className="w-full bg-[#111] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-gray-300 outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            <button className="bg-[#111] border border-white/10 p-2.5 rounded-xl text-gray-400 hover:text-white transition-colors">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-[#151111] border ${stat.borderHighlight ? 'border-red-900/30' : 'border-white/5'} rounded-2xl p-6 relative`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tight">{stat.value}</span>
                <span className={`text-[10px] font-bold ${stat.changeColor}`}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* System-wide Maintenance Schedule Table */}
        <div className="bg-[#151111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 gap-4">
            <h2 className="text-base font-bold text-gray-200 tracking-wide">System-wide Maintenance Schedule</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)]"
            >
              <Plus size={14} /> Add Equipment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">ID</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest min-w-[200px]">Equipment Name</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest min-w-[200px]">Service Countdown</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Action</th>
                  <th className="py-5 px-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEquipment.map((eq, i) => {
                  const props = getEqProps(eq);
                  return (
                    <tr key={eq._id || i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-6 px-6 align-middle">
                        <span className={`text-xs font-bold ${props.actionType === 'danger' ? 'text-red-500' : 'text-gray-400'}`}>{eq.id_tag}</span>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-200 mb-0.5">{eq.name}</span>
                          <span className="text-[10px] font-medium text-gray-500">{eq.location}</span>
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${props.statusColor}`}></div>
                          <span className={`text-[10px] font-bold tracking-wider ${props.actionType === 'danger' ? 'text-red-500' : 'text-green-500'}`}>
                            {eq.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex flex-col gap-2">
                          <span className={`text-[11px] font-bold tracking-wide ${props.countdownColor}`}>{props.countdownText}</span>
                          {props.barWidth && (
                            <div className="w-full max-w-[120px] h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full ${props.barColor}`} style={{ width: props.barWidth }}></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle text-center">
                        <button
                          onClick={() => handleToggleStatus(eq)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all disabled:opacity-50 ${props.actionType === 'danger'
                              ? 'border-red-900/40 text-red-500 hover:bg-red-500/10'
                              : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          {props.actionText}
                        </button>
                      </td>
                      <td className="py-6 px-6 align-middle text-center">
                        <button onClick={() => handleDelete(eq._id)} className="text-gray-600 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[10px] text-gray-500 font-bold tracking-widest">Showing {filteredEquipment.length} of {equipmentList.length} units</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold">&lsaquo;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] text-xs font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold">&rsaquo;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Equipment;
