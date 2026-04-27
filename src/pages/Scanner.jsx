import { useState } from 'react';
import axios from 'axios';
import { Fingerprint, CheckCircle, AlertCircle, Loader2, ShieldCheck, Weight, Ruler, User as UserIcon, RefreshCcw } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Scanner = () => {
    const [status, setStatus] = useState('idle'); // idle, scanning, success, error
    const [message, setMessage] = useState('');
    const [identifiedUser, setIdentifiedUser] = useState(null);

    const handleScan = async () => {
        setStatus('scanning');
        setMessage('Initializing hardware scanner...');

        try {
            // Trigger native biometric prompt via WebAuthn (Identification Mode)
            if (window.PublicKeyCredential) {
                const challenge = new Uint8Array(32);
                window.crypto.getRandomValues(challenge);

                // For identification (Discoverable Credentials), we don't provide allowCredentials
                const publicKeyCredentialRequestOptions = {
                    challenge: challenge,
                    rpId: window.location.hostname,
                    userVerification: "required",
                    timeout: 60000,
                };

                // This triggers the native UI and looks for a match on the device
                const assertion = await navigator.credentials.get({
                    publicKey: publicKeyCredentialRequestOptions
                });

                // Convert rawId to base64 to match what we stored
                const fingerprintId = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));

                setMessage('Hardware verified. Identifying member...');
                
                // Identify user in backend
                const res = await axios.post(`${API_BASE_URL}/fingerprint/identify`, {
                    fingerprintId: fingerprintId
                });

                setStatus('success');
                setIdentifiedUser(res.data.user);
                setMessage(`Access Granted: ${res.data.user.fullName}`);
                
                // Do not auto-reset, let the user see the details and click "Scan Another"
            } else {
                throw new Error("Biometric scanning not supported on this browser.");
            }
        } catch (err) {
            console.error("Scanning error:", err);
            setStatus('error');
            setMessage(err.response?.data?.msg || err.message || "Identification failed.");
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center font-sans overflow-hidden">
            <div className="absolute inset-0 bg-[#080000] opacity-30">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10 max-w-md w-full">
                <div className="text-center mb-16">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(220,38,38,0.3)] animate-in slide-in-from-top-8 duration-700">
                        <Fingerprint size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">Automatic <span className="text-white/40">Identification</span></h1>
                    <p className="text-gray-500 text-[10px] mt-3 uppercase tracking-[0.4em] font-bold">Secure Biometric Entry</p>
                </div>

                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-12 rounded-[50px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-500">
                    {status === 'idle' ? (
                        <>
                            <div className="w-40 h-40 rounded-full border-2 border-dashed border-red-600/20 flex items-center justify-center mb-10 group cursor-pointer hover:border-red-600/40 transition-colors" onClick={handleScan}>
                                <div className="w-32 h-32 bg-red-600/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Fingerprint size={64} className="text-red-600" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight mb-4">Device Ready</h2>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black leading-relaxed max-w-[200px]">
                                Tap the icon or button below to begin identification
                            </p>
                            <button
                                onClick={handleScan}
                                className="w-full mt-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-95"
                            >
                                Start Scan
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 w-full">
                            <div className="relative mb-6">
                                {status === 'scanning' && (
                                    <>
                                        <div className="w-24 h-24 border-4 border-red-600/20 rounded-full animate-ping absolute inset-0"></div>
                                        <div className="w-24 h-24 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center relative">
                                            <Loader2 className="text-red-600 animate-spin" size={32} />
                                        </div>
                                    </>
                                )}
                                {status === 'success' && (
                                    <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                                        <CheckCircle className="text-green-500 animate-in zoom-in duration-500" size={32} />
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                                        <AlertCircle className="text-red-500 animate-in shake duration-500" size={32} />
                                    </div>
                                )}
                            </div>
                            
                            <h2 className={`text-xl font-black uppercase italic tracking-tighter ${status === 'error' ? 'text-red-500' : status === 'success' ? 'text-green-500' : 'text-white'}`}>
                                {status === 'scanning' ? 'Scanning...' : status === 'success' ? 'Identified' : 'Failed'}
                            </h2>
                            <p className="text-gray-500 text-[9px] uppercase tracking-widest font-black mt-2 mb-6 max-w-[240px] leading-relaxed">
                                {message}
                            </p>

                            {status === 'success' && identifiedUser && (
                                <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic border border-red-400/20 uppercase">
                                                {identifiedUser.fullName[0]}
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-black uppercase italic leading-none truncate max-w-[180px]">{identifiedUser.fullName}</h3>
                                                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">{identifiedUser.membershipType} Member</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-left">
                                            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <ShieldCheck size={10} className="text-red-600" />
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">NIC</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-white tracking-widest">{identifiedUser.nic}</p>
                                            </div>
                                            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Activity size={10} className="text-red-600" />
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">BMI</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-white">{identifiedUser.physicalStats?.bmi || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex gap-2">
                                            <div className="flex-1 bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Weight size={12} className="text-gray-600" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">WT</span>
                                                </div>
                                                <p className="text-[10px] font-black">{identifiedUser.physicalStats?.weight}kg</p>
                                            </div>
                                            <div className="flex-1 bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Ruler size={12} className="text-gray-600" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">HT</span>
                                                </div>
                                                <p className="text-[10px] font-black">{identifiedUser.physicalStats?.height}cm</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setStatus('idle');
                                            setIdentifiedUser(null);
                                            setMessage('');
                                        }}
                                        className="w-full py-4 bg-[#111] hover:bg-[#1a1a1a] text-red-600 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-red-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={14} /> Scan Another
                                    </button>
                                </div>
                            )}

                            {status === 'error' && (
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="w-full mt-4 py-4 bg-[#111] text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border border-white/5 transition-all"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-700 text-[9px] uppercase font-bold tracking-widest">
                        RC Fitness Biometric Security Node
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
