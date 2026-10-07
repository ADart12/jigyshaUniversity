import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, Ambulance, Flame, Wrench, Loader2, WifiOff } from 'lucide-react';
import { fetchOfflinePack } from '../api/client';
import { useOutletContext } from 'react-router-dom';

const FALLBACK_CONTACTS = [
  { name: 'National Emergency', phone: '112', icon: ShieldAlert, color: 'text-risk-severe', bg: 'bg-tint-severe' },
  { name: 'Ambulance', phone: '108', icon: Ambulance, color: 'text-risk-high', bg: 'bg-tint-high' },
  { name: 'Police', phone: '100', icon: Phone, color: 'text-river', bg: 'bg-river-tint' },
  { name: 'Highway Assistance', phone: '1033', icon: Wrench, color: 'text-risk-moderate', bg: 'bg-tint-moderate' },
  { name: 'Fire', phone: '101', icon: Flame, color: 'text-risk-high', bg: 'bg-tint-high' },
];

export const Emergency = () => {
  const ctx = useOutletContext() || {};
  const lang = ctx.lang || 'en';

  const [packData, setPackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    async function loadPack() {
      try {
        const storedEtag = localStorage.getItem('offline_pack_etag');
        const result = await fetchOfflinePack(storedEtag);
        if (result.notModified) {
          const stored = localStorage.getItem('offline_pack_data');
          if (stored) setPackData(JSON.parse(stored));
          setCached(true);
        } else if (result.data) {
          setPackData(result.data);
          localStorage.setItem('offline_pack_data', JSON.stringify(result.data));
          if (result.etag) localStorage.setItem('offline_pack_etag', result.etag);
        }
      } catch {
        const stored = localStorage.getItem('offline_pack_data');
        if (stored) {
          setPackData(JSON.parse(stored));
          setCached(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadPack();
  }, []);

  const contacts = packData?.emergency_contacts || [];
  const segments = packData?.segments || [];

  return (
    <div className="flex-1 w-full max-w-[720px] mx-auto p-4 lg:p-8 space-y-8 pb-24">
      <div>
        <h1 className="font-condensed text-[28px] leading-[34px] font-semibold flex items-center gap-2 mb-2">
          <ShieldAlert className="w-7 h-7 text-risk-severe" />
          {lang === 'hi' ? 'आपातकालीन सहायता' : 'Emergency Assistance'}
        </h1>
        {cached && (
          <div className="flex items-center gap-1 text-xs text-granite font-sans">
            <WifiOff className="w-3 h-3" /> Showing cached data
          </div>
        )}
      </div>

      {/* 112 big button */}
      <section className="bg-risk-severe text-white p-6 rounded-md shadow-pop flex flex-col items-center justify-center text-center">
        <h2 className="font-condensed text-[40px] font-bold mb-1">112</h2>
        <p className="font-sans font-medium mb-4 opacity-90">National Emergency Number</p>
        <a
          href="tel:112"
          className="w-full sm:w-auto px-8 py-3 bg-white text-risk-severe rounded-full font-condensed font-bold text-xl hover:bg-snow transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-6 h-6 fill-current" />
          CALL 112
        </a>
      </section>

      {/* Contacts from pack or fallback */}
      <section>
        <h2 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Emergency Services</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-granite text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(contacts.length > 0 ? contacts.map((c) => ({ name: c.name, phone: c.phone, icon: Phone, color: 'text-river', bg: 'bg-river-tint' })) : FALLBACK_CONTACTS).map((service, idx) => {
              const Icon = service.icon || Phone;
              return (
                <a
                  key={idx}
                  href={`tel:${service.phone}`}
                  className="flex items-center justify-between p-4 bg-snow border border-mist rounded-md hover:bg-glacier transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${service.bg || 'bg-river-tint'} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${service.color || 'text-river'}`} />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-ink">{service.name}</div>
                      <div className="text-granite text-sm">{service.phone}</div>
                    </div>
                  </div>
                  <Phone className="w-5 h-5 text-granite" />
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Nearest hospital by stretch */}
      {segments.length > 0 && (
        <section>
          <h2 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Nearest hospital by stretch</h2>
          <div className="space-y-2">
            {segments.slice(0, 8).map((seg, i) => (
              <div key={i} className="p-3 bg-snow border border-mist rounded-md text-sm font-sans">
                <div className="font-medium text-ink">{seg.name_hi && lang === 'hi' ? seg.name_hi : seg.name}</div>
                {seg.nearest_hospital && <div className="text-granite">{seg.nearest_hospital}</div>}
                {seg.advisory_en && lang === 'en' && <div className="text-xs text-granite italic mt-1">{seg.advisory_en}</div>}
                {seg.advisory_hi && lang === 'hi' && <div className="text-xs text-granite italic mt-1">{seg.advisory_hi}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other ways */}
      <section className="bg-glacier border border-mist p-5 rounded-md">
        <h2 className="font-condensed text-[18px] font-semibold mb-3 text-ink">Other ways to reach us</h2>
        <div className="space-y-3 text-sm font-sans">
          <div>
            <strong>SMS:</strong> Text <code className="bg-white px-1 rounded">NH7 HELP</code> to get started.
            Try: <code className="bg-white px-1 rounded">NH7 SEG08</code>, <code className="bg-white px-1 rounded">NH7 ROUTE RISHIKESH JOSHIMATH</code>
          </div>
          <div>
            <strong>Telegram:</strong>{' '}
            <a
              href="https://t.me/NH7_Landslide_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-river hover:underline"
            >
              @NH7_Landslide_Bot
            </a>
          </div>
        </div>
      </section>

      {/* Safety guide */}
      <section className="bg-glacier border border-mist p-6 rounded-md">
        <h2 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Emergency Safety Guide</h2>
        <ol className="space-y-4 font-sans text-sm text-ink">
          {[
            ['Move to a safe location.', 'Pull your vehicle to the side of the road away from traffic or falling debris.'],
            ['Turn on hazard lights.', 'Make yourself visible to other drivers immediately.'],
            ['Share your location.', 'Use your phone to share your exact GPS location with emergency contacts.'],
            ['Call 112.', 'The national emergency number works even with poor signal.'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-river text-white font-bold flex items-center justify-center shrink-0 text-xs">{i+1}</div>
              <div><strong className="block mb-0.5">{title}</strong><span className="text-granite">{desc}</span></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
