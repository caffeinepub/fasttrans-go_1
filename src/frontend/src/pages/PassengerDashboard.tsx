import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@dfinity/principal";
import { useNavigate } from "@tanstack/react-router";
import {
  Car,
  Clock,
  DollarSign,
  History,
  Loader2,
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { RideRequest } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";
import { MapView } from "../components/MapView";
import { RatingModal } from "../components/RatingModal";
import { StatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  FareStatus,
  Status,
  useCancelRide,
  useCreateRideRequest,
  useGetActiveRideForUser,
  useGetAllTrips,
  useGetCallerUserProfile,
} from "../hooks/useQueries";

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const {
    data: activeRide,
    isLoading: rideLoading,
    refetch: refetchRide,
  } = useGetActiveRideForUser();
  const { data: allTrips, isLoading: tripsLoading } = useGetAllTrips();
  const createRide = useCreateRideRequest();
  const cancelRide = useCancelRide();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [fare, setFare] = useState("");
  const [ratingRideId, setRatingRideId] = useState<bigint | null>(null);
  const [ratingDriver, setRatingDriver] = useState<Principal | null>(null);
  const [dismissedRides, setDismissedRides] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!identity) navigate({ to: "/auth" });
  }, [identity, navigate]);

  useEffect(() => {
    if (
      activeRide?.status === Status.completed &&
      activeRide.driver &&
      !dismissedRides.has(activeRide.id.toString())
    ) {
      setRatingRideId(activeRide.id);
      setRatingDriver(activeRide.driver);
    }
  }, [activeRide, dismissedRides]);

  const handleRatingClose = () => {
    if (ratingRideId) {
      setDismissedRides((prev) => new Set([...prev, ratingRideId.toString()]));
    }
    setRatingRideId(null);
    setRatingDriver(null);
    navigate({ to: "/history" });
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim() || !fare) {
      toast.error("من فضلك أدخل جميع البيانات");
      return;
    }
    if (!identity) return;

    const ride: RideRequest = {
      id: BigInt(0),
      status: Status.pending,
      passenger: identity.getPrincipal(),
      pickupLocation: pickup.trim(),
      dropoffLocation: dropoff.trim(),
      proposedFare: BigInt(Math.round(Number(fare))),
      fareStatus: FareStatus.pending,
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
    };

    try {
      await createRide.mutateAsync(ride);
      toast.success("تم إرسال طلب الرحلة!");
      setPickup("");
      setDropoff("");
      setFare("");
      refetchRide();
    } catch {
      toast.error("حدث خطأ. حاول مجدداً.");
    }
  };

  const handleCancel = async (rideId: bigint) => {
    try {
      await cancelRide.mutateAsync(rideId);
      toast.success("تم إلغاء الرحلة");
    } catch {
      toast.error("لم يتم الإلغاء. حاول مجدداً.");
    }
  };

  const completedTrips =
    allTrips?.filter(
      (t) => t.status === Status.completed || t.status === Status.cancelled,
    ) ?? [];

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1 px-4 py-6 space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <AppHeader title="لوحة الراكب" />

      <main className="flex-1 px-4 py-5 pb-24">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="font-bold text-2xl text-foreground">
            مرحباً {profile?.name ?? ""} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            إلى أين تريد الذهاب اليوم؟
          </p>
        </div>

        {/* Request form */}
        {!activeRide && (
          <div
            className="bg-card rounded-2xl p-5 mb-5"
            data-ocid="passenger.card"
          >
            <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              طلب رحلة جديدة
            </h2>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <Label
                  htmlFor="pickup"
                  className="flex items-center gap-1.5 text-sm text-foreground mb-1.5"
                >
                  <MapPin className="w-4 h-4 text-green-500" /> نقطة الانطلاق
                </Label>
                <Input
                  id="pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="مثال: ميدان التحرير، القاهرة"
                  className="bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
                  required
                  data-ocid="passenger.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="dropoff"
                  className="flex items-center gap-1.5 text-sm text-foreground mb-1.5"
                >
                  <Navigation className="w-4 h-4 text-destructive" /> الوجهة
                </Label>
                <Input
                  id="dropoff"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="مثال: مطار القاهرة الدولي"
                  className="bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
                  required
                  data-ocid="passenger.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="fare"
                  className="flex items-center gap-1.5 text-sm text-foreground mb-1.5"
                >
                  <DollarSign className="w-4 h-4 text-primary" /> السعر المقترح
                  (جنيه)
                </Label>
                <Input
                  id="fare"
                  type="number"
                  min="1"
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                  placeholder="مثال: 50"
                  className="bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground"
                  required
                  data-ocid="passenger.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-brand-hover text-primary-foreground rounded-2xl font-bold shadow-lime"
                disabled={createRide.isPending}
                data-ocid="passenger.submit_button"
              >
                {createRide.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري
                    الإرسال...
                  </>
                ) : (
                  "اطلب الآن"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Active ride */}
        {rideLoading ? (
          <Skeleton
            className="h-40 rounded-2xl"
            data-ocid="passenger.loading_state"
          />
        ) : activeRide ? (
          <div
            className="bg-card rounded-2xl p-5 mb-5 border border-primary/20"
            data-ocid="passenger.card"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-foreground">
                رحلتك الحالية
              </h2>
              <StatusBadge status={activeRide.status} />
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-muted-foreground text-xs">من</div>
                  <div className="text-foreground font-medium">
                    {activeRide.pickupLocation}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Navigation className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <div className="text-muted-foreground text-xs">إلى</div>
                  <div className="text-foreground font-medium">
                    {activeRide.dropoffLocation}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3 mb-3">
              <span className="text-sm text-muted-foreground">
                السعر المتفق عليه
              </span>
              <span className="font-bold text-xl text-primary">
                {activeRide.proposedFare.toString()} جنيه
              </span>
            </div>
            <MapView
              pickup={activeRide.pickupLocation}
              dropoff={activeRide.dropoffLocation}
              className="h-48 rounded-xl overflow-hidden mb-3"
            />
            {activeRide.status === Status.pending && (
              <Button
                variant="destructive"
                className="w-full rounded-2xl"
                onClick={() => handleCancel(activeRide.id)}
                disabled={cancelRide.isPending}
                data-ocid="passenger.delete_button"
              >
                {cancelRide.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري
                    الإلغاء...
                  </>
                ) : (
                  <>
                    <X className="mr-1 w-4 h-4" /> إلغاء الرحلة
                  </>
                )}
              </Button>
            )}
          </div>
        ) : null}

        {/* Trip history */}
        <div className="bg-card rounded-2xl p-5" data-ocid="passenger.card">
          <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            سجل الرحلات
          </h2>
          {tripsLoading ? (
            <div className="space-y-2" data-ocid="passenger.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : completedTrips.length === 0 ? (
            <div className="text-center py-8" data-ocid="passenger.empty_state">
              <Clock className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                لا توجد رحلات سابقة
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTrips.map((trip, idx) => (
                <div
                  key={trip.id.toString()}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary"
                  data-ocid={`passenger.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <StatusBadge status={trip.status} />
                    <div className="text-muted-foreground text-xs truncate mt-1">
                      {trip.pickupLocation} → {trip.dropoffLocation}
                    </div>
                  </div>
                  <span className="font-bold text-primary mr-3">
                    {trip.proposedFare.toString()} جنيه
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomTabBar />

      {ratingDriver && ratingRideId && (
        <RatingModal
          open={true}
          onClose={handleRatingClose}
          driverPrincipal={ratingDriver}
          rideId={Number(ratingRideId)}
        />
      )}
    </div>
  );
}
