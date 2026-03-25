import { useNavigate } from "@tanstack/react-router";
import { Car, Package, Plane, Search, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";
import { MapView } from "../components/MapView";

const categories = [
  { id: "city", label: "رحلات المدينة", icon: Car, big: true },
  { id: "travel", label: "سفر", icon: Plane, big: false },
  { id: "freight", label: "الشحن", icon: Package, big: false },
  { id: "delivery", label: "مناديب التوصيل", icon: Truck, big: false },
];

const recentDestinations = [
  "ميدان التحرير، القاهرة",
  "مطار القاهرة الدولي",
  "مدينة نصر، القاهرة",
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    navigate({ to: "/book" });
  };

  return (
    <div
      className="flex flex-col h-screen bg-background overflow-hidden"
      dir="rtl"
    >
      {/* Floating header over map */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <AppHeader />
      </div>

      {/* Map — top 55% */}
      <div className="relative flex-none" style={{ height: "55vh" }}>
        <MapView className="w-full h-full" />
      </div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 bg-card rounded-t-3xl -mt-6 relative z-10 overflow-y-auto shadow-2xl"
      >
        <div className="px-4 pt-5 pb-32">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

          {/* Search bar */}
          <button
            type="button"
            className="w-full flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3.5 mb-5 text-right hover:bg-accent transition-colors"
            onClick={handleSearch}
            data-ocid="home.primary_button"
          >
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ما الوجهة وما التكلفة؟"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none text-right"
              onFocus={() => navigate({ to: "/book" })}
              data-ocid="home.search_input"
            />
          </button>

          {/* Recent destinations */}
          {recentDestinations.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs text-muted-foreground font-medium mb-3 px-1">
                الوجهات الأخيرة
              </h3>
              <div className="space-y-1">
                {recentDestinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors text-right"
                    onClick={() => navigate({ to: "/book" })}
                    data-ocid="home.secondary_button"
                  >
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm">🕐</span>
                    </div>
                    <span className="text-sm text-foreground truncate">
                      {dest}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service categories */}
          <div>
            <h3 className="text-xs text-muted-foreground font-medium mb-3 px-1">
              اختر الخدمة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(({ id, label, icon: Icon, big }) => (
                <motion.button
                  key={id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  className={`bg-secondary rounded-2xl p-4 flex flex-col items-start gap-3 hover:bg-accent transition-colors text-right ${
                    big ? "row-span-2" : ""
                  }`}
                  onClick={() => navigate({ to: "/book" })}
                  data-ocid={`home.${id}.button`}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-foreground block">
                      {label}
                    </span>
                    {big && (
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        احجز رحلتك الآن
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <BottomTabBar />
    </div>
  );
}
