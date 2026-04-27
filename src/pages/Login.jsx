import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('https://rc-fitness-backend.vercel.app/api/user/login', { email, password });

      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('userRole', res.data.role);

      // Strict Role-Based Routing
      if (res.data.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }

    } catch (err) {
      setError(err.response?.data || 'Login Failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen font-sans bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Dark overlay to make the form pop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <form onSubmit={handleLogin} className="relative bg-black/60 p-10 rounded-3xl border border-gray-800 w-[400px] shadow-2xl backdrop-blur-md">
        <h1 className="text-4xl font-black text-red-600 text-center uppercase tracking-tighter mb-2 italic">RC FITNESS</h1>
        <p className="text-gray-400 text-center text-[10px] mb-8 tracking-[0.3em] uppercase font-bold">Secure Access Portal</p>

        {error && <div className="bg-red-900/40 border border-red-600 text-red-200 p-3 rounded-lg text-xs text-center mb-6 font-medium">{error}</div>}

        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-400 uppercase font-bold ml-1 tracking-widest">Email Address</label>
            <input type="email" required className="w-full p-4 bg-black/50 border border-gray-700 rounded-xl focus:border-red-600 outline-none transition-all text-sm text-white" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] text-gray-400 uppercase font-bold ml-1 tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-4 bg-black/50 border border-gray-700 rounded-xl focus:border-red-600 outline-none transition-all text-sm text-white pr-12"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase text-xs tracking-[0.2em] mt-6">
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
