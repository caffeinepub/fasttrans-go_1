import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  HelpCircle,
  History,
  LogOut,
  MapPin,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SideDrawer({ open, onClose }: SideDrawerProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await clear();
    qc.clear();
    navigate({ to: "/" });
  };

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "م";

  // Read saved profile photo from localStorage
  const savedPhoto =
    typeof window !== "undefined"
      ? localStorage.getItem("fasttrans_profile_photo")
      : null;

  const menuItems = [
    { icon: User, label: "الملف الشخصي", to: "/profile" },
    { icon: MapPin, label: "طلب رحلة", to: "/book" },
    { icon: History, label: "سجل الطلبات", to: "/history" },
    { icon: Bell, label: "الإشعارات", to: "/notifications" },
    { icon: Shield, label: "السلامة", to: "/safety" },
    { icon: Settings, label: "الإعدادات", to: "/settings" },
    { icon: HelpCircle, label: "المساعدة", to: "/" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="إغلاق القائمة"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm w-full cursor-default"
        onClick={onClose}
        data-ocid="drawer.close_button"
      />

      {/* Drawer panel — slides from right */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-card flex flex-col shadow-2xl animate-slide-in-right">
        {/* Close button */}
        <button
          type="button"
          className="absolute left-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-accent transition-colors"
          onClick={onClose}
          data-ocid="drawer.close_button"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Profile header */}
        <div className="px-6 pt-14 pb-6 border-b border-border">
          {identity ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden">
                {savedPhoto ? (
                  <img
                    src={savedPhoto}
                    alt="صورة الملف"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary-foreground">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-lg truncate">
                  {profile?.name ?? "المستخدم"}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-yellow-400 text-sm">
                      ★
                    </span>
                  ))}
                  <span className="text-muted-foreground text-xs mr-1">
                    5.00
                  </span>
                </div>
                <button
                  type="button"
                  className="text-primary text-xs mt-1 hover:underline"
                  onClick={() => {
                    onClose();
                    navigate({ to: "/profile" });
                  }}
                >
                  تعديل الملف الشخصي
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👤</span>
              </div>
              <Link
                to="/auth"
                className="text-primary font-semibold"
                onClick={onClose}
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
              data-ocid="drawer.link"
            >
              <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">{label}</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}

          {identity && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
              data-ocid="drawer.button"
            >
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5 text-destructive" />
                <span className="text-destructive font-medium">
                  تسجيل الخروج
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </nav>

        {/* Driver mode CTA */}
        {identity && !profile?.isDriver && (
          <div className="px-6 py-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate({ to: "/driver" });
              }}
              className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-brand-hover transition-all active:scale-[0.98] shadow-lime"
              data-ocid="drawer.primary_button"
            >
              وضع الشريك السائق
            </button>
          </div>
        )}

        {/* Social links */}
        <div className="px-6 py-4 flex items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center hover:bg-accent transition-colors"
          >
            <SiInstagram className="w-4 h-4 text-muted-foreground" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center hover:bg-accent transition-colors"
          >
            <SiFacebook className="w-4 h-4 text-muted-foreground" />
          </a>
          <span className="text-xs text-muted-foreground mr-auto">
            © {new Date().getFullYear()} FastTrans
          </span>
        </div>
      </div>
    </div>
  );
}
