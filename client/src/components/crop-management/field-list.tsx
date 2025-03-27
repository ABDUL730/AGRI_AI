import { useQuery } from "@tanstack/react-query";
import { Field } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Droplets, Sprout, Sun } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface FieldListProps {
  onAddField: () => void;
  onViewField: (field: Field) => void;
}

export function FieldList({ onAddField, onViewField }: FieldListProps) {
  const { t } = useLanguage();
  
  const { data: fields, isLoading, error } = useQuery<Field[]>({ 
    queryKey: ['/api/fields'], 
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getCropHealth = (status: string | null) => {
    if (!status) return null;
    
    switch(status.toLowerCase()) {
      case 'excellent':
        return <Badge className="bg-green-500">{t("Excellent")}</Badge>;
      case 'good':
        return <Badge className="bg-green-400">{t("Good")}</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-500">{t("Fair")}</Badge>;
      case 'poor':
        return <Badge className="bg-red-500">{t("Poor")}</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getIrrigationStatus = (status: string | null) => {
    if (!status) return null;
    
    switch(status.toLowerCase()) {
      case 'optimal':
        return <Badge variant="outline" className="border-green-500 text-green-700">{t("Optimal")}</Badge>;
      case 'needs water':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">{t("Needs Water")}</Badge>;
      case 'overwatered':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">{t("Overwatered")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{t("Loading Fields...")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            {t("Error Loading Fields")}
          </CardTitle>
          <CardDescription>{t("Please check your connection and try again.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>
            {t("Retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{t("My Fields")}</span>
            <Button onClick={onAddField}>
              <Sprout className="mr-2 h-4 w-4" />
              {t("Add New Field")}
            </Button>
          </CardTitle>
          <CardDescription>{t("No fields found. Add your first field to start tracking crops.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center space-y-4">
            <Sprout className="h-16 w-16 text-gray-400" />
            <p className="text-gray-500 text-center max-w-md">
              {t("Add your first field to start tracking crops, monitor growth, and receive personalized recommendations.")}
            </p>
            <Button onClick={onAddField}>
              {t("Add First Field")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{t("My Fields")} ({fields.length})</span>
          <Button onClick={onAddField}>
            <Sprout className="mr-2 h-4 w-4" />
            {t("Add New Field")}
          </Button>
        </CardTitle>
        <CardDescription>{t("List of all your registered fields and their current status")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Field Name")}</TableHead>
                <TableHead>{t("Size")}</TableHead>
                <TableHead>{t("Current Crop")}</TableHead>
                <TableHead>{t("Growth")}</TableHead>
                <TableHead>{t("Health")}</TableHead>
                <TableHead>{t("Irrigation")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell>{field.size} {t("acres")}</TableCell>
                  <TableCell>{field.currentCrop || t("No crop")}</TableCell>
                  <TableCell>
                    {field.growthPercentage ? `${field.growthPercentage}%` : t("N/A")}
                  </TableCell>
                  <TableCell>{getCropHealth(field.healthStatus)}</TableCell>
                  <TableCell>{getIrrigationStatus(field.irrigationStatus)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewField(field)}
                    >
                      {t("View")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}