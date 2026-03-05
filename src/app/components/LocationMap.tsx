import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

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
const MAPBOX_STYLE_URL = "mapbox://styles/mapbox/streets-v12";

export function LocationMap({
  value,
  onSelect,
  interactive = false,
  heightClassName = "h-72",
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const isMountedRef = useRef(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_ACCESS_TOKEN) {
      setError("Mapbox access token is missing. Please set VITE_MAPBOX_ACCESS_TOKEN in your .env file.");
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    if (!containerRef.current || mapRef.current) {
      return;
    }

    const container = containerRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      const timeoutId = setTimeout(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0 && !mapRef.current) {
          initializeMap();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    initializeMap();

    function initializeMap() {
      if (mapRef.current) return;

      setError(null);
      setIsInitializing(true);
      const center = value ?? DEFAULT_CENTER;

      try {
        const map = new mapboxgl.Map({
          container: container,
          style: MAPBOX_STYLE_URL,
          center: [center.longitude, center.latitude],
          zoom: value ? 13 : 6,
          interactive: interactive,
          attributionControl: true,
        });

        mapRef.current = map;

        if (interactive) {
          map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        }

        map.on('load', () => {
          if (!isMountedRef.current) return;
          setMapLoaded(true);
          setIsInitializing(false);
          map.resize();

          if (value) {
            const marker = new mapboxgl.Marker({
              draggable: interactive,
            })
              .setLngLat([value.longitude, value.latitude])
              .addTo(map);

            markerRef.current = marker;

            if (interactive && onSelect) {
              marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                onSelect({
                  latitude: lngLat.lat,
                  longitude: lngLat.lng,
                });
              });
            }
          }

          if (interactive && onSelect) {
            map.on('click', (event) => {
              const lngLat = event.lngLat;

              if (!markerRef.current) {
                const marker = new mapboxgl.Marker({
                  draggable: true,
                })
                  .setLngLat([lngLat.lng, lngLat.lat])
                  .addTo(map);

                markerRef.current = marker;

                marker.on('dragend', () => {
                  const markerLngLat = marker.getLngLat();
                  onSelect({
                    latitude: markerLngLat.lat,
                    longitude: markerLngLat.lng,
                  });
                });
              } else {
                markerRef.current.setLngLat([lngLat.lng, lngLat.lat]);
              }

              onSelect({
                latitude: lngLat.lat,
                longitude: lngLat.lng,
              });
            });
          }
        });

        map.on('error', (e) => {
          console.error('Mapbox error:', e);
          if (!isMountedRef.current) return;
          setIsInitializing(false);
          const mapboxMessage =
            e && typeof e === "object" && "error" in e && e.error && typeof e.error === "object" && "message" in e.error
              ? String(e.error.message)
              : null;
          setError(
            mapboxMessage
              ? `Failed to load map: ${mapboxMessage}`
              : 'Failed to load map. Check Mapbox token/domain config and internet connection.'
          );
        });

      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to initialize map. Please check your Mapbox configuration.');
        setIsInitializing(false);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [interactive, onSelect]);

  // Update marker position when value changes
  useEffect(() => {
    if (!mapLoaded || !value || !mapRef.current) return;

    const map = mapRef.current;
    
    if (!markerRef.current) {
      const marker = new mapboxgl.Marker({
        draggable: interactive,
      })
        .setLngLat([value.longitude, value.latitude])
        .addTo(map);
      
      markerRef.current = marker;

      if (interactive && onSelect) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          onSelect({
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          });
        });
      }
    } else {
      markerRef.current.setLngLat([value.longitude, value.latitude]);
    }

    map.flyTo({
      center: [value.longitude, value.latitude],
      zoom: Math.max(map.getZoom(), 13),
      essential: true,
    });
  }, [value, mapLoaded, interactive, onSelect]);

  return (
    <div className={`map-container w-full rounded-lg border border-gray-300 z-0 ${heightClassName}`} style={{ minHeight: '200px' }}>
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ position: "relative" }}
        aria-label={interactive ? "Location picker map" : "Destination location map"}
      />

      {isInitializing && !error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading map...</div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/95">
          <div className="text-center p-4">
            <div className="text-red-600 font-medium mb-2">Map Error</div>
            <div className="text-sm text-gray-600">{error}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
