import { useState } from "react";
import { useForm } from "react-hook-form";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileFormValues = {
  fullName: string;
  location: string;
  phoneNumber: string;
  preferredLanguage: string;
};

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: user?.fullName || "",
      location: user?.location || "",
      phoneNumber: user?.phoneNumber || "",
      preferredLanguage: user?.preferredLanguage || "english",
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    // In a real app, update the backend
    toast({
      title: t("Profile updated"),
      description: t("Your profile information has been updated successfully."),
    });
    setIsEditing(false);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("My Profile")}</h1>
          <p className="text-gray-500">{t("Manage your personal information")}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-primary mb-4">
                    <span className="material-icons text-4xl">person</span>
                  </div>
                  <h2 className="text-xl font-bold">{user?.fullName}</h2>
                  <p className="text-gray-500">{user?.username}</p>
                  
                  <div className="w-full mt-6">
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 mr-2">phone</span>
                        <span>{user?.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-400 mr-2">location_on</span>
                        <span>{user?.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">{t("Profile Details")}</TabsTrigger>
                <TabsTrigger value="farms">{t("Farm Information")}</TabsTrigger>
                <TabsTrigger value="activity">{t("Activity")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{t("Personal Information")}</CardTitle>
                        <CardDescription>{t("Update your personal details")}</CardDescription>
                      </div>
                      <Button 
                        variant={isEditing ? "outline" : "default"} 
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? t("Cancel") : t("Edit Profile")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Full Name")}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
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
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  {t("Your district and state")}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Phone Number")}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="preferredLanguage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Preferred Language")}</FormLabel>
                                <FormControl>
                                  <select 
                                    className="w-full p-2 border rounded-md"
                                    {...field}
                                  >
                                    <option value="english">English</option>
                                    <option value="hindi">हिन्दी (Hindi)</option>
                                    <option value="tamil">தமிழ் (Tamil)</option>
                                    <option value="telugu">తెలుగు (Telugu)</option>
                                    <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit">{t("Save Changes")}</Button>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">{t("Full Name")}</h3>
                            <p>{user?.fullName}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">{t("Username")}</h3>
                            <p>{user?.username}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">{t("Location")}</h3>
                            <p>{user?.location}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">{t("Phone Number")}</h3>
                            <p>{user?.phoneNumber}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">{t("Preferred Language")}</h3>
                            <p>{user?.preferredLanguage || "English"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="farms">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Farm Information")}</CardTitle>
                    <CardDescription>{t("Your registered farms and fields")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">{t("No farms registered yet")}</h3>
                        <p className="text-gray-500 text-sm">{t("Add your first farm to get personalized recommendations.")}</p>
                        <Button className="mt-4" variant="outline">{t("Add Farm")}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Recent Activity")}</CardTitle>
                    <CardDescription>{t("Your latest actions and updates")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-primary pl-4 py-1">
                        <p className="text-sm text-gray-500">{t("Today")}</p>
                        <p>{t("Logged into the system")}</p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-4 py-1">
                        <p className="text-sm text-gray-500">{t("Yesterday")}</p>
                        <p>{t("Viewed market prices")}</p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-4 py-1">
                        <p className="text-sm text-gray-500">{t("2 days ago")}</p>
                        <p>{t("Updated crop management plan")}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="ghost">{t("View All Activity")}</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}