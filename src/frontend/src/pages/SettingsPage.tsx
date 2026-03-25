import {
  ChevronLeft,
  Globe,
  Info,
  Lock,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";

const settingsGroups = [
  {
    title: "الحساب",
    items: [
      {
        icon: User,
        label: "الملف الشخصي",
        desc: "تعديل اسمك ومعلوماتك",
        to: "/profile",
      },
      { icon: Phone, label: "رقم الهاتف", desc: "تحديث رقم هاتفك", to: "#" },
      {
        icon: Lock,
        label: "الأمان",
        desc: "إعدادات الحساب والخصوصية",
        to: "#",
      },
    ],
  },
  {
    title: "التطبيق",
    items: [
      { icon: Globe, label: "اللغة", desc: "العربية", to: "#" },
      {
        icon: Shield,
        label: "السلامة",
        desc: "إعدادات السلامة والطوارئ",
        to: "/safety",
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <AppHeader title="إعدادات التطبيق" showBack />

      <main className="flex-1 px-4 py-4 pb-24">
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h3>
            <div className="bg-card rounded-2xl overflow-hidden">
              {group.items.map((item, idx) => (
                <a
                  key={item.label}
                  href={item.to}
                  className={`flex items-center gap-4 px-4 py-4 hover:bg-accent transition-colors ${
                    idx < group.items.length - 1 ? "border-b border-border" : ""
                  }`}
                  data-ocid={`settings.${item.label.replace(/\s/g, "_")}.button`}
                >
                  <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Info box */}
        <div className="bg-blue-950/50 border border-blue-800/40 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300 leading-relaxed">
            لتغيير رقم هاتفك، يرجى التواصل مع فريق الدعم. لا يمكن تغيير الرقم
            مباشرة من التطبيق لأسباب أمنية.
          </p>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
