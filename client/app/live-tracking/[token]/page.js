"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';
import { MapPin, Navigation } from 'lucide-react';

// Dynamically import the map to avoid SSR issues with Leaflet's window object
const LiveLocationMap = dynamic(() => import('@/components/ui/LiveLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[600px] w-full bg-gray-50 rounded-xl shadow-sm border border-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading Map Interface...</p>
    </div>
  ),
});

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

const LiveTrackingViewer = () => {
  const params = useParams();
  const token = params?.token;
  const socketRef = useRef(null);
  
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-track', { token });
    });

    socketRef.current.on('location-updated', (data) => {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
      });
      if (data.latitude && data.longitude) {
        setHistory((prev) => [...prev, [data.latitude, data.longitude]]);
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Unable to connect to live tracking server.');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-track', { token });
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const openGoogleMaps = () => {
    if (location.latitude && location.longitude) {
      window.open(
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        '_blank'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-indigo-600" />
              Live Location Viewer
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Tracking Session:</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono border border-gray-200">
                {token}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Disconnected
                </span>
              )}
            </div>
            
            {location.timestamp && (
              <span className="text-xs text-gray-400">
                Last updated: {new Date(location.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
          <LiveLocationMap 
            latitude={location.latitude} 
            longitude={location.longitude} 
            accuracy={location.accuracy} 
            history={history}
          />
        </div>

        {/* Action Bar */}
        {location.latitude && location.longitude && (
          <div className="flex justify-end">
            <button
              onClick={openGoogleMaps}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Navigation className="h-4 w-4" />
              Open in Google Maps
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LiveTrackingViewer;
