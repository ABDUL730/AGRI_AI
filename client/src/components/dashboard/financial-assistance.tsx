import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import type { FinancialAssistance } from "@shared/schema";

export function FinancialAssistanceComponent() {
  const { t } = useLanguage();
  
  const { data: options, isLoading, error } = useQuery<FinancialAssistance[]>({
    queryKey: ['/api/financial-assistance'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="material-icons text-red-500 text-3xl">error</span>
            <p className="mt-2 text-gray-600">{t("Failed to load financial assistance options")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-heading font-semibold text-gray-900">{t("Financial Assistance")}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("Available loans and government subsidies")}</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="space-y-5">
          {options && options.map((option) => {
            let bgColor = '';
            let icon = '';
            let textColor = '';
            
            if (option.type === 'Loan') {
              bgColor = 'bg-green-50';
              icon = 'check_circle';
              textColor = 'text-green-800';
            } else if (option.type === 'Subsidy') {
              bgColor = 'bg-blue-50';
              icon = 'info';
              textColor = 'text-blue-800';
            } else {
              bgColor = 'border border-gray-200';
              icon = '';
              textColor = 'text-gray-900';
            }
            
            return (
              <div key={option.id} className={`${bgColor} p-4 rounded-md`}>
                <div className="flex">
                  {icon && (
                    <div className="flex-shrink-0">
                      <span className={`material-icons ${
                        option.type === 'Loan' ? 'text-green-500' : 'text-blue-500'
                      }`}>{icon}</span>
                    </div>
                  )}
                  <div className={`${icon ? 'ml-3' : ''}`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`text-sm font-medium ${textColor}`}>{option.name}</h3>
                      {option.status === 'New Scheme' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {t("New Scheme")}
                        </span>
                      )}
                    </div>
                    <div className={`mt-2 text-sm ${
                      option.type === 'Loan' ? 'text-green-700' : 
                      option.type === 'Subsidy' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      <p>{option.description}</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        {option.type === 'Loan' || (option.type === 'Subsidy' && option.name === 'PM-KISAN Installment') ? (
                          <button type="button" className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                            option.type === 'Loan' ? 'bg-green-500 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-700'
                          } focus:outline-none`}>
                            {option.type === 'Loan' ? t("Apply Now") : t("Check Status")}
                          </button>
                        ) : (
                          <button type="button" className="text-sm text-blue-500 font-medium hover:text-blue-700">
                            {t("View eligibility criteria")} →
                          </button>
                        )}
                        
                        {option.processingTime && (
                          <span className={`text-xs ${
                            option.type === 'Loan' ? 'text-green-700' : 'text-blue-700'
                          }`}>
                            {t("Processing time")}: {option.processingTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {(!options || options.length === 0) && (
            <div className="text-center p-4">
              <p className="text-gray-500">{t("No financial assistance options available at this time.")}</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="#" className="font-medium text-accent hover:text-accent-dark">
            {t("View all financial options")} →
          </a>
        </div>
      </div>
    </Card>
  );
}

export default FinancialAssistanceComponent;
