import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Fingerprint, Briefcase } from 'lucide-react';

const StaffModal = ({ close, refresh, staffMember }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', nic: '',
    shift: 'Morning (6:00 AM - 2:00 PM)',
    jobRole: 'Trainer',
    role: 'staff',
    backupPin: '',
    salary: 0
  });
  const [loading, setLoading] = useState(false);
  const [jobRoles, setJobRoles] = useState([]);

  useEffect(() => {
    if (staffMember) setFormData({ ...staffMember });
    fetchJobRoles();
  }, [staffMember]);

  const fetchJobRoles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('https://rc-fitness-backend.vercel.app/api/finance/job-roles', { headers: { 'auth-token': token } });
      setJobRoles(res.data);
      if (!staffMember && res.data.length > 0) {
        const defaultRole = res.data.find(r => r.roleName === 'Trainer') || res.data[0];
        setFormData(prev => ({ ...prev, jobRole: defaultRole.roleName, salary: defaultRole.baseSalary }));
      }
    } catch (err) { console.error(err); }
  };

  const handleRoleChange = (e) => {
    const selectedRoleName = e.target.value;
    const selectedRole = jobRoles.find(r => r.roleName === selectedRoleName);
    setFormData({
      ...formData,
      jobRole: selectedRoleName,
      salary: selectedRole ? selectedRole.baseSalary : formData.salary
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'auth-token': token } };

      if (staffMember) {
        await axios.put(`https://rc-fitness-backend.vercel.app/api/user/update/${staffMember._id}`, formData, config);
      } else {
        await axios.post('https://rc-fitness-backend.vercel.app/api/user/register', formData, config);
      }
      refresh(); close();
    } catch (err) { alert(err.response?.data || "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-[#0f0f0f] w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] md:rounded-[2.5rem] border border-red-900/20 shadow-2xl animate-in zoom-in duration-300 custom-scrollbar">

        <div className="p-6 md:p-8 border-b border-gray-900 flex justify-between items-center bg-[#141414] sticky top-0 z-10">
          <h2 className="text-white font-black uppercase tracking-widest text-lg md:text-xl">
            {staffMember ? 'Edit Staff Details' : 'Add Staff Member'}
          </h2>
          <button onClick={close} className="text-gray-600 hover:text-white transition-colors p-1"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

            {/* 1. Identity */}
            <div className="space-y-6">
              <h3 className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border-l-2 border-red-600 pl-3">1. Identity & Contact</h3>
              <InputGroup label="Full Name" val={formData.fullName} fn={(v) => setFormData({ ...formData, fullName: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="NIC / National ID" val={formData.nic} fn={(v) => setFormData({ ...formData, nic: v })} />
                <InputGroup label="Phone" val={formData.phone} fn={(v) => setFormData({ ...formData, phone: v })} />
              </div>
              <InputGroup label="Email Address" val={formData.email} type="email" fn={(v) => setFormData({ ...formData, email: v })} />
            </div>

            {/* 2. Access & Role */}
            <div className="space-y-6">
              <h3 className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border-l-2 border-red-600 pl-3">2. Base Salary & Access</h3>

              <div className="flex flex-col gap-1.5 border border-red-900/30 p-4 rounded-xl bg-red-900/5">
                <label className="text-[10px] text-red-500 font-bold uppercase ml-1 flex items-center gap-2"><Briefcase size={12} /> Job Role Configuration</label>
                <select value={formData.jobRole || ''} className="w-full bg-[#161616] border border-red-900/50 p-3.5 rounded-xl text-sm text-white outline-none focus:border-red-600 transition-colors" onChange={handleRoleChange}>
                  {jobRoles.map(r => (
                    <option key={r._id} value={r.roleName}>{r.roleName} - LKR {r.baseSalary.toLocaleString()}</option>
                  ))}
                  {jobRoles.length === 0 && <option>Loading...</option>}
                </select>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Salary Auto-Assigned: <span className="text-red-500 font-bold">LKR {(formData.salary || 0).toLocaleString()}</span></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase ml-1">Work Shift</label>
                  <select value={formData.shift} className="w-full bg-[#161616] border border-gray-800 p-3.5 rounded-xl text-sm text-white outline-none focus:border-red-600 transition-colors" onChange={(e) => setFormData({ ...formData, shift: e.target.value })}>
                    <option>Morning (6:00 AM - 2:00 PM)</option>
                    <option>Evening (2:00 PM - 10:00 PM)</option>
                    <option>Full Day (8:00 AM - 5:00 PM)</option>
                  </select>
                </div>
                <InputGroup label="4-Digit Backup PIN" val={formData.backupPin} type="password" isRed fn={(v) => setFormData({ ...formData, backupPin: v })} />
              </div>

              <div className="bg-black border border-dashed border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center text-gray-600 mt-4">
                <Fingerprint size={28} className="mb-2 text-red-900/50 animate-pulse" />
                <p className="text-[9px] uppercase font-bold tracking-widest text-center">Scanner Device Ready</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 pt-8 border-t border-gray-900 mt-8">
            <button type="button" onClick={close} className="w-full sm:w-auto text-gray-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors py-4">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-[0.2em] px-12 py-4 rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-95">
              {loading ? "Saving..." : "Save Staff Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, val, fn, type = "text", isRed }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className={`text-[10px] font-bold uppercase ml-1 ${isRed ? 'text-red-500' : 'text-gray-400'}`}>{label}</label>
    <input type={type} required value={val} className={`w-full bg-[#161616] border ${isRed ? 'border-red-900/30 tracking-[1em] text-center' : 'border-gray-800'} p-3.5 rounded-xl text-sm outline-none focus:border-red-600 transition-all text-white`} onChange={(e) => fn(e.target.value)} />
  </div>
);

export default StaffModal;
