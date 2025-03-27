import MainLayout from "@/components/layout/main-layout";
import { useLanguage } from "@/hooks/use-language";
import MarketConnect from "@/components/dashboard/market-connect";

export default function Market() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t("Market Connect")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("Access market prices and sell your produce")}</p>
      </div>
      
      <MarketConnect />
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">{t("Buyer Connections")}</h2>
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <span className="material-icons text-primary text-4xl">shopping_cart</span>
            <h2 className="mt-2 text-lg font-medium text-gray-900">{t("Direct Buyer Connection Coming Soon")}</h2>
            <p className="mt-1 text-gray-500">{t("Connect directly with buyers for your crops")}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
