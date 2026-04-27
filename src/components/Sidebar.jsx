import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BicepsFlexed , UserCheck, CreditCard, Dumbbell, Settings, LogOut, Menu, X, ShoppingBag, Calendar } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/dashboard' },
    { name: 'Members', icon: <Users size={20}/>, path: '/members' },
    { name: 'Staff', icon: <UserCheck size={20}/>, path: '/staff' },
    { name: 'Finances', icon: <CreditCard size={20}/>, path: '/finances' },
    { name: 'Shop', icon: <ShoppingBag size={20}/>, path: '/shop' },
    { name: 'Event', icon: <Calendar size={20}/>, path: '/event' },
    { name: 'Equipment', icon: <Dumbbell size={20}/>, path: '/equipment' },
    { name: 'Classes', icon: <BicepsFlexed size={20}/>, path: '/class' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 w-full bg-black border-b border-gray-900 p-4 flex justify-between items-center z-[60]">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-red-600" size={20} />
          <span className="font-black text-white italic uppercase tracking-tighter">RC Fitness</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 bg-gray-900 rounded-lg">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-900 p-6 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-10 mt-12 lg:mt-0">
          <div className="bg-red-600 p-2 rounded-lg"><Dumbbell className="text-white" size={24} /></div>
          <div>
            <h1 className="text-white font-black text-xl leading-tight italic uppercase">RC Fitness</h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                location.pathname === item.path ? 'bg-red-600/10 text-red-500 border-r-4 border-red-600' : 'text-gray-500 hover:text-white hover:bg-gray-900'
              }`}
            >
              {item.icon}
              <span className="font-bold uppercase text-[10px] tracking-widest">{item.name}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-4 p-3 text-gray-500 hover:text-red-500 transition-colors mt-auto w-full">
          <LogOut size={20} /><span className="font-bold uppercase text-[10px] tracking-widest">Logout</span>
        </button>
      </div>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
