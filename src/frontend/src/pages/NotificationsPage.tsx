import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { AppHeader } from "../components/AppHeader";
import { BottomTabBar } from "../components/BottomTabBar";

const notifications = [
  {
    id: 1,
    title: "تم قبول رحلتك",
    body: "السائق أحمد قبل طلب رحلتك من ميدان التحرير إلى مطار القاهرة",
    time: "منذ 5 دقائق",
    unread: true,
  },
  {
    id: 2,
    title: "تقييم رحلتك",
    body: "كيف كانت رحلتك أمس؟ قيّم السائق وساعد الركاب الآخرين",
    time: "منذ ساعة",
    unread: true,
  },
  {
    id: 3,
    title: "عرض خاص",
    body: "احصل على خصم 20% على رحلتك القادمة باستخدام كود RIDE20",
    time: "أمس",
    unread: false,
  },
  {
    id: 4,
    title: "اكتملت رحلتك",
    body: "وصلت بسلامة! شكراً لاستخدامك RideShare",
    time: "قبل يومين",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      <AppHeader title="إشعارات" showBack />

      <main className="flex-1 px-4 py-4 pb-24">
        {notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="notifications.empty_state"
          >
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-card rounded-2xl p-4 ${notif.unread ? "border border-primary/30" : ""}`}
                data-ocid={`notifications.item.${idx + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.unread ? "bg-primary/10" : "bg-secondary"}`}
                  >
                    <Bell
                      className={`w-5 h-5 ${notif.unread ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-semibold text-sm ${notif.unread ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {notif.title}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 mr-2">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                  {notif.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
