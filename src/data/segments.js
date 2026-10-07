export const SEGMENTS = [
  { id: 'seg_01', seq: 1, nameEn: 'Rishikesh to Shivpuri', nameHi: 'ऋषिकेश से शिवपुरी', kmStart: 0.00, kmEnd: 17.43, length: 17.43 },
  { id: 'seg_02', seq: 2, nameEn: 'Shivpuri to Byasi', nameHi: 'शिवपुरी से ब्यासी', kmStart: 17.43, kmEnd: 24.26, length: 6.83 },
  { id: 'seg_03', seq: 3, nameEn: 'Byasi to Kaudiyala', nameHi: 'ब्यासी से कौडियाला', kmStart: 24.26, kmEnd: 38.12, length: 13.86 },
  { id: 'seg_04', seq: 4, nameEn: 'Kaudiyala to Devprayag', nameHi: 'कौडियाला से देवप्रयाग', kmStart: 38.12, kmEnd: 70.63, length: 32.51 },
  { id: 'seg_05', seq: 5, nameEn: 'Devprayag to Teen Dhara', nameHi: 'देवप्रयाग से तीन धारा', kmStart: 70.63, kmEnd: 85.56, length: 14.94 },
  { id: 'seg_06', seq: 6, nameEn: 'Teen Dhara to Kirtinagar', nameHi: 'तीन धारा से कीर्तिनगर', kmStart: 85.56, kmEnd: 98.04, length: 12.47 },
  { id: 'seg_07', seq: 7, nameEn: 'Kirtinagar to Srinagar', nameHi: 'कीर्तिनगर से श्रीनगर', kmStart: 98.04, kmEnd: 102.99, length: 4.95 },
  { id: 'seg_08', seq: 8, nameEn: 'Srinagar to Sirobagarh', nameHi: 'श्रीनगर से सिरोबगड़', kmStart: 102.99, kmEnd: 112.42, length: 9.42 },
  { id: 'seg_09', seq: 9, nameEn: 'Sirobagarh to Rudraprayag', nameHi: 'सिरोबगड़ से रुद्रप्रयाग', kmStart: 112.42, kmEnd: 136.06, length: 23.64 },
  { id: 'seg_10', seq: 10, nameEn: 'Rudraprayag to Gauchar', nameHi: 'रुद्रप्रयाग से गौचर', kmStart: 136.06, kmEnd: 158.55, length: 22.49 },
  { id: 'seg_11', seq: 11, nameEn: 'Gauchar to Karnaprayag', nameHi: 'गौचर से कर्णप्रयाग', kmStart: 158.55, kmEnd: 168.12, length: 9.56 },
  { id: 'seg_12', seq: 12, nameEn: 'Karnaprayag to Langasu', nameHi: 'कर्णप्रयाग से लंगासू', kmStart: 168.12, kmEnd: 174.18, length: 6.07 },
  { id: 'seg_13', seq: 13, nameEn: 'Langasu to Nandprayag', nameHi: 'लंगासू से नंदप्रयाग', kmStart: 174.18, kmEnd: 187.33, length: 13.15 },
  { id: 'seg_14', seq: 14, nameEn: 'Nandprayag to Chamoli', nameHi: 'नंदप्रयाग से चमोली', kmStart: 187.33, kmEnd: 200.39, length: 13.05 },
  { id: 'seg_15', seq: 15, nameEn: 'Chamoli to Birahi', nameHi: 'चमोली से बिरही', kmStart: 200.39, kmEnd: 205.62, length: 5.24 },
  { id: 'seg_16', seq: 16, nameEn: 'Birahi to Pipalkoti', nameHi: 'बिरही से पीपलकोटी', kmStart: 205.62, kmEnd: 212.36, length: 6.74 },
  { id: 'seg_17', seq: 17, nameEn: 'Pipalkoti to Helang (Tangani)', nameHi: 'पीपलकोटी से हेलंग (तांगणी)', kmStart: 212.36, kmEnd: 241.04, length: 28.68 },
  { id: 'seg_18', seq: 18, nameEn: 'Helang to Joshimath', nameHi: 'हेलंग से जोशीमठ', kmStart: 241.04, kmEnd: 247.37, length: 6.33 },
];

export const TOWNS = [
  { name: 'Rishikesh', nameHi: 'ऋषिकेश', km: 0, segmentId: 'seg_01' },
  { name: 'Shivpuri', nameHi: 'शिवपुरी', km: 17.43, segmentId: 'seg_02' },
  { name: 'Byasi', nameHi: 'ब्यासी', km: 24.26, segmentId: 'seg_03' },
  { name: 'Kaudiyala', nameHi: 'कौडियाला', km: 38.12, segmentId: 'seg_04' },
  { name: 'Devprayag', nameHi: 'देवप्रयाग', km: 70.63, segmentId: 'seg_05' },
  { name: 'Teen Dhara', nameHi: 'तीन धारा', km: 85.56, segmentId: 'seg_06' },
  { name: 'Kirtinagar', nameHi: 'कीर्तिनगर', km: 98.04, segmentId: 'seg_07' },
  { name: 'Srinagar', nameHi: 'श्रीनगर', km: 102.99, segmentId: 'seg_08' },
  { name: 'Sirobagarh', nameHi: 'सिरोबगड़', km: 112.42, segmentId: 'seg_09' },
  { name: 'Rudraprayag', nameHi: 'रुद्रप्रयाग', km: 136.06, segmentId: 'seg_10' },
  { name: 'Gauchar', nameHi: 'गौचर', km: 158.55, segmentId: 'seg_11' },
  { name: 'Karnaprayag', nameHi: 'कर्णप्रयाग', km: 168.12, segmentId: 'seg_12' },
  { name: 'Langasu', nameHi: 'लंगासू', km: 174.18, segmentId: 'seg_13' },
  { name: 'Nandprayag', nameHi: 'नंदप्रयाग', km: 187.33, segmentId: 'seg_14' },
  { name: 'Chamoli', nameHi: 'चमोली', km: 200.39, segmentId: 'seg_15' },
  { name: 'Birahi', nameHi: 'बिरही', km: 205.62, segmentId: 'seg_16' },
  { name: 'Pipalkoti', nameHi: 'पीपलकोटी', km: 212.36, segmentId: 'seg_17' },
  { name: 'Helang', nameHi: 'हेलंग', km: 241.04, segmentId: 'seg_18' },
  { name: 'Joshimath', nameHi: 'जोशीमठ', km: 247.37, segmentId: null },
];

// Town to segment mapping: "from" town maps to segment starting at that town
export function townToFromSegment(townName) {
  const town = TOWNS.find(t => t.name.toLowerCase() === townName.toLowerCase());
  return town ? town.segmentId : null;
}

// "to" town: the segment that ends at this town
export function townToToSegment(townName) {
  const town = TOWNS.find(t => t.name.toLowerCase() === townName.toLowerCase());
  if (!town) return null;
  const seg = SEGMENTS.find(s => Math.abs(s.kmEnd - town.km) < 0.01);
  return seg ? seg.id : null;
}

export function getSegmentById(id) {
  return SEGMENTS.find(s => s.id === id);
}
