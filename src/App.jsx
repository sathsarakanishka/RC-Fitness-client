import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Staff from './pages/Staff';
import MemberProfile from './pages/MemberProfile';
import Finances from './modules/finance/Finances';
import Shop from './pages/Shop';
import Event from './pages/Event';

import PublicShop from './pages/PublicShop';
import PublicProduct from './pages/PublicProduct';
import PublicEvent from './pages/PublicEvent';
import PublicEventDetails from './pages/PublicEventDetails';
import PublicClasses from './pages/PublicClasses';

import WorkoutPlans from './pages/WorkoutPlans';
import DietPlans from './pages/DietPlans';
import Progress from './pages/Progress';
import Equipment from './pages/Equipment';
import Classes from './pages/Classes';
import AdminClass from './pages/AdminClass';
import MemberReviews from './pages/MemberReviews';
import Membership from './pages/Membership';

import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSidebar';

// ✅ Admin protection
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('userRole');
  return role === 'admin' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <CartSidebar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<MemberProfile />} />

          {/* Public Features */}
          <Route path="/store" element={<PublicShop />} />
          <Route path="/store/:id" element={<PublicProduct />} />
          <Route path="/events" element={<PublicEvent />} />
          <Route path="/events/:id" element={<PublicEventDetails />} />
          <Route path="/public-classes" element={<PublicClasses />} />

          <Route path="/workout-plans" element={<WorkoutPlans />} />
          <Route path="/diet-plans" element={<DietPlans />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/reviews" element={<MemberReviews />} />
          <Route path="/membership" element={<Membership />} />

          {/* Admin Protected */}
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/members" element={<AdminRoute><Members /></AdminRoute>} />
          <Route path="/staff" element={<AdminRoute><Staff /></AdminRoute>} />
          <Route path="/finances" element={<AdminRoute><Finances /></AdminRoute>} />
          <Route path="/shop" element={<AdminRoute><Shop /></AdminRoute>} />
          <Route path="/event" element={<AdminRoute><Event /></AdminRoute>} />
          <Route path="/equipment" element={<AdminRoute><Equipment /></AdminRoute>} />
          <Route path="/class" element={<AdminRoute><AdminClass /></AdminRoute>} />
        </Routes>

      </Router>
    </CartProvider>
  );
}

export default App;
