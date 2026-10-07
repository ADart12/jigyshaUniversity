// Convert risk_score to a level number (0-3)
export function scoreToLevel(score) {
  if (score >= 0.8) return 3;
  if (score >= 0.6) return 2;
  if (score >= 0.35) return 1;
  return 0;
}

// Convert text risk level to number (handles English and Hindi)
const LEVEL_TEXT_MAP = {
  'low': 0, 'कम': 0,
  'moderate': 1, 'मध्यम': 1,
  'high': 2, 'ज़्यादा': 2, 'very high': 3,
  'severe': 3, 'गंभीर': 3,
};
export function levelFromText(text) {
  if (!text) return 0;
  return LEVEL_TEXT_MAP[text.toLowerCase().trim()] ?? 0;
}

// Determine the effective display level of a segment (may be 'closed')
export function toEffective(seg) {
  if (seg.closure?.status === 'closed') return 'closed';
  const base = scoreToLevel(seg.risk_score);
  return seg.adjusted_risk_level ? Math.min(3, base + 1) : base;
}

// Level-to-UI mapping
export const LEVEL_META = {
  0: { label: 'Low', labelHi: 'कम', verdict: 'Good to go', verdictHi: 'चल सकते हैं', color: '#2E7D57', tint: '#E3F1EA', textOnFill: 'white' },
  1: { label: 'Moderate', labelHi: 'मध्यम', verdict: 'Go with care', verdictHi: 'सावधानी से चलें', color: '#D49A00', tint: '#FAF0D2', textOnFill: '#1B2A33' },
  2: { label: 'High', labelHi: 'ज़्यादा', verdict: 'Delay if you can', verdictHi: 'हो सके तो टालें', color: '#C4470F', tint: '#F8E3D8', textOnFill: 'white' },
  3: { label: 'Severe', labelHi: 'गंभीर', verdict: 'Not advised', verdictHi: 'यात्रा की सलाह नहीं', color: '#9B1C31', tint: '#F3DADF', textOnFill: 'white' },
  'closed': { label: 'Closed', labelHi: 'बंद', verdict: 'Road closed', verdictHi: 'सड़क बंद है', color: '#1B2A33', tint: '#DDE3E6', textOnFill: 'white' },
};

export function getLevelMeta(level) {
  return LEVEL_META[level] ?? LEVEL_META[0];
}

// Adapt a raw segment from /risk-map to a UI model
export function adaptSegment(raw) {
  const level = toEffective(raw);
  return {
    id: raw.id,
    name: raw.name || raw.name_en,
    nameEn: raw.name_en || raw.name,
    seq: raw.sequence_order,
    coords: raw.subpoints || [],
    level,
    score: raw.risk_score ?? raw.risk_index ?? 0,
    terrainScore: raw.terrain_score ?? raw.terrain_percentile ?? 0.5,
    r3d: raw.r3d_mm ?? raw.rain_mm_3d ?? 0,
    rain24h: raw.rain_24h_mm ?? (raw.rain_mm_3d ? (raw.rain_mm_3d * 0.4) : null),
    forecast24h: raw.forecast_24h_mm ?? (raw.rain_mm_3d ? (raw.rain_mm_3d * 0.6) : null),
    forecast72h: raw.forecast_72h_mm ?? (raw.rain_mm_3d ? (raw.rain_mm_3d * 1.2) : null),
    driver: raw.main_driver || raw.main_driver_en || 'Monsoon rainfall impact',
    driverEn: raw.main_driver_en || raw.main_driver,
    closure: raw.closure,
    adjustedRisk: raw.adjusted_risk_level,
    reports24h: raw.ground_report_count_24h ?? 0,
    nearestHospitalKm: raw.nearest_hospital_km,
    nearestTown: raw.nearest_town,
    updatedAt: raw.updated_at,
  };
}
