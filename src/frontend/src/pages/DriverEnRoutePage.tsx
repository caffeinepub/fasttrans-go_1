import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Phone, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BottomTabBar } from "../components/BottomTabBar";
import { MapView } from "../components/MapView";

export default function DriverEnRoutePage() {
  const navigate = useNavigate();

  const driverName =
    sessionStorage.getItem("rideshare_driver_name") || "أحمد محمد";
  const driverCar =
    sessionStorage.getItem("rideshare_driver_car") || "تويوتا كورولا";
  const driverRating = Number(
    sessionStorage.getItem("rideshare_driver_rating") || "4.9",
  );
  const initialEta = Number(
    sessionStorage.getItem("rideshare_driver_eta") || "4",
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

  const [eta, setEta] = useState(initialEta > 0 ? initialEta : 4);
  const [arrived, setArrived] = useState(false);
  const [driverX, setDriverX] = useState(30);
  const [driverY, setDriverY] = useState(40);
  const etaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    etaIntervalRef.current = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) {
          clearInterval(etaIntervalRef.current!);
          setArrived(true);
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    moveIntervalRef.current = setInterval(() => {
      setDriverX((x) =>
        Math.min(85, Math.max(15, x + (Math.random() - 0.4) * 6)),
      );
      setDriverY((y) =>
        Math.min(85, Math.max(15, y + (Math.random() - 0.4) * 6)),
      );
    }, 3000);

    return () => {
      if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, []);

  const handleCancelTrip = () => {
    if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    sessionStorage.removeItem("rideshare_driver_name");
    sessionStorage.removeItem("rideshare_driver_car");
    sessionStorage.removeItem("rideshare_driver_rating");
    sessionStorage.removeItem("rideshare_driver_eta");
    sessionStorage.removeItem("rideshare_trip_price");
    navigate({ to: "/book" });
  };

  const handleStartTrip = () => {
    navigate({ to: "/trip-in-progress" });
  };

  const simulatedDriver = [
    {
      id: 1,
      x: driverX,
      y: driverY,
      name: driverName,
      car: driverCar,
      rating: driverRating,
      eta: eta,
      distance: eta * 300,
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
          drivers={simulatedDriver}
          searching={false}
        />

        {/* Pulsing car indicator on map */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            right: `${driverX}%`,
            top: `${driverY}%`,
            transform: "translate(50%, -50%)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-8 h-8 rounded-full bg-[#CCFF00]/30 flex items-center justify-center"
          >
            <span className="text-lg">🚗</span>
          </motion.div>
        </div>
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

        <AnimatePresence mode="wait">
          {arrived ? (
            <motion.div
              key="arrived"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 px-5 py-2"
              data-ocid="enroute.success_state"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">السائق وصل!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {driverName} ينتظرك الآن
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartTrip}
                className="w-full py-4 bg-[#CCFF00] text-black font-bold text-base rounded-2xl hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-lg"
                data-ocid="enroute.primary_button"
              >
                بدء الرحلة
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="en-route"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 py-1"
            >
              {/* ETA banner */}
              <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]"
                  />
                  <span className="text-[#CCFF00] font-bold text-sm">
                    السائق يصل في{" "}
                    {eta === 0
                      ? "لحظات"
                      : eta === 1
                        ? "دقيقة واحدة"
                        : eta === 2
                          ? "دقيقتان"
                          : `${eta} دقائق`}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {eta * 300} متر
                </span>
              </div>

              {/* Driver card */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#CCFF00]/10 ring-2 ring-[#CCFF00] flex items-center justify-center text-2xl shrink-0">
                  🚗
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {driverName}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#CCFF00] text-xs">
                      <Star className="w-3 h-3 fill-[#CCFF00]" />
                      {driverRating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {driverCar}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    السعر المتفق عليه:{" "}
                    <span className="text-foreground font-semibold">
                      {tripPrice} EGP
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center border border-border hover:bg-accent transition-colors"
                  data-ocid="enroute.secondary_button"
                >
                  <Phone className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Trip details */}
              <div className="bg-secondary rounded-2xl px-4 py-3 mb-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">الانطلاق</p>
                    <p className="text-sm text-foreground font-medium">
                      {pickup}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-border mx-4" />
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-rose-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">الوجهة</p>
                    <p className="text-sm text-foreground font-medium">
                      {dropoff}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancel button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full py-3 rounded-2xl border border-border text-muted-foreground text-sm font-medium hover:bg-secondary transition-colors"
                    data-ocid="enroute.open_modal_button"
                  >
                    إلغاء الرحلة
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className="bg-card border-border rounded-2xl"
                  dir="rtl"
                  data-ocid="enroute.dialog"
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground text-right">
                      إلغاء الرحلة؟
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-right">
                      هل أنت متأكد أنك تريد إلغاء الرحلة؟ السائق في طريقه إليك.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogCancel
                      className="flex-1 bg-secondary border-border text-foreground rounded-xl"
                      data-ocid="enroute.cancel_button"
                    >
                      لا، استمر
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelTrip}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                      data-ocid="enroute.confirm_button"
                    >
                      نعم، إلغاء
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomTabBar />
    </div>
  );
}
