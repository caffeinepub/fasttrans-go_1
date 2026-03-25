import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";
import { SideDrawer } from "./SideDrawer";

interface AppHeaderProps {
  showBack?: boolean;
  title?: string;
}

export function AppHeader({ showBack, title }: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header
        className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border"
        dir="rtl"
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Right side: hamburger */}
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-accent transition-colors"
            onClick={() => setDrawerOpen(true)}
            data-ocid="header.button"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Center: title or logo */}
          {title ? (
            <span className="font-bold text-foreground text-base">{title}</span>
          ) : (
            <span className="font-display font-bold text-xl text-primary">
              RideShare
            </span>
          )}

          {/* Left side: back or spacer */}
          {showBack ? (
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-accent transition-colors"
              onClick={() => navigate({ to: "/" })}
              data-ocid="header.secondary_button"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
