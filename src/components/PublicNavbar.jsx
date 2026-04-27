import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItems, toggleCart } = useCart();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Classes', path: '/public-classes' },
    { name: 'Events', path: '/events' },
    { name: 'Store', path: '/store' },
    { name: 'Membership', path: '/membership' }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-sm">
            <Dumbbell className="text-white" size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-white">RC Fitness</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <nav className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {navItems.map(item => (
              item.path === '#' ? (
                <a key={item.name} href="#" className="hover:text-white transition-colors">{item.name}</a>
              ) : (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`hover:text-white transition-colors ${
                    (item.path !== '/' && location.pathname.startsWith(item.path)) || (item.path === '/' && location.pathname === '/')
                      ? 'text-white border-b-2 border-red-600 pb-1' 
                      : ''
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>
          <div className="flex items-center gap-6 border-l border-gray-800 pl-6 ml-2">
            <button onClick={toggleCart} className="relative text-white hover:text-purple-500 transition-colors mt-1">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full leading-none shadow shadow-purple-900/50">{cartCount}</span>
              )}
            </button>
            <Link to="/login" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-sm text-white text-[10px] font-black uppercase tracking-widest transition-all">
              Login
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-b border-white/10 p-6 flex flex-col gap-6 text-center animate-in slide-in-from-top duration-300">
          {navItems.map(item => (
            item.path === '#' ? (
              <a key={item.name} href="#" className="text-white text-sm font-bold uppercase tracking-widest">{item.name}</a>
            ) : (
              <Link key={item.name} to={item.path} className="text-white text-sm font-bold uppercase tracking-widest">{item.name}</Link>
            )
          ))}
          <button onClick={() => { setIsMenuOpen(false); toggleCart(); }} className="text-white bg-purple-600 py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <ShoppingCart size={18} /> View Cart ({cartCount})
          </button>
          <Link to="/login" className="text-white bg-red-600 py-4 font-black uppercase tracking-widest">Login</Link>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
