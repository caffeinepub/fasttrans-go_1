import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Principal } from "@dfinity/principal";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRateDriver } from "../hooks/useQueries";

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  driverPrincipal: Principal;
  rideId: number;
}

export function RatingModal({
  open,
  onClose,
  driverPrincipal,
}: RatingModalProps) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const rateDriver = useRateDriver();

  const handleSubmit = async () => {
    if (selected === 0) {
      toast.error("من فضلك اختر تقييماً");
      return;
    }
    try {
      await rateDriver.mutateAsync({
        driver: driverPrincipal,
        rating: BigInt(selected),
      });
      toast.success("شكراً على تقييمك! ⭐");
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء التقييم");
    }
  };

  const displayStars = hovered || selected;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm rounded-3xl"
        dir="rtl"
        data-ocid="rating.dialog"
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-brand fill-brand/30" />
            </div>
          </div>
          <DialogTitle className="font-display text-xl text-center">
            تقييم السائق
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">
            كيف كانت تجربتك مع السائق؟
          </p>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="transition-transform hover:scale-110 active:scale-95"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(star)}
              data-ocid="rating.toggle"
            >
              <Star
                className={`w-9 h-9 transition-colors ${
                  star <= displayStars
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={onClose}
            data-ocid="rating.cancel_button"
          >
            تخطي
          </Button>
          <Button
            className="flex-1 rounded-full bg-brand hover:bg-brand-hover text-white"
            onClick={handleSubmit}
            disabled={rateDriver.isPending || selected === 0}
            data-ocid="rating.submit_button"
          >
            {rateDriver.isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "إرسال التقييم"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
