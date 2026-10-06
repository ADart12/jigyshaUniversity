import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, Clock, Info } from 'lucide-react';
import { ListenButton } from '../components/ListenButton';

export const Alerts = () => {
  const [closures, setClosures] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using Promise.allSettled to handle potential individual endpoint failures gracefully
        const [closuresRes, alertsRes] = await Promise.allSettled([
          fetch('http://localhost:8000/closures?active_only=true'),
          fetch('http://localhost:8000/alerts')
        ]);

        if (closuresRes.status === 'fulfilled' && closuresRes.value.ok) {
          const closuresData = await closuresRes.value.json();
          setClosures(closuresData.closures || []);
        }
        
        if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
          const alertsData = await alertsRes.value.json();
          setAlerts(alertsData || []);
        }
      } catch (err) {
        console.error('Failed to fetch alerts data', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 w-full max-w-[720px] mx-auto p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-condensed text-[28px] leading-[34px] font-semibold">Alerts & Closures</h1>
        <Link to="/emergency" className="text-river font-sans text-sm font-medium hover:underline">
          Emergency info
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-24 bg-mist animate-pulse rounded-md"></div>
          <div className="h-24 bg-mist animate-pulse rounded-md"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Closures Section */}
          <section>
            <h2 className="font-condensed text-[22px] leading-[28px] font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-risk-closed" />
              Road closures
            </h2>
            
            {closures.length === 0 ? (
              <div className="p-4 bg-snow border border-mist rounded-md text-granite font-sans">
                No road closures right now.
              </div>
            ) : (
              <div className="space-y-4">
                {closures.map(closure => (
                  <div key={closure.id} className="bg-snow border-l-4 border-risk-closed border-y border-r border-y-mist border-r-mist p-4 rounded-r-md shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-condensed text-lg font-semibold">{closure.segment_name}</h3>
                      <span className="bg-tint-closed text-ink text-xs font-condensed font-bold px-2 py-1 rounded">CLOSED</span>
                    </div>
                    <p className="text-ink font-sans mb-3">{closure.reason}</p>
                    <div className="text-sm text-granite font-sans flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Closed since {new Date(closure.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Alerts Section */}
          <section>
            <h2 className="font-condensed text-[22px] leading-[28px] font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-river" />
              Active alerts
            </h2>
            
            {alerts.length === 0 ? (
              <div className="p-4 bg-snow border border-mist rounded-md text-granite font-sans flex items-start gap-3">
                <Info className="w-5 h-5 text-river shrink-0 mt-0.5" />
                <p>No active alerts. The road is clear for travel based on current estimates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="bg-snow border border-mist p-4 rounded-md shadow-sm">
                    <h3 className="font-condensed text-lg font-semibold mb-2">{alert.stretch}</h3>
                    <p className="text-ink font-sans mb-4">{alert.advice}</p>
                    <ListenButton segmentId={alert.segment_id} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
