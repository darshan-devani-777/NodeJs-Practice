import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

import socket from "../services/socket";
import { geocodePlace } from "../utils/geocode";
import FitBounds from "../components/FitBound";

export default function MapView() {
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [route, setRoute] = useState(null);
  const [livePos, setLivePos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const watchIdRef = useRef(null);
  const liveMarkerRef = useRef(null);
  const animRef = useRef(null);

  /* SMOOTH MARKER */
  const smoothMoveMarker = (from, to) => {
    if (!liveMarkerRef.current) return;

    const steps = 60;
    let step = 0;

    const latStep = (to.lat - from.lat) / steps;
    const lngStep = (to.lng - from.lng) / steps;

    cancelAnimationFrame(animRef.current);

    const animate = () => {
      step++;
      liveMarkerRef.current.setLatLng([
        from.lat + latStep * step,
        from.lng + lngStep * step,
      ]);

      if (step < steps) animRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  /*  SOCKET LISTENERS  */
  useEffect(() => {
    const onRouteCreated = (data) => {
      setRoute(data);

      setLivePos({
        lat: data.start.lat,
        lng: data.start.lng,
      });

      setIsLoading(false);
    };

    const onRouteError = () => {
      setIsLoading(false);
      alert("Route not found");
    };

    socket.on("route-created", onRouteCreated);
    socket.on("route-error", onRouteError);

    socket.on("location-updated", ({ lat, lng }) => {
      setLivePos((prev) => {
        if (!prev) return { lat, lng };

        if (liveMarkerRef.current) {
          smoothMoveMarker(prev, { lat, lng });
        }

        return { lat, lng };
      });
    });

    return () => {
      socket.off("route-created", onRouteCreated);
      socket.off("route-error", onRouteError);
      socket.off("location-updated");
    };
  }, [livePos]);

  /*  GPS  */
  const startLiveTracking = () => {
    if (!navigator.geolocation || watchIdRef.current) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("live-location", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      console.error,
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
  
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
  
        setLivePos(coords);
  
        startLiveTracking();
      },
      () => {
        toast.error("Location permission denied");
      },
      { enableHighAccuracy: true }
    );
  }, []);
  

  /* ACTIONS */
  const createRoute = async () => {
    if (isLoading) return;

    if (!startText.trim() || !endText.trim()) {
      toast.error("Please enter both start and end locations");
      return;
    }

    setIsLoading(true);
    setRoute(null);
    setLivePos(null);

    try {
      const start = await geocodePlace(startText);
      const end = await geocodePlace(endText);

      socket.emit("create-route", { start, end });
    } catch (err) {
      setIsLoading(false);
      toast.error("❌ Invalid location");
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setLivePos(null);
    setIsLoading(false);
  };

  const liveIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  /*  UI  */
  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 relative">
      {/* LOADER */}
      {isLoading && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            <span className="text-sm">Calculating route...</span>
          </div>
        </div>
      )}

      {/* TOP FORM */}
      <div className="p-4 border-b border-zinc-800 text-white">
        <h2 className="text-center font-semibold font-mono mb-3">
          📍 Live Route Tracking
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Start location"
            className="flex-1 rounded bg-zinc-800 p-2 text-sm font-mono"
            onChange={(e) => setStartText(e.target.value)}
            disabled={isLoading}
          />
          <input
            placeholder="End location"
            className="flex-1 rounded bg-zinc-800 p-2 text-sm font-mono"
            onChange={(e) => setEndText(e.target.value)}
            disabled={isLoading}
          />

          <button
            onClick={createRoute}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2 rounded font-semibold transition font-mono ${
              isLoading
                ? "bg-zinc-600 text-zinc-300 cursor-not-allowed"
                : "bg-cyan-400 text-black hover:bg-cyan-500 cursor-pointer"
            }`}
          >
            {isLoading ? "Loading..." : "Go"}
          </button>

          {route && (
            <button
              onClick={clearRoute}
              className="w-full sm:w-auto border border-zinc-600 px-3 py-2 rounded hover:bg-zinc-700 font-mono cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {route && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900 to-zinc-800 px-4 py-3 shadow-md">
            {/* Distance */}
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center text-cyan-400">
                📏
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                  Distance
                </p>
                <p className="text-sm font-semibold text-zinc-100">
                  {route.distanceKm} km
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-zinc-700" />

            {/* Duration */}
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center text-emerald-400">
                ⏱
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                  Duration
                </p>
                <p className="text-sm font-semibold text-zinc-100">
                  {route.durationHr} hr
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="flex-1 p-2 sm:p-5">
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={6}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {route?.path && (
            <>
              <Polyline
                positions={route.path.map(([lng, lat]) => [lat, lng])}
                color="#22d3ee"
                weight={5}
              />
              <Marker position={[route.start.lat, route.start.lng]} />
              <Marker position={[route.end.lat, route.end.lng]} />
              <FitBounds coords={route.path} />
            </>
          )}

          {livePos && (
            <Marker
              ref={liveMarkerRef}
              position={[livePos.lat, livePos.lng]}
              icon={liveIcon}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
