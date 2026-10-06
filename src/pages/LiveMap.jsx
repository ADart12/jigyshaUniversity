import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Map as MapIcon, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Layers, 
  Maximize,
  AlertTriangle,
  Car,
  CloudRain,
  Bell,
  Hospital,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const LiveMap = () => {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-glacier h-[calc(100dvh-56px)] lg:h-[calc(100dvh-56px)]">
      {/* Mock Map Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-[#e5e3df]"
        style={{
          backgroundImage: 'radial-gradient(#d1cfcb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Mock NH7 Route Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path 
            d="M 10% 80% Q 30% 60% 40% 40% T 80% 10%" 
            fill="none" 
            stroke="#1D5E6B" 
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Closed segment */}
          <path 
            d="M 40% 40% Q 50% 30% 60% 20%" 
            fill="none" 
            stroke="#1B2A33" 
            strokeWidth="6"
            strokeDasharray="10 10"
            strokeLinecap="round"
          />
        </svg>

        {/* Mock Markers */}
        <div className="absolute top-[30%] left-[55%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-risk-closed text-white rounded-md flex items-center justify-center shadow-md border-2 border-white mx-auto">
            <div className="w-4 h-1 bg-white" />
          </div>
          <div className="mt-1 bg-white px-2 py-0.5 rounded shadow text-xs font-condensed font-bold text-ink whitespace-nowrap text-center">Srinagar - Closed</div>
        </div>

        <div className="absolute top-[50%] left-[35%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-risk-high text-white rotate-45 flex items-center justify-center shadow-md border-2 border-white mx-auto">
            <AlertTriangle className="w-4 h-4 -rotate-45" />
          </div>
          <div className="mt-2 bg-white px-2 py-0.5 rounded shadow text-xs font-condensed font-bold text-ink whitespace-nowrap text-center">Devprayag - Landslide</div>
        </div>

        <div className="absolute top-[70%] left-[20%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-snow text-river rounded-full flex items-center justify-center shadow-md border border-mist">
            <Hospital className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Road Status Panel (Top Left Desktop, Bottom Mobile) */}
      <div className="absolute top-4 left-4 right-4 lg:right-auto lg:w-80 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-snow rounded-md shadow-pop border border-mist overflow-hidden pointer-events-auto">
          <div className="p-4 border-b border-mist bg-glacier/50">
            <h2 className="font-condensed text-xl font-semibold text-ink flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-river" />
              NH7 Live Status
            </h2>
          </div>
          <div className="p-4 space-y-4 font-sans text-sm">
            <div className="flex justify-between items-center">
              <span className="text-granite flex items-center gap-2"><MapPin className="w-4 h-4"/> Condition</span>
              <span className="font-semibold text-risk-high">High Risk</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-granite flex items-center gap-2"><Car className="w-4 h-4"/> Traffic</span>
              <span className="font-medium text-ink">Heavy near Srinagar</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-granite flex items-center gap-2"><CloudRain className="w-4 h-4"/> Weather</span>
              <span className="font-medium text-ink">Heavy Rain</span>
            </div>
            <div className="pt-3 border-t border-mist">
              <div className="flex items-start gap-2 text-risk-closed">
                <Bell className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-medium">1 Active Road Closure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Trip CTA */}
        <Link 
          to="/plan" 
          className="bg-river text-white p-4 rounded-md shadow-pop flex items-center justify-between hover:bg-ink transition-colors pointer-events-auto"
        >
          <span className="font-condensed font-semibold text-lg">Plan your trip</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Map Controls (Right Side) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-snow rounded-md shadow-sm border border-mist flex flex-col overflow-hidden">
          <button className="p-2 text-ink hover:bg-glacier transition-colors border-b border-mist" aria-label="Zoom in">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="p-2 text-ink hover:bg-glacier transition-colors" aria-label="Zoom out">
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
        <button className="p-2 bg-snow rounded-md shadow-sm border border-mist text-ink hover:bg-glacier transition-colors mt-2" aria-label="My location">
          <Crosshair className="w-5 h-5" />
        </button>
        <button className="p-2 bg-snow rounded-md shadow-sm border border-mist text-ink hover:bg-glacier transition-colors" aria-label="Layers">
          <Layers className="w-5 h-5" />
        </button>
        <button className="p-2 bg-snow rounded-md shadow-sm border border-mist text-ink hover:bg-glacier transition-colors hidden lg:block" aria-label="Fullscreen">
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Legend (Bottom Left Desktop, hidden on mobile to save space) */}
      <div className="absolute bottom-20 lg:bottom-4 left-4 z-10 hidden md:block">
        <div className="bg-snow p-3 rounded-md shadow-sm border border-mist text-xs font-sans pointer-events-auto">
          <h3 className="font-condensed font-semibold mb-2 text-ink">Legend</h3>
          <div className="space-y-2 text-granite">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-risk-low rounded-full" /> <span>Clear</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-risk-moderate" /> <span>Caution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-risk-high rotate-45" /> <span>Hazard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-risk-closed flex items-center justify-center">
                <div className="w-1.5 h-[1px] bg-white" />
              </div> <span>Closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
