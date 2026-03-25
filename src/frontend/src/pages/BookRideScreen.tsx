import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Car,
  ChevronLeft,
  DollarSign,
  Filter,
  Minus,
  Pencil,
  Plus,
  QrCode,
  Snowflake,
  Star,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { RideRequest } from "../backend.d";
import { BottomTabBar } from "../components/BottomTabBar";
import type { Driver } from "../components/MapView";
import { MapView } from "../components/MapView";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { FareStatus, Status, useCreateRideRequest } from "../hooks/useQueries";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateFareFromCoords(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const km = haversineKm(lat1, lon1, lat2, lon2);
  return Math.max(50, Math.round(50 + km * 8));
}

function estimateFare(pickup: string, dropoff: string): number {
  const distanceUnits = ((pickup.length + dropoff.length) % 20) + 3;
  return 50 + distanceUnits * 5;
}

type RideType = "economy" | "comfort" | "moto" | "premium" | "tuktuK";

const rideTypes = [
  {
    id: "economy" as RideType,
    nameAr: "رحلة",
    descAr: "رحلات بأجرة معقولة",
    passengers: 4,
    icon: "car",
    multiplier: 1.0,
    minPrice: 50,
  },
  {
    id: "comfort" as RideType,
    nameAr: "مريحة ❄️",
    descAr: "سيارات مكيفة أحدث",
    passengers: 4,
    icon: "comfort",
    multiplier: 1.6,
    minPrice: 80,
  },
  {
    id: "moto" as RideType,
    nameAr: "دراجة نارية 🏍️",
    descAr: "وصول أسرع، وتكلفة أقل",
    passengers: 1,
    icon: "moto",
    multiplier: 0.6,
    minPrice: 30,
  },
  {
    id: "tuktuK" as RideType,
    nameAr: "توكتوك 🛺",
    descAr: "اقتصادي ومناسب للمسافات القصيرة",
    passengers: 2,
    icon: "tuktuk",
    multiplier: 0.4,
    minPrice: 20,
  },
  {
    id: "premium" as RideType,
    nameAr: "بريميوم ⭐",
    descAr: "سيارات فاخرة واسعة",
    passengers: 4,
    icon: "premium",
    multiplier: 2.0,
    minPrice: 100,
  },
];

