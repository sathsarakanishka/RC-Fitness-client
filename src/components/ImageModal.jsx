import { X, Download } from 'lucide-react';

const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = src.startsWith('data:application/pdf') ? `receipt_${Date.now()}.pdf` : `receipt_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-[110]"
      >
        <X size={32} />
      </button>

      <div className="absolute top-6 left-6 flex items-center gap-4 z-[110]">
        <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Receipt Preview</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          <Download size={14} /> Download
        </button>
      </div>

      <div 
        className="relative max-w-5xl w-full h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {src.startsWith('data:application/pdf') ? (
          <iframe 
            src={src} 
            className="w-full h-full rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-800 animate-in zoom-in-95 duration-300"
            title="PDF Preview"
          />
        ) : (
          <img 
            src={src} 
            alt="Full Size Receipt" 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-800 animate-in zoom-in-95 duration-300"
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;
