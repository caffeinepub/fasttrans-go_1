import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  Car,
  CheckCircle,
  Clock,
  History,
  Loader2,
  Locate,
  MapPin,
  Navigation,
  PlayCircle,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";
import { StatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  Status,
  useAcceptRide,
  useCompleteTrip,
  useGetActiveRideForUser,
  useGetCallerUserProfile,
  useGetDriverTrips,
  useGetPendingRides,
  useStartTrip,
  useUpdateLocation,
} from "../hooks/useQueries";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: pendingRides, isLoading: pendingLoading } =
    useGetPendingRides();
  const { data: activeRide, isLoading: activeLoading } =
    useGetActiveRideForUser();
  const { data: driverTrips, isLoading: historyLoading } = useGetDriverTrips(
    identity?.getPrincipal().toString(),
  );
  const acceptRide = useAcceptRide();
  const startTrip = useStartTrip();
  const completeTrip = useCompleteTrip();
  const updateLocation = useUpdateLocation();

  const [isOnline, setIsOnline] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    if (!identity) navigate({ to: "/auth" });
  }, [identity, navigate]);

  const handleLocationUpdate = async () => {
    if (!lat || !lng) {
      toast.error("أدخل الإحداثيات");
      return;
    }
    try {
      await updateLocation.mutateAsync({ latitude: lat, longitude: lng });
      toast.success("تم تحديث الموقع");
    } catch {
      toast.error("فشل تحديث الموقع");
    }
  };

  const handleAccept = async (rideId: bigint) => {
    try {
      await acceptRide.mutateAsync(rideId);
      toast.success("تم قبول الرحلة!");
    } catch {
      toast.error("لم يتم قبول الرحلة");
    }
  };

  const handleStart = async (rideId: bigint) => {
    try {
      await startTrip.mutateAsync(rideId);
      toast.success("بدأت الرحلة!");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleComplete = async (rideId: bigint) => {
    try {
      await completeTrip.mutateAsync(rideId);
      toast.success("تم إكمال الرحلة! 🎉");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const completedTrips =
    driverTrips?.filter(
      (t) => t.status === Status.completed || t.status === Status.cancelled,
    ) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <AppHeader title="لوحة السائق" />

      <main className="flex-1 px-4 py-5 pb-24">
        {/* Greeting + online toggle */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="font-bold text-2xl text-foreground">
              لوحة السائق 🚗
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              مرحباً {profile?.name ?? ""}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-3">
            <Switch
              checked={isOnline}
              onCheckedChange={setIsOnline}
              data-ocid="driver.switch"
            />
            <div>
              <div className="text-sm font-semibold text-foreground">
                {isOnline ? "متصل" : "غير متصل"}
              </div>
              <div
                className={`w-2 h-2 rounded-full mt-0.5 mx-auto ${isOnline ? "bg-green-500" : "bg-muted-foreground"}`}
              />
            </div>
          </div>
        </div>

        {/* Driver registration card */}
        <div
          className="bg-card rounded-2xl p-4 mb-5 flex items-center justify-between"
          data-ocid="driver.card"
        >
          <div>
            <p className="font-bold text-foreground">تسجيل كسائق جديد</p>
            <p className="text-xs text-muted-foreground">
              أكمل بياناتك ومستنداتك
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/driver-register" })}
            className="bg-primary text-primary-foreground rounded-2xl font-bold"
            data-ocid="driver.primary_button"
          >
            ابدأ
          </Button>
        </div>

        {/* Stats row */}
        {profile && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-card rounded-2xl p-4 text-center">
              <div className="font-bold text-2xl text-primary">
                {completedTrips.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                رحلة مكتملة
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 text-center">
              <div className="font-bold text-2xl text-primary flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {profile.ratingCount > BigInt(0)
                  ? (
                      Number(profile.rating) / Number(profile.ratingCount)
                    ).toFixed(1)
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">التقييم</div>
            </div>
            <div className="bg-card rounded-2xl p-4 text-center">
              <div className="font-bold text-xl text-primary">
                {completedTrips
                  .reduce((sum, t) => sum + Number(t.proposedFare), 0)
                  .toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                الأرباح (جنيه)
              </div>
            </div>
          </div>
        )}

        {/* Active trip */}
        {activeLoading ? (
          <Skeleton
            className="h-48 rounded-2xl mb-5"
            data-ocid="driver.loading_state"
          />
        ) : activeRide &&
          (activeRide.status === Status.accepted ||
            activeRide.status === Status.inProgress) ? (
          <div
            className="bg-card rounded-2xl p-5 mb-5 border border-primary/20"
            data-ocid="driver.card"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-foreground">
                الرحلة الحالية
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
              <span className="text-sm text-muted-foreground">الأجرة</span>
              <span className="font-bold text-xl text-primary">
                {activeRide.proposedFare.toString()} جنيه
              </span>
            </div>
            <div className="flex gap-2">
              {activeRide.status === Status.accepted && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                  onClick={() => handleStart(activeRide.id)}
                  disabled={startTrip.isPending}
                  data-ocid="driver.primary_button"
                >
                  {startTrip.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-1 w-4 h-4" />
                  )}
                  بدء الرحلة
                </Button>
              )}
              {activeRide.status === Status.inProgress && (
                <Button
                  className="flex-1 bg-primary hover:bg-brand-hover text-primary-foreground rounded-2xl shadow-lime"
                  onClick={() => handleComplete(activeRide.id)}
                  disabled={completeTrip.isPending}
                  data-ocid="driver.primary_button"
                >
                  {completeTrip.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1 w-4 h-4" />
                  )}
                  إنهاء الرحلة
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {/* Pending rides */}
        <div className="bg-card rounded-2xl p-5 mb-5" data-ocid="driver.card">
          <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            الطلبات المتاحة
          </h2>
          {pendingLoading ? (
            <div className="space-y-3" data-ocid="driver.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !isOnline ? (
            <div className="text-center py-10" data-ocid="driver.empty_state">
              <Car className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-foreground">أنت غير متصل</p>
              <p className="text-sm text-muted-foreground mt-1">
                فعّل وضع الاتصال لرؤية الطلبات
              </p>
            </div>
          ) : (pendingRides ?? []).length === 0 ? (
            <div className="text-center py-10" data-ocid="driver.empty_state">
              <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-foreground">لا توجد طلبات الآن</p>
              <p className="text-sm text-muted-foreground mt-1">
                سيتم التحديث تلقائياً
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(pendingRides ?? []).map((ride, idx) => (
                <div
                  key={ride.id.toString()}
                  className="bg-secondary rounded-2xl p-4"
                  data-ocid={`driver.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 space-y-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="font-medium text-foreground truncate">
                          {ride.pickupLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <span className="text-muted-foreground truncate">
                          {ride.dropoffLocation}
                        </span>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-bold text-lg text-primary">
                        {ride.proposedFare.toString()}
                      </div>
                      <div className="text-xs text-muted-foreground">جنيه</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-brand-hover text-primary-foreground rounded-2xl shadow-lime"
                    onClick={() => handleAccept(ride.id)}
                    disabled={acceptRide.isPending}
                    data-ocid="driver.primary_button"
                  >
                    {acceptRide.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "قبول الرحلة"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location update + history */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card rounded-2xl p-5" data-ocid="driver.card">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Locate className="w-4 h-4 text-primary" />
              تحديث الموقع
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="lat" className="text-xs text-muted-foreground">
                  خط العرض (Latitude)
                </Label>
                <Input
                  id="lat"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="30.0444"
                  className="mt-1 bg-secondary border-0 rounded-xl text-foreground"
                  data-ocid="driver.input"
                />
              </div>
              <div>
                <Label htmlFor="lng" className="text-xs text-muted-foreground">
                  خط الطول (Longitude)
                </Label>
                <Input
                  id="lng"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="31.2357"
                  className="mt-1 bg-secondary border-0 rounded-xl text-foreground"
                  data-ocid="driver.input"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-2xl border-primary text-primary hover:bg-primary/10"
                onClick={handleLocationUpdate}
                disabled={updateLocation.isPending}
                data-ocid="driver.save_button"
              >
                {updateLocation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "تحديث"
                )}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5" data-ocid="driver.card">
            <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              سجل الرحلات
            </h3>
            {historyLoading ? (
              <div className="space-y-2" data-ocid="driver.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : completedTrips.length === 0 ? (
              <div className="text-center py-6" data-ocid="driver.empty_state">
                <p className="text-sm text-muted-foreground">
                  لا توجد رحلات بعد
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedTrips.slice(0, 8).map((trip, idx) => (
                  <div
                    key={trip.id.toString()}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary"
                    data-ocid={`driver.item.${idx + 1}`}
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
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
