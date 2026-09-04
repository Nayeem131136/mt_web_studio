import { BorderBeam } from "@/components/ui/border-beam";
import ShimmerButton from "@/components/ui/shimmer-button";
import { Marquee } from "@/components/ui/marquee";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Shield, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden flex flex-col items-center pt-24 pb-12 px-6">
      <WhatsAppFloatingButton />
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Animated Colorful Background Blobs */}
      <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none z-0"></div>
      <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="absolute -bottom-8 left-40 w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 pointer-events-none z-0"></div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white/80 to-white/90 pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl text-center z-10"
      >
        <motion.div 
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, staggerChildren: 0.2 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            {t('hero.title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse">{t('hero.title.highlight')}</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto font-medium">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <div className="relative group inline-flex mt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient bg-[length:200%_200%]"></div>
            <button 
              onClick={() => navigate("/start")}
              className="relative px-12 py-5 text-lg font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 rounded-full leading-none flex items-center justify-center animate-gradient bg-[length:200%_200%] hover:scale-[1.02] transition-transform duration-300"
            >
              {t('hero.cta')}
            </button>
          </div>
          <p className="text-sm text-neutral-500 font-medium mt-2">
            {t('hero.eta')}
          </p>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-24 w-full max-w-5xl"
      >
        <Marquee className="py-4" pauseOnHover>
          {[
            { text: t('trust.design'), icon: Zap },
            { text: t('trust.responsive'), icon: Smartphone },
            { text: t('trust.secure'), icon: Shield },
            { text: t('trust.support'), icon: CheckCircle },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 mx-8 text-neutral-600 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-200/60 shadow-sm">
              <item.icon className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-sm">{item.text}</span>
            </div>
          ))}
        </Marquee>
      </motion.div>

      <div className="mt-32 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { num: "01", title: t('step1.title') },
          { num: "02", title: t('step2.title') },
          { num: "03", title: t('step3.title') },
        ].map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            className="flex flex-col items-center text-center p-8 bg-white/50 backdrop-blur-md rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl mb-6">
              {step.num}
            </div>
            <h3 className="text-xl font-bold text-neutral-800">{step.title}</h3>
          </motion.div>
        ))}
      </div>

      <motion.a
        href="/track"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-sm font-semibold text-neutral-500 hover:text-indigo-600 underline underline-offset-4 transition-colors"
      >
        Already submitted a request? Track your project status →
      </motion.a>
    </div>
  );
}
