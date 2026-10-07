import React, { useState, createContext, useContext } from 'react';
import { Outlet, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Map, Navigation2, Bell, AlertCircle, Phone, Clock, Info, Menu, X, CloudRain, RotateCcw } from 'lucide-react';
import { RainSimulationModal } from './RainSimulationModal';

// Simple lang context if the store doesn't exist yet
export const LangCtx = createContext({ lang: 'en', toggleLang: () => {} });
export const DemoCtx = createContext({
  demo: { active: false },
  setStorm: () => {},
  setTimeMachine: () => {},
  deactivate: () => {},
  openSimModal: () => {},
  closeSimModal: () => {},
});

export function useLang() { return useContext(LangCtx); }
export function useDemo() { return useContext(DemoCtx); }

const NAV_ITEMS = [
  { key: 'map', name: 'Map', nameHi: 'नक्शा', path: '/', icon: Map },
  { key: 'plan', name: 'Plan trip', nameHi: 'यात्रा योजना', path: '/plan', icon: Navigation2 },
  { key: 'alerts', name: 'Alerts', nameHi: 'अलर्ट', path: '/alerts', icon: Bell },
  { key: 'report', name: 'Report', nameHi: 'रिपोर्ट', path: '/report', icon: AlertCircle },
  { key: 'emergency', name: 'Emergency', nameHi: 'आपातकालीन', path: '/emergency', icon: Phone },
  { key: 'past-events', name: 'Past events', nameHi: 'पिछली घटनाएँ', path: '/past-events', icon: Clock },
  { key: 'about', name: 'How it works', nameHi: 'कैसे काम करता है', path: '/about', icon: Info },
];

const NHShield = ({ size = 'sm' }) => (
  <div className={`bg-milestone text-ink font-condensed font-bold border-[1.5px] border-ink rounded-sm ${
    size === 'lg' ? 'px-3 py-1 text-base' : 'px-2 py-0.5 text-sm'
  }`}>
    NH 7
  </div>
);

