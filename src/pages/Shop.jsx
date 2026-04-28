import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { API_BASE_URL } from '../config';
import InventoryReportModal from '../components/InventoryReportModal';
import OrdersReportModal from '../components/OrdersReportModal';
import { ShoppingBag, Plus, Edit2, Trash2, Image as ImageIcon, Tag, Package, CheckCircle, DollarSign, ListOrdered, AlertTriangle, Download, Power } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '', description: '', images: [] });
  const [editProductId, setEditProductId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOrdersReport, setShowOrdersReport] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [orders, setOrders] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [editPromoId, setEditPromoId] = useState(null);
  const [newPromo, setNewPromo] = useState({
    type: 'code',
    code: '',
    title: '',
    discountValue: '',
    discountType: 'percentage',
    userLimit: '',
    endDate: '',
    isActive: true
  });

  const fetchShopData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const config = { headers: { 'auth-token': token } };
      const [productsRes, ordersRes, promosRes] = await Promise.all([
        axios.get(`https://rc-fitness-backend.vercel.app/api/shop/products`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/shop/orders`, config).catch(() => ({ data: [] })),
        axios.get(`https://rc-fitness-backend.vercel.app/api/shop/promotions`, config).catch(() => ({ data: [] }))
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setPromotions(promosRes.data);
    } catch (err) { console.error("Error fetching shop data:", err); }
  };

  const shopStats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Delivered').reduce((acc, o) => acc + (o.totalAmount || 0), 0),
    outOfStock: products.filter(p => p.stock === 0).length
  };

  useEffect(() => { fetchShopData(); }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, images: [reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;

    const submittedProduct = {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock)
    };

    try {
      const token = localStorage.getItem('authToken');
      if (editProductId) {
        const res = await axios.put(`https://rc-fitness-backend.vercel.app/api/shop/products/update/${editProductId}`, submittedProduct, { headers: { 'auth-token': token } });
        setProducts(products.map(p => p._id === editProductId ? res.data : p));
        setEditProductId(null);
      } else {
        await axios.post(`https://rc-fitness-backend.vercel.app/api/shop/products/add`, submittedProduct, { headers: { 'auth-token': token } });
        fetchShopData();
      }
      setNewProduct({ name: '', category: '', price: '', stock: '', description: '', images: [] });
      setIsFormVisible(false);
    } catch (err) { console.error("Error saving product:", err); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`https://rc-fitness-backend.vercel.app/api/shop/orders/${orderId}/status`, { status }, { headers: { 'auth-token': token } });
      fetchShopData();
    } catch (err) { console.error("Error updating order status:", err); }
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const promoToSubmit = { ...newPromo };
      if (!promoToSubmit.startDate && promoToSubmit.type === 'sale') {
        promoToSubmit.startDate = today;
      }

      // Ensure dates are midnight-aligned if provided
      if (promoToSubmit.endDate) {
        const end = new Date(promoToSubmit.endDate);
        end.setHours(23, 59, 59, 999);
        promoToSubmit.endDate = end;
      }

      if (editPromoId) {
        await axios.put(`https://rc-fitness-backend.vercel.app/api/shop/promotions/update/${editPromoId}`, promoToSubmit, { headers: { 'auth-token': token } });
        setEditPromoId(null);
      } else {
        await axios.post(`https://rc-fitness-backend.vercel.app/api/shop/promotions/add`, promoToSubmit, { headers: { 'auth-token': token } });
      }
      setNewPromo({
        type: 'code',
        code: '',
        title: '',
        discountValue: '',
        discountType: 'percentage',
        userLimit: '',
        endDate: '',
        isActive: true
      });
      fetchShopData();
    } catch (err) { console.error("Error saving promo:", err); }
  };

  const handleTogglePromo = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`https://rc-fitness-backend.vercel.app/api/shop/promotions/toggle/${id}`, {}, { headers: { 'auth-token': token } });
      fetchShopData();
    } catch (err) { console.error("Error toggling promo:", err); }
  };

  const handleDeletePromo = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/shop/promotions/delete/${id}`, { headers: { 'auth-token': token } });
      fetchShopData();
    } catch (err) { console.error("Error deleting promo:", err); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://rc-fitness-backend.vercel.app/api/shop/products/delete/${id}`, { headers: { 'auth-token': token } });
      fetchShopData();
    } catch (err) { console.error("Error deleting product:", err); }
  };

  return (
    <div className="flex bg-[#080808] min-h-screen text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-12 lg:ml-64 pt-24 lg:pt-12">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight italic">Shop Inventory</h1>
            <p className="text-gray-500 mt-1 text-[10px] font-bold uppercase tracking-widest">Manage Products & Details</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full lg:w-auto bg-[#111] hover:bg-red-900/20 text-red-500 border border-red-900/30 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
            >
              Generate Stock Report
            </button>
            <button
              onClick={() => { setIsFormVisible(!isFormVisible); setEditProductId(null); setNewProduct({ name: '', category: '', price: '', stock: '', description: '', images: [] }); }}
              className="w-full lg:w-auto bg-red-600 hover:bg-red-700 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95"
            >
              {isFormVisible ? 'Close Form' : <><Plus size={14} className="inline mr-2" /> Add Product</>}
            </button>
          </div>
        </header>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          <StatCard title="Total Products" value={shopStats.totalProducts} trend="In Inventory" icon={<Package />} colorClass="text-red-500" />
          <StatCard title="Total Orders" value={shopStats.totalOrders} trend="All Time" icon={<ListOrdered />} colorClass="text-red-500" />
          <StatCard title="Total Revenue" value={`Rs. ${shopStats.totalRevenue.toLocaleString()}`} trend="Paid Orders" icon={<DollarSign />} colorClass="text-red-500" />
          <StatCard title="Out of Stock" value={shopStats.outOfStock} trend="Needs Refill" icon={<AlertTriangle />} colorClass="text-red-500" />
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-red-600 text-white shadow-lg' : 'bg-[#080808] border border-gray-800 text-gray-400 hover:text-white'}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-lg' : 'bg-[#080808] border border-gray-800 text-gray-400 hover:text-white'}`}>Orders ({orders.length})</button>
          <button onClick={() => setActiveTab('promos')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'promos' ? 'bg-red-600 text-white shadow-lg' : 'bg-[#080808] border border-gray-800 text-gray-400 hover:text-white'}`}>Promotions</button>
        </div>

        {activeTab === 'inventory' && (
          <>
            {isFormVisible && (
              <form onSubmit={handleSaveProduct} className="mb-12 bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 tracking-widest border-b border-gray-800 pb-4">
                  {editProductId ? 'Edit Product Details' : 'Add New Product'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Product Name</label>
                      <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Category</label>
                      <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400" required>
                        <option value="" disabled>Select Category</option>
                        <option value="WheyProtein">Whey Protein</option>
                        <option value="MassGainer">Mass Gainer</option>
                        <option value="Creatine">Creatine</option>
                        <option value="PreWorkout">Pre-Workout</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Price (LKR)</label>
                        <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Stock Details</label>
                        <input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 mt-2">Product Description / Details</label>
                      <textarea value={newProduct.description || ''} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors h-24 resize-none" placeholder="Enter detailed product description..."></textarea>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Product Image</label>
                    <div className="w-full h-full min-h-[150px] bg-black border-2 border-dashed border-gray-800 hover:border-red-600 rounded-xl flex flex-col items-center justify-center transition-colors relative overflow-hidden group">
                      {newProduct.images && newProduct.images[0] ? (
                        <>
                          <img src={newProduct.images[0]} alt="Preview" className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="bg-red-600 text-white font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-lg">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-600 group-hover:text-red-500 transition-colors">
                          <ImageIcon size={32} className="mb-2" />
                          <span className="font-bold text-xs uppercase tracking-widest">Upload Image</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-sm tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-red-900/20 active:scale-[0.98]">
                    {editProductId ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-[#121212] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl group hover:border-gray-700 transition-all flex flex-col h-full">
                  <div className="relative h-48 bg-black overflow-hidden flex items-center justify-center">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4 opacity-90 group-hover:scale-110 transition-transform duration-500 bg-white/5" />
                    ) : (
                      <ImageIcon size={48} className="text-gray-800" />
                    )}
                    <div className="absolute top-4 left-4">
                      {product.stock === 0 ? (
                        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">Sold Out</span>
                      ) : (
                        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">In Stock • {product.stock}</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-lg uppercase tracking-tight italic">{product.name}</h3>
                      <span className="text-red-500 font-bold">LKR {product.price}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <Tag size={12} className="text-gray-500" />
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{product.category}</span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button onClick={() => { setEditProductId(product._id); setNewProduct({ name: product.name, category: product.category, price: product.price, stock: product.stock, description: product.description || '', images: product.images }); setIsFormVisible(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id)} className="flex-1 bg-red-900/20 hover:bg-red-600 hover:text-white text-red-500 border border-red-900/30 hover:border-red-600 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Recent Orders</h3>
              <button
                onClick={() => setShowOrdersReport(true)}
                className="bg-[#111] hover:bg-red-900/20 text-red-500 border border-red-900/30 px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2"
              >
                <Download size={12} /> Generate Orders Report
              </button>
            </div>
            {orders.map(order => (
              <div key={order._id} className="bg-[#121212] border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-black text-xl italic uppercase tracking-tighter">{order.userName}</h3>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        ['Paid', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-green-900/20 border-green-900/30 text-green-500' : 
                        order.status === 'Pending' ? 'bg-yellow-900/20 border-yellow-900/30 text-yellow-500' : 
                        'bg-red-900/20 border-red-900/30 text-red-500'
                      }`}>{order.status}</span>
                    </div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">{order.userEmail} &bull; {new Date(order.createdAt).toLocaleString()}</p>

                    <div className="space-y-2 bg-black/40 rounded-2xl p-4 border border-gray-900">
                      {order.products.map((p, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold uppercase tracking-wide">
                          <span className="text-gray-400">{p.name} <span className="text-red-500">x{p.quantity}</span></span>
                          <span>LKR {(p.price * p.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between font-black text-sm text-red-500 uppercase italic">
                        <span>Total Amount</span>
                        <span>LKR {order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-72 space-y-4 border-l border-gray-900 lg:pl-6">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2 block">Shipping / Payment</label>
                      <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{order.billingDetails?.address || 'N/A'}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{order.paymentMethod}</p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-red-600 transition-colors"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Mark as Paid</option>
                      <option value="Shipped">Mark as Shipped</option>
                      <option value="Delivered">Mark as Delivered</option>
                      <option value="Cancelled">Cancel Order</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center py-10 text-gray-600 font-bold uppercase tracking-widest text-[10px]">No orders found.</p>}
          </section>
        )}

        {activeTab === 'promos' && (
          <section className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setNewPromo({ ...newPromo, type: 'code' })}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newPromo.type === 'code' ? 'bg-red-600 text-white' : 'bg-[#111] text-gray-500'}`}
              >
                Promo Code
              </button>
              <button
                onClick={() => setNewPromo({ ...newPromo, type: 'sale' })}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newPromo.type === 'sale' ? 'bg-red-600 text-white' : 'bg-[#111] text-gray-500'}`}
              >
                Flash Sale
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="mb-8 bg-[#121212] border border-gray-800 rounded-3xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {newPromo.type === 'code' ? (
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. GYM20)"
                    value={newPromo.code}
                    onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors uppercase"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Sale Title (e.g. Summer Sale)"
                    value={newPromo.title}
                    onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                    className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    required
                  />
                )}

                <div className="flex bg-black border border-gray-800 rounded-xl overflow-hidden">
                  <input
                    type="number"
                    placeholder={newPromo.discountType === 'percentage' ? "Discount %" : "Flat Amount"}
                    value={newPromo.discountValue}
                    onChange={e => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                    className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:outline-none"
                    min="0"
                    max={newPromo.discountType === 'percentage' ? "100" : undefined}
                    required
                  />
                  <select
                    value={newPromo.discountType}
                    onChange={e => setNewPromo({ ...newPromo, discountType: e.target.value })}
                    className="bg-gray-900 border-l border-gray-800 px-2 text-[10px] font-black uppercase text-gray-400 focus:outline-none"
                  >
                    <option value="percentage">%</option>
                    <option value="flat">LKR</option>
                  </select>
                </div>

                {newPromo.type === 'code' ? (
                  <input
                    type="number"
                    placeholder="User Limit (Optional)"
                    value={newPromo.userLimit}
                    onChange={e => setNewPromo({ ...newPromo, userLimit: e.target.value })}
                    className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors"
                    min="1"
                  />
                ) : (
                  <div className="flex flex-col justify-center px-4 bg-black/40 rounded-xl border border-gray-800">
                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Starts Today</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                  </div>
                )}

                <input
                  type="date"
                  title={newPromo.type === 'code' ? "Expiry Date" : "End Date"}
                  value={newPromo.endDate}
                  onChange={e => setNewPromo({ ...newPromo, endDate: e.target.value })}
                  className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-gray-400"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              {editPromoId && (
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => { setEditPromoId(null); setNewPromo({ type: 'code', code: '', title: '', discountValue: '', discountType: 'percentage', userLimit: '', endDate: '', isActive: true }); }} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors">
                    Cancel Edit
                  </button>
                </div>
              )}
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl transition-all shadow-lg active:scale-95">
                {editPromoId ? 'Update Promotion' : (newPromo.type === 'code' ? 'Add Promo Code' : 'Start Flash Sale')}
              </button>
            </form>

            <div className="space-y-4">
              {promotions.map(promo => (
                <div key={promo._id} className="bg-[#121212] border border-gray-800 rounded-2xl p-5 group hover:border-red-500/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${promo.type === 'code' ? 'bg-blue-900/20 text-blue-400' : 'bg-red-900/20 text-red-400'}`}>
                      {promo.type === 'code' ? <Tag size={20} /> : <DollarSign size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-lg italic uppercase tracking-tighter truncate">
                          {promo.type === 'code' ? promo.code : promo.title}
                        </h4>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${promo.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-red-500 font-bold text-xs uppercase tracking-widest">
                        {promo.discountType === 'flat' ? `Rs. ${promo.discountValue}` : `${promo.discountValue}%`} OFF
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8 px-6 border-l border-gray-900 flex-[2] justify-center md:justify-start w-full md:w-auto">
                    {promo.type === 'code' && (
                      <div className="text-center md:text-left">
                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Usage Limit</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{promo.usageCount || 0} / {promo.userLimit || '∞'}</p>
                      </div>
                    )}
                    <div className="text-center md:text-left">
                      <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">{promo.type === 'code' ? 'Expires' : 'Ends'}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    {promo.endDate && new Date(promo.endDate) < new Date() && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Expired</span>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
                    <button onClick={() => handleTogglePromo(promo._id)} title={promo.isActive ? "Deactivate" : "Activate"} className={`flex-1 md:flex-none p-3 bg-black border border-gray-900 rounded-xl transition-all ${promo.isActive ? 'text-green-500 hover:border-green-500' : 'text-gray-500 hover:text-red-500 hover:border-red-500'}`}>
                      <Power size={16} />
                    </button>
                    <button onClick={() => {
                      setEditPromoId(promo._id);
                      setNewPromo({
                        type: promo.type || 'code',
                        code: promo.code || '',
                        title: promo.title || '',
                        discountValue: promo.discountValue || '',
                        discountType: promo.discountType || 'percentage',
                        userLimit: promo.userLimit || '',
                        endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
                        isActive: promo.isActive !== false
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} title="Edit Promotion" className="flex-1 md:flex-none p-3 bg-black border border-gray-900 rounded-xl text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeletePromo(promo._id)} title="Delete Promotion" className="flex-1 md:flex-none p-3 bg-black border border-gray-900 rounded-xl text-gray-500 hover:text-red-500 hover:border-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {promotions.length === 0 && <p className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-[10px] border border-dashed border-gray-800 rounded-3xl">No promotions found.</p>}
            </div>
          </section>
        )}


        {showReportModal && (
          <InventoryReportModal
            products={products}
            onClose={() => setShowReportModal(false)}
          />
        )}

        {showOrdersReport && (
          <OrdersReportModal
            orders={orders}
            onClose={() => setShowOrdersReport(false)}
          />
        )}

      </main>
    </div>
  );
};

export default Shop;
