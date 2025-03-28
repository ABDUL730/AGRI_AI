import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { insertIrrigationHistorySchema, type InsertIrrigationHistory, type IrrigationSystem } from "@shared/schema";
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

interface IrrigationHistoryFormProps {
  fieldId: number;
  systems: IrrigationSystem[];
  onSuccess: () => void;
  onCancel: () => void;
}

// Extend the schema to add form validation rules
const formSchema = insertIrrigationHistorySchema.extend({
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date and time"
  }),
  duration: z.number().min(1, { message: "Duration must be at least 1 minute" }),
});

export function IrrigationHistoryForm({ fieldId, systems, onSuccess, onCancel }: IrrigationHistoryFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(systems[0]?.id || null);

  // Format current date and time for the form default values
  const now = new Date();
  const formattedDateTime = now.toISOString().slice(0, 16); // Format: 2023-01-01T12:00

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldId,
      systemId: systems[0]?.id || 0,
      startTime: formattedDateTime,
      duration: 30,
      waterUsed: 0,
      status: "Completed",
      notes: "",
      weatherConditions: {
        temperature: 25,
        humidity: 60,
        windSpeed: 5,
        precipitation: 0
      }
    },
  });

  // Create history record mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Convert startTime string to Date object
      const startTimeDate = new Date(values.startTime);
      
      // Calculate end time
      const endTimeDate = new Date(startTimeDate);
      endTimeDate.setMinutes(endTimeDate.getMinutes() + values.duration);
      
      // Format for submission
      const dataToSubmit = {
        ...values,
        startTime: startTimeDate.toISOString(),
        endTime: endTimeDate.toISOString(),
      };
      
      const response = await apiRequest("POST", "/api/irrigation-history", dataToSubmit);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record irrigation history");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("Success"),
        description: t("Irrigation history recorded successfully"),
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
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="systemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Irrigation System")}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const systemId = Number(value);
                  field.onChange(systemId);
                  setSelectedSystemId(systemId);
                }}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a system")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id.toString()}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Start Time")}</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Duration")} (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="360" 
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
            name="waterUsed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Water Used")} (liters)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
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
                    <SelectItem value="Completed">{t("Completed")}</SelectItem>
                    <SelectItem value="Interrupted">{t("Interrupted")}</SelectItem>
                    <SelectItem value="Failed">{t("Failed")}</SelectItem>
                    <SelectItem value="Partial">{t("Partial")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="weatherConditions.temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Weather Conditions")}</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel className="text-xs">{t("Temperature")} (°C)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                </div>
                
                <FormField
                  control={form.control}
                  name="weatherConditions.humidity"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs">{t("Humidity")} (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weatherConditions.windSpeed"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs">{t("Wind Speed")} (km/h)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weatherConditions.precipitation"
                  render={({ field }) => (
                    <div>
                      <FormLabel className="text-xs">{t("Precipitation")} (mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                    </div>
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Notes")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("Enter any observations or issues")} 
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
                {t("Saving...")}
              </>
            ) : (
              t("Save Record")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}