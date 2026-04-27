import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const PromotionBanner = () => {
    const [activeSale, setActiveSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState({});
    const navigate = useNavigate();

    const calculateTimeLeft = (endDate) => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    useEffect(() => {
        const fetchPromo = async () => {
            try {
                const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/shop/promotions`);
                const promoSale = res.data
                    .filter(p => p.type === 'sale' && p.isActive && new Date(p.endDate) > new Date())
                    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];
                if (promoSale) {
                    setActiveSale(promoSale);
                    setTimeLeft(calculateTimeLeft(promoSale.endDate));
                }
            } catch (err) { console.error("Error fetching promotion:", err); }
        };
        fetchPromo();
    }, []);

    useEffect(() => {
        if (activeSale?.endDate) {
            const timer = setInterval(() => {
                const remaining = calculateTimeLeft(activeSale.endDate);
                setTimeLeft(remaining);
                if (Object.keys(remaining).length === 0) clearInterval(timer);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [activeSale]);

    if (!activeSale || Object.keys(timeLeft).length === 0) return null;

    return (
        <section className="px-6 py-4">
            <div className="max-w-7xl mx-auto bg-red-600 rounded-[2rem] p-6 lg:p-10 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-black/10 skew-x-12 translate-x-32 group-hover:translate-x-20 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-4 inline-block">Flash Sale Live</span>
                        <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white leading-none mb-2">{activeSale.title}</h2>
                        <p className="text-red-100 text-base font-bold uppercase tracking-widest">{activeSale.discountType === 'flat' ? `Flat Rs. ${activeSale.discountValue}` : `UP TO ${activeSale.discountValue}%`} OFF ON ALL PRODUCTS</p>
                    </div>

                    <div className="flex gap-4 lg:gap-6">
                        {[
                            { label: 'Days', value: timeLeft.days },
                            { label: 'Hours', value: timeLeft.hours },
                            { label: 'Mins', value: timeLeft.minutes },
                            { label: 'Secs', value: timeLeft.seconds }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 border border-white/10 group-hover:bg-black/40 transition-colors">
                                    <span className="text-xl lg:text-2xl font-black text-white">{String(item.value).padStart(2, '0')}</span>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-red-100">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="shrink-0">
                        <button 
                            onClick={() => navigate('/store')}
                            className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl active:scale-95"
                        >
                            Shop the Sale
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromotionBanner;
