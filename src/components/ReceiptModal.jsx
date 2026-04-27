import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { X, Printer, Download } from 'lucide-react';

const ReceiptModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("receipt");
      
      const imgData = await toPng(element, { 
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // We need to fetch original element dims to preserve ratio accurately
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${payment.member}.pdf`);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF Error: " + (error.message || JSON.stringify(error)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div id="receipt" className="bg-white text-black p-10 md:p-14 w-full">
            
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-red-600">RC FITNESS <span className="text-black">GYM</span></h1>
                <p className="text-gray-500 text-sm mt-2 font-medium">123 Fitness Avenue, Muscle City</p>
                <p className="text-gray-500 text-sm font-medium">Phone: +94 112 345 678</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest">Invoice</h2>
                <p className="text-sm font-bold mt-2 text-gray-800">Date: {payment.date}</p>
                <p className="text-sm font-bold text-gray-500">Invoice #: {payment._id?.slice(-6).toUpperCase() || Math.floor(Math.random()*1000000)}</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Billed To:</h3>
              <p className="text-xl font-bold text-gray-900">{payment.member}</p>
              {payment.email && <p className="text-sm text-gray-600">{payment.email}</p>}
            </div>

            <table className="w-full mb-10">
              <thead>
                <tr className="border-b-2 border-gray-100 text-left">
                  <th className="py-3 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="py-3 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Duration</th>
                  <th className="py-3 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-5 text-sm font-bold text-gray-800">Gym Membership Plan</td>
                  <td className="py-5 text-sm font-bold text-gray-600 text-right">{payment.duration || 'N/A'}</td>
                  <td className="py-5 text-sm font-bold text-gray-900 text-right">LKR {Number(payment.amount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
              <div className="w-1/2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">Subtotal:</span>
                  <span className="text-sm font-bold text-gray-900">LKR {Number(payment.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-lg font-black text-gray-900 uppercase">Total:</span>
                  <span className="text-2xl font-black text-red-600 italic">LKR {Number(payment.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t-2 border-gray-100">
              <p className="text-sm font-bold text-gray-800 mb-1">Thank you for choosing RC Fitness!</p>
              <p className="text-xs text-gray-400 font-medium">Terms & Conditions apply. This is a computer generated invoice.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-4 hide-on-print relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
