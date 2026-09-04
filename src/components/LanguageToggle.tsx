import { useLanguage } from "@/lib/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "bn" : "en")}
      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
    >
      <Languages className="w-4 h-4 text-indigo-600" />
      {language === "en" ? "বাংলা" : "English"}
    </button>
  );
}
