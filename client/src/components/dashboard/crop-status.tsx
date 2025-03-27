import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import type { Field } from "@shared/schema";

export function CropStatus() {
  const { t } = useLanguage();
  
  const { data: fields, isLoading, error } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
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
            <p className="mt-2 text-gray-600">{t("Failed to load crop status")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the first field for display (in a real app, you might want to allow selection)
  const field = fields && fields.length > 0 ? fields[0] : null;

  if (!field) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="material-icons text-gray-400 text-3xl">agriculture</span>
            <p className="mt-2 text-gray-600">{t("No fields found. Add a field to see crop status.")}</p>
            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-green-700">
              {t("Add New Field")}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format the planting date
  const plantingDate = field.plantingDate ? new Date(field.plantingDate) : null;
  const daysSincePlanting = plantingDate ? 
    Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 3600 * 24)) : 
    null;
    
  // Format last irrigation date
  const lastIrrigationDate = field.lastIrrigationDate ? new Date(field.lastIrrigationDate) : null;
  const daysSinceIrrigation = lastIrrigationDate ? 
    Math.floor((new Date().getTime() - lastIrrigationDate.getTime()) / (1000 * 3600 * 24)) : 
    null;

  return (
    <Card>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg leading-6 font-heading font-semibold text-gray-900">{t("Current Crop Status")}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{t("Based on satellite and IoT sensor data")}</p>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-500">
          <span className="material-icons">refresh</span>
        </button>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t("Field Name")}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {field.name} ({field.size} acres)
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t("Current Crop")}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {field.currentCrop} {field.cropVariety ? `(${field.cropVariety})` : ''}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t("Growth Stage")}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${field.growthPercentage || 0}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {field.growthPercentage || 0}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {field.currentGrowthStage} {daysSincePlanting !== null && daysSincePlanting !== undefined ? 
                  `(${daysSincePlanting} ${t("days since planting")})` : ''}
              </p>
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t("Health Status")}</dt>
            <dd className="mt-1 text-sm text-green-500 font-medium sm:mt-0 sm:col-span-2">
              {field.healthStatus || t("Unknown")}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t("Irrigation Status")}</dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <span className="material-icons text-accent mr-1">water_drop</span>
                <span className="text-sm text-gray-900">{field.irrigationStatus || t("Unknown")}</span>
              </div>
              {daysSinceIrrigation !== null && daysSinceIrrigation !== undefined && (
                <p className="mt-1 text-xs text-gray-500">
                  {t("Last irrigation")}: {daysSinceIrrigation} {t("days ago")}
                </p>
              )}
            </dd>
          </div>
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="#" className="font-medium text-accent hover:text-accent-dark">
            {t("View detailed crop analytics")} →
          </a>
        </div>
      </div>
    </Card>
  );
}

export default CropStatus;
