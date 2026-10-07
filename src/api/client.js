const BASE_URL = 'http://localhost:8000';
const TIMEOUT_MS = 10000;

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = new Error(`API error ${res.status}`);
      err.status = res.status;
      try { err.detail = await res.json(); } catch {}
      throw err;
    }
    return res;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export async function fetchRiskMap({ lang = 'en', simulateRainMm, asOf, refreshWeather } = {}) {
  const params = new URLSearchParams({ lang });
  if (simulateRainMm != null) params.set('simulate_rain_mm', simulateRainMm);
  if (asOf) params.set('as_of', asOf);
  if (refreshWeather) params.set('refresh_weather', 'true');
  const res = await apiFetch(`/risk-map?${params}`);
  return res.json();
}

export async function fetchClosures({ activeOnly = true, segmentId } = {}) {
  const params = new URLSearchParams();
  if (activeOnly) params.set('active_only', 'true');
  if (segmentId) params.set('segment_id', segmentId);
  const res = await apiFetch(`/closures?${params}`);
  return res.json();
}

export async function fetchAlerts() {
  const res = await apiFetch('/alerts');
  return res.json();
}

export async function fetchRouteRisk({ fromSegment, toSegment, date, departTime, speedKmph = 30, lang = 'en', simulateRainMm } = {}) {
  const params = new URLSearchParams({
    from_segment: fromSegment,
    to_segment: toSegment,
    date,
    speed_kmph: speedKmph,
    lang,
  });
  if (departTime) params.set('depart_time', departTime);
  if (simulateRainMm != null) params.set('simulate_rain_mm', simulateRainMm);
  const res = await apiFetch(`/route-risk?${params}`);
  return res.json();
}

export async function postTripPlanner({ origin, destination, departTime, speedKmph = 30, lang = 'en', simulateRainMm } = {}) {
  try {
    const body = { origin, destination, depart_time: departTime, speed_kmph: speedKmph, lang };
    if (simulateRainMm != null) body.simulate_rain_mm = simulateRainMm;
    const res = await apiFetch('/trip-planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (err) {
    // If backend only has /route-risk (GET), use fetchRouteRisk
    const date = departTime ? departTime.split('T')[0] : new Date().toISOString().split('T')[0];
    return fetchRouteRisk({
      fromSegment: origin,
      toSegment: destination,
      date,
      departTime,
      speedKmph,
      lang,
      simulateRainMm,
    });
  }
}

export async function fetchPriorityList({ sortBy = 'priority', simulateRainMm } = {}) {
  const params = new URLSearchParams({ sort_by: sortBy });
  if (simulateRainMm != null) params.set('simulate_rain_mm', simulateRainMm);
  const res = await apiFetch(`/priority-list?${params}`);
  return res.json();
}

export async function fetchOfflinePack(etag) {
  const headers = {};
  if (etag) headers['If-None-Match'] = etag;
  const res = await apiFetch('/offline-pack', { headers });
  if (res.status === 304) return { notModified: true };
  const newEtag = res.headers.get('ETag');
  const data = await res.json();
  return { data, etag: newEtag };
}

export async function postFieldReport({ lat, lng, reporterName, description }) {
  const res = await apiFetch('/field-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, reporter_name: reporterName, description }),
  });
  return res.json();
}

export async function fetchFieldReports() {
  const res = await apiFetch('/field-reports');
  return res.json();
}

export async function postSubscribe({ phoneNumber, segmentId, alertChannel }) {
  const body = { phone_number: phoneNumber, alert_channel: alertChannel };
  if (segmentId) body.segment_id = segmentId;
  const res = await apiFetch('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function postAdminValidateReport({ reportId, status, verifiedBy, adminKey }) {
  const res = await apiFetch('/admin/validate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
    body: JSON.stringify({ report_id: reportId, status, verified_by: verifiedBy }),
  });
  return res.json();
}

export async function postAdminClosure({ segmentId, status, reason, source, startsAt, endsAt, adminKey }) {
  const body = { segment_id: segmentId, status, reason, source: source || 'Control room' };
  if (startsAt) body.starts_at = startsAt;
  if (endsAt) body.ends_at = endsAt;
  const res = await apiFetch('/admin/closure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteAdminClosure({ id, adminKey }) {
  const res = await apiFetch(`/admin/closure/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });
  return res.json();
}

export function getVoiceAlertUrl({ segmentId, lang = 'en' }) {
  const params = new URLSearchParams({ lang });
  if (segmentId) params.set('segment_id', segmentId);
  return `${BASE_URL}/voice-alert?${params}`;
}

export async function fetchHistory() {
  const res = await apiFetch('/history');
  return res.json();
}

