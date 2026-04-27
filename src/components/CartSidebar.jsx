import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, Banknote, Landmark, Upload, Tag, Download, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import InvoiceModal from './InvoiceModal';

const CartSidebar = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', paymentMethod: 'COD' });
  const [receiptBase64, setReceiptBase64] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [activeSale, setActiveSale] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const fetchActiveSale = async () => {
      try {
        const res = await axios.get(`https://rc-fitness-backend.vercel.app/api/shop/promotions`);
        const sale = res.data
          .filter(p => p.type === 'sale' && p.isActive && new Date(p.endDate) > new Date())
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];
        if (sale) setActiveSale(sale);
      } catch (err) { console.error("Error fetching active sale:", err); }
    };
    fetchActiveSale();
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const saleDiscount = activeSale
    ? (activeSale.discountType === 'flat' ? activeSale.discountValue : (totalAmount * (activeSale.discountValue / 100)))
    : 0;

  const promoDiscount = appliedPromo
    ? (appliedPromo.discountType === 'flat' ? appliedPromo.discountValue : (totalAmount * (appliedPromo.discountValue / 100)))
    : 0;

  const discountAmount = saleDiscount + promoDiscount;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  // Convert File to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert('Please upload a valid image or PDF file.');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds the 10MB limit. Please upload a smaller file.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setReceiptBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      const res = await axios.post(`https://rc-fitness-backend.vercel.app/api/shop/promotions/validate`, { code: promoCode });
      setAppliedPromo(res.data);
      setPromoError('');
    } catch (err) {
      setPromoError('Invalid or expired code');
      setAppliedPromo(null);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (formData.paymentMethod === 'Bank' && !receiptBase64) {
      alert("Please upload your bank receipt to proceed.");
      return;
    }
    setIsSubmitting(true);

    const orderData = {
      userName: formData.name,
      userEmail: formData.email,
      products: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: finalAmount,
      promoCode: appliedPromo ? appliedPromo.code : '',
      discountAmount,
      paymentMethod: formData.paymentMethod,
      receiptImage: receiptBase64, // Included the receipt image
      billingDetails: {
        phone: formData.phone,
        address: formData.address
      }
    };

    try {
      const res = await axios.post(`https://rc-fitness-backend.vercel.app/api/shop/checkout`, orderData);
      setLastSavedOrder(res.data.order);
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Something went wrong during checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSidebar = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setIsCheckout(false);
      setOrderComplete(false);
      setFormData({ name: '', email: '', phone: '', address: '', paymentMethod: 'COD' });
      setReceiptBase64('');
      setAppliedPromo(null);
    }, 500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={closeSidebar}></div>
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111] border-l border-gray-800 z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        <div className="flex justify-between items-center p-6 border-b border-gray-900 bg-[#0a0a0a]">
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
            <ShoppingBag className="text-red-600" /> Your Cart
          </h2>
          <button onClick={closeSidebar} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {orderComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black">
            <CheckCircle size={64} className="text-red-600 mb-6 animate-bounce" />
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Order Confirmed!</h3>
            <p className="text-gray-400 text-sm mb-8">
              {formData.paymentMethod === 'Bank'
                ? "Your receipt has been submitted. We will verify and process your order soon."
                : "Your order has been placed. Please pay at the front desk upon pickup."}
            </p>
            <div className="w-full space-y-4 px-6">
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full bg-[#111] hover:bg-gray-800 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border border-gray-800 flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download Invoice
              </button>
              <button onClick={closeSidebar} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/20">
                Continue Shopping
              </button>
            </div>
          </div>
        ) : isCheckout ? (
          <div className="flex-1 overflow-y-auto p-6 bg-black flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Contact Details</h3>
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-white" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-white" placeholder="07XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-white" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Delivery Address</label>
                <textarea required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-white h-20 resize-none" placeholder="Enter your full address..." />
              </div>

              <div className="pt-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'COD' ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-[#111] border-gray-800 text-gray-500'}`}
                  >
                    <Banknote size={20} />
                    <span className="text-[10px] font-bold uppercase">Cash on Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Bank' })}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === 'Bank' ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-[#111] border-gray-800 text-gray-500'}`}
                  >
                    <Landmark size={20} />
                    <span className="text-[10px] font-bold uppercase">Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Conditional Bank Details Display */}
              {formData.paymentMethod === 'Bank' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-red-500 mb-2 tracking-widest">Bank Details</p>
                    <div className="space-y-1">
                      <p className="text-xs text-white font-bold">Bank: <span className="text-gray-400 font-normal">Commercial Bank</span></p>
                      <p className="text-xs text-white font-bold">Account: <span className="text-gray-400 font-normal">800XXXXXXXXX</span></p>
                      <p className="text-xs text-white font-bold">Name: <span className="text-gray-400 font-normal">RC Fitness (PVT) Ltd</span></p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Upload Deposit Slip</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${receiptBase64 ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 group-hover:border-red-600/50 bg-[#111]'}`}>
                        {receiptBase64 ? (
                          <>
                            <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden border border-green-500/30 flex items-center justify-center bg-green-900/20 text-green-500">
                              {receiptBase64.startsWith('data:application/pdf') ? (
                                <FileText size={24} />
                              ) : (
                                <img src={receiptBase64} alt="Receipt" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-green-500 uppercase">Receipt Selected</span>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="text-gray-600 mb-2" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Upload Slip Image</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 pb-10">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-white uppercase" placeholder="ENTER CODE" />
                  <button type="button" onClick={handleApplyPromo} className="px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[10px] font-black uppercase transition-all">Apply</button>
                </div>
                {promoError && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{promoError}</p>}

                <div className="space-y-2 mt-3">
                  {activeSale && (
                    <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
                      <Tag size={12} className="text-red-500" />
                      <p className="text-[9px] font-black uppercase text-red-500 tracking-widest flex-1">
                        Flash Sale: {activeSale.title} (-{activeSale.discountType === 'flat' ? `Rs.${activeSale.discountValue}` : `${activeSale.discountValue}%`})
                      </p>
                      <span className="text-[8px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Auto-Applied</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex items-center gap-2 p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
                      <Tag size={12} className="text-blue-400" />
                      <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest flex-1">
                        Promo: {appliedPromo.code} (-{appliedPromo.discountType === 'flat' ? `Rs.${appliedPromo.discountValue}` : `${appliedPromo.discountValue}%`})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-black">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <ShoppingBag size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 border border-gray-900 rounded-2xl p-4 bg-[#111]">
                    <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {item.images && item.images[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <ShoppingBag className="text-gray-800" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{item.category}</p>
                      <h4 className="text-sm font-black uppercase text-white line-clamp-1">{item.name}</h4>
                      <p className="text-red-500 font-bold text-sm mt-1">LKR {(item.price * item.quantity).toLocaleString()}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 bg-black border border-gray-800 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 hover:text-red-500 hover:bg-gray-900 rounded-md text-white"><Minus size={14} /></button>
                          <span className="text-xs font-bold w-4 text-center text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 hover:text-green-500 hover:bg-gray-900 rounded-md text-white"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-red-500 underline underline-offset-4">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!orderComplete && cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-900 bg-[#0a0a0a]">
            <div className="flex justify-between text-lg font-black uppercase tracking-tight text-white mb-4">
              <span>{isCheckout ? 'Final Total' : 'Total Amount'}</span>
              <span className="text-red-600">LKR {isCheckout ? finalAmount.toLocaleString() : totalAmount.toLocaleString()}</span>
            </div>

            {isCheckout ? (
              <div className="flex gap-4">
                <button onClick={() => setIsCheckout(false)} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors">
                  Back
                </button>
                <button type="submit" form="checkout-form" disabled={isSubmitting} className="flex-[2] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                  {isSubmitting ? 'Processing...' : <>Confirm Order <CheckCircle size={16} /></>}
                </button>
              </div>
            ) : (
              <button onClick={() => setIsCheckout(true)} className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors">
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

      </div>

      {showInvoice && lastSavedOrder && (
        <InvoiceModal order={lastSavedOrder} onClose={() => setShowInvoice(false)} />
      )}
    </>
  );
};

export default CartSidebar;