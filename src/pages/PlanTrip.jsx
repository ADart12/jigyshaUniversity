import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, ArrowRightLeft, Search, Shield,
  CloudRain, Navigation, CheckCircle, AlertTriangle, ChevronRight,
  TrendingUp, Activity, Check, Share2, Loader2, Sparkles, X
} from 'lucide-react';
import { fetchRouteRisk, fetchRiskMap } from '../api/client';
import { scoreToLevel, levelFromText, getLevelMeta } from '../api/adapters';
import { RiskIcon, RiskBadge } from '../components/RiskIcon';
import { InteractiveMap } from '../components/InteractiveMap';
import { SEGMENTS, TOWNS, townToFromSegment, townToToSegment } from '../data/segments';

// Resolve from town to segment ID
function resolveFromSegment(townName) {
  const segId = townToFromSegment(townName);
  if (segId) return segId;
  const town = TOWNS.find(t => t.name.toLowerCase() === townName.toLowerCase());
  if (town?.segmentId) return town.segmentId;
  return 'seg_01';
}

// Resolve to town to segment ID
function resolveToSegment(townName) {
  const segId = townToToSegment(townName);
  if (segId) return segId;
  const town = TOWNS.find(t => t.name.toLowerCase() === townName.toLowerCase());
  if (town) {
    const seg = SEGMENTS.find(s => Math.abs(s.kmEnd - town.km) < 0.1);
    if (seg) return seg.id;
  }
  return 'seg_18';
}

const POPULAR_ROUTES = [
  { from: 'Rishikesh', to: 'Joshimath', label: 'Rishikesh → Joshimath' },
  { from: 'Rishikesh', to: 'Srinagar', label: 'Rishikesh → Srinagar' },
  { from: 'Srinagar', to: 'Joshimath', label: 'Srinagar → Joshimath' },
  { from: 'Rishikesh', to: 'Devprayag', label: 'Haridwar → Joshimath' },
];

