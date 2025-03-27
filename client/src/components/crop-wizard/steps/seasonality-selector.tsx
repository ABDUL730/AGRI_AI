import { useLanguage } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SeasonalitySelectorStepProps {
  seasonality: string;
  onChange: (field: string, value: string) => void;
}

export function SeasonalitySelectorStep({ seasonality, onChange }: SeasonalitySelectorStepProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("Growing Season")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Select the season you're planning to grow your crops")}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="seasonality">{t("Select Growing Season")}</Label>
          <Select 
            value={seasonality}
            onValueChange={(value) => onChange("seasonality", value)}
          >
            <SelectTrigger id="seasonality">
              <SelectValue placeholder={t("Select season")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kharif">{t("Kharif (Monsoon) - June to October")}</SelectItem>
              <SelectItem value="rabi">{t("Rabi (Winter) - November to March")}</SelectItem>
              <SelectItem value="zaid">{t("Zaid (Summer) - March to June")}</SelectItem>
              <SelectItem value="perennial">{t("Perennial - Year-round cultivation")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("Different crops thrive in different seasons based on temperature, rainfall, and daylight")}
          </p>
        </div>
      </div>
      
      {seasonality && (
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <span className="material-icons text-primary">info</span>
            </div>
            <div>
              <h4 className="text-sm font-medium">{t("Season Information")}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {seasonality === "kharif" && t("Kharif crops are monsoon crops sown in June-July and harvested in September-October. They need warm, wet weather and include rice, maize, millets, cotton, and various pulses.")}
                {seasonality === "rabi" && t("Rabi crops are winter season crops sown in October-November and harvested in March-April. They require cool temperatures and include wheat, barley, mustard, and chickpeas.")}
                {seasonality === "zaid" && t("Zaid is the summer cropping season between Rabi and Kharif. Crops are sown in March-April and harvested by June. Common crops include cucumbers, pumpkins, and melons.")}
                {seasonality === "perennial" && t("Perennial crops remain in the soil for multiple years and include fruit trees, certain varieties of sugarcane, and some fodder crops.")}
              </p>
              
              {seasonality === "kharif" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <SeasonalCropTag cropName="Rice" />
                  <SeasonalCropTag cropName="Maize" />
                  <SeasonalCropTag cropName="Cotton" />
                  <SeasonalCropTag cropName="Sugarcane" />
                  <SeasonalCropTag cropName="Groundnut" />
                  <SeasonalCropTag cropName="Soybean" />
                </div>
              )}
              
              {seasonality === "rabi" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <SeasonalCropTag cropName="Wheat" />
                  <SeasonalCropTag cropName="Barley" />
                  <SeasonalCropTag cropName="Mustard" />
                  <SeasonalCropTag cropName="Chickpea" />
                  <SeasonalCropTag cropName="Peas" />
                  <SeasonalCropTag cropName="Lentils" />
                </div>
              )}
              
              {seasonality === "zaid" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <SeasonalCropTag cropName="Cucumber" />
                  <SeasonalCropTag cropName="Watermelon" />
                  <SeasonalCropTag cropName="Muskmelon" />
                  <SeasonalCropTag cropName="Bitter Gourd" />
                  <SeasonalCropTag cropName="Pumpkin" />
                  <SeasonalCropTag cropName="Gourds" />
                </div>
              )}
              
              {seasonality === "perennial" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <SeasonalCropTag cropName="Mango" />
                  <SeasonalCropTag cropName="Banana" />
                  <SeasonalCropTag cropName="Coconut" />
                  <SeasonalCropTag cropName="Papaya" />
                  <SeasonalCropTag cropName="Sugarcane" />
                  <SeasonalCropTag cropName="Guava" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeasonalCropTag({ cropName }: { cropName: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
      {cropName}
    </span>
  );
}

export default SeasonalitySelectorStep;