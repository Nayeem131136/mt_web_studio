import { useState } from "react";
import type { ReactNode } from "react";
import { Lead } from "@/types";
import { ChevronLeft, Edit2, Loader2, Send } from "lucide-react";
import ShimmerButton from "@/components/ui/shimmer-button";
import { useLanguage } from "@/lib/LanguageContext";

export default function Step6Review({ data, onSubmit, onBack, isSubmitting, onEdit }: { data: Partial<Lead>, onSubmit: (d: any) => void, onBack: () => void, isSubmitting: boolean, onEdit: (idx: number) => void }) {
  const { t } = useLanguage();
  const [confirmed, setConfirmed] = useState(false);
  const [consent, setConsent] = useState(false);

  const Section = ({ title, editIdx, children }: { title: string, editIdx: number, children: ReactNode }) => (
    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-neutral-900">{title}</h3>
        <button onClick={() => onEdit(editIdx)} className="text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-800 transition-colors">
          <Edit2 className="w-4 h-4" /> {t('s6.edit')}
        </button>
      </div>
      <div className="space-y-2 text-sm text-neutral-700">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('s6.title')}</h2>
        <p className="text-neutral-500">{t('s6.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Section title={t('s6.sec1')} editIdx={0}>
          <p><span className="font-semibold">Business:</span> {data.businessName}</p>
          <p><span className="font-semibold">Owner:</span> {data.ownerName}</p>
          <p><span className="font-semibold">Phone:</span> {data.phone}</p>
          <p><span className="font-semibold">Email:</span> {data.email}</p>
          <p><span className="font-semibold">Category:</span> {data.category}</p>
        </Section>
        
        <Section title={t('s6.sec2')} editIdx={1}>
          <p><span className="font-semibold">Selected Package:</span> <span className="uppercase">{data.package}</span></p>
          <p><span className="font-semibold">Domain:</span> {data.domainStatus?.replace('_', ' ')}</p>
          <p><span className="font-semibold">Hosting:</span> {data.hostingStatus?.replace('_', ' ')}</p>
        </Section>

        <Section title={t('s6.sec3')} editIdx={2}>
          <p><span className="font-semibold">Pages ({data.pages?.length || 0}):</span> {data.pages?.join(', ')}</p>
          <p><span className="font-semibold">Features ({data.features?.length || 0}):</span> {data.features?.join(', ')}</p>
        </Section>

        <Section title={t('s6.sec4')} editIdx={3}>
          <p><span className="font-semibold">Styles:</span> {data.designStyles?.join(', ')}</p>
          <p><span className="font-semibold">Content:</span> {data.contentReadiness}</p>
          <p><span className="font-semibold">Assets:</span> {data.availableAssets?.join(', ')}</p>
          {data.launchDate && <p><span className="font-semibold">Deadline:</span> {data.launchDate}</p>}
        </Section>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-10 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
          <span className="text-sm font-medium text-indigo-900">{t('s6.confirm')}</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 text-indigo-600 rounded" />
          <span className="text-sm font-medium text-indigo-900">{t('s6.consent')}</span>
        </label>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-neutral-100">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-neutral-600 px-6 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5" /> {t('btn.back')}
        </button>
        <div onClick={() => { if(confirmed && consent) onSubmit({}) }}>
          <ShimmerButton 
            disabled={!confirmed || !consent || isSubmitting}
            className={`${(!confirmed || !consent) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('btn.submitting')}</>
            ) : (
              <><Send className="w-5 h-5" /> {t('btn.submit')}</>
            )}
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
