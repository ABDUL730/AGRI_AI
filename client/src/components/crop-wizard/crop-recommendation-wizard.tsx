import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";

// Step components
import { SoilTypeSelectorStep } from "./steps/soil-type-selector";
import { SeasonalitySelectorStep } from "./steps/seasonality-selector";
import { WaterAvailabilityStep } from "./steps/water-availability";
import { PreviousCropsStep } from "./steps/previous-crops";
import { ResultsStep } from "./steps/results";

export function CropRecommendationWizard() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    soilType: "",
    location: "",
    seasonality: "",
    waterAvailability: "",
    previousCrops: ""
  });
  const [recommendations, setRecommendations] = useState<{
    recommendedCrops: { crop: string; confidence: number; reasoning: string }[];
    generalAdvice: string;
  } | null>(null);
  
  const totalSteps = 5;
  
  const cropRecommendationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/crop-wizard/recommend', data);
      return response;
    },
    onSuccess: (data) => {
      setRecommendations(data);
      setCurrentStep(5); // Move to results step
    }
  });
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNext = () => {
    if (currentStep === 4) {
      // Submit data to API before going to results
      cropRecommendationMutation.mutate(formData);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleStartOver = () => {
    setCurrentStep(1);
    setFormData({
      soilType: "",
      location: "",
      seasonality: "",
      waterAvailability: "",
      previousCrops: ""
    });
    setRecommendations(null);
  };
  
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return !!formData.soilType && !!formData.location;
      case 2:
        return !!formData.seasonality;
      case 3:
        return !!formData.waterAvailability;
      case 4:
        return true; // Previous crops can be optional
      default:
        return false;
    }
  };
  
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mt-6 mb-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("Interactive Crop Recommendation Wizard")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("Complete the steps below to get AI-powered crop recommendations for your field")}
          </p>
          <Breadcrumb className="mt-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => currentStep > 1 && setCurrentStep(1)}
                  className={currentStep >= 1 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                >
                  {t("Soil")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => currentStep > 2 && setCurrentStep(2)}
                  className={currentStep >= 2 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                >
                  {t("Season")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => currentStep > 3 && setCurrentStep(3)}
                  className={currentStep >= 3 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                >
                  {t("Water")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => currentStep > 4 && setCurrentStep(4)}
                  className={currentStep >= 4 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                >
                  {t("History")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  className={currentStep >= 5 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
                >
                  {t("Results")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent>
          {currentStep === 1 && (
            <SoilTypeSelectorStep 
              soilType={formData.soilType}
              location={formData.location}
              onChange={handleChange}
            />
          )}
          
          {currentStep === 2 && (
            <SeasonalitySelectorStep 
              seasonality={formData.seasonality}
              onChange={handleChange}
            />
          )}
          
          {currentStep === 3 && (
            <WaterAvailabilityStep 
              waterAvailability={formData.waterAvailability}
              onChange={handleChange}
            />
          )}
          
          {currentStep === 4 && (
            <PreviousCropsStep 
              previousCrops={formData.previousCrops}
              onChange={handleChange}
            />
          )}
          
          {currentStep === 5 && (
            <ResultsStep 
              recommendations={recommendations}
              formData={formData}
              isLoading={cropRecommendationMutation.isPending}
              error={cropRecommendationMutation.error}
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 1 && currentStep < 5 && (
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <span className="material-icons mr-2">arrow_back</span>
              {t("Back")}
            </Button>
          )}
          
          {currentStep === 5 && (
            <Button
              variant="outline"
              onClick={handleStartOver}
            >
              <span className="material-icons mr-2">refresh</span>
              {t("Start Over")}
            </Button>
          )}
          
          {currentStep < 5 && (
            <Button
              onClick={handleNext}
              disabled={!isStepComplete() || (currentStep === 4 && cropRecommendationMutation.isPending)}
              className="ml-auto"
            >
              {currentStep === 4 ? (
                cropRecommendationMutation.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2">loop</span>
                    {t("Processing...")}
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">auto_awesome</span>
                    {t("Get Recommendations")}
                  </>
                )
              ) : (
                <>
                  {t("Next")}
                  <span className="material-icons ml-2">arrow_forward</span>
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default CropRecommendationWizard;