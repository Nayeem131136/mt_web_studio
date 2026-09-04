import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FeaturesSchema, Lead } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Step3Requirements({ data, onNext, onBack }: { data: Partial<Lead>, onNext: (d: Partial<Lead>) => void, onBack: () => void }) {
  const { t } = useLanguage();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(FeaturesSchema),
    defaultValues: {
      pages: data.pages || [],
      features: data.features || [],
    }
  });

  const commonPages = ["Home", "About Us", "Services", "Products", "Contact", "Blog", "Portfolio", "FAQ", "Testimonials", "Team"];
  const commonFeatures = ["Contact Form", "WhatsApp Chat Button", "Google Maps", "Social Media Links", "Newsletter Signup", "Photo Gallery", "Multilingual Support", "Search Function", "User Login/Registration"];
  
  const isRestaurant = data.category === "Restaurant" || data.category === "Cafe";
  const restaurantFeatures = ["Digital Menu", "Food Categories", "Table Reservation System", "Online Ordering", "Delivery Integration"];
  
  const isEcommerce = data.category === "E-commerce" || data.category === "Clothing Brand";
  const ecommerceFeatures = ["Product Catalog", "Shopping Cart", "Checkout Page", "Payment Gateway (bKash/Card)", "Inventory Management", "Customer Reviews", "Discount/Coupon Codes"];

  return (
    <form onSubmit={handleSubmit(onNext)} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">{t('s3.title')}</h2>
      <p className="text-neutral-500 mb-8">{t('s3.subtitle')}</p>

      <div className="space-y-10">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">{t('s3.req_pages')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {commonPages.map(page => (
              <label key={page} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                <input type="checkbox" value={page} {...register("pages")} className="w-5 h-5 text-indigo-600 rounded" />
                <span className="font-medium text-sm text-neutral-700">{page}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">{t('s3.std_feat')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonFeatures.map(feat => (
              <label key={feat} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors">
                <input type="checkbox" value={feat} {...register("features")} className="w-5 h-5 text-indigo-600 rounded" />
                <span className="font-medium text-sm text-neutral-700">{feat}</span>
              </label>
            ))}
          </div>
        </div>

        {isRestaurant && (
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h3 className="text-lg font-bold text-orange-900 mb-4">{t('s3.rest_feat')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurantFeatures.map(feat => (
                <label key={feat} className="flex items-center gap-3 p-3 bg-white border border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100/50 transition-colors">
                  <input type="checkbox" value={feat} {...register("features")} className="w-5 h-5 text-orange-600 rounded" />
                  <span className="font-medium text-sm text-orange-900">{feat}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isEcommerce && (
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-4">{t('s3.ecom_feat')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ecommerceFeatures.map(feat => (
                <label key={feat} className="flex items-center gap-3 p-3 bg-white border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100/50 transition-colors">
                  <input type="checkbox" value={feat} {...register("features")} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="font-medium text-sm text-indigo-900">{feat}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-10 mt-10 border-t border-neutral-100">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-neutral-600 px-6 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-colors">
          <ChevronLeft className="w-5 h-5" /> {t('btn.back')}
        </button>
        <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          {t('btn.continue_design')} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
