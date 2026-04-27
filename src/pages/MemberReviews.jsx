import { useState, useEffect, useRef } from 'react';
import MemberSidebar from '../components/MemberSidebar';
import { Megaphone, Star, UploadCloud, SlidersHorizontal, Search, CheckCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const MemberReviews = () => {
  const [rating, setRating] = useState(4);
  const [story, setStory] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [reviewsList, setReviewsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const { data } = await axios.get('https://rc-fitness-backend.vercel.app/api/reviews', {
        headers: { 'auth-token': token }
      });
      setReviewsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/reviews/${id}`, {
        headers: { 'auth-token': token }
      });
      showNotification('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete review.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!story) {
      showNotification("Please write your story.", 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      // Fetch profile to get real name/membership duration
      const profileRes = await axios.get('https://rc-fitness-backend.vercel.app/api/user/me', {
        headers: { 'auth-token': token }
      });
      
      await axios.post('https://rc-fitness-backend.vercel.app/api/reviews', {
        name: profileRes.data.fullName,
        membershipDuration: profileRes.data.membershipType,
        rating,
        story,
        imageBase64,
        dateString: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
      }, {
        headers: { 'auth-token': token }
      });
      showNotification('Review submitted successfully! Thank you for sharing.');
      setStory('');
      setRating(5);
      setImageBase64('');
      fetchReviews();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || "Failed to submit review.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex bg-[#0d0a0a] min-h-screen text-white font-sans">
      <MemberSidebar />
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

        <div className="max-w-7xl mx-auto pt-16 lg:pt-0 relative z-10">

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-light uppercase tracking-tight text-white mb-2">Member Reviews</h1>
            <p className="text-gray-400 text-sm tracking-wide max-w-xl">Share your journey, inspire others, and showcase the results of your hard work within our elite community.</p>
          </header>

          {/* Review Submission Form */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 mb-16 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <Megaphone size={20} className="text-red-500" />
              <h2 className="text-xl font-bold tracking-wide text-white">Share Your Transformation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">

              {/* Left Column: Rating & Story */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={star <= rating ? "fill-red-500 text-red-500 shadow-sm" : "text-gray-600"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">Your Story</label>
                  <textarea
                    rows={6}
                    value={story}
                    onChange={e => setStory(e.target.value)}
                    placeholder="Tell us about your fitness journey, the challenges you faced, and the results you achieved..."
                    className="w-full bg-[#151111] border border-white/5 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-red-500/50 transition-colors resize-none placeholder:text-gray-600 leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Right Column: Photo Upload */}
              <div className="flex flex-col h-full">
                <label className="block text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">Transformation Photos</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="flex-1 border-2 border-dashed border-red-900/30 bg-[#151111] rounded-2xl flex flex-col items-center justify-center p-8 hover:border-red-500/50 hover:bg-red-500/5 transition-colors cursor-pointer group overflow-hidden relative"
                >
                  {imageBase64 ? (
                    <>
                      <img src={imageBase64} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2 border border-green-500/50 object-cover">
                          <CheckCircle size={24} className="text-green-500" />
                        </div>
                        <span className="text-white font-bold tracking-wide bg-black/50 px-3 py-1 rounded">Image Attached</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} className="text-red-500" />
                      </div>
                      <span className="text-white font-bold tracking-wide mb-2 block">Upload Photos</span>
                      <span className="text-gray-500 text-xs tracking-wide block mb-6 text-center">Drag and drop or click to browse</span>
                      <span className="text-[9px] font-bold uppercase text-gray-600 tracking-widest block">PNG, JPG up to 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end relative z-10">
              <button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)] disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>

          {/* Community Gallery Section */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">Community Gallery</h2>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors"><SlidersHorizontal size={20} /></button>
              <button className="text-gray-400 hover:text-white transition-colors"><Search size={20} /></button>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewsList.map((rev, i) => (
              <div key={rev._id || i} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-red-900/40 transition-colors flex flex-col group">
                {/* Photo */}
                <div className="h-48 overflow-hidden bg-[#151111]">
                  <img src={rev.imageBase64 || 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=2000&auto=format&fit=crop'} alt={rev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 mix-blend-luminosity" />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Rating Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold tracking-wide">{rev.name}</h3>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">{rev.membershipDuration}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={10} className={s <= rev.rating ? "fill-red-500 text-red-500" : "text-gray-700"} />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
                    "{rev.story}"
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">{rev.dateString || 'NEW MEMBER'}</span>
                    <div className="flex items-center gap-4">
                      <button className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:text-red-400 transition-colors">
                        Read Story
                      </button>
                      <button onClick={() => handleDelete(rev._id)} disabled={loading} className="text-gray-600 hover:text-red-500 disabled:opacity-30 transition-colors" title="Delete Review">
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

export default MemberReviews;
