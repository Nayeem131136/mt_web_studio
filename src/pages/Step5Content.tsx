import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContentSchema, Lead, UploadedFile } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import FileDrop from "@/components/ui/file-drop";

export default function Step5Content({ data, onNext, onBack, sessionId }: { data: Partial<Lead>, onNext: (d: Partial<Lead>) => void, onBack: () => void, sessionId: string }) {
  const { t } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(data.uploadedFiles || []);
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(ContentSchema),
    defaultValues: {
      contentReadiness: data.contentReadiness || "",
      availableAssets: data.availableAssets || [],
      launchDate: data.launchDate || "",
      budgetRange: data.budgetRange || "",
      additionalNotes: data.additionalNotes || "",
    }
  });

  const onSubmit = (values: any) => onNext({ ...values, uploadedFiles });

  const assets = ["Logo (Vector/High-res)", "Professional Photos", "Videos", "Menu/Price List", "Brand Guidelines", "Written Copy/Text"];
  const budgets = ["Less than ৳15,000", "৳15,000 - ৳25,000", "৳25,000 - ৳50,000", "৳50,000+"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('s5.title')}</h2>
      <p className="text-neutral-500 mb-8">{t('s5.subtitle')}</p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">{t('s5.readiness')}</h3>
          <div className="space-y-3">
            {[
              t('s5.r1'),
              t('s5.r2'),
              t('s5.r3')
            ].map(opt => (
              <label key={opt} className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                <input type="radio" value={opt} {...register("contentReadiness")} className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-neutral-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">{t('s5.assets')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {assets.map(asset => (
              <label key={asset} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                <input type="checkbox" value={asset} {...register("availableAssets")} className="w-5 h-5 text-indigo-600 rounded" />
                <span className="font-medium text-sm text-neutral-700">{asset}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Upload Your Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["logo", "photo", "menu", "other"] as const).map((group) => {
              const groupLabel = {
                logo: "Logo",
                photo: "Business / Product Photos",
                menu: "Menu / Price List",
                other: "Other Files",
              }[group];
              const groupFiles = uploadedFiles.filter((f) => f.name.startsWith(`${group}:`));
              return (
                <FileDrop
                  key={group}
                  label={groupLabel}
                  sessionId={sessionId}
                  multiple={group !== "logo"}
                  value={groupFiles}
                  onChange={(files) =>
                    setUploadedFiles((prev) => [
                      ...prev.filter((f) => !f.name.startsWith(`${group}:`)),
                      ...files.map((f) =>
                        f.name.startsWith(`${group}:`) ? f : { ...f, name: `${group}:${f.name}` }
                      ),
                    ])
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('s5.launch')}</label>
            <input type="date" {...register("launchDate")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('s5.budget')}</label>
            <select {...register("budgetRange")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
              <option value="">{t('s5.budget_select')}</option>
              {budgets.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('s5.notes')}</label>
          <textarea {...register("additionalNotes")} rows={3} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder={t('s5.notes_ph')} />
        </div>
      </div>

      <div className="flex justify-between pt-10 mt-10 border-t border-neutral-100">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-neutral-600 px-6 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5" /> {t('btn.back')}
        </button>
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          {t('btn.review')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
