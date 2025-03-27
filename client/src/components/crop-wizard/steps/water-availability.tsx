import { useLanguage } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WaterAvailabilityStepProps {
  waterAvailability: string;
  onChange: (field: string, value: string) => void;
}

export function WaterAvailabilityStep({ waterAvailability, onChange }: WaterAvailabilityStepProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("Water Availability")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Indicate the water access for your field, which will help determine suitable crops")}
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>{t("Select Water Availability")}</Label>
          <RadioGroup
            value={waterAvailability}
            onValueChange={(value) => onChange("waterAvailability", value)}
            className="grid gap-4 pt-2"
          >
            <WaterOptionCard
              value="abundant"
              title={t("Abundant Water Supply")}
              description={t("Reliable irrigation system, well, river, or high rainfall area")}
              icon="water_full"
              selectedValue={waterAvailability}
            />
            
            <WaterOptionCard
              value="moderate"
              title={t("Moderate Water Supply")}
              description={t("Part-time irrigation or seasonal water sources available")}
              icon="water"
              selectedValue={waterAvailability}
            />
            
            <WaterOptionCard
              value="limited"
              title={t("Limited Water Supply")}
              description={t("Minimal irrigation, dependent on rainfall")}
              icon="water_medium"
              selectedValue={waterAvailability}
            />
            
            <WaterOptionCard
              value="scarce"
              title={t("Scarce Water Supply")}
              description={t("Drought-prone area, little to no irrigation available")}
              icon="water_low"
              selectedValue={waterAvailability}
            />
          </RadioGroup>
        </div>
      </div>
      
      {waterAvailability && (
        <div className="rounded-md bg-muted p-4">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <span className="material-icons text-primary">lightbulb</span>
            </div>
            <div>
              <h4 className="text-sm font-medium">{t("Water Conservation Tips")}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {waterAvailability === "abundant" && t("Even with abundant water, consider efficient irrigation methods like drip irrigation to prevent waterlogging and disease.")}
                {waterAvailability === "moderate" && t("For moderate water availability, mulching helps retain soil moisture. Consider crops with medium water requirements.")}
                {waterAvailability === "limited" && t("With limited water, focus on drought-resistant varieties and water-efficient irrigation. Apply organic matter to improve water retention.")}
                {waterAvailability === "scarce" && t("In water-scarce conditions, choose drought-tolerant crops like millets, select early maturing varieties, and use rainwater harvesting.")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface WaterOptionCardProps {
  value: string;
  title: string;
  description: string;
  icon: string;
  selectedValue: string;
}

function WaterOptionCard({ value, title, description, icon, selectedValue }: WaterOptionCardProps) {
  const isSelected = selectedValue === value;
  
  return (
    <label
      htmlFor={`water-${value}`}
      className={`flex items-start space-x-4 rounded-md border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
        isSelected ? "border-primary bg-primary/5" : "border-muted"
      }`}
    >
      <RadioGroupItem value={value} id={`water-${value}`} className="mt-1" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center">
          <span className={`material-icons mr-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
            {icon}
          </span>
          <p className="text-sm font-medium leading-none">{title}</p>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}

export default WaterAvailabilityStep;