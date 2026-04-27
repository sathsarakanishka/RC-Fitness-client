import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Activity, Fingerprint, CheckCircle2, Loader2 } from 'lucide-react';

const RegisterModal = ({ close, refresh, member }) => {
  const [formData, setFormData] = useState({
    nic: '', fullName: '', age: '', email: '', phone: '', address: '',
    weight: '', height: '', chest: '', bicep: '', backupPin: '', fingerprintId: ''
  });
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    if (member) {
        setFormData({ ...member, ...member.physicalStats });
        if (member.fingerprintId) setIsLinked(true);
    }
  }, [member]);

  const handleLinkFingerprint = async () => {
    if (!formData.fullName || !formData.email) {
        alert("Please enter Name and Email before linking fingerprint.");
        return;
    }

    setIsScanning(true);
    try {
        if (window.PublicKeyCredential) {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const publicKeyCredentialCreationOptions = {
                challenge: challenge,
                rp: { name: "RC Fitness", id: window.location.hostname },
                user: {
                    id: Uint8Array.from(Date.now().toString(), c => c.charCodeAt(0)),
                    name: formData.email,
                    displayName: formData.fullName,
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "required"
                },
                timeout: 60000,
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });

            // The credential.id is what we need to store
            setFormData({ ...formData, fingerprintId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))) });
            setIsLinked(true);
        } else {
            alert("Biometric hardware not detected or supported on this browser.");
        }
    } catch (err) {
        console.error("Fingerprint link error:", err);
        alert("Failed to link fingerprint: " + err.message);
    } finally {
        setIsScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'auth-token': token } };

      const payload = { ...formData };

      if (member) {
        await axios.put(`https://rc-fitness-backend.vercel.app/api/user/update/${member._id}`, payload, config);
      } else {
        await axios.post('https://rc-fitness-backend.vercel.app/api/user/register', payload, config);
      }
      refresh(); close();
    } catch (err) { alert(err.response?.data || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-[#0f0f0f] w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] md:rounded-[2.5rem] border border-red-900/20 shadow-2xl animate-in zoom-in duration-300 custom-scrollbar">

        <div className="p-6 md:p-8 border-b border-gray-900 flex justify-between items-center bg-[#141414] sticky top-0 z-10">
          <h2 className="text-red-600 font-black uppercase tracking-widest text-lg md:text-xl">
            {member ? 'Edit Member Profile' : 'Register New Member'}
          </h2>
          <button onClick={close} className="text-gray-600 hover:text-white transition-colors p-1"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Section 1: Personal */}
            <div className="space-y-5">
              <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] border-l-2 border-red-600 pl-3">1. Personal Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="NIC Number" val={formData.nic} fn={(v) => setFormData({ ...formData, nic: v })} />
                <InputGroup label="Full Name" val={formData.fullName} fn={(v) => setFormData({ ...formData, fullName: v })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputGroup label="Age" val={formData.age} type="number" fn={(v) => setFormData({ ...formData, age: v })} />
                <InputGroup label="Email" val={formData.email} type="email" fn={(v) => setFormData({ ...formData, email: v })} />
              </div>
              <InputGroup label="Phone" val={formData.phone} fn={(v) => setFormData({ ...formData, phone: v })} />
              <InputGroup label="Address" val={formData.address} fn={(v) => setFormData({ ...formData, address: v })} />
              <InputGroup label="4-Digit Backup PIN" val={formData.backupPin} type="password" fn={(v) => setFormData({ ...formData, backupPin: v })} isRed />
            </div>

            {/* Section 2: Physicals & Biometrics */}
            <div className="space-y-5">
              <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] border-l-2 border-red-600 pl-3">2. Health & Biometrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                <InputGroup label="Weight (kg)" val={formData.weight} type="number" fn={(v) => setFormData({ ...formData, weight: v })} />
                <InputGroup label="Height (cm)" val={formData.height} type="number" fn={(v) => setFormData({ ...formData, height: v })} />
                <InputGroup label="Chest (in)" val={formData.chest} type="number" fn={(v) => setFormData({ ...formData, chest: v })} />
                <InputGroup label="Bicep (in)" val={formData.bicep} type="number" fn={(v) => setFormData({ ...formData, bicep: v })} />
              </div>

              <div className={`mt-8 p-8 rounded-3xl border-2 border-dashed transition-all duration-500 ${isLinked ? 'border-green-500/30 bg-green-500/5' : 'border-red-600/20 bg-black'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLinked ? 'bg-green-500/20 text-green-500' : 'bg-red-600/10 text-red-600'}`}>
                        {isScanning ? <Loader2 className="animate-spin" size={24} /> : <Fingerprint size={24} />}
                    </div>
                    {isLinked && <CheckCircle2 className="text-green-500" size={24} />}
                </div>
                
                <h4 className="text-sm font-black uppercase tracking-tight italic mb-2">
                    {isLinked ? 'Fingerprint Linked' : 'Biometric Registration'}
                </h4>
                <p className="text-gray-500 text-[10px] leading-relaxed uppercase tracking-widest font-bold mb-6">
                    {isLinked ? 'Hardware identity successfully synced to database' : 'Register member fingerprint for automatic system entry'}
                </p>

                <button
                    type="button"
                    onClick={handleLinkFingerprint}
                    disabled={isScanning}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${isLinked ? 'bg-green-600/10 text-green-500 border border-green-500/20 hover:bg-green-600/20' : 'bg-[#111] text-red-600 border border-red-600/30 hover:bg-red-600/10'}`}
                >
                    {isScanning ? 'Scan in progress...' : isLinked ? 'Re-scan Fingerprint' : 'Link Fingerprint Hardware'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 sm:gap-6 mt-10 pt-8 border-t border-gray-900">
            <button type="button" onClick={close} className="w-full sm:w-auto text-gray-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors py-4">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-[0.2em] px-12 py-4 rounded-2xl shadow-xl shadow-red-900/20 transition-all active:scale-95">
              {loading ? "Processing..." : member ? "Update Member" : "Register Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, val, fn, type = "text", isRed }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className={`text-[10px] uppercase font-bold ml-1 ${isRed ? 'text-red-500' : 'text-gray-400'}`}>{label}</label>
    <input type={type} required value={val} className={`w-full bg-[#1a1a1a] border ${isRed ? 'border-red-900/30 tracking-[1em] text-center' : 'border-gray-800'} p-3.5 rounded-xl text-sm outline-none focus:border-red-600 transition-all text-white`} onChange={(e) => fn(e.target.value)} />
  </div>
);

export default RegisterModal;
