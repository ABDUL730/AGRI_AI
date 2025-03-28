import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { insertIrrigationSystemSchema, type InsertIrrigationSystem } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface IrrigationSystemFormProps {
  fieldId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Extend the schema to add form validation rules
const formSchema = insertIrrigationSystemSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  installationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date"
  }),
});

export function IrrigationSystemForm({ fieldId, onSuccess, onCancel }: IrrigationSystemFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSmartEnabled, setIsSmartEnabled] = useState(false);

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldId,
      name: "",
      type: "Drip",
      waterSource: "Well",
      status: "Active",
      coverageArea: 1,
      installationDate: new Date().toISOString().split("T")[0],
      description: "",
      isSmartEnabled: false,
      efficiency: 90,
    },
  });

  // Create system mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/irrigation-systems", values);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create irrigation system");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("Success"),
        description: t("Irrigation system created successfully"),
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert installation date string to ISO format
    const installDate = new Date(values.installationDate);
    
    // Handle smart system data
    const dataToSubmit = {
      ...values,
      installationDate: installDate.toISOString(),
      sensorData: isSmartEnabled ? {
        moisture: null,
        temperature: null,
        humidity: null,
        batteryLevel: 100,
      } : null,
    };
    
    mutation.mutate(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("System Name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Enter a name for this system")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("System Type")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select a system type")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Drip">{t("Drip Irrigation")}</SelectItem>
                    <SelectItem value="Sprinkler">{t("Sprinkler System")}</SelectItem>
                    <SelectItem value="Center Pivot">{t("Center Pivot")}</SelectItem>
                    <SelectItem value="Flood">{t("Flood Irrigation")}</SelectItem>
                    <SelectItem value="Manual">{t("Manual Irrigation")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="waterSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Water Source")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select a water source")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Well">{t("Well")}</SelectItem>
                    <SelectItem value="Canal">{t("Canal")}</SelectItem>
                    <SelectItem value="Reservoir">{t("Reservoir")}</SelectItem>
                    <SelectItem value="River">{t("River")}</SelectItem>
                    <SelectItem value="Municipal">{t("Municipal Supply")}</SelectItem>
                    <SelectItem value="Rainwater">{t("Rainwater Harvesting")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coverageArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Coverage Area")} (acres)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="efficiency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Efficiency")} (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="100" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="installationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Installation Date")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Status")}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select status")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">{t("Active")}</SelectItem>
                    <SelectItem value="Inactive">{t("Inactive")}</SelectItem>
                    <SelectItem value="Maintenance">{t("Maintenance")}</SelectItem>
                    <SelectItem value="Offline">{t("Offline")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="isSmartEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t("Smart System")}</FormLabel>
                <FormDescription>
                  {t("Enable for IoT sensors and automation")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsSmartEnabled(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Description")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("Enter any additional details about this system")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            {t("Cancel")}
          </Button>
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Creating...")}
              </>
            ) : (
              t("Create System")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}