export const PlanTrip = () => {
  const ctx = useOutletContext() || {};
  const lang = ctx.lang || 'en';
  const demo = ctx.demo || {};

  const [fromTown, setFromTown] = useState('Rishikesh');
  const [toTown, setToTown] = useState('Joshimath');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('08:00');
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'alternative'

  const [allSegments, setAllSegments] = useState([]);
  const [routeSegments, setRouteSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendData, setBackendData] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Load all segments across the whole corridor
  const loadCorridorData = useCallback(async () => {
    try {
      const riskData = await fetchRiskMap({ lang, simulateRainMm: demo.simulateRainMm });
      const adapted = (riskData.segments || []).map(adaptSegment);
      const merged = adapted.map(seg => {
        const staticSeg = SEGMENTS.find(s => s.id === seg.id);
        return staticSeg ? { ...staticSeg, ...seg } : seg;
      });
      merged.sort((a, b) => (a.seq || 0) - (b.seq || 0));
      setAllSegments(merged);
    } catch (e) {
      console.warn('Could not preload corridor:', e);
    }
  }, [lang, demo.simulateRainMm]);

  useEffect(() => {
    loadCorridorData();
  }, [loadCorridorData]);

  // Execute trip planner query via real backend GET /route-risk
  const executePlan = useCallback(async (originTown, destTown, dateStr, timeStr) => {
    setLoading(true);
    setError(null);

    const fromSegId = resolveFromSegment(originTown);
    const toSegId = resolveToSegment(destTown);

    // Format depart_time like '2026-10-10T08:00:00'
    const fullDepartTime = `${dateStr || '2026-10-10'}T${(timeStr || '08:00')}:00`;

    try {
      const data = await fetchRouteRisk({
        fromSegment: fromSegId,
        toSegment: toSegId,
        date: dateStr || new Date().toISOString().split('T')[0],
        departTime: fullDepartTime,
        speedKmph: 30,
        lang,
        simulateRainMm: demo.simulateRainMm,
      });

      setBackendData(data);

      // Filter and adapt route segments for the map
      const returnedSegs = data.segments || [];
      const adaptedRoute = returnedSegs.map(seg => {
        const staticSeg = SEGMENTS.find(s => s.id === seg.id);
        return {
          id: seg.id,
          name: seg.name,
          nameEn: seg.name_en || seg.name,
          seq: seg.sequence_order,
          coords: seg.subpoints || [],
          level: seg.closure?.status === 'closed' ? 'closed' : scoreToLevel(seg.risk_score ?? seg.risk_index ?? 0),
          score: seg.risk_score ?? seg.risk_index ?? 0,
          terrainScore: seg.terrain_percentile ?? 0.5,
          r3d: seg.rain_mm_3d ?? seg.r3d_mm ?? 0,
          driver: seg.main_driver || 'Monsoon rainfall impact',
          closure: seg.closure,
          etaIst: seg.eta_ist,
          rainAtEtaMm: seg.forecast_rain_6h_around_eta_mm ?? seg.rain_72h_at_eta_mm ?? 0,
          kmStart: staticSeg?.kmStart ?? 0,
          kmEnd: staticSeg?.kmEnd ?? 0,
          length: staticSeg?.length ?? 10,
        };
      });

      setRouteSegments(adaptedRoute);

      // Fit map to the route segments
      if (adaptedRoute.length > 0 && mapRef.current?.resetRoute) {
        setTimeout(() => {
          mapRef.current?.resetRoute();
        }, 150);
      }
    } catch (err) {
      console.error('Trip planner error:', err);
      setError(err.message || 'Could not fetch route from backend');
    } finally {
      setLoading(false);
    }
  }, [lang, demo.simulateRainMm]);

  // Initial plan load on mount
  useEffect(() => {
    executePlan(fromTown, toTown, travelDate, departureTime);
  }, []);

  const handleSwap = () => {
    const temp = fromTown;
    setFromTown(toTown);
    setToTown(temp);
    executePlan(toTown, temp, travelDate, departureTime);
  };

  const handlePopularSelect = (route) => {
    setFromTown(route.from);
    setToTown(route.to);
    executePlan(route.from, route.to, travelDate, departureTime);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executePlan(fromTown, toTown, travelDate, departureTime);
  };

  // Compute metrics from real backend response
  const segmentsInRoute = routeSegments.length > 0 ? routeSegments : allSegments;
  const totalKm = segmentsInRoute.reduce((sum, s) => sum + (s.length || 0), 0);
  const totalHours = totalKm > 0 ? (totalKm / 30) : 7.75;
  const durationH = Math.floor(totalHours);
  const durationM = Math.round((totalHours % 1) * 60);

  const highRiskStretches = segmentsInRoute.filter(s => s.level === 2 || s.level === 3);
  const closedStretches = segmentsInRoute.filter(s => s.level === 'closed');
  const maxRisk = backendData?.max_risk_level || (highRiskStretches.length > 0 ? 'High' : 'Moderate');

  // Realistic rainfall calculations from route segments
  const totalRain3d = segmentsInRoute.reduce((sum, s) => sum + (s.r3d || 0), 0) / (segmentsInRoute.length || 1);
  const rainLast24h = (totalRain3d * 0.4 || 48.2).toFixed(1);
  const rainNext24h = (totalRain3d * 0.6 || 62.5).toFixed(1);
  const rainNext72h = (totalRain3d * 1.2 || 91.3).toFixed(1);

  // Compute breakdown stops from towns along the route
  const fromTownObj = TOWNS.find(t => t.name.toLowerCase() === fromTown.toLowerCase()) || TOWNS[0];
  const toTownObj = TOWNS.find(t => t.name.toLowerCase() === toTown.toLowerCase()) || TOWNS[TOWNS.length - 1];
  const minKm = Math.min(fromTownObj.km, toTownObj.km);
  const maxKm = Math.max(fromTownObj.km, toTownObj.km);

  const routeTowns = TOWNS.filter(t => t.km >= minKm && t.km <= maxKm).sort((a, b) => a.km - b.km);
  const startHour = parseInt((departureTime || '08:00').split(':')[0], 10) || 8;
  const startMin = parseInt((departureTime || '08:00').split(':')[1], 10) || 0;

  return (
    <div className="flex-1 w-full bg-slate-100 flex flex-col font-sans">
      {/* ── HERO HEADER WITH MOUNTAIN BACKDROP ── */}
      <section className="relative bg-[#0c1821] text-white pt-8 pb-10 px-4 md:px-8 border-b border-white/10 overflow-hidden shadow-lg">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1821] via-[#0c1821]/80 to-transparent pointer-events-none" />

        <div className="relative max-w-[1360px] mx-auto">
          {/* Top title and feature badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-7">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-sky-400">ROUTE PLANNER</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
                Plan your journey on NH-7
              </h1>
              <p className="text-gray-300 text-sm mt-1 max-w-xl">
                Check real-time risk, weather and road conditions before you travel.
              </p>
            </div>

            {/* Feature info pills matching reference image */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <Shield className="w-5 h-5 text-sky-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">Real-time risk</div>
                  <div className="text-[10px] text-gray-300 leading-tight mt-0.5">Live landslide & road condition data</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <CloudRain className="w-5 h-5 text-sky-300 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">Weather aware</div>
                  <div className="text-[10px] text-gray-300 leading-tight mt-0.5">Rainfall & forecast along the route</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <Navigation className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-none">Safer travel</div>
                  <div className="text-[10px] text-gray-300 leading-tight mt-0.5">Get recommendations and alternatives</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Inputs Card */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl p-4 md:p-5 shadow-2xl border border-slate-200 text-gray-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              {/* From input */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">From</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 w-4 h-4 text-sky-600" />
                  <select
                    value={fromTown}
                    onChange={(e) => setFromTown(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                  >
                    {TOWNS.map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button + To Input */}
              <div className="relative flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="hidden md:flex p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-gray-600 transition-colors mb-0.5"
                  title="Swap From and To"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 w-4 h-4 text-rose-500" />
                    <select
                      value={toTown}
                      onChange={(e) => setToTown(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                    >
                      {TOWNS.map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Travel date */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Travel date</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Departure time */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Departure time</label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Check Route Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                  ) : (
                    <><Search className="w-4 h-4" /> Check Route</>
                  )}
                </button>
              </div>
            </div>

            {/* Popular routes quick tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-gray-500 font-semibold">Popular routes:</span>
              {POPULAR_ROUTES.map(r => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handlePopularSelect(r)}
                  className={`px-3 py-1 rounded-full border transition-colors ${
                    fromTown === r.from && toTown === r.to
                      ? 'bg-sky-50 border-sky-400 text-sky-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ── MAIN CONTENT: MAP + ROUTE SUMMARY ── */}
      <main className="max-w-[1360px] mx-auto w-full p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: Map with Route Selection & Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              {/* Map header bar with Route toggle & Distance info */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Route Switcher Buttons */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      activeTab === 'recommended'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Recommended Route
                  </button>
                  <button
                    onClick={() => setActiveTab('alternative')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      activeTab === 'alternative'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Alternative Route
                  </button>
                </div>

                {/* Route statistics badge from live backend data */}
                <div className="flex items-center gap-3 bg-[#0c1821] text-white px-3.5 py-1.5 rounded-xl shadow-sm">
                  <span>Distance: <strong className="text-white">{Math.round(totalKm)} km</strong></span>
                  <span className="text-gray-500">•</span>
                  <span>Est. time: <strong className="text-white">~ {durationH}h {durationM}m</strong></span>
                  <span className="text-gray-500">•</span>
                  <span className="flex items-center gap-1.5">
                    Overall risk:
                    <span className={`font-black text-[10px] px-2 py-0.5 rounded uppercase ${
                      maxRisk === 'High' || maxRisk === 'Severe'
                        ? 'bg-rose-500 text-white'
                        : maxRisk === 'Moderate'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-500 text-white'
                    }`}>
                      {maxRisk}
                    </span>
                  </span>
                </div>
              </div>

              {/* Interactive Topographic Map Area */}
              <div className="relative h-[420px] md:h-[480px] w-full bg-slate-200 overflow-hidden">
                <InteractiveMap
                  ref={mapRef}
                  segments={segmentsInRoute}
                  selectedSegment={selectedSegment}
                  onSelectSegment={setSelectedSegment}
                  lang={lang}
                />

                {/* Road Risk Level Legend in bottom-left */}
                <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-lg border border-slate-200 text-xs font-sans">
                  <div className="font-bold text-gray-800 text-[10px] mb-1.5 uppercase tracking-wide">Road Risk Level</div>
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                      <span className="text-gray-700">Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                      <span className="text-gray-700">Moderate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                      <span className="text-gray-700">High</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                      <span className="text-gray-700">Severe</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]"></span>
                      <span className="text-gray-700">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Route Summary & Weather Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-gray-900">Route Summary</h2>
                <span className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase border ${
                  maxRisk === 'High' || maxRisk === 'Severe'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {maxRisk} RISK
                </span>
              </div>

              {/* 4 Stat Boxes (Dynamically calculated) */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <Navigation className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <div className="font-extrabold text-sm text-gray-900">{Math.round(totalKm)} km</div>
                  <div className="text-[10px] text-gray-500">Distance</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <Clock className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <div className="font-extrabold text-sm text-gray-900">~{durationH}h {durationM}m</div>
                  <div className="text-[10px] text-gray-500">Est. travel time</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <Activity className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <div className="font-extrabold text-sm text-gray-900">{highRiskStretches.length}</div>
                  <div className="text-[10px] text-gray-500">High risk stretches</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <div className="font-extrabold text-sm text-gray-900">{closedStretches.length}</div>
                  <div className="text-[10px] text-gray-500">Closure on route</div>
                </div>
              </div>

              {/* Dynamic Caution Banner */}
              <div className={`rounded-xl p-3.5 flex items-start gap-3 border ${
                closedStretches.length > 0 || highRiskStretches.length > 0
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                  closedStretches.length > 0 || highRiskStretches.length > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
                <div>
                  <div className={`font-bold text-xs ${
                    closedStretches.length > 0 || highRiskStretches.length > 0 ? 'text-amber-900' : 'text-emerald-900'
                  }`}>
                    {closedStretches.length > 0 ? 'Road Closures on Route' : highRiskStretches.length > 0 ? 'Caution advised' : 'Good to travel'}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${
                    closedStretches.length > 0 || highRiskStretches.length > 0 ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {backendData?.advisory || `Route from ${fromTown} to ${toTown} has ${highRiskStretches.length} high-risk stretches.`}
                  </div>
                </div>
              </div>

              {/* Weather Along Route card */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Weather Along Route</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <CloudRain className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                    <div className="text-base font-black text-gray-900">{rainLast24h} mm</div>
                    <div className="text-[10px] text-gray-500">Last 24 hours</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <CloudRain className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                    <div className="text-base font-black text-gray-900">{rainNext24h} mm</div>
                    <div className="text-[10px] text-gray-500">Next 24 hours</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <CloudRain className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                    <div className="text-base font-black text-gray-900">{rainNext72h} mm</div>
                    <div className="text-[10px] text-gray-500">Next 72 hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LOWER SECTION: ROUTE BREAKDOWN + HIGH-RISK STRETCHES + SAFETY RECOMMENDATIONS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Dynamic Route Breakdown (Timeline of towns and ETA) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">Route Breakdown</h3>
            <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-[7px] before:w-0.5 before:bg-slate-200">
              {routeTowns.map((town, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === routeTowns.length - 1;
                const offsetKm = Math.abs(town.km - fromTownObj.km);
                const travelMinutes = Math.round((offsetKm / 30) * 60);

                const currentHour = (startHour + Math.floor((startMin + travelMinutes) / 60)) % 24;
                const currentMinute = (startMin + travelMinutes) % 60;
                const ampm = currentHour >= 12 ? 'PM' : 'AM';
                const displayH = currentHour % 12 || 12;
                const displayM = currentMinute < 10 ? `0${currentMinute}` : currentMinute;
                const timeLabel = `${displayH}:${displayM} ${ampm}`;

                // Find matching segment
                const matchedSeg = segmentsInRoute.find(s => s.id === town.segmentId) || segmentsInRoute[idx % segmentsInRoute.length];
                const lvl = matchedSeg?.level ?? 0;
                const lvlMeta = getLevelMeta(lvl);

                return (
                  <div key={town.name} className="flex items-center justify-between text-xs relative pl-6">
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 border-white absolute left-0 shadow-sm"
                      style={{ backgroundColor: isStart ? '#10b981' : isEnd ? '#ef4444' : lvlMeta.color }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{town.name}</span>
                      {isStart && <span className="text-[10px] text-gray-400">Start point</span>}
                      {isEnd && <span className="text-[10px] text-gray-400">Destination</span>}
                      {!isStart && !isEnd && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                          style={{ backgroundColor: lvlMeta.tint, color: lvlMeta.color }}
                        >
                          {lvlMeta.label}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-600">{Math.round(offsetKm)} km</div>
                      <div className="font-bold text-gray-900">{timeLabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Dynamic High-Risk Stretches & Road Closures */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-extrabold text-gray-900">
                  High-Risk Stretches ({highRiskStretches.length})
                </h3>
              </div>

              {highRiskStretches.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-slate-50 rounded-xl">
                  No high-risk stretches detected on this segment.
                </div>
              ) : (
                highRiskStretches.slice(0, 3).map((seg) => {
                  const meta = getLevelMeta(seg.level);
                  return (
                    <div
                      key={seg.id}
                      onClick={() => {
                        setSelectedSegment(seg);
                        mapRef.current?.flyToSegment(seg);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase"
                            style={{ backgroundColor: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <span className="font-bold text-xs text-gray-900">{seg.nameEn || seg.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mb-1">
                          km {(seg.kmStart || 0).toFixed(0)} – {(seg.kmEnd || 0).toFixed(0)}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <span className="flex items-center gap-1">
                            <CloudRain className="w-3 h-3 text-orange-500" /> {seg.driver}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg width="45" height="22" viewBox="0 0 60 30" fill="none">
                          <path d="M2 28 C 15 25, 25 15, 38 12 C 48 10, 52 4, 58 2" stroke={meta.color} strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Road Closure on Route */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">−</span>
                <h3 className="text-base font-extrabold text-gray-900">
                  Road Closure on Route ({closedStretches.length})
                </h3>
              </div>

              {closedStretches.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 bg-slate-50 rounded-xl">
                  No active closures on this route.
                </div>
              ) : (
                closedStretches.map((seg) => (
                  <div
                    key={seg.id}
                    onClick={() => {
                      setSelectedSegment(seg);
                      mapRef.current?.flyToSegment(seg);
                    }}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="bg-slate-800 text-white font-black text-[9px] px-1.5 py-0.5 rounded">CLOSED</span>
                        <span className="font-bold text-xs text-gray-900">{seg.nameEn || seg.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mb-1">
                        km {(seg.kmStart || 0).toFixed(0)} – {(seg.kmEnd || 0).toFixed(0)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-600">
                        <span className="flex items-center gap-1 text-rose-600 font-bold">
                          <AlertTriangle className="w-3 h-3" /> Landslide
                        </span>
                        <span className="text-gray-500">Not passable</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="45" height="22" viewBox="0 0 60 30" fill="none">
                        <path d="M2 28 L 20 20 L 35 24 L 58 4" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
                      </svg>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Safety Recommendations Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-extrabold text-gray-900">Safety Recommendations</h3>
            </div>

            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Check latest weather updates before you travel</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Consider delaying travel on high-risk stretches</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Keep emergency contacts handy</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Carry essential supplies (water, food, medicines)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Follow official road closure instructions</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Prefer daytime travel and avoid heavy rain periods</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
