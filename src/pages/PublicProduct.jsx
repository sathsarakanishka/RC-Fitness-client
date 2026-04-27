import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle, Dumbbell, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

const PublicProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/shop/products/${id}`);
        setProduct(res.data);
      } catch (err) { console.error("Error fetching product:", err); } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 text-sm font-black uppercase tracking-widest">Loading...</div>;
  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-sm font-black uppercase tracking-widest">Product Not Found</div>;

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-red-600">
      {/* Minimal Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-sm"><Dumbbell className="text-white" size={20} /></div>
            <span className="font-black text-xl tracking-tighter uppercase italic">RC Fitness</span>
          </Link>
          <Link to="/store" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors">
            <ArrowLeft size={16} /> Back to Store
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Image Section */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#111111] border border-white/5 p-10 min-h-[400px]">
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full max-h-[500px] object-contain drop-shadow-2xl animate-in zoom-in duration-700" />
            ) : (
              <ShoppingBag size={64} className="text-gray-800" />
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-8 border-b border-white/5 pb-8">
              <span className="inline-block px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-6 text-white drop-shadow-xl">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-black text-red-500 tracking-tight">LKR {product.price.toLocaleString()}</p>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-red-950/40 border border-red-900/30 px-3 py-1"><CheckCircle size={12} className="text-red-500" /> In Stock</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 border border-white/10 px-3 py-1"><XCircle size={12} /> Out of Stock</span>
                )}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Product Details</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {product.description || "No detailed description provided for this product. Contact front-desk for nutritional or usage inquiries."}
              </p>
            </div>

            <button
              onClick={() => addToCart(product)}
              className={`w-full py-5 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${product.stock > 0
                ? 'bg-red-600 hover:bg-red-700 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:-translate-y-1 active:scale-95 text-white'
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                }`}
              disabled={product.stock === 0}
            >
              <ShoppingCart size={20} /> {product.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}
            </button>
            <p className="text-center text-gray-700 text-[9px] font-bold uppercase tracking-widest mt-4">
              Online payments coming soon. Reserve in-person.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PublicProduct;
