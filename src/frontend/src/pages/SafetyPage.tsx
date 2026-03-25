import {
  AlertTriangle,
  Eye,
  FileText,
  MapPinIcon,
  Phone,
  Shield,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";

const safetyCards = [
  { icon: Eye, label: "التحقق من هوية السائق", color: "text-primary" },
  { icon: MapPinIcon, label: "مشاركة موقع رحلتك", color: "text-blue-400" },
  { icon: Shield, label: "التأمين على الرحلات", color: "text-green-400" },
  { icon: Star, label: "نظام تقييم السائقين", color: "text-yellow-400" },
  { icon: AlertTriangle, label: "زر الطوارئ", color: "text-red-400" },
  { icon: FileText, label: "سياسة السلامة", color: "text-purple-400" },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <AppHeader title="السلامة" showBack />

      <main className="flex-1 px-4 py-5 pb-24">
        {/* Top 2 cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
            data-ocid="safety.emergency_card"
          >
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">
              جهات الاتصال في حالات الطوارئ
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
            data-ocid="safety.support_card"
          >
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">الدعم</span>
          </motion.div>
        </div>

        {/* Emergency call button */}
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          className="w-full h-16 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 mb-6 transition-colors"
          data-ocid="safety.primary_button"
          onClick={() => {
            window.location.href = "tel:122";
          }}
        >
          <Phone className="w-6 h-6" />
          اتصال على 122
        </motion.button>

        {/* Safety features grid */}
        <div>
          <h3 className="font-bold text-base text-foreground mb-4">
            كيف تتم حمايتك
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {safetyCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className="bg-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                data-ocid={`safety.item.${idx + 1}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="text-xs font-medium text-foreground leading-tight">
                  {card.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
