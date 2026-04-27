import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { X, Printer, Download, ShoppingBag } from 'lucide-react';

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("invoice-document");
      const imgData = await toPng(element, { 
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${String(order._id).slice(-6).toUpperCase()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF Error: " + error.message);
    }
  };

  const subtotal = order.totalAmount + (order.discountAmount || 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div id="invoice-document" className="bg-white text-black p-12 w-full">
            
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter text-red-600">RC FITNESS <span className="text-black">SHOP</span></h1>
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bill To:</p>
                  <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{order.userName}</p>
                  <p className="text-sm font-bold text-gray-500">{order.userEmail}</p>
                  <p className="text-xs font-bold text-gray-400">{order.billingDetails?.phone}</p>
                  <p className="text-xs font-bold text-gray-400 line-clamp-2 md:max-w-[250px]">{order.billingDetails?.address}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black text-gray-100 uppercase tracking-tighter leading-none mb-4">INVOICE</h2>
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                  <p className="text-sm font-black text-gray-900">#{order._id.toString().toUpperCase()}</p>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-3">Date</p>
                  <p className="text-sm font-black text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-3">Payment Method</p>
                  <p className="text-sm font-black text-red-600">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            <table className="w-full mb-8 border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900 text-left">
                  <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Unit Price</th>
                  <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((p, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 px-2">
                      <p className="text-[11px] font-black uppercase text-gray-900">{p.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">RC Supplement Store</p>
                    </td>
                    <td className="py-4 px-2 text-[11px] font-black text-gray-900 text-center">{p.quantity}</td>
                    <td className="py-4 px-2 text-[11px] font-bold text-gray-600 text-right">LKR {p.price.toLocaleString()}</td>
                    <td className="py-4 px-2 text-[11px] font-black text-gray-900 text-right">LKR {(p.price * p.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
              <div className="w-full max-w-[250px] space-y-3">
                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-red-500 uppercase tracking-widest">
                    <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                    <span>- LKR {order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t-2 border-gray-900 text-xl font-black text-gray-900 uppercase">
                  <span>Total</span>
                  <span className="text-red-600">LKR {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Note</p>
                <p className="text-xs font-bold text-gray-600">{order.status === 'Pending' ? 'Your order is currently pending verification. Thank you for choosing RC Fitness!' : 'Thank you for your purchase!'}</p>
              </div>
            </div>

            <div className="text-center pt-8 mt-12 opacity-30">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-900">RC Fitness Center official Invoice</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-4 relative z-10 hide-on-print">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 flex items-center gap-2">
            <X size={16} /> Close
          </button>
          <button onClick={() => window.print()} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-600/20">
            <Printer size={16} /> Print Invoice
          </button>
          <button onClick={handleDownloadPDF} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-800 flex items-center gap-2 shadow-lg shadow-black/20">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
