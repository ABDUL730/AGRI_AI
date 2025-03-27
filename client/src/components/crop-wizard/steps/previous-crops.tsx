import { useLanguage } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PreviousCropsStepProps {
  previousCrops: string;
  onChange: (field: string, value: string) => void;
}

export function PreviousCropsStep({ previousCrops, onChange }: PreviousCropsStepProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("Previous Crops")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Tell us about the crops you've grown previously in this field (Optional)")}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="previousCrops">{t("Previous Crop History")}</Label>
          <Textarea
            id="previousCrops"
            placeholder={t("e.g., Last season I grew rice, before that I had cotton. The yield was good for rice but cotton suffered from pests.")}
            value={previousCrops}
            onChange={(e) => onChange("previousCrops", e.target.value)}
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            {t("Sharing your past crop experience helps us provide better recommendations for crop rotation")}
          </p>
        </div>
      </div>
      
      <div className="rounded-md bg-muted p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">
            <span className="material-icons text-primary">sync</span>
          </div>
          <div>
            <h4 className="text-sm font-medium">{t("Crop Rotation Benefits")}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Proper crop rotation can:")}
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
              <li>{t("Break pest and disease cycles")}</li>
              <li>{t("Improve soil structure and fertility")}</li>
              <li>{t("Reduce soil erosion and nutrient depletion")}</li>
              <li>{t("Increase biodiversity in your field")}</li>
              <li>{t("Optimize water and nutrient usage")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviousCropsStep;