import MainLayout from "@/components/layout/main-layout";
import { useLanguage } from "@/hooks/use-language";
import AIAssistant from "@/components/dashboard/ai-assistant";

export default function Assistant() {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t("AI Assistant")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("Get expert farming advice through our AI assistant")}</p>
      </div>
      
      <AIAssistant />
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">{t("Additional Help Resources")}</h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <span className="material-icons text-primary text-xl mr-2">menu_book</span>
              <h3 className="font-medium">{t("Knowledge Base")}</h3>
            </div>
            <p className="text-sm text-gray-600">{t("Access farming guides and best practices")}</p>
            <a href="#" className="mt-3 inline-block text-sm text-blue-500">{t("Browse articles")} →</a>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <span className="material-icons text-primary text-xl mr-2">groups</span>
              <h3 className="font-medium">{t("Farmer Community")}</h3>
            </div>
            <p className="text-sm text-gray-600">{t("Connect with other farmers and share knowledge")}</p>
            <a href="#" className="mt-3 inline-block text-sm text-blue-500">{t("Join discussions")} →</a>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <span className="material-icons text-primary text-xl mr-2">support_agent</span>
              <h3 className="font-medium">{t("Expert Support")}</h3>
            </div>
            <p className="text-sm text-gray-600">{t("Get help from agricultural experts")}</p>
            <a href="#" className="mt-3 inline-block text-sm text-blue-500">{t("Contact experts")} →</a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
