import React, { useState } from 'react';
import { 
  Navigation, 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldAlert,
  Fuel,
  Coffee,
  Hospital
} from 'lucide-react';

export const PlanTrip = () => {
  const [planned, setPlanned] = useState(false);

  const handlePlan = (e) => {
    e.preventDefault();
    setPlanned(true);
  };

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 pb-24">
      {/* Form Section */}
      <div className={`w-full ${planned ? 'lg:w-1/3' : 'max-w-[720px] mx-auto'}`}>
        <h1 className="font-condensed text-[28px] leading-[34px] font-semibold mb-6">Plan your trip</h1>
        
        <form onSubmit={handlePlan} className="bg-snow border border-mist p-4 lg:p-6 rounded-md shadow-sm space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <label className="block font-sans text-sm font-semibold mb-1 text-ink">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
                <select className="w-full pl-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river appearance-none">
                  <option>Rishikesh</option>
                  <option>Devprayag</option>
                  <option>Srinagar</option>
                </select>
              </div>
            </div>
            
            <div className="relative">
              <label className="block font-sans text-sm font-semibold mb-1 text-ink">To</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
                <select className="w-full pl-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river appearance-none">
                  <option>Joshimath</option>
                  <option>Chamoli</option>
                  <option>Karnaprayag</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-sm font-semibold mb-1 text-ink">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
                <input type="date" className="w-full pl-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river" />
              </div>
            </div>
            <div>
              <label className="block font-sans text-sm font-semibold mb-1 text-ink">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
                <input type="time" className="w-full pl-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-sans text-sm font-semibold mb-1 text-ink">Vehicle Type</label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
              <select className="w-full pl-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river appearance-none">
                <option>Car / SUV</option>
                <option>Two Wheeler</option>
                <option>Heavy Vehicle</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 h-12 bg-river text-white rounded-md font-sans font-medium hover:bg-ink transition-colors mt-2"
          >
            Plan Trip
          </button>
        </form>
      </div>

      {/* Results Section */}
      {planned && (
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Summary Card */}
          <section className="bg-snow border border-mist p-6 rounded-md shadow-sm">
            <div className="flex items-start justify-between mb-4 border-b border-mist pb-4">
              <div>
                <h2 className="font-condensed text-[24px] font-semibold text-ink">Route Summary</h2>
                <p className="text-granite font-sans">Rishikesh to Joshimath</p>
              </div>
              <div className="flex items-center gap-2 bg-tint-high text-risk-high px-3 py-1 rounded-md font-condensed font-semibold">
                <AlertTriangle className="w-5 h-5" />
                High Risk
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-sans text-sm">
              <div>
                <div className="text-granite mb-1">Distance</div>
                <div className="font-semibold text-lg">247 km</div>
              </div>
              <div>
                <div className="text-granite mb-1">Est. Time</div>
                <div className="font-semibold text-lg">8h 15m</div>
              </div>
              <div>
                <div className="text-granite mb-1">Road Condition</div>
                <div className="font-semibold text-risk-high">Caution Advised</div>
              </div>
              <div>
                <div className="text-granite mb-1">Traffic</div>
                <div className="font-semibold">Moderate</div>
              </div>
              <div>
                <div className="text-granite mb-1">Active Alerts</div>
                <div className="font-semibold text-risk-severe">2 Warnings</div>
              </div>
              <div>
                <div className="text-granite mb-1">Weather</div>
                <div className="font-semibold">Heavy Rain</div>
              </div>
            </div>
          </section>

          {/* Safety Recommendation */}
          <section className="bg-tint-high border border-risk-high p-4 rounded-md flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-risk-high shrink-0 mt-1" />
            <div>
              <h3 className="font-condensed font-semibold text-lg text-ink">Delay if you can</h3>
              <p className="font-sans text-sm text-ink mt-1">
                Heavy rainfall is expected along the route, particularly between Srinagar and Rudraprayag. 
                Consider travelling tomorrow morning when conditions are forecasted to improve.
              </p>
            </div>
          </section>

          {/* Along Your Route */}
          <section>
            <h3 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Along Your Route</h3>
            
            <div className="space-y-3 font-sans">
              {/* Alert Item */}
              <div className="flex items-center gap-4 p-4 bg-snow border-l-4 border-risk-closed border-y border-r border-y-mist border-r-mist rounded-r-md">
                <div className="w-10 h-10 bg-tint-closed rounded flex items-center justify-center shrink-0">
                  <div className="w-4 h-1 bg-risk-closed" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Srinagar - Sirobagarh</div>
                  <div className="text-sm text-granite">Road completely closed due to landslide.</div>
                </div>
                <span className="text-xs font-bold text-ink bg-tint-closed px-2 py-1 rounded">CLOSURE</span>
              </div>

              {/* Construction Item */}
              <div className="flex items-center gap-4 p-4 bg-snow border border-mist rounded-md">
                <div className="w-10 h-10 bg-tint-moderate rounded flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-risk-moderate" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Kaudiyala - Devprayag</div>
                  <div className="text-sm text-granite">Single lane traffic due to active road widening.</div>
                </div>
                <span className="text-xs font-bold text-ink bg-glacier border border-mist px-2 py-1 rounded">CONSTRUCTION</span>
              </div>

              {/* Amenities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-3 p-3 bg-snow border border-mist rounded-md">
                  <Fuel className="w-5 h-5 text-river" />
                  <div className="text-sm">
                    <span className="font-semibold block">12 Fuel Stations</span>
                    <span className="text-granite">Next: Shivpuri (14km)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-snow border border-mist rounded-md">
                  <Coffee className="w-5 h-5 text-river" />
                  <div className="text-sm">
                    <span className="font-semibold block">8 Rest Areas</span>
                    <span className="text-granite">Next: Byasi (22km)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-snow border border-mist rounded-md">
                  <Hospital className="w-5 h-5 text-river" />
                  <div className="text-sm">
                    <span className="font-semibold block">4 Major Hospitals</span>
                    <span className="text-granite">Base Hospital, Srinagar</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-snow border border-mist rounded-md">
                  <Shield className="w-5 h-5 text-river" />
                  <div className="text-sm">
                    <span className="font-semibold block">6 Police Stations</span>
                    <span className="text-granite">Dial 112 for emergency</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
