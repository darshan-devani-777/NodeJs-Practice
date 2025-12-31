import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

export default function FitBounds({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (!coords?.length) return;

    const bounds = L.latLngBounds(
      coords.map(([lng, lat]) => [lat, lng])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [coords, map]);

  return null;
}
