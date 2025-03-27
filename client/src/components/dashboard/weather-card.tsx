import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { getWeatherByLocation } from "@/lib/weather";

interface WeatherCardProps {
  location: string;
}

export function WeatherCard({ location }: WeatherCardProps) {
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
            <p className="mt-2 text-gray-600">{t("Failed to load weather data")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-heading font-semibold text-gray-900">{t("Today's Weather")}</h3>
            <p className="text-sm text-gray-500">{location}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{weather?.temperature}°C</div>
            <p className="text-sm text-gray-500">{weather?.condition}</p>
          </div>
        </div>
        
        <div className="mt-5 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="material-icons text-accent">opacity</span>
              <p className="text-xs mt-1 text-gray-700">{t("Humidity")}</p>
              <p className="font-semibold">{weather?.humidity}%</p>
            </div>
            <div>
              <span className="material-icons text-accent">air</span>
              <p className="text-xs mt-1 text-gray-700">{t("Wind")}</p>
              <p className="font-semibold">{weather?.windSpeed} km/h</p>
            </div>
            <div>
              <span className="material-icons text-accent">water_drop</span>
              <p className="text-xs mt-1 text-gray-700">{t("Rain")}</p>
              <p className="font-semibold">{weather?.rainChance}%</p>
            </div>
          </div>
        </div>
      </CardContent>
      <div className="bg-gray-50 px-4 py-4">
        <div className="text-sm">
          <a href="#" className="font-medium text-accent hover:text-accent-dark">
            {t("View 7-day forecast")} →
          </a>
        </div>
      </div>
    </Card>
  );
}

export default WeatherCard;
