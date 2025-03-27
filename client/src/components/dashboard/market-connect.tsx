import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import type { MarketData } from "@shared/schema";

export function MarketConnect() {
  const { t } = useLanguage();
  
  const { data: marketData, isLoading, error } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-heading font-semibold text-gray-900">{t("Market Connect")}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("Current prices from e-NAM and local markets")}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-heading font-semibold text-gray-900">{t("Market Connect")}</h3>
        </div>
        <div className="p-6 text-center">
          <span className="material-icons text-red-500 text-3xl">error</span>
          <p className="mt-2 text-gray-600">{t("Failed to load market data")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-heading font-semibold text-gray-900">{t("Market Connect")}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("Current prices from e-NAM and local markets")}</p>
        </div>
        <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
          <span className="material-icons mr-2">shopping_cart</span>
          {t("Visit e-NAM Portal")}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("Commodity")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("Market")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("Current Price")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("Change")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("Demand")}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("Action")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketData && marketData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">spa</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.commodity}</div>
                      <div className="text-xs text-gray-500">{t("Grade")}: {item.grade}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.market}</div>
                  <div className="text-xs text-gray-500">{item.state}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{item.currentPrice.toLocaleString()}/quintal</div>
                  <div className="text-xs text-gray-500">MSP: ₹{item.msp.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="material-icons text-xs mr-1">arrow_upward</span>
                    {item.priceChange}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${item.demandPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-700">{item.demand}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-blue-500 hover:text-blue-700">{t("Details")}</a>
                </td>
              </tr>
            ))}
            
            {(!marketData || marketData.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {t("No market data available at this time.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="#" className="font-medium text-blue-500 hover:text-blue-700">
            {t("View all commodities and market prices")} →
          </a>
        </div>
      </div>
    </div>
  );
}

export default MarketConnect;
