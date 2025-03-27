import { useLanguage } from "@/hooks/use-language";

export function MobileApp() {
  const { t } = useLanguage();

  return (
    <div className="bg-primary rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-white">{t("Get the AgriAI Mobile App")}</h3>
            <p className="mt-2 text-sm text-green-100">
              {t("Access all features offline, receive instant alerts, and chat with the AI assistant on WhatsApp")}
            </p>
            <div className="mt-4 flex space-x-3">
              <a 
                href="#" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-100 focus:outline-none"
              >
                <span className="material-icons mr-2">android</span>
                Android
              </a>
              <a 
                href="#" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-100 focus:outline-none"
              >
                <span className="material-icons mr-2">apple</span>
                iOS
              </a>
            </div>
          </div>
          <div className="mt-5 sm:mt-0 sm:ml-6 hidden sm:block">
            <div className="float relative">
              <div className="bg-white p-2 rounded-lg shadow-md transform -rotate-6">
                <div className="h-48 w-auto object-cover rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-50 flex items-center justify-center">
                    <span className="material-icons text-6xl text-primary">phone_android</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileApp;
