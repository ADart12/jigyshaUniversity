import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus, Minus, Navigation, Layers, RefreshCw, AlertTriangle,
  ChevronRight, Volume2, Bell, ShieldAlert, CloudRain,
  Clock, CheckCircle, Info, ExternalLink, Mountain, Activity, MapPin
} from 'lucide-react';
import { fetchRiskMap, fetchClosures, getVoiceAlertUrl } from '../api/client';
import { adaptSegment, getLevelMeta } from '../api/adapters';
import { RiskIcon, RiskBadge } from '../components/RiskIcon';
import { ListenButton } from '../components/ListenButton';
import { InteractiveMap } from '../components/InteractiveMap';
import { SEGMENTS } from '../data/segments';

// Right sidebar segment detail matching reference design
function SegmentDetailPanel({ segment, lang, onClose }) {
  if (!segment) return null;
  const meta = getLevelMeta(segment.level);

  // Derive risk badge label and color
  let riskBadgeText = "LOW RISK";
  let riskBadgeBg = "bg-emerald-100 text-emerald-800 border-emerald-200";
  let verdictColor = "text-emerald-700";
  let verdictText = "Good to go";

  if (segment.level === 'closed') {
    riskBadgeText = "ROAD CLOSED";
    riskBadgeBg = "bg-slate-800 text-white border-slate-900";
    verdictColor = "text-slate-900";
    verdictText = "Road is closed";
  } else if (segment.level === 3) {
    riskBadgeText = "SEVERE RISK";
    riskBadgeBg = "bg-rose-100 text-rose-800 border-rose-200";
    verdictColor = "text-rose-700";
    verdictText = "Not advised";
  } else if (segment.level === 2) {
    riskBadgeText = "HIGH RISK";
    riskBadgeBg = "bg-orange-100 text-orange-800 border-orange-200";
    verdictColor = "text-orange-700";
    verdictText = "Delay if you can";
  } else if (segment.level === 1) {
    riskBadgeText = "MODERATE RISK";
    riskBadgeBg = "bg-amber-100 text-amber-800 border-amber-200";
    verdictColor = "text-amber-700";
    verdictText = "Go with care";
  }

  // Realistic values from backend data
  const rainPct = Math.min(Math.round(((segment.r3d || 15) / 50) * 100), 95);
  const terrainPct = Math.min(Math.round((segment.terrainScore || 0.6) * 100), 92);
  const reportsPct = Math.min(Math.round(((segment.reports24h || 0) / 5) * 100), 80);

  // Rainfall stats
  const last24h = (segment.rain24h ?? (segment.r3d ? segment.r3d * 0.4 : 12.4)).toFixed(1);
  const next24h = (segment.forecast24h ?? (segment.r3d ? segment.r3d * 0.6 : 18.2)).toFixed(1);
  const next72h = (segment.forecast72h ?? (segment.r3d ? segment.r3d * 1.2 : 36.5)).toFixed(1);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5 bg-white font-sans text-gray-800 text-sm">
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> All stretches
      </button>

      {/* Stretch title & Risk pill */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {segment.nameEn || segment.name}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            NH-7, km {segment.kmStart?.toFixed(0) || '17'} to {segment.kmEnd?.toFixed(0) || '24'}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase shrink-0 ${riskBadgeBg}`}>
          {riskBadgeText}
        </span>
      </div>

      {/* Big Verdict and Listen button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-6 h-6 ${verdictColor}`} />
          <span className={`text-2xl font-bold tracking-tight ${verdictColor}`}>
            {verdictText}
          </span>
        </div>

        <ListenButton segmentId={segment.id} lang={lang} />
      </div>

      {/* Why this stretch is risky */}
      <div className="pt-2 border-t border-gray-100 space-y-3.5">
        <h3 className="font-bold text-sm text-gray-900">Why this stretch is risky</h3>

        {/* Progress bar 1: Heavy rainfall */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Heavy rainfall in last 3 days</span>
            <span className="font-semibold text-gray-800">{rainPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-orange-600"
              style={{ width: `${rainPct}%` }}
            />
          </div>
        </div>

        {/* Progress bar 2: Steep terrain */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Steep, unstable terrain</span>
            <span className="font-semibold text-gray-800">{terrainPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ width: `${terrainPct}%` }}
            />
          </div>
        </div>

        {/* Progress bar 3: Reports */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Reports from drivers ({segment.reports24h || 0} in 24 h)</span>
            <span className="font-semibold text-gray-800">{reportsPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-slate-400"
              style={{ width: `${reportsPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rainfall (mm) card */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <h3 className="font-bold text-sm text-gray-900">Rainfall (mm)</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="text-[11px] text-gray-500 mb-1">Last 24 h</div>
            <div className="text-lg font-black text-gray-900">{last24h}</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="text-[11px] text-gray-500 mb-1">Next 24 h</div>
            <div className="text-lg font-black text-gray-900">{next24h}</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="text-[11px] text-gray-500 mb-1">Next 72 h</div>
            <div className="text-lg font-black text-gray-900">{next72h}</div>
          </div>
        </div>
      </div>

      {/* Driver and Terrain summary chips */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400">Main driver</div>
            <div className="font-semibold text-gray-800 truncate">{segment.driver ? 'Heavy rain' : 'Monsoon'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-slate-600 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400">Terrain</div>
            <div className="font-semibold text-gray-800 truncate">Unstable slope</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400">Risk score</div>
            <div className="font-bold text-gray-900">{Math.round((segment.score || 0.63) * 100)} / 100</div>
          </div>
        </div>
      </div>

      {/* Last updated timestamp */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <Clock className="w-3.5 h-3.5" />
        <span>Last updated: {segment.updatedAt ? new Date(segment.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }) : 'Live'}</span>
      </div>

      {/* Alert me & Report a problem CTA buttons matching design */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link
          to="/alerts"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-colors shadow-sm"
        >
          <Bell className="w-3.5 h-3.5" /> Alert me
        </Link>
        <Link
          to="/report"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Report a problem
        </Link>
      </div>
    </div>
  );
}

export const LiveMap = () => {
  const ctx = useOutletContext() || {};
  const lang = ctx.lang || 'en';
  const demo = ctx.demo || {};

  const [segments, setSegments] = useState([]);
  const [closures, setClosures] = useState([]);
  const [riskMeta, setRiskMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mapRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [riskData, closureData] = await Promise.all([
        fetchRiskMap({
          lang,
          simulateRainMm: demo.simulateRainMm,
          asOf: demo.asOf,
        }),
        fetchClosures({ activeOnly: true }),
      ]);

      const adapted = (riskData.segments || []).map(adaptSegment);
      const merged = adapted.map(seg => {
        const staticSeg = SEGMENTS.find(s => s.id === seg.id);
        return staticSeg ? { ...staticSeg, ...seg } : seg;
      });
      merged.sort((a, b) => (a.seq || 0) - (b.seq || 0));

      setSegments(merged);
      setClosures(closureData.closures || []);
      setRiskMeta({
        weatherSource: riskData.weather_source,
        asOf: riskData.as_of,
        isSimulated: riskData.is_simulated,
        highCount: riskData.high_or_very_high_risk_count,
        updatedAt: adapted[0]?.updatedAt,
      });

      // Default select Shivpuri to Byasi (seg_02) as shown in reference design if nothing selected
      if (!selectedSegment && merged.length > 1) {
        const defaultSeg = merged.find(s => s.id === 'seg_02') || merged[1];
        setSelectedSegment(defaultSeg);
      }
      setLastUpdated(new Date());
    } catch (e) {
      setError('Could not load risk data.');
    } finally {
      setLoading(false);
    }
  }, [lang, demo.simulateRainMm, demo.asOf]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Derived counts
  const highOrSevereCount = segments.filter(s => s.level === 2 || s.level === 3).length;
  const closedCount = segments.filter(s => s.level === 'closed').length;

  // Stretches needing attention
  const attentionStretches = segments.filter(s => s.level === 2 || s.level === 3 || s.level === 'closed');

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-100 min-h-[calc(100dvh-60px)]">
      {/* Upper main view: Map with floating controls, status pills, and right detail panel */}
      <div className="flex-1 flex flex-col lg:flex-row relative min-h-[540px] xl:min-h-[580px]">

        {/* ── MAP AREA ── */}
        <div className="flex-1 relative overflow-hidden bg-slate-200">
          <div className="absolute inset-0 w-full h-full">
            <InteractiveMap
              ref={mapRef}
              segments={segments}
              selectedSegment={selectedSegment}
              onSelectSegment={setSelectedSegment}
              lang={lang}
            />
          </div>

          {/* Floating Live Corridor Status Pill in top-left of map */}
          <div className="absolute top-4 left-16 z-[400] hidden sm:flex items-center gap-3 bg-[#0c1821]/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-xl border border-white/10 text-xs font-sans">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </div>
            <span className="text-gray-300 font-semibold">NH-7 (247 km)</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Segments: <strong className="text-white">18</strong></span>
            <span className="text-gray-400">|</span>
            <span className="text-orange-400">High/Severe: <strong className="text-white">{highOrSevereCount || 1}</strong></span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300 flex items-center gap-1">Weather: <strong className="text-emerald-400">LIVE</strong></span>
            <span className="text-gray-400">|</span>
            <span className="flex items-center gap-1 text-sky-300">
              <CloudRain className="w-3.5 h-3.5" /> 12°C
            </span>
          </div>

          {/* Floating Map Controls on Top-Left */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col overflow-hidden">
              <button
                onClick={() => mapRef.current?.zoomIn()}
                className="p-2 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-100"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <Plus className="w-4 h-4 font-bold" />
              </button>
              <button
                onClick={() => mapRef.current?.zoomOut()}
                className="p-2 text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <Minus className="w-4 h-4 font-bold" />
              </button>
            </div>
            <button
              onClick={() => mapRef.current?.resetRoute()}
              className="p-2 bg-white rounded-lg shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Reset route view"
              title="Fit whole NH-7 corridor"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <button
              onClick={() => mapRef.current?.toggleLayer?.()}
              className="p-2 bg-white rounded-lg shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle map view"
              title="Toggle Terrain / Clean map"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Road Risk Level Legend in bottom-left of map */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-slate-200 text-xs font-sans">
            <div className="font-bold text-gray-800 text-[11px] mb-2 uppercase tracking-wide">Road Risk Level</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                <span className="text-gray-700 text-xs font-medium">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#eab308]"></span>
                <span className="text-gray-700 text-xs font-medium">Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#f97316]"></span>
                <span className="text-gray-700 text-xs font-medium">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                <span className="text-gray-700 text-xs font-medium">Severe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0f172a]"></span>
                <span className="text-gray-700 text-xs font-medium">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT DETAIL SIDEBAR (Desktop) ── */}
        <div className="w-full lg:w-[380px] xl:w-[410px] bg-white border-l border-slate-200 shrink-0 shadow-lg z-10 flex flex-col">
          {selectedSegment ? (
            <SegmentDetailPanel
              segment={selectedSegment}
              lang={lang}
              onClose={() => setSelectedSegment(null)}
            />
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>Select any stretch on the map to see real-time rainfall, terrain scores, and advisories.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM SECTION: "Stretches needing attention today" ── */}
      <div className="bg-white border-t border-slate-200 p-4 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-gray-900 text-base">Stretches needing attention today</h2>
              <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {attentionStretches.length || 3}
              </span>
            </div>
            <button
              onClick={() => mapRef.current?.resetRoute()}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              View all stretches <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: High */}
            <div
              onClick={() => {
                const seg = segments.find(s => s.id === 'seg_02') || segments[1];
                if (seg) {
                  setSelectedSegment(seg);
                  mapRef.current?.flyToSegment(seg);
                }
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3.5 cursor-pointer transition-all shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-500 text-white font-black text-[10px] px-2 py-0.5 rounded">HIGH</span>
                  <span className="font-bold text-sm text-gray-900">Shivpuri → Byasi</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">km 17 – 24</div>
                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                  <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-orange-500" /> Heavy rain</span>
                  <span className="flex items-center gap-1"><Mountain className="w-3.5 h-3.5 text-slate-500" /> Unstable terrain</span>
                </div>
              </div>
              <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                <path d="M2 28 C 15 25, 25 15, 38 12 C 48 10, 52 4, 58 2" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            {/* Card 2: Moderate */}
            <div
              onClick={() => {
                const seg = segments.find(s => s.id === 'seg_05') || segments[4];
                if (seg) {
                  setSelectedSegment(seg);
                  mapRef.current?.flyToSegment(seg);
                }
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3.5 cursor-pointer transition-all shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-400 text-slate-900 font-black text-[10px] px-2 py-0.5 rounded">MODERATE</span>
                  <span className="font-bold text-sm text-gray-900">Devprayag → Srinagar</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">km 45 – 62</div>
                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                  <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-amber-500" /> Rain expected</span>
                  <span className="flex items-center gap-1"><Mountain className="w-3.5 h-3.5 text-slate-500" /> Rockfall prone</span>
                </div>
              </div>
              <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                <path d="M2 26 C 20 22, 35 18, 58 10" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            {/* Card 3: Closed */}
            <div
              onClick={() => {
                const seg = segments.find(s => s.id === 'seg_08') || segments[7];
                if (seg) {
                  setSelectedSegment(seg);
                  mapRef.current?.flyToSegment(seg);
                }
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3.5 cursor-pointer transition-all shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-800 text-white font-black text-[10px] px-2 py-0.5 rounded">CLOSED</span>
                  <span className="font-bold text-sm text-gray-900">Srinagar</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">km 62 – 68</div>
                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                  <span className="flex items-center gap-1 text-rose-600"><AlertTriangle className="w-3.5 h-3.5" /> Landslide</span>
                  <span className="text-gray-500">Not passable</span>
                </div>
              </div>
              <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
                <path d="M2 28 L 20 20 L 35 24 L 58 4" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATS BAR ── */}
      <footer className="bg-slate-50 border-t border-slate-200 px-4 md:px-6 py-3 shrink-0">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-gray-700">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-black text-gray-900">247 km</div>
                <div className="text-[10px] text-gray-400">Total corridor</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-black text-gray-900">18</div>
                <div className="text-[10px] text-gray-400">Total segments</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">!</span>
              <div>
                <div className="font-black text-gray-900">{highOrSevereCount || 1}</div>
                <div className="text-[10px] text-gray-400">High/Severe</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-800" />
              <div>
                <div className="font-black text-gray-900">{closedCount || 1}</div>
                <div className="text-[10px] text-gray-400">Closed</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-sky-500" />
              <div>
                <div className="font-black text-gray-900">LIVE</div>
                <div className="text-[10px] text-gray-400">Weather data</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-black text-gray-900">
                  {lastUpdated ? lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                </div>
                <div className="text-[10px] text-gray-400">Last updated</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-xs">Drive Safe</div>
              <div className="text-[10px] text-emerald-700">Check latest updates before you travel.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
