import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { X, Printer, Download, MapPin, Clock } from 'lucide-react';

const EventScheduleModal = ({ events, onClose }) => {
  if (!events) return null;

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("event-schedule-report");
      const imgData = await toPng(element, { backgroundColor: "#ffffff", pixelRatio: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const rect = element.getBoundingClientRect();
      const pdfHeight = (rect.height * pdfWidth) / rect.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RC_Fitness_Events_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF Error: " + (error.message || JSON.stringify(error)));
    }
  };

  // Sort events by chronological order roughly (assuming standard YYYY-MM-DD date format)
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div id="event-schedule-report" className="bg-white text-black p-10 md:p-14 w-full">
            
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter text-blue-600">RC FITNESS <span className="text-black">GYM</span></h1>
                <p className="text-gray-500 text-sm mt-2 font-medium">123 Fitness Avenue, Muscle City</p>
                <p className="text-gray-500 text-sm font-medium">Official Noticeboard Output</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-gray-200 uppercase tracking-widest">Event Schedule</h2>
                <p className="text-sm font-bold mt-2 text-gray-800">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-2xl font-black text-blue-900 tracking-tighter italic">UPCOMING CLASSES & EVENTS</h3>
              <p className="text-sm font-medium text-blue-600 mt-2">Displaying all {sortedEvents.length} scheduled sessions.</p>
            </div>

            <div className="flex flex-col gap-6 mb-10">
              {sortedEvents.length === 0 ? (
                <p className="text-center py-10 text-gray-400 font-bold">No upcoming events found.</p>
              ) : (
                sortedEvents.map((ev, index) => (
                  <div key={ev._id || index} className="flex flex-col md:flex-row gap-6 p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow bg-white">
                    <div className="md:w-1/4 flex flex-col justify-center border-r border-gray-100 pr-6">
                      <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{ev.date}</span>
                      <span className="text-2xl font-black text-gray-900 line-clamp-1">{ev.time}</span>
                    </div>
                    
                    <div className="md:w-2/4 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-widest">
                          {ev.type || 'Event'}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{ev.title}</h4>
                      {ev.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ev.description}</p>}
                    </div>
                    
                    <div className="md:w-1/4 flex flex-col justify-center border-l border-gray-100 pl-6">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin size={16} />
                        <span className="text-sm font-bold uppercase tracking-wider">{ev.location || 'TBA'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center pt-8 border-t-2 border-gray-200 mt-16">
              <p className="text-sm font-bold text-gray-800 mb-1">Please arrive 10 minutes early for all fitness classes.</p>
              <p className="text-xs text-gray-400 font-medium">Schedules are subject to change. Check with front desk for real-time updates.</p>
            </div>

          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-4 relative z-10 hide-on-print">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer">
            <X size={16} /> Cancel
          </button>
          <button onClick={() => window.print()} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer">
            <Printer size={16} /> Print Schedule
          </button>
          <button onClick={handleDownloadPDF} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 flex items-center gap-2 cursor-pointer">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventScheduleModal;
