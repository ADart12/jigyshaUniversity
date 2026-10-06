import React from 'react';
import { 
  Phone, 
  ShieldAlert, 
  Ambulance, 
  Flame, 
  Wrench,
  Hospital,
  Shield,
  Fuel,
  Coffee,
  CheckCircle
} from 'lucide-react';

export const Emergency = () => {
  const services = [
    { name: 'Police', phone: '100', icon: Shield, color: 'text-river', bg: 'bg-river-tint' },
    { name: 'Ambulance', phone: '108', icon: Ambulance, color: 'text-risk-high', bg: 'bg-tint-high' },
    { name: 'Fire', phone: '101', icon: Flame, color: 'text-risk-high', bg: 'bg-tint-high' },
    { name: 'Highway Assistance', phone: '1033', icon: Wrench, color: 'text-risk-moderate', bg: 'bg-tint-moderate' },
  ];

  const nearMe = [
    { name: 'Hospital', icon: Hospital },
    { name: 'Police Station', icon: Shield },
    { name: 'Fuel Station', icon: Fuel },
    { name: 'Rest Area', icon: Coffee },
  ];

  return (
    <div className="flex-1 w-full max-w-[720px] mx-auto p-4 lg:p-8 space-y-8 pb-24">
      <div>
        <h1 className="font-condensed text-[28px] leading-[34px] font-semibold flex items-center gap-2 mb-6">
          <ShieldAlert className="w-8 h-8 text-risk-severe" />
          Emergency Assistance
        </h1>

        {/* 112 Emergency Button */}
        <section className="bg-risk-severe text-white p-6 rounded-md shadow-pop flex flex-col items-center justify-center text-center">
          <h2 className="font-condensed text-[32px] font-bold mb-1 tracking-wider">112</h2>
          <p className="font-sans font-medium mb-4 opacity-90">National Emergency Number</p>
          <a 
            href="tel:112"
            className="w-full sm:w-auto px-8 py-3 bg-white text-risk-severe rounded-full font-condensed font-bold text-xl hover:bg-snow transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-6 h-6 fill-current" />
            CALL 112
          </a>
        </section>
      </div>

      {/* Service Cards */}
      <section>
        <h2 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Emergency Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service, idx) => (
            <a 
              key={idx}
              href={`tel:${service.phone}`}
              className="flex items-center justify-between p-4 bg-snow border border-mist rounded-md hover:bg-glacier transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${service.bg} rounded-full flex items-center justify-center`}>
                  <service.icon className={`w-6 h-6 ${service.color}`} />
                </div>
                <div>
                  <div className="font-sans font-semibold text-lg text-ink">{service.name}</div>
                  <div className="text-granite text-sm">{service.phone}</div>
                </div>
              </div>
              <Phone className="w-5 h-5 text-granite" />
            </a>
          ))}
        </div>
      </section>

      {/* Find help near you */}
      <section>
        <h2 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Find help near you</h2>
        <div className="grid grid-cols-2 gap-3">
          {nearMe.map((item, idx) => (
            <button key={idx} className="flex flex-col items-center justify-center gap-2 p-4 bg-snow border border-mist rounded-md hover:border-river hover:text-river transition-colors text-ink">
              <item.icon className="w-8 h-8" />
              <span className="font-sans font-medium text-sm">{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Safety Guide */}
      <section className="bg-glacier border border-mist p-6 rounded-md">
        <h2 className="font-condensed text-[22px] font-semibold mb-4 text-ink">Emergency Safety Guide</h2>
        <ul className="space-y-4 font-sans text-sm text-ink">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-river text-white font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <strong className="block mb-0.5">Move to a safe location.</strong>
              <span className="text-granite">If possible, pull your vehicle to the side of the road away from traffic or falling debris.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-river text-white font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <strong className="block mb-0.5">Turn on hazard lights.</strong>
              <span className="text-granite">Make yourself visible to other drivers immediately.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-river text-white font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <strong className="block mb-0.5">Share your location.</strong>
              <span className="text-granite">Use your phone to share your exact GPS location with emergency contacts.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-river text-white font-bold flex items-center justify-center shrink-0">4</div>
            <div>
              <strong className="block mb-0.5">Contact emergency services.</strong>
              <span className="text-granite">Call 112 or the nearest service listed above and wait for help.</span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
};
