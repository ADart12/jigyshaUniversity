import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Live Map', path: '/' },
    { name: 'Plan Trip', path: '/plan' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Report', path: '/report' },
    { name: 'Emergency', path: '/emergency' },
    { name: 'Past Events', path: '/past-events' },
    { name: 'About', path: '/about' },
    { name: 'Officials', path: '/officials' },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-glacier">
      {/* Top Nav (Wide Shell & Compact Header) */}
      <header className="h-[56px] bg-ink text-white flex items-center px-4 shrink-0 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-2 mr-6">
          <div className="bg-milestone text-ink font-condensed font-bold px-2 py-0.5 rounded-sm border-[1.5px] border-ink text-sm">NH 7</div>
          <span className="font-condensed font-semibold text-lg">Raah</span>
        </div>

        {/* Wide Shell Nav Items */}
        <nav className="hidden lg:flex gap-6 overflow-x-auto items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm whitespace-nowrap px-1 py-4 border-b-2 ${
                location.pathname === item.path ? 'border-river font-semibold' : 'border-transparent hover:text-mist'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 text-sm font-condensed">
          <button className="hover:text-mist">हिं | EN</button>
          <span className="hidden lg:inline text-mist">|</span>
          <button className="hidden lg:inline hover:text-mist">Officials</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row relative">
        <Outlet />
      </main>

      {/* Bottom Nav (Compact Shell) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-mist flex justify-around items-center z-10 pb-[env(safe-area-inset-bottom)]">
        {navItems.slice(0, 4).map((item) => (
           <Link
             key={item.path}
             to={item.path}
             className={`flex flex-col items-center justify-center w-full h-full text-xs font-condensed ${
               location.pathname === item.path ? 'text-river font-bold' : 'text-granite'
             }`}
           >
             {/* Icon placeholder */}
             <div className="w-6 h-6 bg-mist rounded-full mb-1" />
             {item.name}
           </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
