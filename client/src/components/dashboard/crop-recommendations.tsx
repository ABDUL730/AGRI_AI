import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import type { CropRecommendation } from "@shared/schema";

export function CropRecommendations() {
  const { t } = useLanguage();
  
  const { data: recommendations, isLoading, error } = useQuery<CropRecommendation[]>({
    queryKey: ['/api/crop-recommendations'],
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">{t("AI Crop Recommendations")}</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="animate-pulse p-6">
            <div className="flex space-x-4">
              <div className="rounded-md bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">{t("AI Crop Recommendations")}</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
          <div className="text-center">
            <span className="material-icons text-red-500 text-3xl">error</span>
            <p className="mt-2 text-gray-600">{t("Failed to load crop recommendations")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render stars based on suitability score
  const renderSuitabilityStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-icons ${i <= score ? 'text-amber-500' : 'text-gray-300'}`}>
          star
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">{t("AI Crop Recommendations")}</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {recommendations && recommendations.map((crop) => (
            <li key={crop.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-green-100 flex items-center justify-center">
                      <span className="material-icons text-primary">agriculture</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {crop.cropName} ({crop.cropVariety})
                      </h3>
                      <div className="mt-1 flex items-center">
                        <span className="text-sm text-gray-500">{t("Suitability")}:</span>
                        <div className="ml-2 flex items-center">
                          {renderSuitabilityStars(crop.suitabilityScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="px-3 py-1 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white">
                      {t("Details")}
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <div className="text-sm text-gray-700">
                      <p>{crop.description}</p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="material-icons mr-1 text-sm">schedule</span>
                      <p>{crop.daysToMaturity} {t("days to maturity")}</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-gray-50 rounded-md p-3">
                      <h4 className="text-sm font-medium text-gray-700">{t("Market Analysis")}</h4>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm text-gray-600">e-NAM {t("Price")}:</div>
                        <div className="font-medium text-amber-500">₹{crop.eNamPrice.toLocaleString()}/quintal</div>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <div className="text-sm text-gray-600">{t("Trend")}:</div>
                        <div className="flex items-center text-green-500">
                          <span className="material-icons text-sm">trending_up</span>
                          <span className="ml-1 text-sm">{crop.priceTrend}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          
          {(!recommendations || recommendations.length === 0) && (
            <li>
              <div className="px-4 py-6 text-center">
                <p className="text-gray-500">{t("No crop recommendations available at this time.")}</p>
                <p className="text-sm text-gray-400 mt-1">{t("Complete your soil profile to get personalized recommendations.")}</p>
              </div>
            </li>
          )}
        </ul>
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              {t("Previous")}
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              {t("Next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropRecommendations;
