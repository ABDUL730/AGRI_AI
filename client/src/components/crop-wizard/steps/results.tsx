import { useLanguage } from "@/hooks/use-language";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsStepProps {
  recommendations: {
    recommendedCrops: { crop: string; confidence: number; reasoning: string }[];
    generalAdvice: string;
  } | null;
  formData: {
    soilType: string;
    location: string;
    seasonality: string;
    waterAvailability: string;
    previousCrops: string;
  };
  isLoading: boolean;
  error: Error | null;
}

export function ResultsStep({ recommendations, formData, isLoading, error }: ResultsStepProps) {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t("Getting AI Recommendations...")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("Our AI is analyzing your field conditions to provide personalized crop recommendations")}
          </p>
        </div>
        
        <div className="space-y-8 py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <span className="material-icons mr-2">error</span>
        <AlertTitle>{t("Error Getting Recommendations")}</AlertTitle>
        <AlertDescription>
          {t("Unable to generate crop recommendations. Please try again later.")}
          <div className="mt-2 text-xs">
            {error.message}
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!recommendations) {
    return (
      <Alert>
        <span className="material-icons mr-2">info</span>
        <AlertTitle>{t("No Recommendations Available")}</AlertTitle>
        <AlertDescription>
          {t("Please complete the previous steps to get personalized crop recommendations.")}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("Your Personalized Crop Recommendations")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Based on your soil type, location, season, and water availability")}
        </p>
      </div>
      
      <div className="rounded-md bg-muted p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            <span className="material-icons text-primary">tips_and_updates</span>
          </div>
          <div>
            <h4 className="text-sm font-medium">{t("Expert Advice")}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {recommendations.generalAdvice}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium">{t("Recommended Crops")}</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.recommendedCrops.map((crop, index) => (
            <Card key={index} className={index === 0 ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  {index === 0 && (
                    <span className="material-icons text-primary mr-2">
                      verified
                    </span>
                  )}
                  {crop.crop}
                </CardTitle>
                <CardDescription>
                  {t("Confidence")}: {Math.round(crop.confidence * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={crop.confidence * 100} className="h-2" />
                <p className="text-sm text-muted-foreground mt-4">
                  {crop.reasoning}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Your Input Summary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">{t("Soil Type")}:</span>
              <span className="text-sm col-span-2">{formData.soilType}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">{t("Location")}:</span>
              <span className="text-sm col-span-2">{formData.location}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">{t("Season")}:</span>
              <span className="text-sm col-span-2">{formData.seasonality}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sm font-medium">{t("Water Availability")}:</span>
              <span className="text-sm col-span-2">{formData.waterAvailability}</span>
            </div>
            {formData.previousCrops && (
              <div className="grid grid-cols-3 gap-1">
                <span className="text-sm font-medium">{t("Previous Crops")}:</span>
                <span className="text-sm col-span-2">{formData.previousCrops}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 pt-2">
          <p className="text-xs text-muted-foreground">
            {t("Recommendations are generated based on the information provided and local agricultural knowledge. Always consult with local agricultural experts before making significant changes to your farming practices.")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ResultsStep;