import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast from "react-hot-toast";
import { socket } from "../services/socket";
import { geocodePlace } from "../utils/geocode";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/* HELPERS */
const getBearing = (a, b) => {
  const y =
    Math.sin(((b.lng - a.lng) * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.cos(((b.lng - a.lng) * Math.PI) / 180);

  return (Math.atan2(y, x) * 180) / Math.PI;
};

/* COMPONENT */
export default function MapView() {
  const mapRef = useRef(null);
  const map = useRef(null);

  const startMarker = useRef(null);
  const endMarker = useRef(null);
  const liveMarker = useRef(null);
  const watchId = useRef(null);
  const animRef = useRef(null);
  const prevPos = useRef(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  /* MAP INIT  */
  useEffect(() => {
    if (!mapRef.current) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [72.8777, 19.076],
      zoom: 5,
    });

    map.current.on("load", () => {
      map.current.resize();
    });

    socket.on("location-updated", onLiveLocation);

    return () => {
      socket.off("location-updated", onLiveLocation);
      map.current?.remove();
    };
  }, []);

  /* SMOOTH MARKER  */
  const smoothMove = (from, to) => {
    if (!liveMarker.current) return;

    const steps = 60;
    let step = 0;

    const latStep = (to.lat - from.lat) / steps;
    const lngStep = (to.lng - from.lng) / steps;

    cancelAnimationFrame(animRef.current);

    const animate = () => {
      step++;
      const pos = {
        lat: from.lat + latStep * step,
        lng: from.lng + lngStep * step,
      };

      liveMarker.current.setLngLat([pos.lng, pos.lat]);

      if (prevPos.current) {
        liveMarker.current.setRotation(getBearing(prevPos.current, pos));
      }

      if (step < steps) animRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const onLiveLocation = ({ lat, lng }) => {
    const next = { lat, lng };

    if (!liveMarker.current) {
      liveMarker.current = new mapboxgl.Marker({
        color: "#facc15",
        rotationAlignment: "map",
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
    } else if (prevPos.current) {
      smoothMove(prevPos.current, next);
    }

    map.current.easeTo({ center: [lng, lat], duration: 400 });
    prevPos.current = next;
  };

  const getRoute = async (s, e) => {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${s.lng},${s.lat};${e.lng},${e.lat}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    return data.routes[0];
  };

  const createRoute = async () => {
    if (!start || !end) return toast.error("Enter start & end location");

    try {
      setLoading(true);

      const s = await geocodePlace(start);
      const e = await geocodePlace(end);
      const route = await getRoute(s, e);

      drawRoute(route.geometry.coordinates);
      addMarkers(s, e);
      fitBounds(route.geometry.coordinates);

      setRouteInfo({
        start: s.name,
        end: e.name,
        distance: (route.distance / 1000).toFixed(2),
        duration: (route.duration / 3600).toFixed(1),
      });

      socket.emit("create-route", {
        start: {
          name: s.name,
          lat: s.lat,
          lng: s.lng,
        },
        end: {
          name: e.name,
          lat: e.lat,
          lng: e.lng,
        },
        route: {
          distance: route.distance,
          duration: route.duration,
        },
      });

      startLiveTracking();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const drawRoute = (coords) => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
      },
    });

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#22d3ee",
        "line-width": 5,
      },
    });
  };

  const addMarkers = (s, e) => {
    startMarker.current?.remove();
    endMarker.current?.remove();

    startMarker.current = new mapboxgl.Marker({ color: "#22c55e" })
      .setLngLat([s.lng, s.lat])
      .addTo(map.current);

    endMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([e.lng, e.lat])
      .addTo(map.current);
  };

  const fitBounds = (coords) => {
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0])
    );
    map.current.fitBounds(bounds, { padding: 80 });
  };

  const startLiveTracking = () => {
    if (watchId.current) return;

    watchId.current = navigator.geolocation.watchPosition(
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

  const clearRoute = () => {
    setRouteInfo(null);
    setStart("");
    setEnd("");

    if (map.current?.getLayer("route")) {
      map.current.removeLayer("route");
    }

    if (map.current?.getSource("route")) {
      map.current.removeSource("route");
    }

    startMarker.current?.remove();
    startMarker.current = null;

    endMarker.current?.remove();
    endMarker.current = null;

    liveMarker.current?.remove();
    liveMarker.current = null;

    prevPos.current = null;
    cancelAnimationFrame(animRef.current);

    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  /* UI */

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 relative">
      {/* LOADER */}
      {loading && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            <span className="text-sm">Calculating route...</span>
          </div>
        </div>
      )}

      {/* TOP FORM */}
      <div className="p-4 border-b border-zinc-800 text-white z-10">
        <h2 className="text-center font-semibold font-mono mb-3">
          📍 Live Route Tracking
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Start location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="flex-1 rounded bg-zinc-800 p-2 text-sm font-mono"
            disabled={loading}
          />

          <input
            placeholder="End location"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="flex-1 rounded bg-zinc-800 p-2 text-sm font-mono"
            disabled={loading}
          />

          <button
            onClick={createRoute}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold font-mono transition ${
              loading
                ? "bg-zinc-600 text-zinc-300 cursor-not-allowed"
                : "bg-cyan-400 text-black hover:bg-cyan-500 cursor-pointer"
            }`}
          >
            {loading ? "Loading..." : "Go"}
          </button>

          {routeInfo && (
            <button
              onClick={clearRoute}
              className="border border-zinc-600 px-3 py-2 rounded hover:bg-zinc-700 font-mono cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {routeInfo && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-900 to-zinc-800 px-4 py-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">📏</span>
              <div>
                <p className="text-[11px] uppercase text-zinc-400">Distance</p>
                <p className="text-sm font-semibold">{routeInfo.distance} km</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-zinc-700" />

            <div className="flex items-center gap-2">
              <span className="text-emerald-400">⏱</span>
              <div>
                <p className="text-[11px] uppercase text-zinc-400">Duration</p>
                <p className="text-sm font-semibold">{routeInfo.duration} hr</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
