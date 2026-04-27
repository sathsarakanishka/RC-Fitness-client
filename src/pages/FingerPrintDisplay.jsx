import { useState, useEffect } from 'react';
import axios from 'axios';
import { Fingerprint, User, Activity, ShieldCheck, Mail, Phone, Calendar, Info } from 'lucide-react';
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

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="text-red-600 animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3d0000_0%,#000_60%)] opacity-30"></div>
            
            <div className="relative z-10 p-10 max-w-7xl mx-auto h-screen flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-16">
                    <div>
                        <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2">RC Fitness Security</p>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Access <span className="text-white/40">Terminal</span></h1>
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
                            <div className="w-24 h-24 bg-red-900/20 border border-red-900/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(185,28,28,0.1)]">
                                <Fingerprint size={48} className="text-red-600/40" />
                            </div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter italic text-white/20">Waiting for <br /> <span className="text-white/40">Scan...</span></h2>
                            <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.3em] mt-6">Place finger on scanner to identify</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col md:flex-row gap-10 animate-in slide-in-from-bottom-8 duration-700">
                        {/* Profile Section */}
                        <div className="flex-1 bg-[#080808] border border-white/10 p-1 w-full rounded-[40px] shadow-2xl">
                             <div className="bg-black h-full w-full rounded-[38px] p-10 flex flex-col">
                                <div className="flex flex-col items-center text-center mb-10">
                                    <div className="w-40 h-40 bg-gradient-to-tr from-red-600 to-red-900 rounded-full p-1 mb-6 shadow-2xl shadow-red-900/20">
                                        <div className="bg-black w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                                            <User size={80} className="text-gray-800" />
                                        </div>
                                    </div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-2">{latestScan.userId.fullName}</h2>
                                    <div className="flex items-center gap-4">
                                        <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full italic">
                                            {latestScan.userId.membershipType} Member
                                        </span>
                                        <span className={`px-4 py-1.5 border ${latestScan.userId.status === 'Active' ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'} text-[10px] font-black uppercase tracking-widest rounded-full italic`}>
                                            Status: {latestScan.userId.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <InfoCard icon={<ShieldCheck className="text-red-600" size={16} />} label="NIC" value={latestScan.userId.nic} />
                                    <InfoCard icon={<Mail className="text-red-600" size={16} />} label="Email" value={latestScan.userId.email} />
                                    <InfoCard icon={<Phone className="text-red-600" size={16} />} label="Mobile" value={latestScan.userId.phone || 'N/A'} />
                                    <InfoCard icon={<Calendar className="text-red-600" size={16} />} label="Scan Time" value={new Date(latestScan.scannedAt).toLocaleTimeString()} />
                                </div>
                             </div>
                        </div>

                        {/* Physical Stats / Secondary Info */}
                        <div className="w-full md:w-[400px] flex flex-col gap-6">
                            <div className="bg-[#111] border border-white/5 p-8 rounded-[40px] flex-1">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black uppercase italic tracking-tight">Physical <span className="text-white/40">Snapshot</span></h3>
                                    <Activity className="text-red-600" size={20} />
                                </div>
                                <div className="space-y-6">
                                    <StatBar label="Weight" value={latestScan.userId.physicalStats?.weight} unit="kg" max={150} color="red" />
                                    <StatBar label="Height" value={latestScan.userId.physicalStats?.height} unit="cm" max={220} color="gray" />
                                    <div className="pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-end">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Calculated BMI</p>
                                            <p className="text-4xl font-black italic tracking-tighter text-red-600">{latestScan.userId.physicalStats?.bmi || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-600 p-8 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-red-500 transition-all duration-300">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Access Control</p>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Unlock Turnstile</h3>
                                </div>
                                <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ArrowRight size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Loader2 = ({ className, size }) => (
    <Fingerprint className={`${className}`} size={size} />
);

const ArrowRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const InfoCard = ({ icon, label, value }) => (
    <div className="bg-[#111] p-5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</span>
        </div>
        <p className="font-bold text-sm truncate">{value}</p>
    </div>
);

const StatBar = ({ label, value, unit, max, color }) => (
    <div>
        <div className="flex justify-between items-end mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
            <p className="text-sm font-black uppercase tracking-tighter italic">{value} {unit}</p>
        </div>
        <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
            <div 
                className={`h-full ${color === 'red' ? 'bg-red-600' : 'bg-gray-700'} rounded-full transition-all duration-1000`} 
                style={{ width: `${(value / max) * 100}%` }}
            ></div>
        </div>
    </div>
);

export default FingerPrintDisplay;
