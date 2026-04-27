import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { X, Printer, Download } from 'lucide-react';

const OrdersReportModal = ({ orders, onClose }) => {
  if (!orders) return null;

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("orders-report");
      const imgData = await toPng(element, { 
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RC_Fitness_Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF Error: " + error.message);
    }
  };

  const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled', 'Paid'];
  const groupedOrders = statuses.reduce((acc, status) => {
    acc[status] = orders.filter(o => o.status === status);
    return acc;
  }, {});

  const totalRevenue = orders.reduce((acc, o) => acc + (o.status === 'Completed' || o.status === 'Paid' ? (o.totalAmount || 0) : 0), 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div id="orders-report" className="bg-white text-black p-10 md:p-14 w-full">
            
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-red-600">RC FITNESS <span className="text-black">SHOP</span></h1>
                <p className="text-gray-500 text-sm mt-2 font-medium">Sales & Order Management Report</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest leading-none">Orders Report</h2>
                <p className="text-sm font-bold mt-2 text-gray-800">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm font-bold text-gray-500">Total Revenue: LKR {totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {statuses.map(status => (
              <div key={status} className="mb-10 last:mb-0">
                <h3 className="text-sm font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === 'Completed' || status === 'Paid' ? 'bg-green-500' : status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                  {status} Orders ({groupedOrders[status].length})
                </h3>
                
                {groupedOrders[status].length === 0 ? (
                  <p className="text-xs font-bold text-gray-400 italic py-2 px-4 border border-dashed border-gray-200 rounded-lg">No orders in this category.</p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200 text-left">
                        <th className="py-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Order ID</th>
                        <th className="py-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
                        <th className="py-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                        <th className="py-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment</th>
                        <th className="py-3 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedOrders[status].map(o => (
                        <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-[10px] font-mono font-bold text-gray-400">#{String(o._id).slice(-6).toUpperCase()}</td>
                          <td className="py-3 px-2 text-[11px] font-bold text-gray-800">{o.userName}</td>
                          <td className="py-3 px-2 text-[11px] font-bold text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">{o.paymentMethod}</td>
                          <td className="py-3 px-2 text-[11px] font-black text-gray-900 text-right">LKR {o.totalAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}

            <div className="text-center pt-8 border-t-2 border-gray-200 mt-16">
              <p className="text-sm font-bold text-gray-800 mb-1">Generated by RC Fitness Center Management System</p>
              <p className="text-xs text-gray-400 font-medium">This is an automated system-generated report.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-4 relative z-10 hide-on-print">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 flex items-center gap-2">
            <X size={16} /> Close
          </button>
          <button onClick={() => window.print()} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 shadow-lg shadow-red-600/20">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleDownloadPDF} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-800 flex items-center gap-2 shadow-lg shadow-black/20">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersReportModal;
