import { useState, useEffect } from 'react';
import axios from 'axios';
import { Fingerprint, User, Activity, Mail, Phone, Calendar, Info, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

const FingerPrintDisplay = () => {
    const [latestScan, setLatestScan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestScan = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/fingerprint/latest`);
                // Only update if it's a new scan (within last 30 seconds for demo)
                const scanTime = new Date(res.data.scannedAt).getTime();
                const now = new Date().getTime();
                
                if (now - scanTime < 30000) {
                    setLatestScan(res.data);
                } else {
                    setLatestScan(null);
                }
            } catch (err) {
                console.error("No scans found or error:", err);
                setLatestScan(null);
            } finally {
                setLoading(false);
            }
        };

        // Poll every 2 seconds
        const interval = setInterval(fetchLatestScan, 2000);
        return () => clearInterval(interval);
    }, []);

    const daysRemaining = latestScan?.userId?.membershipExpiry 
        ? Math.max(0, Math.ceil((new Date(latestScan.userId.membershipExpiry) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;
    const isAccessGranted = daysRemaining > 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-bold">
                LOADING TERMINAL...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 overflow-y-auto">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3d0000_0%,#000_60%)] opacity-30"></div>
            
            <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] mb-2">RC Fitness Security</p>
                        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic">Access <span className="text-white/40">Terminal</span></h1>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            System Online
                        </div>
                        <p className="text-gray-700 text-[10px] uppercase font-black tracking-widest mt-1">v2.4.0-BIOMETRIC</p>
                    </div>
                </div>

                {!latestScan ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-white/5 bg-[#050505]/50 backdrop-blur-3xl rounded-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-red-950/5 to-transparent"></div>
                        <div className="relative text-center animate-pulse">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-900/20 border border-red-900/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(185,28,28,0.1)]">
                                <Fingerprint size={48} className="text-red-600/40" />
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic text-white/20">Waiting for <br /> <span className="text-white/40">Scan...</span></h2>
                            <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.3em] mt-6">Place finger on scanner to identify</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-700">
                        {/* Profile Section */}
                        <div className="bg-[#080808] border border-white/10 p-1 w-full max-w-2xl rounded-[50px] shadow-2xl relative">
                             <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-pulse">
                                <Fingerprint size={48} className="text-white" />
                             </div>

                             <div className="bg-black h-full w-full rounded-[48px] p-12 sm:p-20 flex flex-col items-center text-center">
                                <p className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px] mb-8">Identification Successful</p>
                                
                                <h1 className="text-gray-500 text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2">Welcome Back,</h1>
                                <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter italic mb-10 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-tight lowercase first-letter:uppercase">
                                    {latestScan.userId.fullName}
                                </h2>

                                <div className="w-full h-px bg-white/5 mb-10"></div>

                                <div className="space-y-6 w-full">
                                    <div>
                                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Current Plan</p>
                                        <div className={`inline-block px-8 py-3 ${isAccessGranted ? 'bg-red-600' : 'bg-gray-800'} text-white text-xl font-black uppercase tracking-widest rounded-2xl italic shadow-[0_0_30px_rgba(220,38,38,0.2)]`}>
                                            {latestScan.userId.membershipType === 'None' ? 'Regular' : latestScan.userId.membershipType}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Membership Validity</p>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className={`${isAccessGranted ? 'bg-white/5 border-white/10' : 'bg-red-950/10 border-red-900/20'} border p-6 rounded-[32px] min-w-[140px]`}>
                                                <p className={`text-4xl sm:text-6xl font-black italic ${isAccessGranted ? 'text-white' : 'text-red-500'}`}>
                                                    {daysRemaining}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Days Remaining</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-16 ${isAccessGranted ? 'text-green-500' : 'text-red-500'} flex items-center gap-2 animate-pulse`}>
                                    {isAccessGranted ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">
                                        {isAccessGranted ? 'Verified Access Granted' : 'Access Denied: Plan Expired'}
                                    </span>
                                </div>
                             </div>
                        </div>

                        <div className={`mt-12 flex items-center gap-3 py-4 px-8 ${isAccessGranted ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.3)]'} border rounded-full transition-all duration-500`}>
                             {isAccessGranted ? <Activity size={16} className="text-red-600" /> : <Info size={16} />}
                             <span className="text-[10px] font-bold uppercase tracking-widest">
                                {isAccessGranted ? 'Turnstile Unlocked' : 'Contact Reception'}
                             </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FingerPrintDisplay;
