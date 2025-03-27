import { useLanguage } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SoilTypeSelectorStepProps {
  soilType: string;
  location: string;
  onChange: (field: string, value: string) => void;
}

export function SoilTypeSelectorStep({ soilType, location, onChange }: SoilTypeSelectorStepProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("Soil Type and Location")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Tell us about your soil type and field location to get accurate crop recommendations")}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="soilType">{t("Soil Type")}</Label>
          <Select 
            value={soilType}
            onValueChange={(value) => onChange("soilType", value)}
          >
            <SelectTrigger id="soilType">
              <SelectValue placeholder={t("Select soil type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clay">{t("Clay Soil")}</SelectItem>
              <SelectItem value="sandy">{t("Sandy Soil")}</SelectItem>
              <SelectItem value="loamy">{t("Loamy Soil")}</SelectItem>
              <SelectItem value="silty">{t("Silty Soil")}</SelectItem>
              <SelectItem value="peaty">{t("Peaty Soil")}</SelectItem>
              <SelectItem value="chalky">{t("Chalky Soil")}</SelectItem>
              <SelectItem value="red">{t("Red Soil")}</SelectItem>
              <SelectItem value="black">{t("Black Cotton Soil")}</SelectItem>
              <SelectItem value="alluvial">{t("Alluvial Soil")}</SelectItem>
              <SelectItem value="laterite">{t("Laterite Soil")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("The soil type affects water retention and nutrient availability")}
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="location">{t("Field Location")}</Label>
          <Input
            id="location"
            placeholder={t("e.g., Anantapur, AP")}
            value={location}
            onChange={(e) => onChange("location", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t("Location helps us analyze regional climate patterns")}
          </p>
        </div>
      </div>
      
      {soilType && (
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <span className="material-icons text-primary">info</span>
            </div>
            <div>
              <h4 className="text-sm font-medium">{t("Soil Type Information")}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {soilType === "clay" && t("Clay soil is heavy, nutrient-rich, and retains water but can become waterlogged. Good for crops requiring high nutrients.")}
                {soilType === "sandy" && t("Sandy soil drains quickly and warms up fast in spring but lacks nutrients. Good for root vegetables and drought-resistant crops.")}
                {soilType === "loamy" && t("Loamy soil is ideal for most crops with excellent nutrient retention and water drainage. A balanced mix of sand, silt, and clay.")}
                {soilType === "silty" && t("Silty soil retains moisture well and is rich in nutrients. It's excellent for most vegetable crops but may compact easily.")}
                {soilType === "peaty" && t("Peaty soil is dark, highly organic and retains water well. Acidic by nature, good for acid-loving plants.")}
                {soilType === "chalky" && t("Chalky soil is alkaline, drains quickly, and may lack some nutrients. Good for crops that prefer alkaline conditions.")}
                {soilType === "red" && t("Red soils are rich in iron but may have low nitrogen and phosphorus. Good for pulses and drought-resistant crops.")}
                {soilType === "black" && t("Black cotton soil has high clay content, swells when wet and shrinks when dry. Rich in calcium, magnesium and potassium.")}
                {soilType === "alluvial" && t("Alluvial soil is highly fertile, deposited by rivers and streams. Excellent for most crops including cereals and pulses.")}
                {soilType === "laterite" && t("Laterite soil is acidic and rich in iron and aluminum but low in organic matter. Good for tree crops and some cereals.")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SoilTypeSelectorStep;