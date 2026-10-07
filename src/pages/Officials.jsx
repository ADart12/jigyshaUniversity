import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, X, AlertTriangle, Trash2 } from 'lucide-react';
import { fetchFieldReports, postAdminValidateReport, fetchPriorityList, fetchClosures, deleteAdminClosure } from '../api/client';
import { scoreToLevel } from '../api/adapters';
import { RiskBadge } from '../components/RiskIcon';

const ADMIN_KEY = 'admin-dev-secret-key-nh7';

function AdminDashboard({ adminKey, onSignOut }) {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [priority, setPriority] = useState([]);
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [r, p, c] = await Promise.allSettled([
        fetchFieldReports(),
        fetchPriorityList(),
        fetchClosures({ activeOnly: false }),
      ]);
      if (r.status === 'fulfilled') setReports(r.value?.reports || r.value || []);
      if (p.status === 'fulfilled') setPriority(p.value?.priority_list || []);
      if (c.status === 'fulfilled') setClosures(c.value?.closures || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleValidate(reportId, newStatus) {
    try {
      const res = await postAdminValidateReport({
        reportId,
        status: newStatus,
        verifiedBy: 'Official',
        adminKey,
      });
      showToast(res.message || `Report ${newStatus}.`);
      setReports(rs => rs.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch {
      showToast('Action failed. Check your admin key.');
    }
  }

  async function handleDeleteClosure(id) {
    try {
      await deleteAdminClosure({ id, adminKey });
      showToast('Closure removed.');
      setClosures(cs => cs.filter(c => c.id !== id));
    } catch {
      showToast('Could not remove closure.');
    }
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="flex-1 w-full max-w-[1100px] mx-auto p-4 lg:p-8 pb-24">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-3 rounded-md shadow-pop z-50 text-sm font-sans">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-condensed text-[28px] font-semibold text-ink">Officials Dashboard</h1>
        <button onClick={onSignOut} className="text-sm text-granite hover:text-ink font-sans">Sign out</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-mist">
        {[
          { key: 'reports', label: `Reports ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}` },
          { key: 'priority', label: 'BRO Priority' },
          { key: 'closures', label: 'Closures' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-condensed font-semibold text-sm border-b-2 transition-colors ${
              tab === t.key ? 'border-river text-ink' : 'border-transparent text-granite hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button onClick={loadData} className="ml-auto text-xs text-river hover:underline font-sans">
          {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Refresh'}
        </button>
      </div>

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 && !loading && <p className="text-granite font-sans text-sm">No reports found.</p>}
          {reports.map(report => (
            <div key={report.id} className="bg-snow border border-mist rounded-md p-4 font-sans text-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      report.status === 'pending' ? 'bg-tint-moderate text-risk-moderate' :
                      report.status === 'verified' ? 'bg-tint-low text-risk-low' :
                      'bg-glacier text-granite'
                    }`}>{report.status || 'pending'}</span>
                    <span className="text-granite text-xs">{report.segment_id}</span>
                  </div>
                  <p className="text-ink font-medium">{report.description}</p>
                  <p className="text-granite text-xs mt-1">
                    {report.reporter_name || 'Anonymous'} · {report.reported_at ? new Date(report.reported_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
                  </p>
                </div>
                {(!report.status || report.status === 'pending') && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleValidate(report.id, 'verified')}
                      className="px-3 py-1.5 bg-risk-low text-white rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => handleValidate(report.id, 'rejected')}
                      className="px-3 py-1.5 bg-glacier border border-mist text-granite rounded-md text-xs font-semibold hover:bg-mist flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Priority tab */}
      {tab === 'priority' && (
        <div>
          <p className="text-sm text-granite font-sans mb-4">Where should BRO machines be pre-positioned? Priority = hazard × consequence.</p>
          {priority.length === 0 && !loading && <p className="text-granite font-sans text-sm">No priority data available.</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-mist text-granite text-left">
                  <th className="py-2 pr-4 font-semibold">Rank</th>
                  <th className="py-2 pr-4 font-semibold">Stretch</th>
                  <th className="py-2 pr-4 font-semibold">Hazard</th>
                  <th className="py-2 pr-4 font-semibold">Priority</th>
                  <th className="py-2 pr-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {priority.map((item, i) => {
                  const lvl = scoreToLevel(item.hazard_risk_score);
                  return (
                    <tr key={item.segment_id || i} className="border-b border-mist hover:bg-glacier">
                      <td className="py-3 pr-4 font-condensed font-bold text-ink">{item.rank}</td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-ink">{item.segment_name}</div>
                        {item.nearest_town && <div className="text-xs text-granite">{item.nearest_town}</div>}
                      </td>
                      <td className="py-3 pr-4">
                        <RiskBadge level={lvl} />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-mist rounded-full">
                            <div className="h-full bg-granite rounded-full" style={{ width: `${Math.min((item.priority_score || 0) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-granite">{(item.priority_score || 0).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-granite">{item.recommended_action || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Closures tab */}
      {tab === 'closures' && (
        <div className="space-y-3">
          {closures.length === 0 && !loading && <p className="text-granite font-sans text-sm">No closures found.</p>}
          {closures.map(closure => (
            <div key={closure.id} className="bg-snow border border-mist rounded-md p-4 font-sans text-sm flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-tint-closed text-ink">{closure.status}</span>
                  <span className="font-medium text-ink">{closure.segment_name}</span>
                </div>
                <p className="text-granite">{closure.reason}</p>
                <p className="text-xs text-granite mt-1">
                  Source: {closure.source || '—'} ·
                  {closure.starts_at && ` Since ${new Date(closure.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`}
                </p>
              </div>
              <button
                onClick={() => handleDeleteClosure(closure.id)}
                className="px-3 py-1.5 bg-tint-high border border-risk-high text-risk-high rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3 h-3" /> Reopen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Officials = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin_key');
    if (stored) { setAdminKey(stored); setIsLoggedIn(true); }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!adminKey) { setError('Please enter the admin key.'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      localStorage.setItem('admin_key', adminKey);
      setIsLoggedIn(true);
      setLoading(false);
    }, 400);
  };

  const handleSignOut = () => {
    localStorage.removeItem('admin_key');
    setIsLoggedIn(false);
    setAdminKey('');
  };

  if (isLoggedIn) {
    return <AdminDashboard adminKey={adminKey} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 pb-24">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-river-tint rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-river" />
          </div>
          <h1 className="font-condensed text-[28px] font-semibold text-ink">Officials</h1>
          <p className="text-granite font-sans text-sm mt-2">Access road monitoring and incident management tools.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-snow border border-mist p-6 rounded-md shadow-sm space-y-5">
          <div>
            <label className="block font-sans text-sm font-semibold mb-1 text-ink">Admin Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-granite" />
              <input
                type={showKey ? 'text' : 'password'}
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full pl-10 pr-10 p-3 bg-white border border-mist rounded-md font-sans text-ink focus:outline-none focus:ring-2 focus:ring-river text-sm"
              />
              <button type="button" onClick={() => setShowKey(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-granite">
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <div className="p-3 bg-tint-severe border border-risk-severe rounded-md text-risk-severe font-sans text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full h-12 bg-river text-white rounded-md font-sans font-medium hover:bg-ink transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-glacier border border-mist rounded-md text-xs text-granite font-sans">
          Demo key: <code className="bg-white px-1 rounded font-mono">{ADMIN_KEY}</code>
        </div>
      </div>
    </div>
  );
};
