import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const TAGS = [
  { id: "clean", label: "نظافة ✓" },
  { id: "friendly", label: "لطف ✓" },
  { id: "speed", label: "سرعة ✓" },
  { id: "safe", label: "أمان ✓" },
  { id: "punctual", label: "موعدية ✓" },
];

export default function TripRatingPage() {
  const navigate = useNavigate();

  const driverName =
    sessionStorage.getItem("rideshare_driver_name") || "أحمد محمد";
  const driverCar =
    sessionStorage.getItem("rideshare_driver_car") || "تويوتا كورولا";

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const clearSession = () => {
    sessionStorage.removeItem("rideshare_driver_name");
    sessionStorage.removeItem("rideshare_driver_car");
    sessionStorage.removeItem("rideshare_driver_rating");
    sessionStorage.removeItem("rideshare_driver_eta");
    sessionStorage.removeItem("rideshare_trip_price");
    sessionStorage.removeItem("rideshare_pickup_for_route");
    sessionStorage.removeItem("rideshare_saved_pickup");
    sessionStorage.removeItem("rideshare_dropoff_for_route");
    sessionStorage.removeItem("rideshare_saved_dropoff");
  };

  const handleSubmit = () => {
    setSubmitted(true);
    clearSession();
    setTimeout(() => {
      toast.success("شكراً على تقييمك! ⭐");
      navigate({ to: "/history" });
    }, 600);
  };

  const handleSkip = () => {
    clearSession();
    navigate({ to: "/history" });
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const displayStar = hovered > 0 ? hovered : rating;

  return (
    <div
      className="min-h-screen bg-[#1C1C1C] flex flex-col items-center justify-center px-5 py-10"
      dir="rtl"
      data-ocid="rating.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="w-full max-w-sm flex flex-col gap-6"
      >
        {/* Header */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-3">كيف كانت رحلتك؟</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="w-24 h-24 rounded-full bg-[#CCFF00]/10 ring-4 ring-[#CCFF00] flex items-center justify-center text-5xl mx-auto mb-4"
          >
            🚗
          </motion.div>
          <h1 className="text-xl font-bold text-white">{driverName}</h1>
          <p className="text-sm text-gray-400 mt-1">{driverCar}</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3" data-ocid="rating.panel">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform"
              data-ocid="rating.toggle"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={star <= displayStar ? "filled" : "empty"}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {star <= displayStar ? "⭐" : "☆"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {TAGS.map((tag, i) => (
            <motion.button
              key={tag.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTag(tag.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedTags.includes(tag.id)
                  ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                  : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-400"
              }`}
              data-ocid="rating.toggle"
            >
              {tag.label}
            </motion.button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقاً (اختياري)"
          rows={3}
          className="w-full rounded-2xl bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 text-sm px-4 py-3 resize-none focus:outline-none focus:border-[#CCFF00] transition-colors"
          data-ocid="rating.textarea"
        />

        {/* Submit */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitted}
          className="w-full py-4 bg-[#CCFF00] text-black font-bold text-base rounded-2xl hover:bg-[#b8e600] active:scale-[0.98] transition-all shadow-lg disabled:opacity-60"
          data-ocid="rating.submit_button"
        >
          {submitted ? "جاري الإرسال..." : "إرسال التقييم"}
        </motion.button>

        {/* Skip */}
        <button
          type="button"
          onClick={handleSkip}
          className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-200 transition-colors"
          data-ocid="rating.secondary_button"
        >
          تخطي
        </button>
      </motion.div>
    </div>
  );
}
