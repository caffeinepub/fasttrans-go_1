import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

// Fix default marker icons for Vite
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

export interface Driver {
  id: number;
  x: number;
  y: number;
  name: string;
  eta: number;
  distance: number;
}

const CAIRO: [number, number] = [30.0444, 31.2357];

const greenIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconAnchor: [7, 7],
});

const redIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconAnchor: [7, 7],
});

function makeDriverIcon(eta: number) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:30px;height:30px;border-radius:50%;background:#CCFF00;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(204,255,0,0.4);">🚗</div>
      <div style="background:rgba(20,20,20,0.9);color:#CCFF00;font-size:9px;font-weight:bold;padding:2px 5px;border-radius:4px;margin-top:2px;border:1px solid rgba(204,255,0,0.3);white-space:nowrap;">${eta === 1 ? "دقيقة" : eta === 2 ? "دقيقتان" : `${eta} د`}</div>
    </div>`,
    iconAnchor: [15, 15],
  });
}

interface FlyToProps {
  center: [number, number] | null;
}

function FlyTo({ center }: FlyToProps) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (
      center &&
      (!prevCenter.current ||
        prevCenter.current[0] !== center[0] ||
        prevCenter.current[1] !== center[1])
    ) {
      map.flyTo(center, 15, { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, map]);
  return null;
}

interface SearchingOverlayProps {
  searching?: boolean;
}

function SearchingOverlay({ searching }: SearchingOverlayProps) {
  if (!searching) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 999,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "2px solid #CCFF00",
            animation: `pulseRing 2s ease-out ${i * 0.5}s infinite`,
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            opacity: 0,
          }}
        />
      ))}
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: "#CCFF00",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 12px #CCFF00",
        }}
      />
    </div>
  );
}

interface MapViewProps {
  pickup?: string;
  dropoff?: string;
  className?: string;
  drivers?: Driver[];
  searching?: boolean;
  onPickupChange?: (lat: number, lng: number, label: string) => void;
  onDropoffChange?: (lat: number, lng: number, label: string) => void;
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
  showGPSButton?: boolean;
}

function GPSButton({
  onLocate,
}: {
  onLocate: (pos: GeolocationPosition) => void;
}) {
  const map = useMap();
  const handleClick = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 15, { duration: 1.2 });
        onLocate(pos);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  return (
    <div
      style={{
        position: "absolute",
        bottom: "80px",
        left: "10px",
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        style={{
          width: "36px",
          height: "36px",
          background: "#1C1C1C",
          border: "2px solid #CCFF00",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          color: "#CCFF00",
          fontSize: "16px",
        }}
        title="موقعي الحالي"
        aria-label="تحديد موقعي الحالي"
      >
        ⊕
      </button>
    </div>
  );
}

export function MapView({
  pickup,
  dropoff,
  className,
  drivers,
  searching,
  onPickupChange,
  onDropoffChange,
  pickupCoords,
  dropoffCoords,
  showGPSButton,
}: MapViewProps) {
  const pickupPos: [number, number] = pickupCoords ?? [
    CAIRO[0] + 0.005,
    CAIRO[1] - 0.005,
  ];
  const dropoffPos: [number, number] = dropoffCoords ?? [
    CAIRO[0] - 0.005,
    CAIRO[1] + 0.005,
  ];

  const flyTarget: [number, number] | null = pickupCoords ?? null;

  return (
    <div
      className={`relative overflow-hidden ${className ?? "h-64"}`}
      style={{ background: "#1a1a1a" }}
    >
      <style>{`
        @keyframes pulseRing {
          0% { transform: translate(-50%,-50%) scale(0.3); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
        }
        .leaflet-container { background: #141414; }
      `}</style>

      <MapContainer
        center={CAIRO}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap © CartoDB"
          maxZoom={19}
        />

        <FlyTo center={flyTarget} />

        {showGPSButton && (
          <GPSButton
            onLocate={(pos) => {
              const { latitude, longitude } = pos.coords;
              onPickupChange?.(latitude, longitude, "موقعي الحالي");
            }}
          />
        )}

        {pickup?.trim() && (
          <Marker
            position={pickupPos}
            icon={greenIcon}
            draggable={!!onPickupChange}
            eventHandlers={{
              dragend: (e) => {
                const latlng = (e.target as L.Marker).getLatLng();
                onPickupChange?.(latlng.lat, latlng.lng, "موقعي");
              },
            }}
          />
        )}

        {dropoff?.trim() && (
          <Marker
            position={dropoffPos}
            icon={redIcon}
            draggable={!!onDropoffChange}
            eventHandlers={{
              dragend: (e) => {
                const latlng = (e.target as L.Marker).getLatLng();
                onDropoffChange?.(latlng.lat, latlng.lng, "وجهتي");
              },
            }}
          />
        )}

        {drivers?.map((driver) => {
          const lat = CAIRO[0] + (driver.y / 100 - 0.5) * 0.06;
          const lng = CAIRO[1] + (driver.x / 100 - 0.5) * 0.06;
          return (
            <Marker
              key={driver.id}
              position={[lat, lng]}
              icon={makeDriverIcon(driver.eta)}
            />
          );
        })}
      </MapContainer>

      <SearchingOverlay searching={searching} />

      <div
        style={{
          position: "absolute",
          bottom: "4px",
          right: "8px",
          fontSize: "9px",
          color: "rgba(255,255,255,0.3)",
          pointerEvents: "none",
          zIndex: 500,
        }}
      >
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
