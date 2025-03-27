import { useQuery } from "@tanstack/react-query";
import { CropRecommendation } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sprout, AlertCircle, Droplets, CloudRain, Sun, ThermometerSun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CropRecommendationsTable() {
  const { t } = useLanguage();
  
  const { data: recommendations, isLoading, error } = useQuery<CropRecommendation[]>({
    queryKey: ['/api/crop-recommendations'],
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const getSuitabilityBadge = (suitability: string) => {
    const badges = {
      "Excellent": <Badge className="bg-green-500">{t("Excellent")}</Badge>,
      "Good": <Badge className="bg-green-400">{t("Good")}</Badge>,
      "Fair": <Badge className="bg-yellow-500">{t("Fair")}</Badge>,
      "Poor": <Badge className="bg-red-500">{t("Poor")}</Badge>,
      "Not Recommended": <Badge className="bg-gray-500">{t("Not Recommended")}</Badge>
    };
    
    return badges[suitability as keyof typeof badges] || <Badge>{suitability}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Crop Recommendations")}</CardTitle>
          <CardDescription>{t("Loading recommendations...")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
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
            {t("Error Loading Recommendations")}
          </CardTitle>
          <CardDescription>{t("Unable to load crop recommendations at this time.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} variant="outline">
            {t("Retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Crop Recommendations")}</CardTitle>
          <CardDescription>{t("Recommended crops based on your field conditions and market trends")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center space-y-4">
            <Sprout className="h-16 w-16 text-gray-400" />
            <p className="text-gray-500 text-center max-w-md">
              {t("No crop recommendations available yet. Add field information to receive personalized recommendations.")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Crop Recommendations")}</CardTitle>
        <CardDescription>{t("Recommended crops based on your soil, climate, and market conditions")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Crop Name")}</TableHead>
                <TableHead>{t("Variety")}</TableHead>
                <TableHead>{t("Suitability")}</TableHead>
                <TableHead>{t("Expected Yield")}</TableHead>
                <TableHead>{t("Market Potential")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((recommendation) => (
                <TableRow key={recommendation.id}>
                  <TableCell className="font-medium">{recommendation.cropName}</TableCell>
                  <TableCell>{recommendation.cropVariety || t("Any")}</TableCell>
                  <TableCell>{getSuitabilityBadge(recommendation.suitabilityScore >= 8 ? "Excellent" : recommendation.suitabilityScore >= 6 ? "Good" : recommendation.suitabilityScore >= 4 ? "Fair" : "Poor")}</TableCell>
                  <TableCell>{Math.round(recommendation.suitabilityScore * 150)} {t("kg/acre")}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {Array.from({length: Math.min(5, Math.max(1, Math.ceil(recommendation.suitabilityScore / 2)))}).map((_, i) => (
                        <span key={i} className="text-green-500">★</span>
                      ))}
                      {Array.from({length: 5 - Math.min(5, Math.max(1, Math.ceil(recommendation.suitabilityScore / 2)))}).map((_, i) => (
                        <span key={i} className="text-gray-300">★</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      {t("View Details")}
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