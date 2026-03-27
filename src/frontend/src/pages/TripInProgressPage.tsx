import { useNavigate } from "@tanstack/react-router";
import { MapPin, Phone, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BottomTabBar } from "../components/BottomTabBar";
import { MapView } from "../components/MapView";

export default function TripInProgressPage() {
  const navigate = useNavigate();

  const driverName =
    sessionStorage.getItem("rideshare_driver_name") || "أحمد محمد";
  const driverCar =
    sessionStorage.getItem("rideshare_driver_car") || "تويوتا كورولا";
  const driverRating = Number(
    sessionStorage.getItem("rideshare_driver_rating") || "4.9",
  );
  const tripPrice = Number(
    sessionStorage.getItem("rideshare_trip_price") || "150",
  );
  const pickup =
    sessionStorage.getItem("rideshare_pickup_for_route") ||
    sessionStorage.getItem("rideshare_saved_pickup") ||
    "موقع الانطلاق";
  const dropoff =
    sessionStorage.getItem("rideshare_dropoff_for_route") ||
    sessionStorage.getItem("rideshare_saved_dropoff") ||
    "الوجهة";

  const TRIP_DURATION_MS = 120_000;
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = now - startTimeRef.current;
      const pct = Math.min(100, (diff / TRIP_DURATION_MS) * 100);
      setProgress(pct);
      setElapsed(Math.floor(diff / 1000));
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const remainingSec = Math.max(
    0,
    Math.round((TRIP_DURATION_MS - elapsed * 1000) / 1000),
  );
  const remainingMin = Math.floor(remainingSec / 60);
  const remainingSecPart = remainingSec % 60;

  const handleTripEnd = () => {
    navigate({ to: "/trip-rating" });
  };

  const simulatedDrivers = [
    {
      id: 1,
      x: 50,
      y: 45,
      name: driverName,
      car: driverCar,
      rating: driverRating,
      eta: remainingMin,
      distance: remainingSec * 8,
    },
  ];

  return (
    <div
      className="flex flex-col h-screen bg-background overflow-hidden"
      dir="rtl"
    >
      {/* Map */}
      <div className="relative flex-1">
        <MapView
          pickup={pickup}
          dropoff={dropoff}
          className="w-full h-full"
          drivers={simulatedDrivers}
          searching={false}
        />

        {/* Trip in progress overlay badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#CCFF00] text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            className="w-2 h-2 rounded-full bg-black"
          />
          الرحلة جارية
        </motion.div>
      </div>

      {/* Bottom card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative z-30 bg-card rounded-t-3xl shadow-2xl pt-3 pb-24"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="px-5 py-1 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                الوقت المتبقي: {remainingMin}:
                {String(remainingSecPart).padStart(2, "0")}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#CCFF00] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.5 }}
              />
            </div>
          </div>

          {/* Driver card */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#CCFF00]/10 ring-2 ring-[#CCFF00] flex items-center justify-center text-2xl shrink-0">
              🚗
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{driverName}</span>
                <span className="flex items-center gap-0.5 text-[#CCFF00] text-xs">
                  <Star className="w-3 h-3 fill-[#CCFF00]" />
                  {driverRating}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {driverCar}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                السعر:{" "}
                <span className="text-foreground font-semibold">
                  {tripPrice} EGP
                </span>
              </p>
            </div>
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center border border-border hover:bg-accent transition-colors"
              data-ocid="trip.secondary_button"
            >
              <Phone className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Pickup / dropoff */}
          <div className="bg-secondary rounded-2xl px-4 py-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">الانطلاق</p>
                <p className="text-sm text-foreground font-medium">{pickup}</p>
              </div>
            </div>
            <div className="h-px bg-border mx-4" />
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-rose-400 mt-1 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">الوجهة</p>
                <p className="text-sm text-foreground font-medium">{dropoff}</p>
              </div>
            </div>
          </div>

          {/* End trip button */}
          <button
            type="button"
            onClick={handleTripEnd}
            className="w-full py-4 bg-[#CCFF00] text-black font-bold text-base rounded-2xl hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-lg"
            data-ocid="trip.primary_button"
          >
            الرحلة انتهت
          </button>
        </div>
      </motion.div>

      <BottomTabBar />
    </div>
  );
}
