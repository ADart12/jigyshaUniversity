import React, { useState } from 'react';
import { Search, Calendar, MapPin, Tag, Filter, X, ChevronRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const MOCK_EVENTS = [
  { id: 1, type: 'Landslide', location: 'Srinagar to Sirobagarh, km 105', datetime: '2023-08-14 14:30', status: 'Resolved', description: 'Major debris blocked both lanes after heavy rainfall. Cleared after 12 hours.' },
  { id: 2, type: 'Road damage', location: 'Kaudiyala to Devprayag', datetime: '2023-09-02 09:15', status: 'Under Review', description: 'Road sinking reported near milestone 42. Awaiting engineering assessment.' },
  { id: 3, type: 'Accident', location: 'Shivpuri to Byasi', datetime: '2023-09-15 18:45', status: 'Closed', description: 'Two vehicle collision. Road was restricted for 3 hours during rescue operations.' },
  { id: 4, type: 'Flooding', location: 'Chamoli to Birahi', datetime: '2023-07-25 11:00', status: 'Resolved', description: 'Water on the road due to river swelling. Traffic halted for 5 hours.' },
  { id: 5, type: 'Construction', location: 'Rudraprayag to Gauchar', datetime: '2023-10-01 08:00', status: 'Closed', description: 'Planned highway expansion blasting. Scheduled closure.' },
];

export const PastEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-tint-low text-risk-low border-risk-low';
      case 'Under Review': return 'bg-tint-moderate text-risk-moderate border-risk-moderate';
      case 'Closed': return 'bg-tint-closed text-ink border-mist';
      default: return 'bg-glacier text-ink border-mist';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'Under Review': return <Clock className="w-4 h-4" />;
      case 'Closed': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 lg:p-8 flex flex-col relative pb-24">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-condensed text-[28px] leading-[34px] font-semibold text-ink">Past Road Events</h1>
          <p className="text-granite font-sans text-sm mt-1">Review historical incidents and road conditions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-snow border border-mist p-4 rounded-md mb-6 shadow-sm flex flex-wrap items-center gap-3 font-sans text-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-granite" />
          <input type="text" placeholder="Search events..." className="w-full pl-9 pr-3 py-2 bg-white border border-mist rounded focus:outline-none focus:border-river" />
        </div>
        
        <div className="relative min-w-[150px]">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-granite" />
          <select className="w-full pl-9 pr-3 py-2 bg-white border border-mist rounded focus:outline-none focus:border-river appearance-none">
            <option>All Dates</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-granite" />
          <select className="w-full pl-9 pr-3 py-2 bg-white border border-mist rounded focus:outline-none focus:border-river appearance-none">
            <option>All Locations</option>
            <option>Rishikesh to Devprayag</option>
            <option>Devprayag to Srinagar</option>
            <option>Srinagar to Joshimath</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-granite" />
          <select className="w-full pl-9 pr-3 py-2 bg-white border border-mist rounded focus:outline-none focus:border-river appearance-none">
            <option>All Types</option>
            <option>Landslide</option>
            <option>Accident</option>
            <option>Flooding</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-snow border border-mist rounded-md overflow-hidden shadow-sm">
        {MOCK_EVENTS.map((evt, idx) => (
          <div 
            key={evt.id}
            onClick={() => setSelectedEvent(evt)}
            className={`p-4 cursor-pointer hover:bg-glacier transition-colors group ${idx !== MOCK_EVENTS.length - 1 ? 'border-b border-mist' : ''}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-condensed text-lg font-semibold text-ink">{evt.type}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold ${getStatusStyle(evt.status)}`}>
                    {getStatusIcon(evt.status)}
                    {evt.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-granite font-sans">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {evt.datetime}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-mist group-hover:text-river hidden sm:block" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal/Panel */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-[400px] h-full bg-snow shadow-pop animate-in slide-in-from-right duration-200 flex flex-col">
            <div className="p-4 border-b border-mist flex items-center justify-between bg-white">
              <h2 className="font-condensed text-xl font-semibold">Event Details</h2>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-glacier rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto font-sans">
              <div className="mb-6">
                <div className="text-granite text-sm mb-1">Type</div>
                <div className="font-semibold text-lg">{selectedEvent.type}</div>
              </div>
              
              <div className="mb-6">
                <div className="text-granite text-sm mb-1">Status</div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-sm font-semibold ${getStatusStyle(selectedEvent.status)}`}>
                  {getStatusIcon(selectedEvent.status)}
                  {selectedEvent.status}
                </span>
              </div>
              
              <div className="mb-6">
                <div className="text-granite text-sm mb-1">Location</div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-granite mt-0.5" />
                  <span className="font-medium text-ink">{selectedEvent.location}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-granite text-sm mb-1">Date & Time</div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-granite mt-0.5" />
                  <span className="font-medium text-ink">{selectedEvent.datetime}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-granite text-sm mb-2">Description</div>
                <p className="text-ink leading-relaxed bg-glacier p-3 rounded-md border border-mist">
                  {selectedEvent.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
