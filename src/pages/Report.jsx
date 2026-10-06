import React, { useState } from 'react';
import { Camera, MapPin, Send, CheckCircle2, ShieldCheck, Megaphone, Clock } from 'lucide-react';

const REPORT_TYPES = [
  'Accident',
  'Road blockage',
  'Road damage',
  'Landslide',
  'Flooding',
  'Traffic congestion',
  'Construction',
  'Other'
];

export const Report = () => {
  const [status, setStatus] = useState('idle'); // idle, locating, submitting, success, error
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState('');
  const [contact, setContact] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleGetLocation = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStatus('idle');
      },
      () => {
        setErrorMsg('Unable to get your location. Please check permissions.');
        setStatus('error');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      setErrorMsg('Please select a report type.');
      setStatus('error');
      return;
    }
    if (!location) {
      setErrorMsg('Please provide your location.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    // Mock API call delay
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div className="flex-1 w-full max-w-[720px] mx-auto p-4 lg:p-8 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-16 h-16 text-risk-low mb-4" />
        <h2 className="font-condensed text-[28px] font-semibold mb-2">Report sent successfully</h2>
        <p className="text-ink font-sans">An official will verify your report shortly. Thank you for keeping NH-7 safe.</p>
        <button 
          onClick={() => {
            setStatus('idle');
            setPhoto(null);
            setLocation(null);
            setSelectedType('');
            setDescription('');
            setDatetime('');
            setContact('');
          }}
          className="mt-8 px-6 py-3 bg-snow border border-mist rounded-md font-sans font-medium hover:bg-glacier transition-colors"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-[720px] mx-auto p-4 lg:p-8 pb-24">
      <h1 className="font-condensed text-[28px] leading-[34px] font-semibold mb-6">Report a road issue</h1>
      
      {/* Workflow Section */}
      <div className="flex items-center justify-between mb-8 p-4 bg-glacier border border-mist rounded-md font-sans text-sm font-medium text-ink relative">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-mist -z-0 -translate-y-1/2"></div>
        <div className="flex flex-col items-center gap-1 z-10 bg-glacier px-2">
          <div className="w-8 h-8 rounded-full bg-river text-white flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
          <span>Report</span>
        </div>
        <div className="flex flex-col items-center gap-1 z-10 bg-glacier px-2">
          <div className="w-8 h-8 rounded-full bg-snow border-2 border-river text-river flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>Verify</span>
        </div>
        <div className="flex flex-col items-center gap-1 z-10 bg-glacier px-2">
          <div className="w-8 h-8 rounded-full bg-snow border-2 border-mist text-granite flex items-center justify-center">
            <Megaphone className="w-4 h-4" />
          </div>
          <span className="text-granite">Inform</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <section>
          <label className="block font-condensed text-lg font-semibold mb-2">What happened? *</label>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full border text-sm font-sans transition-colors ${
                  selectedType === type 
                    ? 'bg-river-tint border-river text-river font-medium' 
                    : 'bg-snow border-mist text-ink hover:bg-glacier'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section>
          <label className="block font-condensed text-lg font-semibold mb-2">Location *</label>
          <button 
            type="button" 
            onClick={handleGetLocation}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-snow border border-mist rounded-md hover:bg-glacier transition-colors font-sans w-full"
          >
            <MapPin className="w-5 h-5 text-river" />
            {location ? 'Location acquired' : status === 'locating' ? 'Locating...' : 'Use my current location'}
          </button>
          {location && <p className="text-xs text-granite mt-2 text-center">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
        </section>

        {/* Date / Time */}
        <section>
          <label className="block font-condensed text-lg font-semibold mb-2">Date & Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
            <input 
              type="datetime-local" 
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full pl-10 p-3 bg-snow border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river"
            />
          </div>
        </section>

        {/* Description */}
        <section>
          <label className="block font-condensed text-lg font-semibold mb-2">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide any additional details..."
            className="w-full p-3 bg-snow border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river"
            rows={3}
          />
        </section>

        {/* Photo Upload */}
        <section>
          <label className="block font-condensed text-lg font-semibold mb-2">Photo</label>
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center justify-center w-24 h-24 bg-snow border-2 border-dashed border-mist rounded-md cursor-pointer hover:bg-glacier transition-colors">
              <Camera className="w-6 h-6 text-granite mb-1" />
              <span className="text-xs text-granite font-sans">Add photo</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
            </label>
            {photo && <span className="text-sm font-sans text-river">Photo added: {photo.name}</span>}
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <label className="block font-condensed text-lg font-semibold mb-2">Contact Information (Optional)</label>
          <input 
            type="text" 
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone number or Email"
            className="w-full p-3 bg-snow border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river"
          />
        </section>

        {errorMsg && (
          <div className="p-3 bg-tint-severe border border-risk-severe rounded-md text-risk-severe font-sans text-sm">
            {errorMsg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'submitting' || !location || !selectedType}
          className="w-full flex items-center justify-center gap-2 h-12 bg-river text-white rounded-md font-sans font-medium hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};
