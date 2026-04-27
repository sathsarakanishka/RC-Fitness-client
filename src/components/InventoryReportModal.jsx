import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { X, Printer, Download } from 'lucide-react';

const InventoryReportModal = ({ products, onClose }) => {
  if (!products) return null;

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("inventory-report");
      
      const imgData = await toPng(element, { 
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RC_Fitness_Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF Error: " + (error.message || JSON.stringify(error)));
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  const totalValue = products.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.stock) || 0)), 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div id="inventory-report" className="bg-white text-black p-10 md:p-14 w-full">
            
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-red-600">RC FITNESS <span className="text-black">SHOP</span></h1>
                <p className="text-gray-500 text-sm mt-2 font-medium">Official Equipment & Supplement Store</p>
                <p className="text-gray-500 text-sm font-medium">Phone: +94 112 345 678</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest">Inventory Report</h2>
                <p className="text-sm font-bold mt-2 text-gray-800">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm font-bold text-gray-500">Report #: {Math.floor(Math.random()*1000000)}</p>
              </div>
            </div>

            <div className="mb-10 flex gap-12 border-b-2 border-gray-100 pb-8">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Items</h3>
                <p className="text-2xl font-black text-gray-900">{totalProducts}</p>
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Stock</h3>
                <p className="text-2xl font-black text-gray-900">{totalStock} Units</p>
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Est. Value</h3>
                <p className="text-2xl font-black text-red-600">LKR {totalValue.toLocaleString()}</p>
              </div>
            </div>

            <table className="w-full mb-10 border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y-2 border-gray-200 text-left">
                  <th className="py-4 px-2 text-xs font-black text-gray-500 uppercase tracking-widest">Product Name</th>
                  <th className="py-4 px-2 text-xs font-black text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="py-4 px-2 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Price</th>
                  <th className="py-4 px-2 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Stock</th>
                  <th className="py-4 px-2 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-sm font-bold text-gray-400">No inventory data available.</td>
                  </tr>
                ) : (
                  products.map((p, index) => (
                    <tr key={p._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-sm font-bold text-gray-800">{p.name}</td>
                      <td className="py-4 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{p.category}</td>
                      <td className="py-4 px-2 text-sm font-bold text-gray-900 text-right">LKR {Number(p.price).toLocaleString()}</td>
                      <td className="py-4 px-2 text-sm font-bold text-gray-600 text-right">{p.stock}</td>
                      <td className="py-4 px-2 text-right">
                        {p.stock === 0 ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Out of Stock</span>
                        ) : p.stock < 5 ? (
                          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Low Stock</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="text-center pt-8 border-t-2 border-gray-200 mt-16">
              <p className="text-sm font-bold text-gray-800 mb-1">Generated by RC Fitness Center Management System</p>
              <p className="text-xs text-gray-400 font-medium">This is an automated system-generated report.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-4 relative z-10 hide-on-print">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} /> Print Document
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default InventoryReportModal;
