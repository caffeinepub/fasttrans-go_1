import { Crosshair, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Leaflet is loaded from CDN via index.html <script> + <link> tags
// L is available as window.L globally

export interface Driver {
  id: number;
  x: number;
  y: number;
  name: string;
  eta: number;
  distance: number;
}

interface MapViewProps {
  className?: string;
  drivers?: Driver[];
  searching?: boolean;
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
  onPickupChange?: (lat: number, lng: number, label: string) => void;
  showGPSButton?: boolean;
  pickup?: string;
  dropoff?: string;
  onDropoffChange?: (lat: number, lng: number, label: string) => void;
}

const CAIRO_LAT = 30.0444;
const CAIRO_LNG = 31.2357;

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
      { headers: { "User-Agent": "FastTrans/1.0" } },
    );
    const data = await res.json();
    return (
      data.display_name ||
      data.address?.road ||
      `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    );
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getL(): any {
  return (window as any).L;
}

export function MapView({
  className,
  drivers,
  searching,
  pickupCoords,
  dropoffCoords,
  onPickupChange,
  showGPSButton,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pickupMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dropoffMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driverMarkersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLineRef = useRef<any>(null);
  const moveEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const [isLocating, setIsLocating] = useState(false);

  const onPickupChangeRef = useRef(onPickupChange);
  useEffect(() => {
    onPickupChangeRef.current = onPickupChange;
  }, [onPickupChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = getL();
    if (!L) return;

    if (L.Icon?.Default?.prototype) {
      L.Icon.Default.prototype._getIconUrl = undefined;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }

    const map = L.map(containerRef.current, {
      center: [CAIRO_LAT, CAIRO_LNG],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite imagery base layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri",
      },
    ).addTo(map);

    // Labels overlay on top (shows street names)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        opacity: 0.8,
      },
    ).addTo(map);

    if (onPickupChangeRef.current) {
      // Track user drag intent
      map.on("dragstart", () => {
        isDraggingRef.current = true;
      });

      map.on("moveend", () => {
        // Only reverse geocode when the user manually dragged the map
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        if (moveEndTimerRef.current) clearTimeout(moveEndTimerRef.current);
        moveEndTimerRef.current = setTimeout(async () => {
          const center = map.getCenter();
          const label = await reverseGeocode(center.lat, center.lng);
          onPickupChangeRef.current?.(center.lat, center.lng, label);
        }, 600);
      });
    }

    mapRef.current = map;

    // Auto-locate user on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          map.setView([lat, lng], 16, { animate: false });
          if (onPickupChangeRef.current) {
            const label = await reverseGeocode(lat, lng);
            onPickupChangeRef.current(lat, lng, label);
          }
        },
        () => {}, // silently fail
        { timeout: 8000, enableHighAccuracy: true },
      );
    }

    return () => {
      if (moveEndTimerRef.current) clearTimeout(moveEndTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = getL();
    if (!map || !L) return;
    if (pickupCoords) {
      if (!pickupMarkerRef.current) {
        const greenIcon = L.divIcon({
          html: '<div style="width:12px;height:12px;background:#4ade80;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(74,222,128,0.8)"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
          className: "",
        });
        pickupMarkerRef.current = L.marker(pickupCoords, {
          icon: greenIcon,
        }).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng(pickupCoords);
      }
      map.setView(pickupCoords, 14, { animate: true });
    }
  }, [pickupCoords]);

  useEffect(() => {
    const map = mapRef.current;
    const L = getL();
    if (!map || !L) return;
    if (dropoffCoords) {
      if (!dropoffMarkerRef.current) {
        const redIcon = L.divIcon({
          html: '<div style="width:12px;height:12px;background:#f87171;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(248,113,113,0.8)"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
          className: "",
        });
        dropoffMarkerRef.current = L.marker(dropoffCoords, {
          icon: redIcon,
        }).addTo(map);
      } else {
        dropoffMarkerRef.current.setLatLng(dropoffCoords);
      }
    }
    if (pickupCoords && dropoffCoords) {
      if (routeLineRef.current) map.removeLayer(routeLineRef.current);
      routeLineRef.current = L.polyline([pickupCoords, dropoffCoords], {
        color: "#CCFF00",
        weight: 3,
        opacity: 0.8,
        dashArray: "6, 8",
      }).addTo(map);
      map.fitBounds([pickupCoords, dropoffCoords], { padding: [40, 40] });
    }
  }, [dropoffCoords, pickupCoords]);

  useEffect(() => {
    const map = mapRef.current;
    const L = getL();
    if (!map || !L) return;

    for (const m of driverMarkersRef.current) map.removeLayer(m);
    driverMarkersRef.current = [];

    if (!drivers || drivers.length === 0) return;

    const center = map.getCenter();
    const bounds = map.getBounds();
    const latSpan = (bounds.getNorth() - bounds.getSouth()) * 0.4;
    const lngSpan = (bounds.getEast() - bounds.getWest()) * 0.4;

    for (const driver of drivers) {
      const lat = center.lat + (driver.y / 50 - 1) * latSpan;
      const lng = center.lng + (driver.x / 50 - 1) * lngSpan;

      const carIcon = L.divIcon({
        html: `<div style="font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))" title="${driver.name}">🚗</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: "",
      });

      const marker = L.marker([lat, lng], { icon: carIcon })
        .bindPopup(
          `<b>${driver.name}</b><br/>${driver.eta} \u062f\u0642\u064a\u0642\u0629`,
          { closeButton: false },
        )
        .addTo(map);

      driverMarkersRef.current.push(marker);
    }
  }, [drivers]);

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapRef.current?.setView([lat, lng], 16, { animate: true });
        if (onPickupChange) {
          const label = await reverseGeocode(lat, lng);
          onPickupChange(lat, lng, label);
        }
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {onPickupChange && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 500 }}
        >
          <div className="flex flex-col items-center">
            <div
              style={{
                width: "16px",
                height: "16px",
                background: "#4285F4",
                borderRadius: "50%",
                border: "3px solid white",
                boxShadow: "0 0 0 3px rgba(66,133,244,0.3)",
              }}
            />
            <div className="w-0.5 h-4 bg-white opacity-80" />
          </div>
        </div>
      )}

      {showGPSButton && (
        <button
          type="button"
          onClick={handleGPS}
          className="absolute bottom-4 left-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg hover:bg-accent transition-colors"
          data-ocid="map.button"
          style={{ zIndex: 1000 }}
        >
          {isLocating ? (
            <Crosshair className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Navigation className="w-5 h-5 text-primary" />
          )}
        </button>
      )}

      {searching && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 600 }}
        >
          <div className="w-20 h-20 rounded-full border-2 border-[#CCFF00] opacity-40 animate-ping" />
        </div>
      )}
    </div>
  );
}
