import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { buildWaMeLink } from "@/lib/phone";

// MT Web Studio's own WhatsApp contact number.
const AGENCY_WHATSAPP = "+8801740527078";

export default function WhatsAppFloatingButton({ message }: { message?: string }) {
  const link = buildWaMeLink(
    AGENCY_WHATSAPP,
    message || "Hi MT Web Studio! I have a question about getting a website."
  );

  if (!link) return null;

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[90] group"
      aria-label="Chat with MT Web Studio on WhatsApp"
    >
      {/* Pulsing glow ring */}
      <span className="absolute inset-0 rounded-full bg-green-400 opacity-60 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/40">
        <MessageCircle className="w-7 h-7 text-white fill-white/10" />
      </span>
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-900 text-white text-xs font-semibold px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Chat with us
      </span>
    </motion.a>
  );
}
