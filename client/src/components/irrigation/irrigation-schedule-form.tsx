import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { insertIrrigationScheduleSchema, type InsertIrrigationSchedule } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface IrrigationScheduleFormProps {
  systemId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Days of the week options
const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

// Extend the schema to add form validation rules
const formSchema = insertIrrigationScheduleSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  startTime: z.string().refine((time) => !isNaN(Date.parse(`2000-01-01T${time}`)), {
    message: "Please enter a valid time"
  }),
  daysOfWeek: z.array(z.string()).optional().nullable(),
  duration: z.number().min(1, { message: "Duration must be at least 1 minute" }),
});

export function IrrigationScheduleForm({ systemId, onSuccess, onCancel }: IrrigationScheduleFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAdjustForWeather, setIsAdjustForWeather] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("Daily");

  // Get current time for default value (rounded to nearest 30min)
  const now = new Date();
  const hours = now.getHours();
  const minutes = Math.round(now.getMinutes() / 30) * 30;
  const defaultTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemId,
      name: "",
      frequency: "Daily",
      startTime: defaultTime,
      duration: 30,
      daysOfWeek: ["monday", "wednesday", "friday"],
      waterAmount: null,
      isActive: true,
      adjustForWeather: false,
      status: "Scheduled",
    },
  });

  // Watch the frequency field to show/hide days of week
  const frequency = form.watch("frequency");

  // Create schedule mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Convert startTime string to Date object
      const startDate = new Date();
      const [hours, minutes] = values.startTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);

      // Calculate next run time based on frequency
      let nextRunTime = new Date(startDate);
      
      // For weekly, check if today is a selected day, otherwise find the next selected day
      if (values.frequency === "Weekly" && values.daysOfWeek && values.daysOfWeek.length > 0) {
        const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
        const selectedDays = values.daysOfWeek.map(day => dayMap[day as keyof typeof dayMap]).sort();
        
        // Find the next day that is selected
        let nextDayIndex = selectedDays.findIndex(day => day > today);
        if (nextDayIndex === -1) {
          // If no days after today, get the first day of next week
          nextDayIndex = 0;
          nextRunTime.setDate(nextRunTime.getDate() + (7 - today + selectedDays[0]));
        } else {
          nextRunTime.setDate(nextRunTime.getDate() + (selectedDays[nextDayIndex] - today));
        }
      }
      
      // Format for submission
      const dataToSubmit = {
        ...values,
        startTime: startDate.toISOString(),
        nextRunTime: nextRunTime.toISOString(),
      };
      
      const response = await apiRequest("POST", "/api/irrigation-schedules", dataToSubmit);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create irrigation schedule");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("Success"),
        description: t("Irrigation schedule created successfully"),
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
    // If not weekly, don't send days of week
    const finalValues = {
      ...values,
      daysOfWeek: values.frequency === "Weekly" ? values.daysOfWeek : null,
    };
    
    mutation.mutate(finalValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Schedule Name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("Enter a name for this schedule")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Frequency")}</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedFrequency(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select frequency")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Daily">{t("Daily")}</SelectItem>
                    <SelectItem value="Weekly">{t("Weekly")}</SelectItem>
                    <SelectItem value="BiWeekly">{t("Bi-Weekly")}</SelectItem>
                    <SelectItem value="Monthly">{t("Monthly")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Start Time")}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {frequency === "Weekly" && (
          <FormField
            control={form.control}
            name="daysOfWeek"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">{t("Days of Week")}</FormLabel>
                  <FormDescription>
                    {t("Select which days to run the irrigation")}
                  </FormDescription>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <FormField
                      key={day.id}
                      control={form.control}
                      name="daysOfWeek"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), day.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {t(day.label)}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-2 gap-4">
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
          
          <FormField
            control={form.control}
            name="waterAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Water Amount")} (liters, optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder={t("Auto calculate")}
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : Number(e.target.value);
                      field.onChange(value);
                    }} 
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t("Active")}</FormLabel>
                  <FormDescription>
                    {t("Schedule will run automatically")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="adjustForWeather"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>{t("Adjust for Weather")}</FormLabel>
                  <FormDescription>
                    {t("Skip if rain is forecasted")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setIsAdjustForWeather(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
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
              t("Create Schedule")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}