import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for form values
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketUpdatesEnabled, setMarketUpdatesEnabled] = useState(true);
  const [weatherAlertsEnabled, setWeatherAlertsEnabled] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const handleSavePreferences = () => {
    // In a real app, save to backend
    toast({
      title: t("Settings saved"),
      description: t("Your preferences have been updated."),
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">{t("Settings")}</h1>
        
        <Tabs defaultValue="preferences">
          <TabsList className="mb-4">
            <TabsTrigger value="preferences">{t("Preferences")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("Notifications")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("Appearance")}</TabsTrigger>
            <TabsTrigger value="account">{t("Account")}</TabsTrigger>
          </TabsList>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>{t("App Preferences")}</CardTitle>
                <CardDescription>{t("Manage your app experience and regional settings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("Language")}</Label>
                    <select 
                      id="language"
                      className="w-full p-2 border rounded-md"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                    >
                      <option value="english">English</option>
                      <option value="hindi">हिन्दी (Hindi)</option>
                      <option value="tamil">தமிழ் (Tamil)</option>
                      <option value="telugu">తెలుగు (Telugu)</option>
                      <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="offline">{t("Offline Mode")}</Label>
                      <p className="text-sm text-gray-500">{t("Allow app to work without internet")}</p>
                    </div>
                    <Switch 
                      id="offline"
                      checked={offlineModeEnabled}
                      onCheckedChange={setOfflineModeEnabled}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>{t("Save Preferences")}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("Notification Settings")}</CardTitle>
                <CardDescription>{t("Control which notifications you receive")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="all-notifications">{t("All Notifications")}</Label>
                    <p className="text-sm text-gray-500">{t("Master toggle for all notifications")}</p>
                  </div>
                  <Switch 
                    id="all-notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <div className={`flex items-center justify-between ${!notificationsEnabled && "opacity-50"}`}>
                  <div>
                    <Label htmlFor="market-updates">{t("Market Updates")}</Label>
                    <p className="text-sm text-gray-500">{t("Prices, demand changes, and opportunities")}</p>
                  </div>
                  <Switch 
                    id="market-updates"
                    checked={marketUpdatesEnabled}
                    disabled={!notificationsEnabled}
                    onCheckedChange={setMarketUpdatesEnabled}
                  />
                </div>
                
                <div className={`flex items-center justify-between ${!notificationsEnabled && "opacity-50"}`}>
                  <div>
                    <Label htmlFor="weather-alerts">{t("Weather Alerts")}</Label>
                    <p className="text-sm text-gray-500">{t("Extreme weather and agricultural advisories")}</p>
                  </div>
                  <Switch 
                    id="weather-alerts"
                    checked={weatherAlertsEnabled}
                    disabled={!notificationsEnabled}
                    onCheckedChange={setWeatherAlertsEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>{t("Save Notification Settings")}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t("Appearance")}</CardTitle>
                <CardDescription>{t("Customize how the app looks")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">{t("Dark Mode")}</Label>
                    <p className="text-sm text-gray-500">{t("Use dark theme throughout the app")}</p>
                  </div>
                  <Switch 
                    id="dark-mode"
                    checked={darkModeEnabled}
                    onCheckedChange={setDarkModeEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences}>{t("Save Appearance Settings")}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{t("Account Settings")}</CardTitle>
                <CardDescription>{t("Manage your account details and security")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t("Username")}</Label>
                    <Input id="username" value={user?.username || ""} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("Phone Number")}</Label>
                    <Input id="phone" value={user?.phoneNumber || ""} disabled />
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <Button variant="outline">{t("Change Password")}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}