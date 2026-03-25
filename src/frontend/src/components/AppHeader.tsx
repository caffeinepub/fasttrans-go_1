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
            <div className="flex items-center gap-2">
              <img
                src="/assets/uploads/file_00000000f3807243a28c9e0e373b8d9c-019d25f2-f105-7089-a82d-3b73f20d3bf8-2.png"
                alt="FastTrans Logo"
                className="h-7 w-auto"
              />
              <span className="font-display font-bold text-xl text-primary">
                FastTrans
              </span>
            </div>
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
