import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Max trail points to keep in memory
const MAX_TRAIL_POINTS = 200;

/**
 * Get accuracy-based color for the circle overlay
 * Green ≤ 30m, Orange ≤ 100m, Red > 100m
 */
function getAccuracyColor(accuracy) {
  if (accuracy == null) return '#6366f1';
  if (accuracy <= 30) return '#22c55e';   // green
  if (accuracy <= 100) return '#f59e0b';  // orange/amber
  return '#ef4444';                        // red
}

/**
 * Create a directional marker icon with heading rotation
 * Shows a pulsating dot with an arrow indicating direction of travel
 */
function createMarkerIcon(heading) {
  const rotation = heading != null && !isNaN(heading) ? heading : 0;
  const showArrow = heading != null && !isNaN(heading);

  return new L.DivIcon({
    className: 'custom-pulse-icon',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
      ">
        <!-- Pulse ring -->
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #6366f1;
          border-radius: 50%;
          animation: livePulse 1.5s infinite ease-in-out;
        "></div>
        <!-- Center dot -->
        <div style="
          position: absolute;
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          background-color: white;
          border-radius: 50%;
          border: 3px solid #6366f1;
          box-shadow: 0 0 6px rgba(99, 102, 241, 0.5);
          z-index: 2;
        "></div>
        ${showArrow ? `
        <!-- Direction arrow -->
        <div style="
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%) rotate(${rotation}deg);
          transform-origin: center 28px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 14px solid #6366f1;
          filter: drop-shadow(0 0 2px rgba(99,102,241,0.6));
          z-index: 3;
        "></div>` : ''}
      </div>
      <style>
        @keyframes livePulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

/**
 * ImperativeMarkerController is responsible for updating the marker position
 * using native Leaflet APIs without triggering React re-renders.
 * Uses smooth CSS transitions for marker movement.
 */
const ImperativeMarkerController = ({ lat, lng, accuracy, heading }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const prevPosRef = useRef([lat, lng]);

  useEffect(() => {
    if (!map) return;

    // Initialize marker and accuracy circle on first mount
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: createMarkerIcon(heading) }).addTo(map);
      
      const color = getAccuracyColor(accuracy);
      circleRef.current = L.circle([lat, lng], {
        radius: accuracy || 30,
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '4 6',
      }).addTo(map);

      // Initial view
      map.setView([lat, lng], 17);
    }

    return () => {
      // Cleanup on unmount
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
    };
  }, [map]); // Only run on map init

  useEffect(() => {
    // Update position imperatively when lat/lng change
    if (markerRef.current && circleRef.current && lat != null && lng != null) {
      const newPos = [lat, lng];

      // Update marker icon with heading rotation
      markerRef.current.setIcon(createMarkerIcon(heading));

      // Smooth transition: Leaflet doesn't natively support CSS transitions on markers,
      // so we use a small animation step
      const currentPos = markerRef.current.getLatLng();
      const steps = 20;
      const stepDuration = 50; // total ~1s animation
      let step = 0;

      const animate = () => {
        step++;
        const t = step / steps; // 0 to 1
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        const interpLat = currentPos.lat + (lat - currentPos.lat) * ease;
        const interpLng = currentPos.lng + (lng - currentPos.lng) * ease;
        
        markerRef.current.setLatLng([interpLat, interpLng]);
        circleRef.current.setLatLng([interpLat, interpLng]);

        if (step < steps) {
          setTimeout(animate, stepDuration);
        }
      };

      // Only animate if the distance is reasonable (not a teleport)
      const distance = map.distance(L.latLng(currentPos), L.latLng(newPos));
      if (distance > 1 && distance < 5000) {
        animate();
      } else {
        markerRef.current.setLatLng(newPos);
        circleRef.current.setLatLng(newPos);
      }

      // Update accuracy circle color and radius
      const color = getAccuracyColor(accuracy);
      circleRef.current.setRadius(accuracy || 30);
      circleRef.current.setStyle({
        color: color,
        fillColor: color,
      });

      // Check if distance moved is significant enough to pan the map
      const prevPos = prevPosRef.current;
      const panDistance = map.distance(L.latLng(prevPos), L.latLng(newPos));
      
      // If moved more than 10 meters, pan smoothly
      if (panDistance > 10) {
        map.flyTo(newPos, map.getZoom(), { animate: true, duration: 1.2 });
        prevPosRef.current = newPos;
      }
    }
  }, [lat, lng, accuracy, heading, map]);

  return null;
};

const LiveLocationMap = ({ latitude, longitude, accuracy, heading, history = [] }) => {
  // Cap the trail to MAX_TRAIL_POINTS (use the most recent entries)
  const cappedHistory = history.length > MAX_TRAIL_POINTS 
    ? history.slice(-MAX_TRAIL_POINTS) 
    : history;

  if (!latitude || !longitude) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 min-h-[400px] rounded-lg shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium animate-pulse">Acquiring GPS Lock...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Overlay Indicator */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <span className="text-sm font-semibold text-gray-800">Live GPS Tracking</span>
      </div>

      {/* Accuracy Badge */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className={`px-3 py-1.5 rounded-full shadow-md border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          accuracy <= 30 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : accuracy <= 100 
            ? 'bg-amber-50 border-amber-200 text-amber-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span className={`h-2 w-2 rounded-full ${
            accuracy <= 30 ? 'bg-green-500' : accuracy <= 100 ? 'bg-amber-500' : 'bg-red-500'
          }`}></span>
          ~{Math.round(accuracy)}m
        </div>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ImperativeMarkerController lat={latitude} lng={longitude} accuracy={accuracy} heading={heading} />
        
        {/* Breadcrumb Trail with gradient effect */}
        {cappedHistory.length > 1 && (
          <Polyline 
            positions={cappedHistory} 
            pathOptions={{ 
              color: '#6366f1', 
              weight: 4, 
              opacity: 0.7, 
              lineJoin: 'round',
              lineCap: 'round',
            }} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveLocationMap;
