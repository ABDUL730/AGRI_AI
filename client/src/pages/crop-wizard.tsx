import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import CropRecommendationWizard from "@/components/crop-wizard/crop-recommendation-wizard";
import { Button } from "@/components/ui/button";

export function CropWizardPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="space-y-4 text-center">
          <span className="material-icons text-primary text-6xl">lock</span>
          <h1 className="text-2xl font-bold">{t("Authentication Required")}</h1>
          <p className="text-muted-foreground max-w-md">
            {t("You need to be logged in to access the Crop Recommendation Wizard")}
          </p>
          <Button 
            onClick={() => navigate("/login")} 
            className="mt-4"
          >
            {t("Go to Login")}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("Crop Recommendation Wizard")}</h1>
        <p className="text-muted-foreground mt-2 mb-6 max-w-2xl">
          {t("Answer a few questions about your field conditions and get AI-powered crop recommendations tailored to your specific farming situation")}
        </p>
      </div>
      
      <CropRecommendationWizard />
    </div>
  );
}

export default CropWizardPage;