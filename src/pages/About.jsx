import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Calendar, Bell, Users, Search, CheckCircle, Navigation, ShieldCheck } from 'lucide-react';

export const About = () => {
  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto p-4 lg:p-8 font-sans pb-24">
      <div className="text-center mb-12">
        <h1 className="font-condensed text-[40px] leading-[48px] font-semibold mb-4 text-ink">About Raah</h1>
        <p className="text-xl text-granite max-w-2xl mx-auto">
          Making road travel safer, simpler and better informed.
        </p>
      </div>
      
      {/* What is Raah? */}
      <section className="mb-16">
        <h2 className="font-condensed text-[24px] font-semibold mb-4 text-ink flex items-center gap-2">
          <div className="w-1.5 h-6 bg-river rounded-full" />
          What is Raah?
        </h2>
        <p className="text-ink leading-relaxed text-lg bg-snow border border-mist p-6 rounded-md shadow-sm">
          Raah is a comprehensive road-safety platform designed specifically for the NH7 corridor. 
          By combining live condition monitoring, verified driver reports, and predictive risk analysis, 
          we aim to provide the most accurate and up-to-date information for anyone travelling through 
          mountainous and potentially hazardous terrains.
        </p>
      </section>

      {/* What we provide */}
      <section className="mb-16">
        <h2 className="font-condensed text-[24px] font-semibold mb-6 text-ink flex items-center gap-2">
          <div className="w-1.5 h-6 bg-river rounded-full" />
          What we provide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-snow border border-mist p-6 rounded-md shadow-sm flex flex-col gap-3 hover:border-river transition-colors">
            <div className="w-12 h-12 bg-river-tint rounded-full flex items-center justify-center">
              <Map className="w-6 h-6 text-river" />
            </div>
            <h3 className="font-condensed text-xl font-semibold">Live Road Information</h3>
            <p className="text-granite text-sm">Real-time status of the entire highway, including road blocks, hazards, and weather conditions.</p>
          </div>
          
          <div className="bg-snow border border-mist p-6 rounded-md shadow-sm flex flex-col gap-3 hover:border-river transition-colors">
            <div className="w-12 h-12 bg-river-tint rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-river" />
            </div>
            <h3 className="font-condensed text-xl font-semibold">Trip Planning</h3>
            <p className="text-granite text-sm">Intelligently plan your journey by selecting your departure time to avoid forecasted risks.</p>
          </div>

          <div className="bg-snow border border-mist p-6 rounded-md shadow-sm flex flex-col gap-3 hover:border-river transition-colors">
            <div className="w-12 h-12 bg-river-tint rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-river" />
            </div>
            <h3 className="font-condensed text-xl font-semibold">Safety Alerts</h3>
            <p className="text-granite text-sm">Get notified about active closures and critical warnings before you encounter them.</p>
          </div>

          <div className="bg-snow border border-mist p-6 rounded-md shadow-sm flex flex-col gap-3 hover:border-river transition-colors">
            <div className="w-12 h-12 bg-river-tint rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-river" />
            </div>
            <h3 className="font-condensed text-xl font-semibold">Community Reporting</h3>
            <p className="text-granite text-sm">Contribute to the safety of others by reporting incidents directly from the road.</p>
          </div>
        </div>
      </section>

      {/* How Raah works */}
      <section className="mb-16">
        <h2 className="font-condensed text-[24px] font-semibold mb-6 text-ink flex items-center gap-2">
          <div className="w-1.5 h-6 bg-river rounded-full" />
          How Raah works
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 bg-glacier border border-mist rounded-md">
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-white border-2 border-river rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Search className="w-7 h-7 text-river" />
            </div>
            <strong className="font-condensed text-xl block">Discover</strong>
            <span className="text-sm text-granite">Check the Live Map for current hazards.</span>
          </div>
          
          <div className="text-mist hidden md:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
          <div className="w-px h-8 bg-mist md:hidden"></div>

          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-white border-2 border-river rounded-full flex items-center justify-center mb-3 shadow-sm">
              <CheckCircle className="w-7 h-7 text-river" />
            </div>
            <strong className="font-condensed text-xl block">Check</strong>
            <span className="text-sm text-granite">Plan your trip based on verified data.</span>
          </div>
          
          <div className="text-mist hidden md:block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
          <div className="w-px h-8 bg-mist md:hidden"></div>

          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-white border-2 border-river rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Navigation className="w-7 h-7 text-river" />
            </div>
            <strong className="font-condensed text-xl block">Travel</strong>
            <span className="text-sm text-granite">Drive safely with offline emergency packs.</span>
          </div>
        </div>
      </section>

      {/* Our Goal & CTA */}
      <section className="bg-ink text-white p-8 rounded-md shadow-pop text-center">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-river-tint" />
        <h2 className="font-condensed text-[28px] font-semibold mb-4">Our Goal</h2>
        <p className="text-xl opacity-90 mb-8 max-w-lg mx-auto italic">
          "Better information leads to safer journeys."
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center bg-river text-white hover:bg-white hover:text-ink px-8 py-4 rounded-md font-condensed font-bold text-lg transition-colors"
        >
          Check Live Map
        </Link>
      </section>
    </div>
  );
};
