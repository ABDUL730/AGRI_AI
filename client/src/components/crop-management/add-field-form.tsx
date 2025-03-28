import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertFieldSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Extend the insert schema with validations
const formSchema = insertFieldSchema.extend({
  name: z.string().min(2, {
    message: "Field name must be at least 2 characters.",
  }),
  size: z.coerce.number().positive({
    message: "Size must be a positive number.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  soilType: z.string().min(2, {
    message: "Soil type is required."
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFieldFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFieldForm({ isOpen, onClose }: AddFieldFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(1);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      size: 0,
      location: "",
      soilType: "",
      currentCrop: null,
      cropVariety: null,
      plantingDate: null,
      farmerId: 1 // Default farmerId for this application
    },
  });

  const fieldMutation = useMutation({
    mutationFn: (data: FormValues) => 
      apiRequest("POST", "/api/fields", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
      toast({
        title: t("Field Added"),
        description: t("Your field has been added successfully"),
      });
      form.reset();
      setStep(1);
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to add field. Please try again."),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (step === 1) {
      setStep(2);
    } else {
      fieldMutation.mutate(data);
    }
  };

  const soilTypes = [
    "Clay",
    "Sandy",
    "Silty",
    "Loamy",
    "Chalky",
    "Peaty",
    "Black Cotton Soil",
    "Red Soil",
    "Alluvial Soil"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? t("Add New Field") : t("Crop Information (Optional)")}</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? t("Fill in the details about your field to start tracking.")
              : t("Add information about your current or planned crop.")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 ? (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Field Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("East Field")} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("A name to identify this field")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Size (acres)")}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("The size of your field in acres")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Location")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Village or area name")} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("Where this field is located")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Soil Type")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select soil type")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {soilTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("The type of soil in your field")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="currentCrop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Current Crop (Optional)")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("e.g., Wheat, Rice, Cotton")} 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        {t("What crop is currently planted")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cropVariety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Crop Variety (Optional)")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("e.g., Basmati, Pusa-1121")} 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("The specific variety of your crop")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  {t("Back")}
                </Button>
              )}
              <Button 
                type="submit"
                disabled={fieldMutation.isPending}
              >
                {fieldMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {step === 1 
                  ? t("Next") 
                  : (fieldMutation.isPending ? t("Saving...") : t("Save Field"))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}