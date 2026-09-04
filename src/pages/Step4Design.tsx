import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DesignSchema, Lead } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Step4Design({ data, onNext, onBack }: { data: Partial<Lead>, onNext: (d: Partial<Lead>) => void, onBack: () => void }) {
  const { t } = useLanguage();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(DesignSchema),
    defaultValues: {
      designStyles: data.designStyles || [],
      colorPreferences: data.colorPreferences || "",
      referenceUrls: data.referenceUrls || "",
    }
  });

  const styles = ["Modern", "Minimal", "Luxury", "Corporate", "Bold", "Elegant", "Creative", "Premium Dark", "Light & Clean"];

  return (
    <form onSubmit={handleSubmit(onNext)} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('s4.title')}</h2>
      <p className="text-neutral-500 mb-8">{t('s4.subtitle')}</p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">{t('s4.vibe')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {styles.map(style => (
              <label key={style} className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                <input type="checkbox" value={style} {...register("designStyles")} className="w-5 h-5 text-indigo-600 rounded" />
                <span className="font-medium text-neutral-700">{style}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('s4.colors')}</label>
          <input {...register("colorPreferences")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder={t('s4.colors_ph')} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('s4.ref')}</label>
          <textarea {...register("referenceUrls")} rows={3} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder={t('s4.ref_ph')} />
          <p className="text-sm text-neutral-500 mt-2">{t('s4.ref_help')}</p>
        </div>
      </div>

      <div className="flex justify-between pt-10 mt-10 border-t border-neutral-100">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-neutral-600 px-6 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5" /> {t('btn.back')}
        </button>
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          {t('btn.continue_content')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
