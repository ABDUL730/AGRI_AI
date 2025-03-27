import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { getWeatherByLocation } from "@/lib/weather";

interface WeatherAdvisoryProps {
  location: string;
}

export function WeatherAdvisory({ location }: WeatherAdvisoryProps) {
  const { t } = useLanguage();
  
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: () => getWeatherByLocation(location)
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
            <p className="mt-2 text-gray-600">{t("Failed to load weather advisories")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <span className="flex-shrink-0 rounded-md bg-amber-100 p-2">
            <span className="material-icons text-amber-500">warning</span>
          </span>
          <h3 className="ml-3 text-lg font-heading font-semibold text-gray-900">{t("Weather Advisory")}</h3>
        </div>
        <div className="mt-4 space-y-4">
          {weather?.advisories?.map((advisory, index) => (
            <div key={index} className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-amber-500">
                <span className="material-icons text-sm">arrow_right</span>
              </span>
              <div className="ml-2">
                <p className="text-sm text-gray-700">{advisory}</p>
              </div>
            </div>
          ))}
          
          {(!weather?.advisories || weather.advisories.length === 0) && (
            <div className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-green-500">
                <span className="material-icons text-sm">check_circle</span>
              </span>
              <div className="ml-2">
                <p className="text-sm text-gray-700">{t("No weather advisories at this time.")}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="bg-gray-50 px-4 py-4">
        <div className="text-sm">
          <a href="#" className="font-medium text-accent hover:text-accent-dark">
            {t("View detailed irrigation advice")} →
          </a>
        </div>
      </div>
    </Card>
  );
}

export default WeatherAdvisory;