const Layout = () => {
  const location = useLocation();
  const [lang, setLang] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demo, setDemo] = useState({ active: false, simulateRainMm: null, asOf: null });
  const [shieldClicks, setShieldClicks] = useState(0);
  const [searchParams] = useSearchParams();

  const [simModalOpen, setSimModalOpen] = useState(false);

  // Activate demo mode via ?demo=1 or 5 shield clicks
  const demoParam = searchParams.get('demo');
  const isDemoActive = demo.active || demoParam === '1' || demo.simulateRainMm != null;

  const handleShieldClick = () => {
    const next = shieldClicks + 1;
    setShieldClicks(next);
    if (next >= 5) {
      setDemo(d => ({ ...d, active: true }));
      setShieldClicks(0);
    }
  };

  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');

  const setStorm = (mm) => setDemo({ active: true, simulateRainMm: mm, asOf: null });
  const setTimeMachine = (date) => setDemo({ active: true, simulateRainMm: null, asOf: date });
  const deactivate = () => setDemo({ active: false, simulateRainMm: null, asOf: null });
  const openSimModal = () => setSimModalOpen(true);
  const closeSimModal = () => setSimModalOpen(false);

  const demoCtxValue = {
    demo: { ...demo, active: isDemoActive },
    setStorm,
    setTimeMachine,
    deactivate,
    openSimModal,
    closeSimModal,
  };
  const langCtxValue = { lang, toggleLang, setLang };

  return (
    <LangCtx.Provider value={langCtxValue}>
      <DemoCtx.Provider value={demoCtxValue}>
        <div className="min-h-[100dvh] flex flex-col bg-glacier">
          {/* Header matching design */}
          <header className="h-[60px] bg-[#0c1821] text-white flex items-center px-4 md:px-6 shrink-0 shadow-md z-30 sticky top-0 border-b border-white/5">
            <Link to="/" className="flex items-center gap-2.5 mr-6 focus:outline-none" aria-label="NH7 Raah home">
              <div className="bg-[#f59e0b] text-[#0c1821] font-condensed font-black px-2.5 py-0.5 rounded text-base tracking-wider border border-[#d97706]">
                NH7
              </div>
              <div className="flex flex-col">
                <span className="font-condensed font-bold text-xl leading-none text-white tracking-wide">Raah</span>
                <span className="text-[10px] text-gray-400 font-sans tracking-tight hidden sm:inline">Safer journeys through the mountains</span>
              </div>
            </Link>

            {/* Nav with rounded pill selector */}
            <nav className="hidden lg:flex gap-1.5 items-center flex-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                      isActive
                        ? 'bg-[#1e293b] text-white shadow-inner font-semibold border border-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lang === 'hi' ? item.nameHi : item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2.5">
              {/* Rain Simulation Trigger Button for presentation */}
              <button
                onClick={() => setSimModalOpen(true)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all font-semibold border shadow-sm ${
                  demo.simulateRainMm != null
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)] animate-pulse'
                    : 'bg-[#1e293b] text-sky-300 hover:text-white hover:bg-[#334155] border-white/10'
                }`}
                title="Rainfall Simulation Override (For Presentation & Stress-Testing)"
              >
                <CloudRain className={`w-3.5 h-3.5 ${demo.simulateRainMm != null ? 'text-amber-400' : 'text-sky-400'}`} />
                <span>{demo.simulateRainMm != null ? `Sim: ${demo.simulateRainMm} mm` : 'Simulate Rain'}</span>
              </button>

              {/* Quick Reset Button if Simulation is active */}
              {demo.simulateRainMm != null && (
                <button
                  onClick={deactivate}
                  className="hidden md:flex items-center gap-1 text-[11px] text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 px-2.5 py-1 rounded-full transition-colors font-medium"
                  title="Reset rainfall simulation to live weather"
                >
                  <RotateCcw className="w-3 h-3 text-rose-400" />
                  <span>Reset</span>
                </button>
              )}

              {/* Time Machine chip */}
              {demo.asOf && (
                <span className="hidden sm:inline text-xs font-condensed font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                  Replay: {demo.asOf}
                </span>
              )}

              {/* Lang toggle pill */}
              <div className="flex items-center bg-[#1e293b] rounded-full p-0.5 border border-white/10 text-xs">
                <button
                  onClick={() => setLang('hi')}
                  className={`px-2.5 py-1 rounded-full transition-colors ${lang === 'hi' ? 'bg-[#0284c7] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                  aria-label="Switch to Hindi"
                  title="हिन्दी (Hindi)"
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-[#0284c7] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                  aria-label="Switch to English"
                  title="English"
                >
                  EN
                </button>
              </div>

              {/* Officials button */}
              <Link
                to="/officials"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] border border-white/10 px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Officials
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                className="lg:hidden p-1.5 text-gray-300 hover:text-white rounded-md bg-[#1e293b]"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-ink text-white z-10 border-t border-white/10">
              <button
                onClick={() => {
                  setSimModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-sky-400 hover:text-white border-b border-white/10"
              >
                <CloudRain className="w-4 h-4" />
                Rainfall Simulation Studio
              </button>
              {NAV_ITEMS.slice(4).map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-white/10 ${
                    location.pathname === item.path ? 'text-white font-semibold' : 'text-mist hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {lang === 'hi' ? item.nameHi : item.name}
                </Link>
              ))}
              <Link
                to="/officials"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-mist hover:text-white border-b border-white/10"
              >
                Officials
              </Link>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-mist">Language / भाषा</span>
                <div className="flex items-center bg-[#1e293b] rounded-full p-0.5 border border-white/10 text-xs">
                  <button
                    onClick={() => setLang('hi')}
                    className={`px-2.5 py-1 rounded-full transition-colors ${lang === 'hi' ? 'bg-[#0284c7] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-[#0284c7] text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 flex flex-col relative" id="main-content">
            <Outlet context={{
              lang,
              demo: demoCtxValue.demo,
              setStorm,
              setTimeMachine,
              deactivate,
              toggleLang,
              openSimModal,
              closeSimModal,
              isSimModalOpen: simModalOpen,
            }} />
          </main>

          {/* Global Rainfall Simulation Modal */}
          <RainSimulationModal
            isOpen={simModalOpen}
            onClose={() => setSimModalOpen(false)}
            currentRainMm={demo.simulateRainMm}
            onApply={(mm) => setStorm(mm)}
            onReset={deactivate}
          />

          {/* Bottom nav - compact only */}
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-mist flex justify-around items-center z-10"
            style={{ height: '64px', paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Bottom navigation"
          >
            {NAV_ITEMS.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-full h-full text-xs font-condensed gap-0.5 transition-colors ${
                    active ? 'text-river' : 'text-granite'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 ${active ? 'stroke-river' : ''}`} strokeWidth={active ? 2.5 : 1.75} />
                  <span>{lang === 'hi' ? item.nameHi : item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </DemoCtx.Provider>
    </LangCtx.Provider>
  );
};

export default Layout;
