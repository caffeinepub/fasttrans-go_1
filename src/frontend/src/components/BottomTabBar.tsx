import { Link, useRouterState } from "@tanstack/react-router";
import { Car, ClipboardList } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export function BottomTabBar() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (!identity) return null;

  const isActive = (path: string) => currentPath === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center pb-safe"
      dir="rtl"
      data-ocid="bottombar.panel"
    >
      <Link
        to={profile?.isDriver ? "/driver" : "/passenger"}
        className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
          isActive("/passenger") || isActive("/driver")
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
        data-ocid="bottombar.tab"
      >
        <Car className="w-6 h-6" />
        <span className="text-xs font-medium">رحلة</span>
      </Link>

      {profile?.isDriver && (
        <Link
          to="/history"
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            isActive("/history")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="bottombar.tab"
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-xs font-medium">طلباتي</span>
        </Link>
      )}
    </nav>
  );
}
