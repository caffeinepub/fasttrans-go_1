import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface Props {
  open: boolean;
}

export function ProfileSetupModal({ open }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isDriver, setIsDriver] = useState(false);
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("من فضلك أدخل الاسم ورقم الهاتف");
      return;
    }
    if (!identity) return;

    const profile: UserProfile = {
      name: name.trim(),
      phoneNumber: phone.trim(),
      isDriver,
      rating: BigInt(0),
      ratingCount: BigInt(0),
      createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    };

    try {
      await saveProfile.mutateAsync(profile);
      toast.success("تم إنشاء حسابك بنجاح!");
    } catch {
      toast.error("حدث خطأ. حاول مجدداً.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        data-ocid="profile_setup.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center" dir="rtl">
            مرحباً بك في RideLink!
          </DialogTitle>
          <DialogDescription className="text-center" dir="rtl">
            أكمل بياناتك لتبدأ الرحلة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2" dir="rtl">
          <div className="space-y-1.5">
            <Label htmlFor="setup-name">الاسم الكامل</Label>
            <Input
              id="setup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد أحمد"
              required
              data-ocid="profile_setup.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setup-phone">رقم الهاتف</Label>
            <Input
              id="setup-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 100 000 0000"
              required
              data-ocid="profile_setup.input"
            />
          </div>

          <div className="space-y-2">
            <Label>اختر دورك</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDriver(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  !isDriver
                    ? "border-brand bg-accent text-brand"
                    : "border-border hover:border-muted-foreground"
                }`}
                data-ocid="profile_setup.radio"
              >
                <User className="w-8 h-8" />
                <span className="font-semibold text-sm">راكب</span>
                <span className="text-xs text-muted-foreground">
                  اطلب توصيلة
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsDriver(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isDriver
                    ? "border-brand bg-accent text-brand"
                    : "border-border hover:border-muted-foreground"
                }`}
                data-ocid="profile_setup.radio"
              >
                <Car className="w-8 h-8" />
                <span className="font-semibold text-sm">سائق</span>
                <span className="text-xs text-muted-foreground">
                  اشتغل وكسب
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-hover text-white rounded-full py-6 text-base font-semibold"
            disabled={saveProfile.isPending}
            data-ocid="profile_setup.submit_button"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...
              </>
            ) : (
              "ابدأ الآن"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
