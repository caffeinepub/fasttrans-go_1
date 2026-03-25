import { Skeleton } from "@/components/ui/skeleton";
import { Car, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";
import { Status, useGetAllTrips } from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Filter = "all" | "city" | "delivery";

export default function TripHistoryPage() {
  const { data: allTrips, isLoading } = useGetAllTrips();
  const [filter, setFilter] = useState<Filter>("all");

  const pastTrips =
    allTrips?.filter(
      (t) => t.status === Status.completed || t.status === Status.cancelled,
    ) ?? [];

  // For demo, all trips are shown for any filter
  const filteredTrips = pastTrips;

  // Group by date
  const groups: Record<string, typeof pastTrips> = {};
  for (const trip of filteredTrips) {
    const date = formatDate(trip.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(trip);
  }

  const filterLabels: { key: Filter; label: string }[] = [
    { key: "all", label: "الكل ☰" },
    { key: "city", label: "رحلات المدينة" },
    { key: "delivery", label: "التوصيل" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AppHeader title="سجل الطلبات" showBack />

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 border-b border-border overflow-x-auto">
        {filterLabels.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
            data-ocid={`history.${key}.tab`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 pb-24">
        {isLoading ? (
          <div
            className="px-4 pt-4 space-y-3"
            data-ocid="history.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center px-4"
            data-ocid="history.empty_state"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="font-bold text-xl text-foreground mb-1">
              لا توجد رحلات سابقة
            </h2>
            <p className="text-muted-foreground text-sm">
              رحلاتك المكتملة والملغاة ستظهر هنا
            </p>
          </motion.div>
        ) : (
          <div className="px-4 pt-4">
            {Object.entries(groups).map(([date, trips]) => (
              <div key={date} className="mb-5">
                {/* Date header */}
                <h3 className="text-sm font-bold text-foreground mb-3 px-1">
                  {date}
                </h3>
                <div className="space-y-3">
                  {trips.map((trip, idx) => (
                    <motion.div
                      key={trip.id.toString()}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-card rounded-2xl p-4 flex items-start gap-3"
                      data-ocid={`history.item.${idx + 1}`}
                    >
                      {/* Car thumbnail */}
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6 text-muted-foreground" />
                      </div>

                      {/* Trip info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {trip.pickupLocation}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          → {trip.dropoffLocation}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary text-sm">
                            {trip.proposedFare.toString()} جنيه
                          </span>
                          {trip.status === Status.cancelled ? (
                            <span className="text-destructive text-xs font-medium">
                              لقد ألغيت
                            </span>
                          ) : (
                            <span className="text-green-400 text-xs font-medium">
                              مكتملة
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(trip.timestamp)}
                        </div>
                      </div>

                      <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
