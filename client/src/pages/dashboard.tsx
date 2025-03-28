import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { useAuth } from "@/hooks/use-auth";
import { useBuyer } from "@/hooks/use-buyer";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, MessageCircle, Store, User, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

// Buyer dashboard component
function BuyerDashboard() {
  const { t } = useLanguage();
  const { buyer } = useBuyer();
  const [, navigate] = useLocation();
  const [location] = useState("Anantapur, AP");

  // Fetch crop listings
  const { data: cropListings, isLoading: isListingsLoading } = useQuery({
    queryKey: ["/api/crop-listings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/crop-listings");
      return await res.json();
    }
  });

  // Fetch purchase requests
  const { data: purchaseRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["/api/purchase-requests/buyer"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/purchase-requests/buyer");
      return await res.json();
    }
  });

  // Fetch unread messages count
  const { data: unreadMessages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["/api/direct-messages/unread/buyer"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/direct-messages/unread/buyer");
      return await res.json();
    }
  });

  return (
    <MainLayout>
      {/* Page header */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{t("Buyer Dashboard")}</h1>
            <p className="mt-1 text-sm text-gray-600">{t(`Welcome back, ${buyer?.fullName || ""}! Here's your market overview for today.`)}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="inline-flex items-center" onClick={() => navigate("/market")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("Browse Marketplace")}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        {/* Available Crops */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{t("Available Crops")}</CardTitle>
            <CardDescription>{t("Crops currently available for purchase")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isListingsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                cropListings?.length || 0
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs h-8 px-2" onClick={() => navigate("/market")}>
              {t("View All")}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Active Purchase Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{t("Purchase Requests")}</CardTitle>
            <CardDescription>{t("Your active purchase requests")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isRequestsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                purchaseRequests?.length || 0
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs h-8 px-2" onClick={() => navigate("/market")}>
              {t("Manage Requests")}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Unread Messages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{t("Unread Messages")}</CardTitle>
            <CardDescription>{t("Messages from farmers")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isMessagesLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                unreadMessages?.count || 0
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs h-8 px-2" onClick={() => navigate("/contact-farmers")}>
              {t("Go to Messages")}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Current Market Trends */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("Current Market Trends")}</h2>
        <MarketConnect />
      </div>
      
      {/* Contact Farmers */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("Connect with Farmers")}</CardTitle>
                <CardDescription>
                  {t("Contact farmers directly to inquire about their produce or negotiate deals")}
                </CardDescription>
              </div>
              <MessageCircle className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-2">{t("Why Connect Directly?")}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2 text-sm">check_circle</span>
                    <span>{t("Eliminate middlemen for better prices")}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2 text-sm">check_circle</span>
                    <span>{t("Direct quality assurance and verification")}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2 text-sm">check_circle</span>
                    <span>{t("Plan purchases ahead of harvest time")}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">{t("Getting Started")}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="material-icons text-primary mr-2 text-sm">looks_one</span>
                    <span>{t("Browse farmers in your target region")}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-primary mr-2 text-sm">looks_two</span>
                    <span>{t("Start a conversation about your requirements")}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-primary mr-2 text-sm">looks_3</span>
                    <span>{t("Negotiate prices and logistics")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/contact-farmers")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("Contact Farmers")}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Weather and Alerts Section */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <WeatherCard location={location} />
        <ImportantUpdates />
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
      
      {/* Mobile App Promotion */}
      <MobileApp />
    </MainLayout>
  );
}

// Farmer dashboard component
function FarmerDashboard() {
  const { t } = useLanguage();
  const [location] = useState("Anantapur, AP");

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

// Main dashboard component that decides which dashboard to render
export default function Dashboard() {
  const { user } = useAuth();
  const { buyer } = useBuyer();
  
  // Check if the user is a buyer
  if (buyer) {
    return <BuyerDashboard />;
  }
  
  // Otherwise, show the farmer dashboard
  return <FarmerDashboard />;
}
