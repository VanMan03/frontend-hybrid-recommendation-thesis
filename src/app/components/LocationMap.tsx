import { useEffect, useRef } from "react";

declare global {
  interface Window {
    L?: any;
  }
}

type LocationValue = {
  latitude: number;
  longitude: number;
};

type LocationMapProps = {
  value: LocationValue | null;
  onSelect?: (next: LocationValue) => void;
  interactive?: boolean;
  heightClassName?: string;
};

const DEFAULT_CENTER: LocationValue = { latitude: 12.8797, longitude: 121.774 };
const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_SCRIPT_ID = "leaflet-script";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_SCRIPT_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

let leafletLoader: Promise<any> | null = null;

const ensureLeafletCss = () => {
  if (document.getElementById(LEAFLET_CSS_ID)) return;
  const link = document.createElement("link");
  link.id = LEAFLET_CSS_ID;
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS_URL;
  link.crossOrigin = "";
  document.head.appendChild(link);
};

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    ensureLeafletCss();

    const existing = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Leaflet script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.src = LEAFLET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Failed to load Leaflet script"));
    document.body.appendChild(script);
  });

  return leafletLoader;
};

export function LocationMap({
  value,
  onSelect,
  interactive = false,
  heightClassName = "h-72",
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    loadLeaflet()
      .then((L) => {
        if (!mounted || !containerRef.current || mapRef.current) return;

        const center = value ?? DEFAULT_CENTER;
        const map = L.map(containerRef.current, {
          zoomControl: interactive,
          dragging: interactive,
          scrollWheelZoom: interactive,
          doubleClickZoom: interactive,
          boxZoom: interactive,
          keyboard: interactive,
          touchZoom: interactive,
        }).setView([center.latitude, center.longitude], value ? 13 : 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        if (value) {
          markerRef.current = L.marker([value.latitude, value.longitude]).addTo(map);
        }

        if (interactive && onSelect) {
          map.on("click", (event: any) => {
            const next = {
              latitude: Number(event.latlng.lat),
              longitude: Number(event.latlng.lng),
            };

            if (!markerRef.current) {
              markerRef.current = L.marker([next.latitude, next.longitude]).addTo(map);
            } else {
              markerRef.current.setLatLng([next.latitude, next.longitude]);
            }

            onSelect(next);
          });
        }

        mapRef.current = map;
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [interactive, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const L = window.L;

    if (!map || !L || !value) return;

    const nextLatLng = [value.latitude, value.longitude] as [number, number];
    if (!marker) {
      markerRef.current = L.marker(nextLatLng).addTo(map);
    } else {
      marker.setLatLng(nextLatLng);
    }
    map.setView(nextLatLng, Math.max(map.getZoom(), 13));
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-lg border border-gray-300 ${heightClassName}`}
      aria-label={interactive ? "Location picker map" : "Destination location map"}
    />
  );
}
