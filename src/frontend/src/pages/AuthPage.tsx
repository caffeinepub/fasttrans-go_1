import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Car, Globe, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function AuthPage() {
  const { identity, login, loginStatus, isInitializing } =
    useInternetIdentity();
  const { data: profile, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const navigate = useNavigate();
  const isLoggingIn = loginStatus === "logging-in";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const showSetup = identity && isFetched && !profile;

  useEffect(() => {
    if (identity && isFetched && profile) {
      navigate({ to: profile.isDriver ? "/driver" : "/passenger" });
    }
  }, [identity, profile, isFetched, navigate]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("من فضلك أدخل الاسم ورقم الهاتف");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phoneNumber: phone.trim(),
        isDriver: false,
        ratingCount: BigInt(0),
        rating: BigInt(0),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
        location: undefined,
      });
      navigate({ to: "/passenger" });
    } catch {
      toast.error("حدث خطأ أثناء إنشاء الحساب. حاول مجدداً.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Simple dark header */}
      <header className="h-14 border-b border-border flex items-center px-4">
        <span className="font-display font-bold text-xl text-primary">
          RideShare
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-3xl p-8 w-full max-w-sm text-center shadow-card"
        >
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Car className="w-9 h-9 text-primary-foreground" />
          </div>

          {showSetup ? (
            <>
              <h1 className="font-display font-bold text-2xl text-foreground mb-2">
                أكمل بياناتك
              </h1>
              <p className="text-muted-foreground mb-6 text-sm">
                أدخل اسمك ورقم هاتفك لإنشاء حسابك
              </p>
              <form
                onSubmit={handleCreateProfile}
                className="flex flex-col gap-3 text-right"
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground text-right"
                  data-ocid="auth.input"
                />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                  type="tel"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground text-right"
                  data-ocid="auth.input"
                />
                <Button
                  type="submit"
                  disabled={saveProfile.isPending}
                  className="w-full bg-primary hover:bg-brand-hover text-primary-foreground rounded-2xl h-12 text-base font-bold mt-2 shadow-lime"
                  data-ocid="auth.submit_button"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري
                      الحفظ...
                    </>
                  ) : (
                    "ابدأ الاستخدام"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-3xl text-foreground mb-2">
                مرحباً بك
              </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                سجّل دخولك للوصول إلى حسابك
              </p>

              <Button
                onClick={() => login()}
                disabled={isLoggingIn || isInitializing}
                className="w-full bg-primary hover:bg-brand-hover text-primary-foreground rounded-2xl h-12 text-base font-bold mb-6 shadow-lime"
                data-ocid="auth.primary_button"
              >
                {isLoggingIn || isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري
                    الدخول...
                  </>
                ) : (
                  "تسجيل الدخول / إنشاء حساب"
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-secondary">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    هوية آمنة
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-secondary">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    لا كلمة مرور
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                بالمتابعة توافق على شروط الاستخدام وسياسة الخصوصية
              </p>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
