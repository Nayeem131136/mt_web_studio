import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Lead } from "@/types";
import Step1Business from "./Step1Business";
import Step2Package from "./Step2Package";
import Step3Requirements from "./Step3Requirements";
import Step4Design from "./Step4Design";
import Step5Content from "./Step5Content";
import Step6Review from "./Step6Review";
import { fireConfetti } from "@/lib/confetti";
import { supabase } from "@/supabase";
import { leadToRow } from "@/lib/leadMapper";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { generateReferenceId } from "@/lib/refId";
import { normalizeBDPhone } from "@/lib/phone";
import { sendConfirmationEmail } from "@/lib/email";
import SaveToast from "@/components/ui/save-toast";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

const STEPS = [
  "Business",
  "Package",
  "Features",
  "Design",
  "Content",
  "Review"
];

const DRAFT_KEY = "mt_onboarding_draft_v1";

function loadDraft(): { step: number; data: Partial<Lead>; sessionId: string } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function OnboardingWizard() {
  const { t } = useLanguage();
  const draft = useRef(loadDraft()).current;

  const [sessionId] = useState<string>(() => draft?.sessionId || crypto.randomUUID());
  const [currentStep, setCurrentStep] = useState(draft?.step || 0);
  const [formData, setFormData] = useState<Partial<Lead>>(draft?.data || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Show a one-time "restored" toast if we picked up an earlier session.
  useEffect(() => {
    if (draft) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [draft]);

  const persistDraft = (step: number, data: Partial<Lead>) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data, sessionId }));
    } catch {
      // localStorage unavailable (private browsing etc.) — fail silently, non-critical
    }
  };

  const flashSaved = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1400);
  };

  const handleNext = (data: Partial<Lead>) => {
    const merged = { ...formData, ...data };
    setFormData(merged);
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistDraft(nextStep, merged);
      flashSaved();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      persistDraft(prevStep, formData);
    }
  };

  const handleSaveAndExit = () => {
    persistDraft(currentStep, formData);
    window.location.href = "/";
  };

  const handleSubmit = async (finalData: Partial<Lead>) => {
    setIsSubmitting(true);
    const fullData = { ...formData, ...finalData };

    try {
      const referenceId = await generateReferenceId();
      const normalizedPhone = normalizeBDPhone(fullData.phone || "") || fullData.phone || "";
      const normalizedWhatsapp = fullData.whatsapp
        ? normalizeBDPhone(fullData.whatsapp) || fullData.whatsapp
        : "";

      const leadData: Omit<Lead, "id"> = {
        referenceId,
        businessName: fullData.businessName || "",
        ownerName: fullData.ownerName || "",
        phone: normalizedPhone,
        whatsapp: normalizedWhatsapp,
        email: fullData.email || "",
        category: fullData.category || "",
        district: fullData.district || "",
        address: fullData.address || "",
        socialLinks: fullData.socialLinks || "",
        businessDescription: fullData.businessDescription || "",
        businessGoals: fullData.businessGoals || [],
        package: fullData.package || "starter",
        domainStatus: fullData.domainStatus,
        domainName: fullData.domainName,
        hostingStatus: fullData.hostingStatus,
        hostingProvider: fullData.hostingProvider,
        pages: fullData.pages || [],
        features: fullData.features || [],
        designStyles: fullData.designStyles || [],
        colorPreferences: fullData.colorPreferences,
        referenceUrls: fullData.referenceUrls,
        contentReadiness: fullData.contentReadiness,
        availableAssets: fullData.availableAssets || [],
        uploadedFiles: fullData.uploadedFiles || [],
        launchDate: fullData.launchDate,
        budgetRange: fullData.budgetRange,
        additionalNotes: fullData.additionalNotes,
        status: "New",
        priority: "WARM",
        createdAt: Date.now()
      };

      const { error: insertError } = await supabase.from("leads").insert(leadToRow(leadData));
      if (insertError) throw insertError;

      // Fire-and-forget — never block the success screen on email delivery.
      sendConfirmationEmail({
        referenceId,
        businessName: leadData.businessName,
        ownerName: leadData.ownerName,
        email: leadData.email,
        package: leadData.package,
      });

      localStorage.removeItem(DRAFT_KEY);
      setSuccessId(referenceId);
      fireConfetti();
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Something went wrong. Your information has not been lost — it's saved in this browser. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 shadow-xl max-w-md w-full text-center border border-neutral-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('success.title')}</h2>
          <p className="text-neutral-600 mb-6">
            {t('success.desc')}
          </p>
          <div className="bg-neutral-100 p-4 rounded-xl mb-8">
            <p className="text-sm text-neutral-500 uppercase font-semibold mb-1">{t('success.ref')}</p>
            <p className="text-2xl font-mono font-bold text-indigo-600">{successId}</p>
          </div>
          <a
            href="/track"
            className="block w-full py-4 mb-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Track My Project Status
          </a>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-4 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
          >
            {t('success.home')}
          </button>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1Business data={formData} onNext={handleNext} />;
      case 1: return <Step2Package data={formData} onNext={handleNext} onBack={handleBack} />;
      case 2: return <Step3Requirements data={formData} onNext={handleNext} onBack={handleBack} />;
      case 3: return <Step4Design data={formData} onNext={handleNext} onBack={handleBack} />;
      case 4: return <Step5Content data={formData} onNext={handleNext} onBack={handleBack} sessionId={sessionId} />;
      case 5: return <Step6Review data={formData} onSubmit={handleSubmit} onBack={handleBack} isSubmitting={isSubmitting} onEdit={(stepIndex) => setCurrentStep(stepIndex)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      <SaveToast show={showSaved} />
      <WhatsAppFloatingButton message="Hi! I need help filling out the project onboarding form." />
      {/* Top Progress Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex gap-2 items-center text-sm font-semibold text-neutral-900">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              {currentStep + 1}
            </div>
            <span className="hidden md:inline bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-indigo-600 font-extrabold">{t(`nav.step.${STEPS[currentStep]}`)}</span>
          </div>

          <div className="flex-1 mx-8 hidden md:flex items-center">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 shadow-sm ${idx <= currentStep ? 'bg-gradient-to-r from-pink-500 to-indigo-500 scale-125' : 'bg-neutral-200'}`} />
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-500 ${idx < currentStep ? 'bg-gradient-to-r from-pink-500 to-indigo-500' : 'bg-neutral-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button onClick={handleSaveAndExit} className="hidden sm:block text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              {t('wizard.save_exit')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
