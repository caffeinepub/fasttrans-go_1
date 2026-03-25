import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Car, Loader2, Phone, Star, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "../components/AppHeader";
import { Footer } from "../components/Footer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSwitchRole,
  useUpdateProfileName,
  useUpdateProfilePhone,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const updateName = useUpdateProfileName();
  const updatePhone = useUpdateProfilePhone();
  const switchRole = useSwitchRole();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!identity) navigate({ to: "/auth" });
  }, [identity, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phoneNumber);
    }
  }, [profile]);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    try {
      await updateName.mutateAsync(name.trim());
      toast.success("تم تحديث الاسم");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleSavePhone = async () => {
    if (!phone.trim()) return;
    try {
      await updatePhone.mutateAsync(phone.trim());
      toast.success("تم تحديث رقم الهاتف");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleSwitchRole = async () => {
    try {
      await switchRole.mutateAsync();
      toast.success(
        `تم التبديل إلى ${profile?.isDriver ? "راكب" : "سائق"} بنجاح!`,
      );
    } catch {
      toast.error("حدث خطأ في تبديل الدور");
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <AppHeader />
      <main className="flex-1 container max-w-2xl py-10" dir="rtl">
        <h1 className="font-display font-bold text-3xl mb-8">الملف الشخصي</h1>

        {/* Avatar + role */}
        <div className="flex items-center gap-5 mb-8 bg-white border border-border rounded-2xl p-6 shadow-card">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-brand text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl">
              {profile?.name ?? "..."}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {profile?.isDriver ? (
                <span className="inline-flex items-center gap-1 text-sm text-brand font-medium">
                  <Car className="w-4 h-4" /> سائق
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground font-medium">
                  <Users className="w-4 h-4" /> راكب
                </span>
              )}
              {profile?.isDriver && profile.ratingCount > BigInt(0) && (
                <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  {(
                    Number(profile.rating) / Number(profile.ratingCount)
                  ).toFixed(1)}
                  <span className="text-muted-foreground">
                    ({profile.ratingCount.toString()} تقييم)
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <Card className="shadow-card" data-ocid="profile.card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> الاسم
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className="flex-1"
                data-ocid="profile.input"
              />
              <Button
                onClick={handleSaveName}
                disabled={updateName.isPending}
                className="bg-brand hover:bg-brand-hover text-white rounded-full px-5"
                data-ocid="profile.save_button"
              >
                {updateName.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "حفظ"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card className="shadow-card" data-ocid="profile.card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand" /> رقم الهاتف
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="flex-1"
                data-ocid="profile.input"
              />
              <Button
                onClick={handleSavePhone}
                disabled={updatePhone.isPending}
                className="bg-brand hover:bg-brand-hover text-white rounded-full px-5"
                data-ocid="profile.save_button"
              >
                {updatePhone.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "حفظ"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Switch role */}
          <Card className="shadow-card" data-ocid="profile.card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                تبديل الدور
              </CardTitle>
              <CardDescription>
                {profile?.isDriver
                  ? "التبديل إلى وضع الراكب"
                  : "التبديل إلى وضع السائق"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleSwitchRole}
                disabled={switchRole.isPending}
                className="rounded-full border-brand text-brand hover:bg-accent"
                data-ocid="profile.toggle"
              >
                {switchRole.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : profile?.isDriver ? (
                  <>
                    <Users className="mr-1 w-4 h-4" /> التبديل إلى راكب
                  </>
                ) : (
                  <>
                    <Car className="mr-1 w-4 h-4" /> التبديل إلى سائق
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
