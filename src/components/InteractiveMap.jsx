import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Tooltip, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getLevelMeta } from '../api/adapters';

// Major towns along NH-7 to place prominent town markers with white labels exactly like the design
const MAJOR_TOWNS = [
  { name: 'Rishikesh', lat: 30.0869, lng: 78.2676, isStart: true },
  { name: 'Devprayag', lat: 30.1459, lng: 78.5989 },
  { name: 'Srinagar', lat: 30.2223, lng: 78.7844 },
  { name: 'Karnaprayag', lat: 30.2587, lng: 79.2173 },
  { name: 'Nandaprayag', lat: 30.3297, lng: 79.3244 },
  { name: 'Chamoli', lat: 30.4100, lng: 79.3500 },
  { name: 'Pipalkoti', lat: 30.4297, lng: 79.4304 },
  { name: 'Joshimath', lat: 30.5564, lng: 79.5663, isEnd: true },
];

function createTownMarkerIcon(town) {
  if (town.isEnd) {
    // Red pin with dot for Joshimath destination
    return L.divIcon({
      className: 'town-marker-end',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#ffffff; color:#0f172a; font-weight:700; font-size:11px; padding:2px 8px; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px; border:1px solid #cbd5e1;">
            ${town.name}
          </div>
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 12 30 12 30C12 30 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#ef4444"/>
            <circle cx="12" cy="11" r="5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  if (town.isStart) {
    // Teal ring for Rishikesh starting point
    return L.divIcon({
      className: 'town-marker-start',
      html: `
        <div style="display:flex; align-items:center; gap:6px; transform: translate(-10px, -10px);">
          <div style="width:18px; height:18px; border-radius:50%; background:#10b981; border:3px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
          <div style="background:#ffffff; color:#0f172a; font-weight:700; font-size:11px; padding:2px 8px; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.25); white-space:nowrap; border:1px solid #cbd5e1;">
            ${town.name}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  // Regular town with small dot and white pill
  return L.divIcon({
    className: 'town-marker-intermediate',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background:#ffffff; color:#0f172a; font-weight:700; font-size:11px; padding:2px 7px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.25); white-space:nowrap; margin-bottom:2px; border:1px solid #cbd5e1;">
          ${town.name}
        </div>
        <div style="width:8px; height:8px; border-radius:50%; background:#0f172a; border:2px solid #ffffff; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Warning / Risk badge icon placed on segments needing attention
function createWarningMarkerIcon(level, label) {
  if (level === 'closed') {
    return L.divIcon({
      className: 'warning-marker-closed',
      html: `
        <div style="
          width:26px; height:26px; border-radius:50%; background:#991b1b; border:2.5px solid #ffffff;
          box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;
          transform: translate(-13px, -13px); cursor:pointer;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }

  // Orange exclamation for High / Moderate watch
  return L.divIcon({
    className: 'warning-marker-attention',
    html: `
      <div style="
        width:24px; height:24px; border-radius:50%; background:#f97316; border:2.5px solid #ffffff;
        box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;
        transform: translate(-12px, -12px); cursor:pointer;
      ">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function getSegmentMidpoint(coords) {
  if (!coords || coords.length === 0) return null;
  const midIdx = Math.floor(coords.length / 2);
  return coords[midIdx];
}

// Controller component to handle bounds and programmatic interactions
function MapController({ selectedSegment, segments, onMapReady }) {
  const map = useMap();
  const initialFittedRef = useRef(false);

  useEffect(() => {
    if (map) {
      onMapReady(map);
      map.invalidateSize();
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (segments && segments.length > 0 && !initialFittedRef.current) {
      const allCoords = segments.flatMap(s => s.coords || []);
      if (allCoords.length > 0) {
        try {
          const bounds = L.latLngBounds(allCoords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
            initialFittedRef.current = true;
          }
        } catch (e) {
          console.warn('[InteractiveMap] fitBounds error:', e);
        }
      }
    }
  }, [segments, map]);

  useEffect(() => {
    if (selectedSegment && selectedSegment.coords && selectedSegment.coords.length > 0) {
      try {
        const segBounds = L.latLngBounds(selectedSegment.coords);
        if (segBounds.isValid()) {
          map.flyToBounds(segBounds, { padding: [80, 80], maxZoom: 13, duration: 1 });
        }
      } catch (e) {
        console.warn('[InteractiveMap] flyToBounds error:', e);
      }
    }
  }, [selectedSegment, map]);

  return null;
}

export const InteractiveMap = forwardRef(({ segments, selectedSegment, onSelectSegment, lang }, ref) => {
  const mapInstanceRef = useRef(null);
  const [tileMode, setTileMode] = useState('terrain'); // 'terrain' | 'carto' | 'satellite'

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
    },
    zoomOut: () => {
      if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
    },
    resetRoute: () => {
      if (mapInstanceRef.current && segments && segments.length > 0) {
        const allCoords = segments.flatMap(s => s.coords || []);
        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords);
          if (bounds.isValid()) {
            mapInstanceRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
          }
        }
      }
    },
    flyToSegment: (segment) => {
      if (mapInstanceRef.current && segment?.coords && segment.coords.length > 0) {
        const bounds = L.latLngBounds(segment.coords);
        if (bounds.isValid()) {
          mapInstanceRef.current.flyToBounds(bounds, { padding: [70, 70], maxZoom: 13, duration: 1 });
        }
      }
    },
    toggleLayer: () => {
      setTileMode(prev => prev === 'terrain' ? 'carto' : 'terrain');
    },
    invalidateSize: () => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }
  }));

  // Center roughly in the Garhwal Himalayas (between Rishikesh and Joshimath)
  const defaultCenter = [30.3165, 78.9629];
  const defaultZoom = 9;

  // Real mountain topographic hillshade tiles for Himalayan terrain, matching the reference image
  const terrainTileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  const cartoTileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileMode === 'terrain' ? terrainTileUrl : cartoTileUrl}
          maxZoom={17}
        />

        <MapController
          selectedSegment={selectedSegment}
          segments={segments}
          onMapReady={(m) => { mapInstanceRef.current = m; }}
        />

        {/* Render NH-7 road polylines with crisp casing & highway risk colors */}
        {segments.map(seg => {
          if (!seg.coords || seg.coords.length === 0) return null;
          const isSelected = selectedSegment?.id === seg.id;
          const meta = getLevelMeta(seg.level);
          const isClosed = seg.level === 'closed';

          // Color palette matching design:
          // Low: #10b981 (green)
          // Moderate: #eab308 (yellow)
          // High: #f97316 (orange)
          // Severe: #ef4444 (red)
          // Closed: #0f172a (dark slate/black)
          let strokeColor = '#10b981';
          if (seg.level === 1) strokeColor = '#eab308';
          else if (seg.level === 2) strokeColor = '#f97316';
          else if (seg.level === 3) strokeColor = '#ef4444';
          else if (isClosed) strokeColor = '#0f172a';

          const casingWeight = isSelected ? 13 : 9;
          const lineWeight = isSelected ? 8 : 5;

          // Midpoint marker for notable segments
          const midpoint = getSegmentMidpoint(seg.coords);
          const showAttentionBadge = (seg.level === 2 || seg.level === 3 || isClosed) && midpoint;

          return (
            <React.Fragment key={seg.id}>
              {/* Outer white casing */}
              <Polyline
                positions={seg.coords}
                pathOptions={{
                  color: isSelected ? '#0284c7' : '#ffffff',
                  weight: casingWeight,
                  opacity: 0.98,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => onSelectSegment(seg),
                }}
              />

              {/* Highway colored risk line */}
              <Polyline
                positions={seg.coords}
                pathOptions={{
                  color: strokeColor,
                  weight: lineWeight,
                  opacity: 1,
                  dashArray: isClosed ? '5 7' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => onSelectSegment(seg),
                }}
              >
                <Tooltip sticky direction="top" className="font-sans text-xs shadow-md">
                  <div className="font-sans">
                    <span className="font-bold text-gray-900">{seg.nameEn || seg.name}</span>
                    <div className="text-gray-600 font-medium">
                      {lang === 'hi' ? meta.labelHi : meta.label} · Risk {Math.round((seg.score || 0) * 100)}%
                    </div>
                  </div>
                </Tooltip>
              </Polyline>

              {/* Warning badge on segments with high/severe/closed risk */}
              {showAttentionBadge && (
                <Marker
                  position={midpoint}
                  icon={createWarningMarkerIcon(seg.level, seg.name)}
                  eventHandlers={{
                    click: () => onSelectSegment(seg),
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Town labels along the route */}
        {MAJOR_TOWNS.map(town => (
          <Marker
            key={town.name}
            position={[town.lat, town.lng]}
            icon={createTownMarkerIcon(town)}
            interactive={false}
          />
        ))}
      </MapContainer>
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';
