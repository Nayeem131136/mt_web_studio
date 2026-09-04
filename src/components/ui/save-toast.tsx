import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SaveToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-20 left-1/2 z-[100] flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm font-medium px-4 py-2 shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Progress saved
        </motion.div>
      )}
    </AnimatePresence>
  );
}