const DRIVER_POOL = [
  { name: "أحمد محمد", car: "تويوتا كورولا", rating: 4.9 },
  { name: "محمد علي", car: "هيونداي إيلانترا", rating: 4.8 },
  { name: "خالد إبراهيم", car: "كيا سيراتو", rating: 4.7 },
  { name: "عمر حسن", car: "نيسان صني", rating: 4.9 },
  { name: "يوسف أحمد", car: "فولكس فاغن باسات", rating: 5.0 },
  { name: "سامي خالد", car: "شيفروليه أوبترا", rating: 4.6 },
];

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} متر`;
  return `${(meters / 1000).toFixed(1)} كم`;
}

function formatEta(minutes: number): string {
  if (minutes === 1) return "دقيقة واحدة";
  if (minutes === 2) return "دقيقتان";
  return `${minutes} دقائق`;
}

function generateDrivers(): Driver[] {
  const count = Math.floor(Math.random() * 3) + 4;
  const shuffled = [...DRIVER_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  return shuffled.map((d, i) => ({
    id: i + 1,
    x: Math.random() * 70 + 10,
    y: Math.random() * 70 + 10,
    name: d.name,
    car: d.car,
    rating: d.rating,
    eta: Math.floor(Math.random() * 7) + 1,
    distance: Math.floor(Math.random() * 2200) + 200,
  }));
}

interface DriverWithMeta extends Driver {
  car: string;
  rating: number;
}

type OfferStatus = "active" | "accepted" | "declined" | "expired";

interface DriverOffer {
  id: number;
  driver: DriverWithMeta;
  proposedPrice: number;
  status: OfferStatus;
  timeLeft: number;
}

type SearchPhase = "idle" | "sending" | "offers" | "no_offers";

export default function BookRideScreen() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createRide = useCreateRideRequest();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [dropoffSuggestions, setDropoffSuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideType>("economy");
  const [autoAccept, setAutoAccept] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<
    [number, number] | undefined
  >(undefined);
  const [dropoffCoords, setDropoffCoords] = useState<
    [number, number] | undefined
  >(undefined);
  const [customPrices, setCustomPrices] = useState<Record<RideType, number>>({
    economy: 50,
    comfort: 80,
    moto: 30,
    tuktuK: 20,
    premium: 100,
  });

  const [searchPhase, setSearchPhase] = useState<SearchPhase>("idle");
  const [offers, setOffers] = useState<DriverOffer[]>([]);
  const [mapDrivers, setMapDrivers] = useState<DriverWithMeta[]>([]);

  const offerTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const countdownIntervalsRef = useRef<
    Map<number, ReturnType<typeof setInterval>>
  >(new Map());
  const mapIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore saved pickup/dropoff from sessionStorage on mount + GPS auto-detect
  useEffect(() => {
    const savedPickup = sessionStorage.getItem("rideshare_saved_pickup");
    const savedDropoff = sessionStorage.getItem("rideshare_saved_dropoff");
    if (savedPickup) {
      setPickup(savedPickup);
      sessionStorage.removeItem("rideshare_saved_pickup");
    }
    if (savedDropoff) {
      setDropoff(savedDropoff);
      sessionStorage.removeItem("rideshare_saved_dropoff");
    }
    // Auto-detect GPS location for pickup if no saved pickup
    if (!savedPickup) {
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setPickupCoords([lat, lng]);
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
              { headers: { "User-Agent": "FastTrans/1.0" } },
            );
            const data = await res.json();
            setPickup(
              data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            );
          } catch {
            setPickup(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        },
        () => {},
        { timeout: 8000, enableHighAccuracy: true },
      );
    }
  }, []);

  const searchDestination = (query: string) => {
    setDropoff(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim() || query.length < 2) {
      setDropoffSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=eg&accept-language=ar&limit=5`,
          { headers: { "User-Agent": "FastTrans/1.0" } },
        );
        const data = await res.json();
        setDropoffSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setDropoffSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
  };

  const selectSuggestion = (s: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setDropoff(s.display_name);
    setDropoffCoords([Number.parseFloat(s.lat), Number.parseFloat(s.lon)]);
    setDropoffSuggestions([]);
    setShowSuggestions(false);
  };

  const fareBase =
    pickupCoords && dropoffCoords
      ? estimateFareFromCoords(
          pickupCoords[0],
          pickupCoords[1],
          dropoffCoords[0],
          dropoffCoords[1],
        )
      : pickup.trim() && dropoff.trim()
        ? estimateFare(pickup.trim(), dropoff.trim())
        : 150;

  const etaMinutes =
    pickupCoords && dropoffCoords
      ? Math.round(
          (haversineKm(
            pickupCoords[0],
            pickupCoords[1],
            dropoffCoords[0],
            dropoffCoords[1],
          ) /
            30) *
            60,
        )
      : 15;

  const getRidePrice = (multiplier: number, minPrice: number) =>
    Math.max(minPrice, Math.round(fareBase * multiplier));

  // Reset custom prices when base fare changes
  useEffect(() => {
    const newPrices = {} as Record<RideType, number>;
    for (const ride of rideTypes) {
      newPrices[ride.id] = Math.max(
        ride.minPrice,
        Math.round(fareBase * ride.multiplier),
      );
    }
    setCustomPrices(newPrices);
  }, [fareBase]);

  const autoAcceptPrice = customPrices[selectedRide]
    ? Math.round(customPrices[selectedRide] * 0.8)
    : Math.round(fareBase * 0.8);

  const adjustPrice = (rideId: RideType, delta: number) => {
    const ride = rideTypes.find((r) => r.id === rideId);
    const minPrice = ride?.minPrice ?? 20;
    setCustomPrices((prev) => ({
      ...prev,
      [rideId]: Math.max(minPrice, (prev[rideId] ?? 0) + delta),
    }));
  };

  const clearAllTimers = useCallback(() => {
    for (const t of offerTimeoutsRef.current) clearTimeout(t);
    offerTimeoutsRef.current = [];
    for (const interval of countdownIntervalsRef.current.values())
      clearInterval(interval);
    countdownIntervalsRef.current.clear();
    if (mapIntervalRef.current) {
      clearInterval(mapIntervalRef.current);
      mapIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const startCountdownForOffer = useCallback((offerId: number) => {
    const interval = setInterval(() => {
      setOffers((prev) => {
        const offer = prev.find((o) => o.id === offerId);
        if (!offer || offer.status !== "active") {
          clearInterval(interval);
          countdownIntervalsRef.current.delete(offerId);
          return prev;
        }
        if (offer.timeLeft <= 1) {
          clearInterval(interval);
          countdownIntervalsRef.current.delete(offerId);
          return prev.map((o) =>
            o.id === offerId
              ? { ...o, status: "expired" as OfferStatus, timeLeft: 0 }
              : o,
          );
        }
        return prev.map((o) =>
          o.id === offerId ? { ...o, timeLeft: o.timeLeft - 1 } : o,
        );
      });
    }, 1000);
    countdownIntervalsRef.current.set(offerId, interval);
  }, []);

  const startSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      toast.error("من فضلك أدخل موقع الانطلاق والوجهة");
      return;
    }

    clearAllTimers();
    setOffers([]);
    setMapDrivers([]);
    setSearchPhase("sending");

    const driverPool = generateDrivers() as DriverWithMeta[];
    const selectedType = rideTypes.find((r) => r.id === selectedRide)!;
    const baseFare = getRidePrice(
      selectedType.multiplier,
      selectedType.minPrice,
    );

    const t0 = setTimeout(() => {
      setMapDrivers(driverPool);
      setSearchPhase("offers");

      mapIntervalRef.current = setInterval(() => {
        setMapDrivers((prev) =>
          prev.map((d) => ({
            ...d,
            x: Math.min(90, Math.max(10, d.x + (Math.random() - 0.5) * 4)),
            y: Math.min(90, Math.max(10, d.y + (Math.random() - 0.5) * 4)),
            eta: Math.max(1, d.eta + Math.round(Math.random() * 2 - 1)),
          })),
        );
      }, 60000);

      const offerCount = driverPool.length;
      let cumulativeDelay = 0;

      for (let i = 0; i < offerCount; i++) {
        const driver = driverPool[i];
        const variance = 0.75 + Math.random() * 0.5;
        const proposedPrice = Math.max(
          selectedType.minPrice,
          Math.round(baseFare * variance),
        );
        const offerDelay =
          i === 0 ? 500 : cumulativeDelay + (3000 + Math.random() * 4000);
        if (i > 0) cumulativeDelay = offerDelay;

        const tOffer = setTimeout(() => {
          const newOffer: DriverOffer = {
            id: driver.id,
            driver,
            proposedPrice,
            status: "active",
            timeLeft: 30,
          };
          setOffers((prev) => [...prev, newOffer]);
          startCountdownForOffer(driver.id);
        }, offerDelay);
        offerTimeoutsRef.current.push(tOffer);
      }

      const lastOfferDelay = offerCount === 1 ? 500 : cumulativeDelay;
      const noOffersDelay = lastOfferDelay + 31000;
      const tNoOffers = setTimeout(() => {
        setOffers((prev) => {
          const hasAccepted = prev.some((o) => o.status === "accepted");
          if (!hasAccepted) {
            const activeCount = prev.filter(
              (o) => o.status === "active",
            ).length;
            if (activeCount === 0) {
              setSearchPhase("no_offers");
            }
          }
          return prev;
        });
      }, noOffersDelay);
      offerTimeoutsRef.current.push(tNoOffers);
    }, 3000);
    offerTimeoutsRef.current.push(t0);
  };

  useEffect(() => {
    if (searchPhase !== "offers") return;
    if (offers.length === 0) return;
    const hasAccepted = offers.some((o) => o.status === "accepted");
    if (hasAccepted) return;
    const hasActive = offers.some((o) => o.status === "active");
    if (!hasActive) {
      // let scheduled timeout handle no_offers state
    }
  }, [offers, searchPhase]);

  const cancelSearch = () => {
    clearAllTimers();
    setSearchPhase("idle");
    setOffers([]);
    setMapDrivers([]);
  };

  const declineOffer = (offerId: number) => {
    const interval = countdownIntervalsRef.current.get(offerId);
    if (interval) {
      clearInterval(interval);
      countdownIntervalsRef.current.delete(offerId);
    }
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId ? { ...o, status: "declined" as OfferStatus } : o,
      ),
    );
  };

  const handleSelectDriver = async (offer: DriverOffer) => {
    clearAllTimers();

    setOffers((prev) =>
      prev.map((o) =>
        o.id === offer.id ? { ...o, status: "accepted" as OfferStatus } : o,
      ),
    );

    // Save driver info for the en-route screen
    sessionStorage.setItem("rideshare_driver_name", offer.driver.name);
    sessionStorage.setItem("rideshare_driver_car", offer.driver.car);
    sessionStorage.setItem(
      "rideshare_driver_rating",
      String(offer.driver.rating),
    );
    sessionStorage.setItem("rideshare_driver_eta", String(offer.driver.eta));
    sessionStorage.setItem("rideshare_trip_price", String(offer.proposedPrice));
    sessionStorage.setItem("rideshare_pickup_for_route", pickup.trim());
    sessionStorage.setItem("rideshare_dropoff_for_route", dropoff.trim());

    // If logged in, persist the ride to the backend
    if (identity) {
      const ride: RideRequest = {
        id: BigInt(0),
        status: Status.pending,
        passenger: identity.getPrincipal(),
        pickupLocation: pickup.trim(),
        dropoffLocation: dropoff.trim(),
        proposedFare: BigInt(offer.proposedPrice),
        fareStatus: FareStatus.pending,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      };
      try {
        await createRide.mutateAsync(ride);
      } catch {
        // Non-fatal: continue to en-route screen even if backend call fails
      }
    }

    toast.success(`تم اختيار ${offer.driver.name}! السائق في طريقه إليك 🚗`);
    navigate({ to: "/driver-enroute" });
  };

  const retrySearch = () => {
    clearAllTimers();
    setOffers([]);
    setMapDrivers([]);
    setSearchPhase("idle");
  };

  const activeOffers = offers.filter((o) => o.status === "active");
  const displayOffers = offers.filter((o) => o.status === "active");

  const isSearching = searchPhase === "sending";
  const showOffers = searchPhase === "offers";
  const showNoOffers = searchPhase === "no_offers";
  const showForm = searchPhase === "idle";

  return (
    <div
      className="flex flex-col h-screen bg-background overflow-hidden"
      dir="rtl"
    >
      {/* Map section */}
      <div className="relative flex-none" style={{ height: "40vh" }}>
        <MapView
          pickup={pickup}
          dropoff={dropoff}
          className="w-full h-full"
          drivers={mapDrivers}
          searching={isSearching}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          showGPSButton={true}
          onPickupChange={(lat, lng, label) => {
            setPickup(label);
            setPickupCoords([lat, lng]);
          }}
          onDropoffChange={(lat, lng, label) => {
            setDropoff(label);
            setDropoffCoords([lat, lng]);
          }}
        />

        {/* Back button */}
        <button
          type="button"
          className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-card z-10 hover:bg-accent transition-colors"
          onClick={() => navigate({ to: "/" })}
          data-ocid="book.secondary_button"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Searching overlay on map */}
        {isSearching && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 z-20">
            <span className="w-3 h-3 rounded-full border-2 border-[#CCFF00] border-t-transparent animate-spin" />
            <span className="text-xs text-foreground">
              جاري الإرسال للسائقين القريبين...
            </span>
          </div>
        )}
      </div>

      {/* Bottom content */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 bg-card rounded-t-3xl relative z-10 overflow-y-auto flex flex-col"
      >
        {/* Pickup/dropoff input card — always visible below map */}
        <div className="px-4 pt-3 pb-0 shrink-0">
          <div className="bg-secondary rounded-2xl px-3 py-2.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
              <Input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="موقع الانطلاق"
                className="flex-1 bg-transparent border-0 p-0 h-auto text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-right"
                data-ocid="book.input"
              />
            </div>
            <div className="h-px bg-border mx-4" />
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <Input
                value={dropoff}
                onChange={(e) => searchDestination(e.target.value)}
                onFocus={() =>
                  dropoffSuggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="الوجهة"
                className="flex-1 bg-transparent border-0 p-0 h-auto text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-right"
                data-ocid="book.input"
              />
              {dropoff.trim() && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {etaMinutes < 60
                    ? `${etaMinutes} دقيقة`
                    : `${Math.floor(etaMinutes / 60)} س ${etaMinutes % 60} د`}
                </span>
              )}
            </div>
          </div>
          {/* Nominatim suggestions */}
          {showSuggestions && dropoffSuggestions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
              {dropoffSuggestions.map((s) => (
                <button
                  key={s.display_name}
                  type="button"
                  className="w-full text-right px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors border-b border-border last:border-0"
                  onMouseDown={() => selectSuggestion(s)}
                  data-ocid="book.secondary_button"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Promo code row */}
        {showForm && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <QrCode className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">
              هل لديك كود ترويجي؟ استخدمه هنا
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* PHASE 1: SENDING/WAITING */}
          {isSearching && (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8"
            >
              <div className="relative w-24 h-24">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-[#CCFF00]"
                    animate={{ scale: [1, 2.2, 1], opacity: [0.9, 0, 0.9] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.65,
                      ease: "easeOut",
                    }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  {selectedRide === "tuktuK" ? "🛺" : "🚖"}
                </div>
              </div>
              <p className="text-foreground font-bold text-base text-center">
                جاري الإرسال للسائقين القريبين...
              </p>
              <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                <p className="text-muted-foreground text-sm">
                  نطاق البحث: ٢.٥ كيلومتر
                </p>
              </div>
              <button
                type="button"
                onClick={cancelSearch}
                className="mt-2 px-6 py-2 rounded-full border border-border text-muted-foreground text-sm hover:bg-secondary transition-colors"
                data-ocid="book.cancel_button"
              >
                إلغاء
              </button>
            </motion.div>
          )}

          {/* PHASE 2: OFFERS ARRIVING */}
          {showOffers && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <button
                  type="button"
                  onClick={cancelSearch}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                  data-ocid="book.cancel_button"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-2">
                  {activeOffers.length > 0 ? (
                    <Badge className="bg-[#CCFF00] text-black font-bold text-xs">
                      {activeOffers.length} عروض نشطة
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full border border-[#CCFF00]/50 border-t-transparent animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        بانتظار عروض...
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    في نطاق ٢.٥ كم
                  </span>
                </div>
              </div>

              {/* Offer cards */}
              <div className="flex-1 overflow-y-auto px-4 py-3 pb-20 space-y-3">
                <AnimatePresence>
                  {displayOffers.map((offer, idx) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      idx={idx}
                      onAccept={() => handleSelectDriver(offer)}
                      onDecline={() => declineOffer(offer.id)}
                      isAccepting={createRide.isPending}
                      isTuktuk={selectedRide === "tuktuK"}
                    />
                  ))}
                </AnimatePresence>

                {/* Waiting for more offers indicator */}
                {activeOffers.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-3"
                    data-ocid="book.loading_state"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#CCFF00]"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      بانتظار عروض السائقين...
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* NO OFFERS STATE */}
          {showNoOffers && (
            <motion.div
              key="no_offers"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-8"
              data-ocid="book.empty_state"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-4xl">
                😔
              </div>
              <div className="text-center">
                <p className="text-foreground font-bold text-base mb-1">
                  لم يصل عروض كافية
                </p>
                <p className="text-muted-foreground text-sm">
                  لم يتوفر سائقون في نطاق ٢.٥ كيلومتر. حاول مجدداً.
                </p>
              </div>
              <button
                type="button"
                onClick={retrySearch}
                className="px-8 py-3 bg-[#CCFF00] text-black font-bold rounded-2xl hover:bg-[#b8e600] active:scale-95 transition-all"
                data-ocid="book.primary_button"
              >
                حاول مجدداً
              </button>
            </motion.div>
          )}

          {/* RIDE TYPE SELECTION (default) */}
          {showForm && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={startSearch}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {rideTypes.map((ride, idx) => {
                  const price = getRidePrice(ride.multiplier, ride.minPrice);
                  const isSelected = selectedRide === ride.id;
                  const customPrice = customPrices[ride.id] ?? price;
                  return (
                    <motion.div
                      key={ride.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`w-full rounded-2xl mb-2 overflow-hidden transition-all ${
                        isSelected
                          ? "border-2 border-primary bg-brand-light"
                          : "border border-border bg-secondary"
                      }`}
                      data-ocid={`book.item.${idx + 1}`}
                    >
                      {/* Ride type row - clickable */}
                      <button
                        type="button"
                        onClick={() => setSelectedRide(ride.id)}
                        className="w-full flex items-center justify-between px-3 py-3"
                      >
                        {/* Price + edit icon */}
                        <div className="flex flex-col items-end min-w-[70px]">
                          <div className="flex items-center gap-1">
                            {isSelected && (
                              <Pencil className="w-3 h-3 text-primary opacity-70" />
                            )}
                            <span
                              className={`font-bold text-base ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {customPrice} EGP
                            </span>
                          </div>
                          {ride.id === "tuktuK" && (
                            <span className="text-xs text-muted-foreground mt-0.5">
                              أدنى {ride.minPrice} EGP
                            </span>
                          )}
                          {isSelected && ride.id !== "tuktuK" && (
                            <span className="text-xs text-primary mt-0.5">
                              ✓
                            </span>
                          )}
                          {isSelected && ride.id === "tuktuK" && (
                            <span className="text-xs text-primary mt-0.5">
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Name + desc */}
                        <div className="flex-1 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold text-foreground">
                              {ride.nameAr}
                            </span>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                              <span>{ride.passengers}</span>
                              <Users className="w-3 h-3" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ride.descAr}
                          </p>
                        </div>

                        {/* Icon */}
                        <div className="shrink-0">
                          {ride.icon === "car" && (
                            <Car className="w-8 h-8 text-muted-foreground" />
                          )}
                          {ride.icon === "comfort" && (
                            <div className="flex items-center gap-0.5">
                              <Snowflake className="w-4 h-4 text-blue-400" />
                              <Car className="w-7 h-7 text-muted-foreground" />
                            </div>
                          )}
                          {ride.icon === "moto" && (
                            <Bike className="w-8 h-8 text-muted-foreground" />
                          )}
                          {ride.icon === "tuktuk" && (
                            <span className="text-3xl leading-none">🛺</span>
                          )}
                          {ride.icon === "premium" && (
                            <div className="flex items-center gap-0.5">
                              <Snowflake className="w-4 h-4 text-yellow-400" />
                              <Car className="w-7 h-7 text-yellow-400" />
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Expanded price adjustment — only for selected */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            key="price-adjust"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="bg-secondary/80 border-t border-border px-4 py-3">
                              {/* +/- price row */}
                              <div className="flex items-center justify-between mb-1.5">
                                <button
                                  type="button"
                                  onClick={() => adjustPrice(ride.id, 5)}
                                  className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all"
                                  data-ocid="book.secondary_button"
                                >
                                  <Plus className="w-4 h-4 text-primary" />
                                </button>
                                <span className="font-bold text-xl text-foreground">
                                  {customPrice} EGP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => adjustPrice(ride.id, -5)}
                                  className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-accent active:scale-95 transition-all"
                                  data-ocid="book.secondary_button"
                                >
                                  <Minus className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                              {/* Suggested fare */}
                              <p className="text-center text-xs text-muted-foreground">
                                الأجر المقترح: {price} EGP
                                {ride.id === "tuktuK" &&
                                  " | الحد الأدنى: 20 EGP"}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom bar */}
              <div className="shrink-0 px-4 pb-20 pt-2 border-t border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">
                      قبول تلقائي لعرض بقيمة {autoAcceptPrice} EGP
                    </span>
                    <Switch
                      checked={autoAccept}
                      onCheckedChange={setAutoAccept}
                      data-ocid="book.toggle"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shrink-0 hover:bg-accent transition-colors"
                    data-ocid="book.secondary_button"
                  >
                    <Filter className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 bg-primary text-primary-foreground font-bold text-base rounded-2xl hover:bg-brand-hover transition-all active:scale-[0.98] shadow-lime"
                    data-ocid="book.submit_button"
                  >
                    البحث عن عروض
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shrink-0 hover:bg-accent transition-colors"
                    data-ocid="book.secondary_button"
                  >
                    <DollarSign className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomTabBar />
    </div>
  );
}

// ---- OfferCard sub-component ----

interface OfferCardProps {
  offer: DriverOffer;
  idx: number;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting: boolean;
  isTuktuk?: boolean;
}

function OfferCard({
  offer,
  idx,
  onAccept,
  onDecline,
  isAccepting,
  isTuktuk,
}: OfferCardProps) {
  const { driver, proposedPrice, timeLeft } = offer;
  const progress = (timeLeft / 30) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
        delay: idx * 0.05,
      }}
      className="bg-secondary border border-border rounded-2xl overflow-hidden"
      data-ocid={`book.item.${idx + 1}`}
    >
      {/* Timer bar at top */}
      <div className="h-1 bg-border">
        <motion.div
          className={`h-full transition-colors ${
            isUrgent ? "bg-rose-500" : "bg-[#CCFF00]"
          }`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar with ring */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
              isUrgent
                ? "ring-2 ring-rose-500 bg-rose-500/10"
                : "ring-2 ring-[#CCFF00] bg-[#CCFF00]/10"
            }`}
          >
            {isTuktuk ? "🛺" : "🚗"}
          </div>

          {/* Driver info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-bold text-foreground text-sm">
                {driver.name}
              </span>
              <span className="flex items-center gap-0.5 text-[#CCFF00] text-xs">
                <Star className="w-2.5 h-2.5 fill-[#CCFF00] text-[#CCFF00]" />
                {driver.rating}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mb-1">
              {isTuktuk ? "توكتوك" : driver.car}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDistance(driver.distance)}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span className="text-xs text-[#CCFF00] font-medium">
                {formatEta(driver.eta)}
              </span>
            </div>
          </div>

          {/* Price + timer */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-bold text-foreground text-base">
              {proposedPrice} EGP
            </span>
            <span
              className={`text-xs font-mono ${
                isUrgent ? "text-rose-400" : "text-muted-foreground"
              }`}
            >
              {timeLeft}ث
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onDecline}
            disabled={isAccepting}
            className="flex-1 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40"
            data-ocid="book.cancel_button"
          >
            رفض
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={isAccepting}
            className="flex-[2] py-2 rounded-xl bg-[#CCFF00] text-black text-sm font-bold hover:bg-[#b8e600] active:scale-[0.98] transition-all disabled:opacity-50"
            data-ocid="book.primary_button"
          >
            {isAccepting ? "جاري التأكيد..." : "قبول"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
