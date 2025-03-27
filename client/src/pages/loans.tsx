import MainLayout from "@/components/layout/main-layout";
import { useLanguage } from "@/hooks/use-language";
import FinancialAssistanceComponent from "@/components/dashboard/financial-assistance";

export default function Loans() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t("Loans & Subsidies")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("Explore financial options for your farming needs")}</p>
      </div>
      
      <FinancialAssistanceComponent />
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">{t("Additional Financial Options")}</h2>
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <span className="material-icons text-primary text-4xl">payments</span>
            <h2 className="mt-2 text-lg font-medium text-gray-900">{t("More Financial Tools Coming Soon")}</h2>
            <p className="mt-1 text-gray-500">{t("Additional loan and subsidy options are under development")}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
