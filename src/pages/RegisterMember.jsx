import { useState } from 'react';
import axios from 'axios';

function RegisterMember() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    nic: '',
    backupPin: '',
    role: 'member',
    weight: '',
    height: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate BMI automatically before sending
      const bmi = (formData.weight / ((formData.height / 100) ** 2)).toFixed(2);

      const payload = {
        ...formData,
        physicalStats: { weight: formData.weight, height: formData.height, bmi }
      };

      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/user/register', payload, {
        headers: { 'auth-token': token }
      });

      setMessage('Member Registered Successfully!');
      setFormData({ fullName: '', email: '', password: '', nic: '', backupPin: '', role: 'member', weight: '', height: '' });
    } catch (err) {
      setMessage(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-[#121212] rounded-2xl border border-gray-800 mt-10">
      <h2 className="text-2xl font-bold text-red-600 mb-6 uppercase">Register New Member</h2>
      {message && <p className="mb-4 text-sm text-green-500">{message}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="Full Name" className="p-3 bg-black border border-gray-800 rounded col-span-2" required
          value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />

        <input type="email" placeholder="Email" className="p-3 bg-black border border-gray-800 rounded" required
          value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

        <input type="text" placeholder="NIC Number" className="p-3 bg-black border border-gray-800 rounded" required
          value={formData.nic} onChange={(e) => setFormData({ ...formData, nic: e.target.value })} />

        <input type="password" placeholder="System Password" className="p-3 bg-black border border-gray-800 rounded" required
          value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

        <input type="text" placeholder="4-Digit Backup PIN" className="p-3 bg-black border border-gray-800 rounded" required maxLength="4"
          value={formData.backupPin} onChange={(e) => setFormData({ ...formData, backupPin: e.target.value })} />

        <input type="number" placeholder="Weight (kg)" className="p-3 bg-black border border-gray-800 rounded"
          value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />

        <input type="number" placeholder="Height (cm)" className="p-3 bg-black border border-gray-800 rounded"
          value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />

        <button type="submit" className="col-span-2 py-3 bg-red-600 hover:bg-red-700 font-bold rounded uppercase tracking-widest mt-4">
          Register Member
        </button>
      </form>
    </div>
  );
}

export default RegisterMember;
