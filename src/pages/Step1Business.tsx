import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { BusinessInfoSchema, Lead } from "@/types";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { normalizeBDPhone } from "@/lib/phone";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function Step1Business({ data, onNext }: { data: Partial<Lead>, onNext: (d: Partial<Lead>) => void }) {
  const { t } = useLanguage();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(BusinessInfoSchema),
    defaultValues: {
      businessName: data.businessName || "",
      ownerName: data.ownerName || "",
      phone: data.phone || "",
      whatsapp: data.whatsapp || "",
      email: data.email || "",
      category: data.category || "",
      district: data.district || "",
      address: data.address || "",
      socialLinks: data.socialLinks || "",
      businessDescription: data.businessDescription || "",
      businessGoals: data.businessGoals || [],
    }
  });

  const selectedGoals: string[] = watch("businessGoals") || [];

  const toggleGoal = (goal: string) => {
    const next = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setValue("businessGoals", next);
  };

  const onSubmit = (values: any) => {
    onNext({
      ...values,
      phone: normalizeBDPhone(values.phone) || values.phone,
      whatsapp: values.whatsapp ? normalizeBDPhone(values.whatsapp) || values.whatsapp : "",
    });
  };

  const categories = [
    "Restaurant", "Cafe", "Bakery", "Clothing Brand", "Salon", "Beauty Studio",
    "Gym", "Coaching Center", "Real Estate", "Interior Design", "Photography",
    "Travel Agency", "E-commerce", "Personal Brand", "Other"
  ];

  const goals = [
    "Get more customers", "Build brand trust", "Online presence",
    "Receive online orders", "Accept bookings", "Showcase products/services",
    "Generate leads", "Other"
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('s1.title')}</h2>
      <p className="text-neutral-500 mb-8">{t('s1.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <label className="block text-sm font-semibold mb-2">{t('s1.bname')}</label>
          <input {...register("businessName")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="e.g. MT Web Studio" />
          {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName.message as string}</p>}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <label className="block text-sm font-semibold mb-2">{t('s1.owner')}</label>
          <input {...register("ownerName")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="e.g. John Doe" />
          {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName.message as string}</p>}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <label className="block text-sm font-semibold mb-2">{t('s1.phone')}</label>
          <input {...register("phone")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="+880 1XXX-XXXXXX" />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
          <input {...register("whatsapp")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="+880 1XXX-XXXXXX (if different)" />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <label className="block text-sm font-semibold mb-2">{t('s1.email')}</label>
          <input type="email" {...register("email")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="hello@example.com" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
          <label className="block text-sm font-semibold mb-2">{t('s1.category')}</label>
          <select {...register("category")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
            <option value="">{t('s1.cat_select')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
          <label className="block text-sm font-semibold mb-2">{t('s1.district')}</label>
          <input {...register("district")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="e.g. Dhaka" />
          {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message as string}</p>}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}>
          <label className="block text-sm font-semibold mb-2">Area / Address</label>
          <input {...register("address")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="e.g. Gulshan-2, Dhaka" />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8} className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Facebook / Instagram / Google Business / Existing Website</label>
          <input {...register("socialLinks")} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Paste any links you have, separated by commas" />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9} className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">{t('s1.desc')}</label>
          <textarea {...register("businessDescription")} rows={4} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder={t('s1.desc_ph')} />
          {errors.businessDescription && <p className="text-red-500 text-sm mt-1">{errors.businessDescription.message as string}</p>}
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={10} className="mb-8">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">What are your business goals?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => {
            const checked = selectedGoals.includes(goal);
            return (
              <label
                key={goal}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                  checked ? "border-indigo-500 bg-indigo-50/60 shadow-sm" : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGoal(goal)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="font-medium text-sm text-neutral-700">{goal}</span>
              </label>
            );
          })}
        </div>
      </motion.div>

      <div className="flex justify-end pt-6 border-t border-neutral-100">
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 hover:scale-[1.02] transition-all">
          {t('btn.continue_package')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
