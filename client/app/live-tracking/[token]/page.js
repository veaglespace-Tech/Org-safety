"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { io } from 'socket.io-client';
import { Navigation, PhoneCall, AlertTriangle, User, Activity, Clock, Compass, Zap, MapPin } from 'lucide-react';

// Dynamically import the map to avoid SSR issues with Leaflet's window object
const LiveLocationMap = dynamic(() => import('@/components/ui/LiveLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-slate-800 dark:text-slate-200 font-black text-sm uppercase tracking-widest animate-pulse">Establishing Satellite Link...</p>
    </div>
  ),
});

// Extract base URL from API URL (e.g. "https://api.example.com/api" -> "https://api.example.com")
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : 'http://localhost:5001';
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || apiBaseUrl;

const LiveTrackingViewer = () => {
  const params = useParams();
  const token = params?.token;
  const socketRef = useRef(null);
  const timeCheckerRef = useRef(null);
  
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
  });
  
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTrackerOffline, setIsTrackerOffline] = useState(false);
  const [timeAgo, setTimeAgo] = useState('Waiting...');
  const [error, setError] = useState(null);

  // Helper to format time ago
  const updateTimeAgo = (timestamp) => {
    if (!timestamp) return 'Waiting for data...';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ${seconds % 60}s ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_SERVER_URL, {
      path: '/api/socket.io',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socketRef.current.emit('join-track', { token });
    });

    socketRef.current.on('location-updated', (data) => {
      setIsTrackerOffline(false);
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        speed: data.speed,
        heading: data.heading,
        timestamp: data.timestamp,
      });
      
      if (data.latitude && data.longitude) {
        setHistory((prev) => {
          const newHistory = [...prev, [data.latitude, data.longitude]];
          // Cap history array to 200 entries to prevent memory leaks
          if (newHistory.length > 200) {
            return newHistory.slice(newHistory.length - 200);
          }
          return newHistory;
        });
      }
    });

    socketRef.current.on('tracker-alive', () => {
      // Heartbeat received
      setIsTrackerOffline(false);
    });

    socketRef.current.on('tracker-offline', () => {
      setIsTrackerOffline(true);
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

  // Update time ago and check for stale data
  useEffect(() => {
    if (timeCheckerRef.current) clearInterval(timeCheckerRef.current);
    
    timeCheckerRef.current = setInterval(() => {
      if (location.timestamp) {
        setTimeAgo(updateTimeAgo(location.timestamp));
        
        // If we haven't received an update or heartbeat in 60 seconds, mark as offline
        if (Date.now() - location.timestamp > 60000 && !isTrackerOffline) {
          setIsTrackerOffline(true);
        }
      }
    }, 1000);

    return () => {
      if (timeCheckerRef.current) clearInterval(timeCheckerRef.current);
    };
  }, [location.timestamp, isTrackerOffline]);

  const speedKmh = location.speed != null ? (location.speed * 3.6).toFixed(1) : '---';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 pt-20 sm:pt-24 lg:p-8 lg:pt-28 max-w-6xl mx-auto space-y-4 lg:space-y-6 pb-12 w-full flex flex-col">
      
      {/* Header Banner */}
      <div className="p-5 rounded-3xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 border border-blue-400/50 dark:border-blue-700/50 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
          <div className="bg-white/20 p-2.5 rounded-full border border-white/50 backdrop-blur-sm shrink-0">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider leading-none mb-1">LIVE GPS STREAM</h1>
            <p className="text-[10px] sm:text-xs font-bold opacity-90 tracking-widest uppercase truncate max-w-[200px] sm:max-w-xs">ID: {token}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto relative z-10">
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider">Viewer</span>
            {isConnected ? (
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
            )}
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${
            isTrackerOffline 
              ? 'bg-rose-500/20 border-rose-500/50 text-white' 
              : 'bg-white/20 border-white/30 text-white'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">Device</span>
            {isTrackerOffline ? (
              <span className="text-xs font-black">OFFLINE</span>
            ) : (
              <span className="text-xs font-black flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> ONLINE
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shrink-0">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      
      {isTrackerOffline && location.latitude && !error && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm animate-pulse shrink-0">
          <Activity className="h-5 w-5 shrink-0" />
          Tracker is currently offline or unreachable. Showing last known location.
        </div>
      )}

      {/* The Responsive Grid (Map + Command Panel) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-6 flex-1 min-h-0 flex flex-col lg:flex-row space-y-4 lg:space-y-0">
        
        {/* Left Column: The Map */}
        <div className="lg:col-span-8 flex-1 min-h-[60vh] lg:min-h-0 -mx-4 sm:mx-0 relative z-0">
          <div className="sm:rounded-[2rem] overflow-hidden sm:shadow-2xl border-y-2 sm:border-4 border-white dark:border-slate-800 h-full min-h-[60vh] lg:min-h-[600px] w-full relative bg-slate-100 dark:bg-slate-900">
            <LiveLocationMap 
              latitude={location.latitude} 
              longitude={location.longitude} 
              accuracy={location.accuracy} 
              heading={location.heading}
              history={history}
            />
          </div>
        </div>

        {/* Right Column: The Command Panel */}
        <div className="lg:col-span-4 space-y-4 shrink-0">
          
          {/* Tracking Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="font-black text-sm border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Telemetry Data
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Speed
                </div>
                <div className="text-slate-900 dark:text-white font-black text-lg truncate">
                  {speedKmh} <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">km/h</span>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Compass className="h-3 w-3" /> Heading
                </div>
                <div className="text-slate-900 dark:text-white font-black text-lg truncate">
                  {location.heading != null ? `${Math.round(location.heading)}°` : '---'}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Last Update</span>
                <span className={`${isTrackerOffline ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} text-right truncate pl-2`}>
                  {timeAgo}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Accuracy</span>
                <span className="text-slate-800 dark:text-slate-200 text-right truncate pl-2">
                  {location.accuracy ? `±${Math.round(location.accuracy)} m` : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Siren / Alarm Trigger Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 dark:border-rose-600 rounded-3xl p-5 shadow-xl flex flex-col items-center text-center gap-4 relative overflow-hidden group hover:border-rose-600 dark:hover:border-rose-500 transition-colors">
            <div className="absolute inset-0 bg-rose-50 dark:bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-full text-rose-600 dark:text-rose-500 relative z-10 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">EMERGENCY SIREN</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Trigger loud alarm on user's device</p>
            </div>
            <button className="relative z-10 w-full px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all bg-rose-600 dark:bg-rose-600 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 hover:bg-rose-700 hover:shadow-rose-600/40">
              <AlertTriangle className="h-4 w-4" />
              PLAY SIREN
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <a href="tel:112" className="w-full bg-rose-600 text-white py-4 rounded-2xl text-center shadow-lg shadow-rose-500/20 flex items-center justify-center space-x-2 text-xs uppercase tracking-wider font-black hover:bg-rose-700 transition-colors">
              <PhoneCall className="h-5 w-5 shrink-0" />
              <span className="truncate">CALL 112 EMERGENCY</span>
            </a>

            {location.latitude && location.longitude ? (
              <a href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-4 rounded-2xl text-center shadow-md flex items-center justify-center space-x-2 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">GET DIRECTIONS</span>
              </a>
            ) : (
              <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 py-4 rounded-2xl text-center shadow-sm flex items-center justify-center space-x-2 text-xs font-black cursor-not-allowed">
                <Navigation className="h-5 w-5 shrink-0" />
                <span className="truncate">WAITING FOR LOCATION...</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveTrackingViewer;
