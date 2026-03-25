import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Car,
  ChevronDown,
  Clock,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "../components/Footer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

const FEATURES = [
  {
    icon: Clock,
    title: "سريع وآمن",
    desc: "توصيل في دقائق مع تتبع فوري للرحلة",
  },
  {
    icon: Star,
    title: "أفضل سعر",
    desc: "اقترح سعرك واحصل على أفضل عرض من السائقين",
  },
  {
    icon: Shield,
    title: "سائقون موثوقون",
    desc: "جميع السائقين معتمدون ومُقيَّمون من المستخدمين",
  },
];

const STEPS = [
  { num: "01", title: "سجّل حسابك", desc: "أنشئ حسابك في ثوانٍ" },
  { num: "02", title: "حدد موقعك", desc: "اختر نقطة الانطلاق والوصول" },
  { num: "03", title: "اتفق على السعر", desc: "اقترح سعرك أو اقبل عرض السائق" },
  { num: "04", title: "استمتع بالرحلة", desc: "تتبع سائقك وصل بأمان" },
];

const MOCKUP_DRIVERS = [
  { label: "سائق أحمد — ⭐ 4.9", fare: "25 جنيه" },
  { label: "سائق محمد — ⭐ 4.7", fare: "25 جنيه" },
  { label: "سائق علي — ⭐ 4.8", fare: "25 جنيه" },
];

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();

  const dashboardPath = identity
    ? profile?.isDriver
      ? "/driver"
      : "/passenger"
    : "/auth";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Landing Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              RIDELINK
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Services
            </a>
            <a
              href="/safety"
              className="hover:text-foreground transition-colors"
            >
              Safety
            </a>
            <a
              href="/drivers"
              className="hover:text-foreground transition-colors"
            >
              Drivers
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a
              href="/cities"
              className="hover:text-foreground transition-colors"
            >
              Cities
            </a>
            <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              العربية <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </nav>

          <div className="flex items-center gap-2">
            {identity ? (
              <Link to={dashboardPath}>
                <Button
                  className="bg-brand hover:bg-brand-hover text-white rounded-full px-5"
                  data-ocid="landing.primary_button"
                >
                  لوحة التحكم
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="rounded-full px-5 border-foreground text-foreground hover:bg-secondary"
                    data-ocid="landing.secondary_button"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    className="bg-brand hover:bg-brand-hover text-white rounded-full px-5"
                    data-ocid="landing.primary_button"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[85vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-city-night.dim_1600x900.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-foreground/70" />
        <div
          className="container relative z-10 grid lg:grid-cols-2 gap-12 py-20"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center gap-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full px-4 py-1.5 w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              متاح في أكثر من 20 مدينة
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl text-white leading-tight">
              اطلب توصيلة.
              <br />
              <span style={{ color: "oklch(0.68 0.15 258)" }}>في أي وقت،</span>{" "}
              أي مكان.
            </h1>
            <p className="text-white/75 text-lg max-w-md">
              منصة مشاركة الرحلات الأولى في المنطقة. سافر بأمان، واكسب أكثر.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={identity ? "/passenger" : "/auth"}>
                <Button
                  size="lg"
                  className="bg-brand hover:bg-brand-hover text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg"
                  data-ocid="landing.primary_button"
                >
                  اطلب الآن
                </Button>
              </Link>
              <Link to={identity ? "/driver" : "/auth"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-semibold border-white text-white hover:bg-white/10 hover:text-white"
                  data-ocid="landing.secondary_button"
                >
                  اشتغل سائق
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Phone mockup card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-64 relative">
              <div className="bg-brand-light rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-brand" />
                  <div className="flex-1 bg-white rounded-full h-8 flex items-center px-3 text-xs text-muted-foreground">
                    نقطة الانطلاق
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <div className="flex-1 bg-white rounded-full h-8 flex items-center px-3 text-xs text-muted-foreground">
                    الوجهة
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {MOCKUP_DRIVERS.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2"
                  >
                    <span className="text-xs font-medium">{d.label}</span>
                    <span className="text-xs font-bold text-brand">
                      {d.fare}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full bg-brand text-white rounded-full py-2.5 text-sm font-semibold"
              >
                اطلب الآن
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-4xl text-foreground mb-3">
              لماذا RideLink؟
            </h2>
            <p className="text-muted-foreground text-lg">
              خدمة متميزة تضع راحتك في المقام الأول
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-border rounded-2xl p-8 shadow-card hover:shadow-md transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-brand" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2" dir="rtl">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm" dir="rtl">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-20 bg-brand-light">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-bold text-4xl text-foreground mb-3">
              للركاب والسائقين
            </h2>
            <p className="text-muted-foreground text-lg">
              منصة واحدة تخدم الجميع
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-card text-center"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
                <Users className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">الركاب</h3>
              <p className="text-muted-foreground mb-5">
                اطلب رحلتك، اقترح سعرك، وتتبع سائقك في الوقت الفعلي
              </p>
              <Link to={identity ? "/passenger" : "/auth"}>
                <Button
                  className="bg-brand hover:bg-brand-hover text-white rounded-full px-6"
                  data-ocid="landing.primary_button"
                >
                  اطلب الآن
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-card text-center"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
                <Car className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">السائقون</h3>
              <p className="text-muted-foreground mb-5">
                اقبل الرحلات، حدد أسعارك، وزد دخلك بكل مرونة
              </p>
              <Link to={identity ? "/driver" : "/auth"}>
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-brand text-brand hover:bg-accent"
                  data-ocid="landing.secondary_button"
                >
                  اشتغل سائق
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-bold text-4xl text-foreground mb-3">
              كيف يعمل؟
            </h2>
            <p className="text-muted-foreground text-lg">أربع خطوات بسيطة</p>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-border" />
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center text-center"
                  dir="rtl"
                >
                  <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mb-5 shadow-md">
                    <span className="font-display font-bold text-xl text-white">
                      {s.num}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-lg mb-1">
                    {s.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
