import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import WeatherCard from "@/components/dashboard/weather-card";
import WeatherAdvisory from "@/components/dashboard/weather-advisory";
import ImportantUpdates from "@/components/dashboard/important-updates";
import CropRecommendations from "@/components/dashboard/crop-recommendations";
import CropStatus from "@/components/dashboard/crop-status";
import FinancialAssistanceComponent from "@/components/dashboard/financial-assistance";
import AIAssistant from "@/components/dashboard/ai-assistant";
import MarketConnect from "@/components/dashboard/market-connect";
import MobileApp from "@/components/dashboard/mobile-app";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { t } = useLanguage();
  const [location] = useState("Nagpur, Maharashtra");

  return (
    <MainLayout>
      {/* Page header */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{t("Farmer Dashboard")}</h1>
            <p className="mt-1 text-sm text-gray-600">{t("Welcome back! Here's your farm overview for today.")}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="inline-flex items-center">
              <span className="material-icons mr-2">add</span>
              {t("Add New Field")}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Weather and Alerts Section */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <WeatherCard location={location} />
        <WeatherAdvisory location={location} />
        <ImportantUpdates />
      </div>
      
      {/* AI Crop Recommendations */}
      <CropRecommendations />
      
      {/* Farm Management Section */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <CropStatus />
        <FinancialAssistanceComponent />
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
      
      {/* Market Connect Quick View */}
      <MarketConnect />
      
      {/* Mobile App Promotion */}
      <MobileApp />
    </MainLayout>
  );
}
