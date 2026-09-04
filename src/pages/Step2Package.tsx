import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageSchema, Lead } from "@/types";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

export default function Step2Package({ data, onNext, onBack }: { data: Partial<Lead>, onNext: (d: Partial<Lead>) => void, onBack: () => void }) {
  const { t } = useLanguage();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(PackageSchema),
    defaultValues: {
      package: (data.package as "starter" | "business" | "premium") || "starter",
      domainStatus: (data.domainStatus as "has_one" | "needs_new" | "needs_help") || "needs_help",
      domainName: data.domainName || "",
      hostingStatus: (data.hostingStatus as "has_one" | "needs" | "needs_help") || "needs_help",
      hostingProvider: data.hostingProvider || "",
    }
  });

  const selectedPackage = watch("package");

  const packages = [
    {
      id: "starter",
      name: t('s2.starter'),
      price: "৳8,000",
      desc: t('s2.starter.desc'),
      features: ["5 sections", "WhatsApp button", "Maps Integration", "Basic SEO", "Contact form", "1 revision"],
    },
    {
      id: "business",
      name: t('s2.business'),
      price: "৳15,000",
      desc: t('s2.business.desc'),
      popular: true,
      features: ["8 sections + Custom animations", "Reviews & FAQ", "Booking requests", "Admin CMS", "WhatsApp lead capture", "2 revisions", "Performance optimization"],
    },
    {
      id: "premium",
      name: t('s2.premium'),
      price: "৳25,000",
      desc: t('s2.premium.desc'),
      features: ["Full admin dashboard", "Booking/reservation system", "Product/menu management", "Customer data & analytics", "Dynamic CMS", "3 revisions", "Launch assistance"],
    }
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('s2.title')}</h2>
        <p className="text-neutral-500">{t('s2.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="relative" onClick={() => setValue("package", pkg.id as any)}>
            <SpotlightCard className={cn(
              "p-8 cursor-pointer h-full flex flex-col transition-all duration-300",
              selectedPackage === pkg.id ? "ring-2 ring-pink-500 bg-gradient-to-b from-pink-50/50 to-indigo-50/50 scale-[1.02] shadow-xl shadow-pink-500/20" : "hover:border-indigo-200"
            )}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-full animate-pulse shadow-md">
                  {t('s2.popular')}
                </div>
              )}
              {selectedPackage === pkg.id && pkg.popular && <BorderBeam duration={10} size={250} />}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-1">{pkg.name}</h3>
                <p className="text-sm text-neutral-500 h-10">{pkg.desc}</p>
                <div className="mt-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-600">{pkg.price}</div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                    <Check className="w-5 h-5 text-pink-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className={cn(
                "w-full py-3 rounded-xl font-bold text-center transition-all",
                selectedPackage === pkg.id ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              )}>
                {selectedPackage === pkg.id ? t('s2.selected') : t('s2.select')}
              </div>
            </SpotlightCard>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200 mt-12">
        <h3 className="text-xl font-bold text-neutral-900 mb-6">{t('s2.domain.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-4 text-neutral-800">{t('s2.domain.label')}</label>
            <div className="space-y-3">
              {[
                { val: "has_one", label: t('s2.domain.has') },
                { val: "needs_new", label: t('s2.domain.new') },
                { val: "needs_help", label: t('s2.domain.help') }
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input type="radio" value={opt.val} {...register("domainStatus")} className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-neutral-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-4 text-neutral-800">{t('s2.hosting.label')}</label>
            <div className="space-y-3">
              {[
                { val: "has_one", label: t('s2.hosting.has') },
                { val: "needs", label: t('s2.hosting.new') },
                { val: "needs_help", label: t('s2.hosting.help') }
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input type="radio" value={opt.val} {...register("hostingStatus")} className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-neutral-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-neutral-600 px-6 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5" /> {t('btn.back')}
        </button>
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          {t('btn.continue_features')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
