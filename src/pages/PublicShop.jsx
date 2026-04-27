import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ShoppingBag, Filter, ArrowRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PromotionBanner from '../components/PromotionBanner';
import { useCart } from '../context/CartContext';

import { API_BASE_URL } from '../config';

const PublicShop = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/shop/products`);
        setProducts(res.data);
      } catch (err) { console.error("Error fetching products:", err); }
    };
    fetchProducts();
  }, []);

  const categories = ['All', 'WheyProtein', 'MassGainer', 'Creatine', 'PreWorkout', 'Other'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-red-600">
      <PublicNavbar />

      {/* Hero Strip */}
      <section className="pt-32 pb-12 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-3">RC Fitness Store</p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">RC Supplements</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em] mt-3">Fuel your performance</p>
          </div>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{filteredProducts.length} Products</p>
        </div>
      </section>

      <PromotionBanner />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">

        {/* Sidebar Filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="sticky top-28 border border-white/5 bg-[#111111] p-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
              <Filter size={14} /> Filters
            </h2>

            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-black border border-white/10 px-4 py-3 pl-10 text-sm focus:outline-none focus:border-red-600 transition-colors"
                />
                <Search size={16} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">Categories</label>
              <div className="flex flex-col gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left px-3 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all ${category === cat ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 opacity-50">
              <ShoppingBag size={48} className="text-gray-700 mb-4" />
              <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link
                  to={`/store/${product._id}`}
                  key={product._id}
                  className="bg-[#111111] border border-white/5 group hover:border-red-600/30 transition-all duration-500 flex flex-col h-full"
                >
                  <div className="relative h-64 bg-black overflow-hidden flex items-center justify-center p-6">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain opacity-90 group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <ShoppingBag size={48} className="text-gray-800" />
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col border-t border-white/5">
                    <p className="text-gray-600 text-[9px] uppercase font-black tracking-widest mb-2">{product.category}</p>
                    <h3 className="font-black text-lg uppercase tracking-tight italic mb-4 line-clamp-2 group-hover:text-red-500 transition-colors">{product.name}</h3>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-red-500 font-black text-xl">LKR {product.price.toLocaleString()}</p>
                      {product.stock > 0 && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 transition-all active:scale-95 shadow-lg"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default PublicShop;
