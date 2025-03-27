import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Field } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Calendar,
  Droplet,
  Leaf,
  MapPin,
  Maximize,
  Ruler,
  ScanLine,
  Sprout
} from "lucide-react";

interface FieldDetailProps {
  fieldId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FieldDetail({ fieldId, isOpen, onClose }: FieldDetailProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: field, isLoading, error } = useQuery<Field>({
    queryKey: ['/api/fields', fieldId],
    enabled: !!fieldId && isOpen,
    retry: false
  });

  if (!isOpen || !fieldId) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return t("Not set");
    return new Date(date).toLocaleDateString();
  };

  const renderGrowthStage = (stage: string | null) => {
    if (!stage) return t("Not available");
    
    const stageColorMap: Record<string, string> = {
      "seedling": "bg-green-100 text-green-800",
      "vegetative": "bg-green-200 text-green-800",
      "flowering": "bg-yellow-100 text-yellow-800",
      "fruiting": "bg-orange-100 text-orange-800",
      "mature": "bg-red-100 text-red-800",
      "harvested": "bg-gray-100 text-gray-800"
    };
    
    const color = stageColorMap[stage.toLowerCase()] || "bg-blue-100 text-blue-800";
    
    return (
      <Badge className={color} variant="outline">
        {t(stage)}
      </Badge>
    );
  };

  const renderHealthStatus = (status: string | null) => {
    if (!status) return t("Not available");
    
    const statusColorMap: Record<string, string> = {
      "excellent": "bg-green-500",
      "good": "bg-green-400",
      "fair": "bg-yellow-500",
      "poor": "bg-red-500"
    };
    
    const color = statusColorMap[status.toLowerCase()] || "bg-gray-500";
    
    return <Badge className={color}>{t(status)}</Badge>;
  };

  const renderIrrigationStatus = (status: string | null) => {
    if (!status) return t("Not available");
    
    const statusColorMap: Record<string, { border: string, text: string }> = {
      "optimal": { border: "border-green-500", text: "text-green-700" },
      "needs water": { border: "border-amber-500", text: "text-amber-700" },
      "overwatered": { border: "border-blue-500", text: "text-blue-700" }
    };
    
    const style = statusColorMap[status.toLowerCase()] || { border: "border-gray-500", text: "text-gray-700" };
    
    return <Badge variant="outline" className={`${style.border} ${style.text}`}>{t(status)}</Badge>;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{t("Loading Field Data...")}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !field) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {t("Error Loading Field Data")}
            </DialogTitle>
            <DialogDescription>
              {t("Unable to load field information. Please try again.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>{t("Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field.name}</DialogTitle>
          <DialogDescription className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {field.location}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
            <TabsTrigger value="crop">{t("Crop Details")}</TabsTrigger>
            <TabsTrigger value="soil">{t("Soil & Irrigation")}</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("Field Size")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Maximize className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-2xl font-bold">{field.size}</span>
                    <span className="ml-1">{t("acres")}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("Soil Type")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ScanLine className="h-5 w-5 mr-2 text-amber-600" />
                    <span className="text-lg font-semibold">{t(field.soilType)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("Current Crop")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    <span className="text-lg font-semibold">
                      {field.currentCrop ? t(field.currentCrop) : t("No crop planted")}
                    </span>
                  </div>
                  {field.cropVariety && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {t("Variety")}: {field.cropVariety}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("Planting Date")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-lg font-semibold">
                      {field.plantingDate ? formatDate(field.plantingDate) : t("Not planted")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{t("Growth Status")}</CardTitle>
                <CardDescription>
                  {t("Current state of your crop growth and health")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Sprout className="h-5 w-5 mr-2 text-green-600" />
                      <span className="font-medium">{t("Growth Stage")}:</span>
                    </div>
                    <div>
                      {renderGrowthStage(field.currentGrowthStage)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 mr-2 text-indigo-600" />
                      <span className="font-medium">{t("Growth Progress")}:</span>
                    </div>
                    <div>
                      {field.growthPercentage ? `${field.growthPercentage}%` : t("No data")}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Leaf className="h-5 w-5 mr-2 text-emerald-600" />
                      <span className="font-medium">{t("Plant Health")}:</span>
                    </div>
                    <div>
                      {renderHealthStatus(field.healthStatus)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Droplet className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="font-medium">{t("Irrigation Status")}:</span>
                    </div>
                    <div>
                      {renderIrrigationStatus(field.irrigationStatus)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Crop Details Tab */}
          <TabsContent value="crop">
            <Card>
              <CardHeader>
                <CardTitle>{t("Crop Information")}</CardTitle>
                <CardDescription>
                  {field.currentCrop 
                    ? t("Details about your current crop")
                    : t("No crop information available")}
                </CardDescription>
              </CardHeader>
              {field.currentCrop ? (
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          {t("Crop Type")}
                        </h3>
                        <p className="font-semibold">{field.currentCrop}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          {t("Variety")}
                        </h3>
                        <p className="font-semibold">{field.cropVariety || t("Not specified")}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          {t("Planting Date")}
                        </h3>
                        <p className="font-semibold">{formatDate(field.plantingDate)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          {t("Last Irrigation")}
                        </h3>
                        <p className="font-semibold">{formatDate(field.lastIrrigationDate)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        {t("Growth Progress")}
                      </h3>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full" 
                          style={{ width: `${field.growthPercentage || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>{t("Planted")}</span>
                        <span>{field.growthPercentage || 0}%</span>
                        <span>{t("Harvest Ready")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <Sprout className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-muted-foreground text-center max-w-md">
                      {t("No crop is currently planted in this field. Add crop information to track growth and receive recommendations.")}
                    </p>
                    <Button variant="outline" className="mt-4">
                      {t("Add Crop Information")}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
          
          {/* Soil & Irrigation Tab */}
          <TabsContent value="soil">
            <Card>
              <CardHeader>
                <CardTitle>{t("Soil Information")}</CardTitle>
                <CardDescription>
                  {t("Soil characteristics and recommendations")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("Soil Type")}
                    </h3>
                    <p className="font-semibold">{t(field.soilType)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("Characteristics")}
                    </h3>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      {t("Soil type characteristics will be displayed here based on soil tests and analysis.")}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      {t("Irrigation Status")}
                    </h3>
                    <div className="flex items-center">
                      <Droplet className="h-5 w-5 mr-2 text-blue-600" />
                      {renderIrrigationStatus(field.irrigationStatus)}
                    </div>
                    <p className="text-sm mt-2">
                      {t("Last irrigation")}: {formatDate(field.lastIrrigationDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  {t("Schedule Soil Testing")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>{t("Close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}