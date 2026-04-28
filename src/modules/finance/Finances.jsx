import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

import ReceiptModal from '../../components/ReceiptModal';
import ImageModal from '../../components/ImageModal';
import { Plus, Trash2, Calendar, FileText, Edit2, TrendingUp, BarChart3, Users, ShoppingBag, Banknote, TrendingDown, Receipt, CheckCircle, X, Image as ImageIcon, Landmark } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Finances = () => {
  const [activeTab, setActiveTab] = useState('plans');

  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [jobRoles, setJobRoles] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Forms for Plans and Payments
  const [newPlan, setNewPlan] = useState({ name: '', price: '', duration: '', features: [] });
  const [newPayment, setNewPayment] = useState({ member: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Paid', duration: '', email: '', treadmillAccess: false, planName: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });

  // Edit states
  const [editPlanId, setEditPlanId] = useState(null);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editStaffId, setEditStaffId] = useState(null);
  const [editSalaryValue, setEditSalaryValue] = useState('');
  const [editJobRoleId, setEditJobRoleId] = useState(null);
  const [editJobRoleSalary, setEditJobRoleSalary] = useState('');

  // Receipt Modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'auth-token': token } };

      const [plansRes, paymentsRes, staffRes, productsRes, membersRes, payrollRes, expensesRes, jobRolesRes, shopOrdersRes] = await Promise.all([
        axios.get(`https://rc-fitness-backend.vercel.app/api/finance/plans`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/finance/payments`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/user/staff-all`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/shop/products`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/user/all`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/finance/payroll`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/finance/expenses`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/finance/job-roles`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/shop/orders`, config).catch(() => ({ data: [] }))
      ]);

      setPlans(plansRes.data || []);
      setPayments(paymentsRes.data || []);
      setStaff(staffRes.data || []);
      setProducts(productsRes.data || []);
      setMembers(membersRes.data || []);
      setPayroll(payrollRes.data || []);
      setExpenses(expensesRes.data || []);
      setJobRoles(jobRolesRes.data || []);
      setShopOrders(shopOrdersRes.data || []);
    } catch (err) { console.error("Error fetching finance data:", err); }
  };

  useEffect(() => { fetchFinanceData(); }, []);

  // --- CALCULATIONS ---
  const memberPaymentsIncome = useMemo(() => payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0), [payments]);
  const totalMemberPayments = useMemo(() => payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0), [payments]);
  
  const shopOrdersRevenue = useMemo(() => shopOrders.filter(o => o.status !== 'Cancelled').reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0), [shopOrders]);

  const recordedExpenses = useMemo(() => expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [expenses]);
  const paidPayroll = useMemo(() => payroll.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0), [payroll]);

  const totalExpenses = paidPayroll + recordedExpenses;
  const netProfit = (memberPaymentsIncome + shopOrdersRevenue) - totalExpenses;

  // --- CHART DATA PREPARATION ---
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const monthlyData = useMemo(() => {
    const data = months.map(m => ({ name: m, income: 0, expenses: 0 }));
    
    payments.forEach(p => {
      const month = new Date(p.date).getMonth();
      if (p.status === 'Paid') data[month].income += Number(p.amount) || 0;
    });

    shopOrders.forEach(o => {
      const month = new Date(o.createdAt).getMonth();
      if (o.status !== 'Cancelled') data[month].income += Number(o.totalAmount) || 0;
    });

    expenses.forEach(e => {
      const month = new Date(e.date).getMonth();
      data[month].expenses += Number(e.amount) || 0;
    });

    payroll.forEach(p => {
      const month = new Date(p.datePaid).getMonth();
      if (p.status === 'Paid') data[month].expenses += Number(p.amount) || 0;
    });

    return data;
  }, [payments, shopOrders, expenses, payroll]);

  const expenseCategoryData = useMemo(() => {
    const categories = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + (Number(e.amount) || 0);
    });
    if (paidPayroll > 0) categories['Payroll'] = paidPayroll;
    
    return Object.keys(categories).map(k => ({ name: k, value: categories[k] }));
  }, [expenses, paidPayroll]);

  const planDistributionData = useMemo(() => {
    const dist = {};
    payments.forEach(p => {
      const plan = p.planName || p.duration || 'Other';
      dist[plan] = (dist[plan] || 0) + 1;
    });
    return Object.keys(dist).map(k => ({ name: k, count: dist[k] }));
  }, [payments]);

  const COLORS = ['#dc2626', '#991b1b', '#7f1d1d', '#450a0a', '#ef4444', '#b91c1c'];

  // --- PLANS HANDLERS ---
  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price || !newPlan.duration) return;

    if (Number(newPlan.price) <= 0) {
      alert("Plan price must be greater than 0");
      return;
    }

    if (!editPlanId && plans.some(p => p.name.trim().toLowerCase() === newPlan.name.trim().toLowerCase())) {
      alert("A plan with this exact name already exists.");
      return;
    }

    const submittedPlan = { ...newPlan, price: Number(newPlan.price) };

    if (editPlanId) {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.put(`https://rc-fitness-backend.vercel.app/api/finance/plans/update/${editPlanId}`, submittedPlan, { headers: { 'auth-token': token } });
        setPlans(plans.map(p => (p._id || p.id) === editPlanId ? res.data : p));
        setEditPlanId(null);
        setNewPlan({ name: '', price: '', duration: '', features: [] });
      } catch (err) { console.error("Error updating DB:", err); }
    } else {
      const tempPlan = { ...submittedPlan, _id: Date.now() };
      setPlans(prev => [...prev, tempPlan]);
      setNewPlan({ name: '', price: '', duration: '', features: [] });
      try {
        const token = localStorage.getItem('authToken');
        await axios.post('https://rc-fitness-backend.vercel.app/api/finance/plans/add', submittedPlan, { headers: { 'auth-token': token } });
        fetchFinanceData();
      } catch (err) { console.error("Error adding to DB:", err); }
    }
  };
  const handleDeletePlan = async (id) => {
    setPlans(prev => prev.filter(p => (p._id || p.id) !== id));
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/finance/plans/delete/${id}`, { headers: { 'auth-token': token } });
      fetchFinanceData();
    } catch (err) { console.error("Error deleting from DB:", err); }
  };

  // --- PAYMENTS HANDLERS ---
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!newPayment.member || !newPayment.amount || !newPayment.date) return;

    if (Number(newPayment.amount) <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    const todayDateStr = new Date().toISOString().split('T')[0];
    if (newPayment.date > todayDateStr) {
      alert("Payment date cannot be in the future");
      return;
    }

    // Auto-fill email if they typed the name manually instead of selecting
    let userEmail = newPayment.email;
    if (!userEmail) {
      const foundMember = members.find(m => m.fullName.toLowerCase() === newPayment.member.toLowerCase());
      if (foundMember) {
        userEmail = foundMember.email;
      } else {
        alert("Please select a registered member from the list.");
        return;
      }
    }

    const submittedPayment = { ...newPayment, email: userEmail, amount: Number(newPayment.amount) };
    if (editPaymentId) {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.put(`https://rc-fitness-backend.vercel.app/api/finance/payments/update/${editPaymentId}`, submittedPayment, { headers: { 'auth-token': token } });
        setPayments(payments.map(p => (p._id || p.id) === editPaymentId ? res.data : p));
        setEditPaymentId(null);
        setNewPayment({ member: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Paid', duration: '', email: '', treadmillAccess: false, planName: '' });
      } catch (err) { console.error("Error updating DB:", err); }
    } else {
      const tempPayment = { ...submittedPayment, _id: Date.now() };
      setPayments(prev => [...prev, tempPayment]);
      setNewPayment({ member: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Paid', duration: '', email: '', treadmillAccess: false, planName: '' });
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.post('https://rc-fitness-backend.vercel.app/api/finance/payments/add', submittedPayment, { headers: { 'auth-token': token } });
        fetchFinanceData();

        const memberUser = members.find(m => m.fullName.toLowerCase() === newPayment.member.toLowerCase());
        if (memberUser && newPayment.planName) {
          await axios.put(`https://rc-fitness-backend.vercel.app/api/user/update/${memberUser._id}`, {
            membershipType: newPayment.planName,
            treadmillAccess: newPayment.treadmillAccess
          }, { headers: { 'auth-token': token } }).catch(e => console.error(e));
        }

        // Notify user about email status
        if (res.data.emailError) {
          alert("Payment recorded, but " + res.data.emailError);
        } else if (res.data.emailSent) {
          alert("Payment recorded and Invoice Email Sent Successfully!");
        }

      } catch (err) { console.error("Error adding to DB:", err); }
    }
  };
  const handleDeletePayment = async (id) => {
    setPayments(prev => prev.filter(p => (p._id || p.id) !== id));
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/finance/payments/delete/${id}`, { headers: { 'auth-token': token } });
      fetchFinanceData();
    } catch (err) { console.error("Error deleting from DB:", err); }
  };

  // --- STAFF SALARY HANDLER ---
  const handleUpdateSalary = async (id) => {
    if (!editSalaryValue) return;
    if (Number(editSalaryValue) < 0) {
      alert("Salary cannot be negative");
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put(`https://rc-fitness-backend.vercel.app/api/user/update/${id}`, { salary: Number(editSalaryValue) }, { headers: { 'auth-token': token } });
      setStaff(staff.map(s => s._id === id ? res.data : s));
      setEditStaffId(null);
      setEditSalaryValue('');
    } catch (err) { console.error("Error updating Staff Salary:", err); }
  };

  const handleUpdateJobRoleSalary = async (id) => {
    if (!editJobRoleSalary) return;
    if (Number(editJobRoleSalary) < 0) {
      alert("Base salary cannot be negative");
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put(`https://rc-fitness-backend.vercel.app/api/finance/job-roles/update/${id}`, { baseSalary: Number(editJobRoleSalary) }, { headers: { 'auth-token': token } });
      setJobRoles(jobRoles.map(r => r._id === id ? res.data : r));
      setEditJobRoleId(null);
      setEditJobRoleSalary('');
    } catch (err) { console.error("Error updating Job Role:", err); }
  };

  const handleProcessPayroll = async (staffMember) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const payrollData = {
      staffId: staffMember._id,
      staffName: staffMember.fullName,
      month: currentMonth,
      year: currentYear,
      amount: staffMember.salary || 0,
      status: 'Paid',
      datePaid: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/finance/payroll/add', payrollData, { headers: { 'auth-token': token } });
      fetchFinanceData();
      alert(`Salary for ${staffMember.fullName} for ${currentMonth} ${currentYear} recorded successfully!`);
    } catch (err) { console.error("Error recording payroll:", err); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (Number(newExpense.amount) <= 0) {
      alert("Expense amount must be greater than 0");
      return;
    }

    const todayDateStr = new Date().toISOString().split('T')[0];
    if (newExpense.date > todayDateStr) {
      alert("Expense date cannot be in the future");
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://rc-fitness-backend.vercel.app/api/finance/expenses/add', newExpense, { headers: { 'auth-token': token } });
      fetchFinanceData();
      setNewExpense({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) { console.error("Error adding expense:", err); }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/finance/expenses/delete/${id}`, { headers: { 'auth-token': token } });
      fetchFinanceData();
    } catch (err) { console.error("Error deleting expense:", err); }
  };

  const calculateRemainingDays = (paymentDate, durationText) => {
    if (!paymentDate || !durationText) return 0;
    const start = new Date(paymentDate);
    let daysToAdd = 30;
    if (durationText.toLowerCase().includes('3')) daysToAdd = 90;
    else if (durationText.toLowerCase().includes('12')) daysToAdd = 365;
    else if (durationText.toLowerCase().includes('6')) daysToAdd = 180;

    const expiry = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`https://rc-fitness-backend.vercel.app/api/shop/orders/${orderId}/status`, { status: newStatus }, { headers: { 'auth-token': token } });
      fetchFinanceData();
      alert(`Order status updated to ${newStatus}`);
    } catch (err) { console.error("Error updating order status:", err); }
  };

  const handleDownloadReport = () => {
    const headers = ['Member', 'Date', 'Duration', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...payments.map(p => `"${p.member}","${p.date}","${p.duration || 'N/A'}","${p.amount}","${p.status}"`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex bg-[#080808] min-h-screen text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 pt-24 lg:pt-12">
        <header className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">Financial Dashboard</h1>
          <p className="text-gray-500 mt-1 text-[10px] font-bold uppercase tracking-widest">Overview & Management</p>
        </header>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
          <StatCard title="Total Expenses" value={`LKR ${totalExpenses.toLocaleString()}`} trend="Net Out" icon={<TrendingDown />} colorClass="text-red-500" />
          <StatCard title="Net Profit" value={`LKR ${netProfit.toLocaleString()}`} trend="Total Profit/Loss" icon={<TrendingUp />} colorClass="text-red-500" />
          <StatCard title="Total Payments" value={`LKR ${totalMemberPayments.toLocaleString()}`} trend="Gross Revenue" icon={<ShoppingBag />} colorClass="text-red-500" />
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Monthly Revenue vs Expenses */}
          <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-red-500" size={24} />
                <h2 className="text-xl font-black uppercase italic tracking-wider">Revenue vs Expenses</h2>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#555" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#555" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#555" fontSize={10} fontWeight="bold" tickFormatter={(value) => `LKR ${value / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#080808', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="income" name="Revenue" stroke="#dc2626" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#555" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Expense Distribution */}
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest text-center">Expense Distribution</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#080808', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '10px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {expenseCategoryData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest text-center">Member Plan Reach</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#080808', border: '1px solid #333', borderRadius: '12px' }}
                      cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="count" name="Members" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[9px] text-center text-gray-600 mt-2 uppercase font-black tracking-widest">Active Plans Breakdown</p>
            </div>
          </div>
        </div>

        {/* Bottom Nav Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <button onClick={() => setActiveTab('plans')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'plans' ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'bg-[#080808] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
            <FileText size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Plans</span>
          </button>
          <button onClick={() => setActiveTab('salary')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'salary' ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'bg-[#080808] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
            <Users size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Payroll</span>
          </button>
          <button onClick={() => setActiveTab('expense')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'expense' ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'bg-[#080808] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
            <TrendingDown size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Expenses</span>
          </button>
          <button onClick={() => setActiveTab('payments')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'payments' ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'bg-[#080808] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
            <Banknote size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Payments</span>
          </button>
          <button onClick={() => setActiveTab('SOP')} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'SOP' ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'bg-[#080808] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
            <ImageIcon size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">SOP</span>
          </button>
        </div>

        {/* Dynamic Content Section */}
        <div className="mt-8">

          {/* PLANS */}
          {activeTab === 'plans' && (
            <section className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <FileText className="text-red-500" size={24} />
                <h2 className="text-2xl font-black uppercase italic tracking-wider">Membership Plans</h2>
              </div>

              <form onSubmit={handleAddPlan} className="mb-8 bg-black p-4 rounded-2xl border border-gray-800">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest">{editPlanId ? 'Edit Plan' : 'Add New Plan'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input type="text" required placeholder="Plan Name" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                  <input type="number" required placeholder="Price (LKR)" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                  <input type="text" required placeholder="Duration (e.g. 1 Month)" value={newPlan.duration} onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                </div>
                {/* FEATURES EDITOR */}
                <div className="mb-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2">Plan Features / Perks</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(newPlan.features || []).map((f, i) => (
                      <span key={i} className="flex items-center gap-1 bg-red-900/20 text-red-400 border border-red-900/30 px-3 py-1 rounded-full text-[10px] font-bold">
                        {f}
                        <button type="button" onClick={() => setNewPlan({ ...newPlan, features: newPlan.features.filter((_, idx) => idx !== i) })} className="text-red-700 hover:text-red-400 ml-1 font-black">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="feature-input"
                      type="text"
                      placeholder="Add a feature (e.g. Free parking)"
                      className="flex-1 bg-[#080808] border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val) { setNewPlan({ ...newPlan, features: [...(newPlan.features || []), val] }); e.target.value = ''; }
                        }
                      }}
                    />
                    <button type="button" onClick={() => {
                      const inp = document.getElementById('feature-input');
                      if (inp && inp.value.trim()) { setNewPlan({ ...newPlan, features: [...(newPlan.features || []), inp.value.trim()] }); inp.value = ''; }
                    }} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      + Add
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-700 mt-1 uppercase tracking-widest">Press Enter or click + Add to add a feature</p>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    {editPlanId ? <><Edit2 size={16} /> Update Plan</> : <><Plus size={16} /> Add Plan</>}
                  </button>
                  {editPlanId && (
                    <button type="button" onClick={() => { setEditPlanId(null); setNewPlan({ name: '', price: '', duration: '', features: [] }); }} className="bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs tracking-widest px-6 py-3 rounded-xl transition-all">Cancel</button>
                  )}
                </div>
              </form>

              <div className="space-y-4">
                {plans.map(plan => (
                  <div key={plan._id || plan.id} className="flex items-center justify-between bg-black p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
                    <div>
                      <h4 className="font-bold text-lg">{plan.name}</h4>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{plan.duration} &bull; <span className="text-red-500">LKR {plan.price}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditPlanId(plan._id || plan.id); setNewPlan({ name: plan.name, price: plan.price, duration: plan.duration, features: plan.features || [] }); }} className="p-3 bg-[#111] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button type="button" onClick={() => handleDeletePlan(plan._id || plan.id)} className="p-3 bg-[#111] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {plans.length === 0 && <p className="text-center text-gray-600 text-sm font-bold uppercase tracking-widest py-4">No plans available.</p>}
              </div>
            </section>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <section className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <Banknote className="text-red-500" size={24} />
                <h2 className="text-2xl font-black uppercase italic tracking-wider flex-1">Member Payments</h2>
                <button type="button" onClick={handleDownloadReport} className="bg-[#080808] hover:bg-red-600/10 text-red-500 border border-red-800 font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                  <FileText size={14} /> Generate Report
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="mb-8 bg-black p-4 rounded-2xl border border-gray-800">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest">{editPaymentId ? 'Edit Payment' : 'Record Payment'}</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Search Member..."
                      value={newPayment.member}
                      onChange={(e) => {
                        setNewPayment({ ...newPayment, member: e.target.value });
                        setShowMemberDropdown(true);
                      }}
                      onFocus={() => setShowMemberDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                      className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:border-red-600 transition-colors"
                    />
                    {showMemberDropdown && members.filter(m => m.fullName && m.fullName.toLowerCase().includes((newPayment.member || '').toLowerCase())).length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-[#111] border border-gray-800 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
                        {members.filter(m => m.fullName && m.fullName.toLowerCase().includes((newPayment.member || '').toLowerCase())).map(m => (
                          <div
                            key={m._id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setNewPayment({ ...newPayment, member: m.fullName, email: m.email });
                              setShowMemberDropdown(false);
                            }}
                            className="p-3 hover:bg-red-600/20 hover:text-red-500 cursor-pointer text-sm transition-colors border-b border-gray-800/50 last:border-0"
                          >
                            <p className="font-bold">{m.fullName}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{m.email} {m.membershipType ? `• ${m.membershipType}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <select
                    required
                    onChange={(e) => {
                      const selectedPlan = plans.find(p => String(p._id || p.id) === String(e.target.value));
                      if (selectedPlan) {
                        setNewPayment({ ...newPayment, planName: selectedPlan.name, amount: Number(selectedPlan.price) + (newPayment.treadmillAccess ? 500 : 0), duration: selectedPlan.duration });
                      }
                    }}
                    className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Plan</option>
                    {plans.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name} - LKR {p.price}</option>
                    ))}
                  </select>
                  <input type="number" required placeholder="Amount (LKR)" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" required value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400" />
                    <select required value={newPayment.status} onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400">
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="bg-red-900/5 border border-red-900/20 p-4 rounded-xl flex items-center justify-between col-span-1 xl:col-span-2">
                    <div>
                      <p className="text-sm font-black uppercase text-gray-400">Treadmill Access</p>
                      <p className="text-[10px] text-gray-600">+Rs. 500 / month</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-red-600 cursor-pointer"
                      checked={newPayment.treadmillAccess || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setNewPayment(prev => ({
                          ...prev,
                          treadmillAccess: isChecked,
                          amount: isChecked ? Number(prev.amount || 0) + 500 : Math.max(0, Number(prev.amount || 0) - 500)
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    {editPaymentId ? <><Edit2 size={16} /> Update Payment</> : <><Plus size={16} /> Record Payment</>}
                  </button>
                  {editPaymentId && (
                    <button type="button" onClick={() => { setEditPaymentId(null); setNewPayment({ member: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Paid', duration: '', email: '' }); }} className="bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs tracking-widest px-6 py-3 rounded-xl transition-all">Cancel</button>
                  )}
                </div>
              </form>

              <div className="space-y-4">
                {payments.map(payment => {
                  const remainingDays = calculateRemainingDays(payment.date, payment.duration);
                  const isExpiringSoon = remainingDays > 0 && remainingDays <= 7;
                  const isExpired = remainingDays === 0;

                  return (
                    <div key={payment._id || payment.id} className="flex flex-col md:flex-row md:items-center justify-between bg-black p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg">{payment.member}</h4>
                          {isExpired ? (
                            <span className="px-2 py-0.5 rounded-full border bg-red-900/20 text-red-500 border-red-900/30 text-[9px] font-black uppercase tracking-widest">Expired</span>
                          ) : isExpiringSoon ? (
                            <span className="px-2 py-0.5 rounded-full border bg-red-900/20 text-red-500 border-red-900/30 text-[9px] font-black uppercase tracking-widest">Expiring Soon</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full border bg-red-900/20 text-red-500 border-red-900/30 text-[9px] font-black uppercase tracking-widest">Active</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-2">
                          <span className="flex items-center gap-1"><Calendar size={12} className="text-gray-600" /> {payment.date}</span>
                          <span className="flex items-center gap-1"><FileText size={12} className="text-gray-600" /> {payment.duration || 'N/A'}</span>
                          <span className={`px-2 py-0.5 rounded-full border ${payment.status === 'Paid' ? 'bg-red-900/20 text-red-500 border-red-900/30' : 'bg-red-900/20 text-red-500 border-red-900/30'}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-gray-800 md:border-t-0">
                        <div className="flex flex-col items-start md:items-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Time Remaining</span>
                          <span className={`font-black text-2xl tracking-tighter italic ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-red-500' : 'text-red-500'}`}>
                            {remainingDays} <span className="text-[10px] uppercase font-bold tracking-widest not-italic">Days</span>
                          </span>
                        </div>
                        <div className="flex flex-col items-end pl-6 ml-2 border-l border-gray-800">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Amount</span>
                          <span className="text-red-500 font-bold block text-lg">LKR {payment.amount}</span>
                        </div>
                        <button onClick={() => { setEditPaymentId(payment._id || payment.id); setNewPayment({ member: payment.member, amount: payment.amount, date: payment.date, status: payment.status, duration: payment.duration || '' }); }} className="p-3 bg-[#111] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors ml-4">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeletePayment(payment._id || payment.id)} className="p-3 bg-[#111] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors ml-2">
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => { setSelectedPayment(payment); }} className="p-3 bg-[#111] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Receipt size={18} />
                        </button>
                        {selectedPayment && (
                          <ReceiptModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
                        )}
                      </div>
                    </div>
                  );
                })}
                {payments.length === 0 && <p className="text-center text-gray-600 text-sm font-bold uppercase tracking-widest py-4">No payments recorded.</p>}
              </div>
            </section>
          )}

          {/* STAFF SALARY (Fetched from Users) */}
          {activeTab === 'salary' && (
            <section className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-gray-800 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="text-red-500" size={24} />
                  <h2 className="text-2xl font-black uppercase italic tracking-wider">Payroll Management</h2>
                </div>
              </div>

              {/* Job Roles Management */}
              <div className="mb-8 bg-black p-5 rounded-2xl border border-gray-800">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2"><Edit2 size={12} /> Configure Base Salaries</h3>
                <div className="flex flex-wrap gap-4">
                  {jobRoles.map(r => (
                    <div key={r._id} className="flex-1 min-w-[200px] border border-gray-800 rounded-xl p-3 flex justify-between items-center bg-[#111]">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{r.roleName}</p>
                        {editJobRoleId === r._id ? (
                          <input type="number" value={editJobRoleSalary} onChange={e => setEditJobRoleSalary(e.target.value)} className="w-20 bg-black border border-red-900 focus:border-red-500 rounded p-1 text-sm text-red-500 font-bold outline-none mt-1" />
                        ) : (
                          <p className="text-sm font-black text-red-500">LKR {r.baseSalary.toLocaleString()}</p>
                        )}
                      </div>
                      {editJobRoleId === r._id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateJobRoleSalary(r._id)} className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-md"><CheckCircle size={14} /></button>
                          <button onClick={() => setEditJobRoleId(null)} className="bg-gray-800 hover:bg-gray-700 text-white p-1.5 rounded-md"><X size={14} /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditJobRoleId(r._id); setEditJobRoleSalary(r.baseSalary); }} className="text-gray-500 hover:text-red-500 p-2"><Edit2 size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {staff.map(s => {
                  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                  const currentMonth = months[new Date().getMonth()];
                  const currentYear = new Date().getFullYear();
                  const isPaid = payroll.some(p => p.staffId === s._id && p.month === currentMonth && p.year === currentYear);

                  return (
                    <div key={s._id} className="flex flex-col md:flex-row md:items-center justify-between bg-black p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg">{s.fullName}</h4>
                          <span className="px-2 py-0.5 rounded-full border bg-red-900/20 text-red-500 border-red-900/30 text-[9px] font-black uppercase tracking-widest">
                            {s.jobRole || s.shift || 'Staff'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">{s.email}</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-gray-800 md:border-t-0">
                        <div className="flex flex-col items-end px-4 border-l border-gray-800">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">{currentMonth} Salary</span>
                          {editStaffId === s._id ? (
                            <div className="flex items-center gap-2">
                              <input type="number" value={editSalaryValue} onChange={(e) => setEditSalaryValue(e.target.value)} className="bg-[#080808] border border-gray-800 rounded-xl px-2 py-1 text-sm focus:outline-none focus:border-red-600 w-24 text-red-500 font-bold" />
                              <button onClick={() => handleUpdateSalary(s._id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95">Save</button>
                            </div>
                          ) : (
                            <span className="text-red-500 font-bold block text-lg">LKR {(s.salary || 0).toLocaleString()}</span>
                          )}
                        </div>
                        {!editStaffId && (
                          <div className="flex gap-2">
                            <button onClick={() => { setEditStaffId(s._id); setEditSalaryValue(s.salary || 0); }} className="p-3 bg-[#111] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                              <Edit2 size={18} />
                            </button>
                            {isPaid ? (
                              <span className="flex items-center gap-2 px-4 py-3 bg-red-900/20 text-red-500 border border-red-900/30 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                                <CheckCircle size={14} /> Paid
                              </span>
                            ) : (
                              <button onClick={() => handleProcessPayroll(s)} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20">
                                Pay Salary
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12">
                <h3 className="text-[10px] font-black uppercase text-gray-600 mb-4 tracking-widest border-b border-gray-900 pb-4">Payment History</h3>
                <div className="space-y-3">
                  {payroll.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 bg-black/40 border border-gray-900 rounded-xl text-xs">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-900/10 p-2 rounded-lg text-red-500"><CheckCircle size={14} /></div>
                        <div>
                          <p className="font-bold">{p.staffName}</p>
                          <p className="text-gray-500 text-[10px] uppercase">{p.month} {p.year}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-300">LKR {p.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">{new Date(p.datePaid).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {payroll.length === 0 && <p className="text-center text-gray-700 py-10 uppercase text-[10px] font-bold tracking-widest">No transaction history found</p>}
                </div>
              </div>
            </section>
          )}

          {/* EXPENSES MANAGEMENT */}
          {activeTab === 'expense' && (
            <section className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <TrendingDown className="text-red-500" size={24} />
                <h2 className="text-2xl font-black uppercase italic tracking-wider">Gym Expenses</h2>
              </div>

              <form onSubmit={handleAddExpense} className="mb-8 bg-black p-4 rounded-2xl border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input type="text" required placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                  <input type="number" required placeholder="Amount (LKR)" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" />
                  <select required value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400">
                    <option value="" disabled>Category</option>
                    <option value="Rent">Rent</option>
                    <option value="Utility">Utility</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="date" required value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} className="bg-[#080808] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400" />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95">
                  Record Expense
                </button>
              </form>

              <div className="space-y-3">
                {expenses.map(exp => (
                  <div key={exp._id} className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-900/10 p-3 rounded-xl text-red-500 font-bold text-xs">{exp.category[0]}</div>
                      <div>
                        <p className="font-bold">{exp.description}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{exp.category} &bull; {exp.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-black text-red-500">- LKR {exp.amount.toLocaleString()}</span>
                      <button onClick={() => handleDeleteExpense(exp._id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SHOP REVENUE (Calculated from Sold Out Products) */}
          {activeTab === 'shop' && (
            <section className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-red-500" size={24} />
                  <h2 className="text-2xl font-black uppercase italic tracking-wider">Shop Sold-Out Revenue</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-black italic tracking-tighter text-red-500">
                    LKR {shopRevenue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {soldOutProducts.map(p => (
                  <div key={p._id || p.id} className="flex flex-col md:flex-row md:items-center justify-between bg-black p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg">{p.name || p.item}</h4>
                        <span className="px-2 py-0.5 rounded-full border bg-red-900/20 text-red-500 border-red-900/30 text-[9px] font-black uppercase tracking-widest">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-1">Status: <span className="text-red-500">SOLD OUT</span></p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-gray-800 md:border-t-0">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Added Date</span>
                        <span className="font-bold text-gray-400 block text-sm flex items-center gap-1"><Calendar size={12} /> {new Date(p.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col items-end px-4 border-l border-gray-800">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Amount</span>
                        <span className="text-red-500 font-bold block text-lg">+ LKR {(p.price || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {soldOutProducts.length === 0 && <p className="text-center text-gray-600 text-sm font-bold uppercase tracking-widest py-4">No sold out shop products recorded.</p>}
              </div>
            </section>
          )}

          {/* SOP - Shop Order Payments (Bank Slips) */}
          {activeTab === 'SOP' && (
            <section className="bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                <ImageIcon className="text-red-500" size={24} />
                <h2 className="text-2xl font-black uppercase italic tracking-wider">Shop Order Payments (SOP)</h2>
              </div>

              <div className="space-y-6">
                {shopOrders.filter(o => o.paymentMethod === 'Bank' || o.paymentMethod === 'Koko').map(order => (
                  <div key={order._id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
                    <div className="p-6 flex flex-col lg:flex-row gap-6">
                      {/* Receipt Image */}
                      <div className="w-full lg:w-48 h-64 lg:h-48 bg-[#080808] rounded-xl overflow-hidden border border-gray-800 group relative">
                        {order.receiptImage ? (
                          <>
                            {order.receiptImage.startsWith('data:application/pdf') ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-[#111] text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                                <FileText size={48} className="mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">PDF Document</span>
                              </div>
                            ) : (
                              <img src={order.receiptImage} alt="Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            )}
                            <button
                              onClick={() => setPreviewImage(order.receiptImage)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <span className="text-[10px] font-black uppercase bg-red-600 px-3 py-1.5 rounded">View Full</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                            <ImageIcon size={32} className="mb-2" />
                            <span className="text-[8px] font-bold uppercase">No Receipt Captured</span>
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight">{order.userName}</h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">{order.userEmail}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.status === 'Paid' ? 'border-green-900/30 bg-green-900/10 text-green-500' :
                            order.status === 'Pending' ? 'border-red-900/30 bg-red-900/10 text-red-500' : 'border-gray-800 bg-gray-900/50 text-gray-500'
                            }`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-1">Payment Method</p>
                            <p className="text-xs font-bold text-white flex items-center gap-2">
                              {order.paymentMethod === 'Bank' ? <Landmark size={12} className="text-red-500" /> : <ShoppingBag size={12} className="text-red-500" />}
                              {order.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-1">Total Amount</p>
                            <p className="text-sm font-black text-red-500 italic">LKR {(order.totalAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-1">Order Date</p>
                            <p className="text-xs font-bold text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest mb-1">Promo Code</p>
                            <p className="text-xs font-bold text-gray-400">{order.promoCode || 'None'}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status === 'Pending' && (
                          <div className="flex gap-3 pt-4 border-t border-gray-900">
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Paid')}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 active:scale-95"
                            >
                              <CheckCircle size={14} /> Approve Payment
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                              className="flex-1 bg-[#111] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {shopOrders.filter(o => o.paymentMethod === 'Bank' || o.paymentMethod === 'Koko').length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center border border-dashed border-gray-900 rounded-3xl opacity-50">
                    <ImageIcon size={48} className="text-gray-800 mb-4" />
                    <p className="text-gray-500 uppercase tracking-widest font-black text-xs">No Bank/Koko orders found.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'dashboard' && (
            <div className="flex flex-col items-center justify-center p-12 opacity-50 my-10 border-2 border-dashed border-gray-900 rounded-3xl">
              <span className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Select a module above to view details</span>
            </div>
          )}
        </div>
      </main>

      {previewImage && (
        <ImageModal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default Finances;
