import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useBuyer } from "@/hooks/use-buyer";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sprout, User, Lock, Phone, MapPin, Store, Mail } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Password reset request schema
const resetRequestSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
});

// Password reset schema
const resetPasswordSchema = z.object({
  token: z.string().min(6, {
    message: "Valid reset token is required.",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Farmer Registration form schema
const farmerRegisterSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
  fullName: z.string().min(2, {
    message: "Full name is required.",
  }),
  location: z.string().min(2, {
    message: "Location is required.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Valid phone number is required.",
  }),
  preferredLanguage: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Buyer Registration form schema
const buyerRegisterSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
  fullName: z.string().min(2, {
    message: "Full name is required.",
  }),
  location: z.string().min(2, {
    message: "Location is required.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Valid phone number is required.",
  }),
  email: z.string().email({
    message: "Valid email address is required.",
  }),
  businessType: z.string().min(2, {
    message: "Business type is required.",
  }),
  companyName: z.string().optional(),
  preferredLanguage: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type FarmerRegisterFormValues = z.infer<typeof farmerRegisterSchema>;
type BuyerRegisterFormValues = z.infer<typeof buyerRegisterSchema>;
type ResetRequestFormValues = z.infer<typeof resetRequestSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Initial selection between farmer and buyer
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Tab state for each role
  const [farmerActiveTab, setFarmerActiveTab] = useState("login");
  const [buyerActiveTab, setBuyerActiveTab] = useState("login");

  // Farmer auth
  const { 
    user: farmer,
    isLoading: isFarmerLoading,
    loginMutation: farmerLogin, 
    registerMutation: farmerRegister,
    isAuthenticated: isFarmerAuthenticated
  } = useAuth();

  // Buyer auth
  const {
    buyer,
    isLoading: isBuyerLoading,
    loginMutation: buyerLogin,
    registerMutation: buyerRegister,
    isAuthenticated: isBuyerAuthenticated
  } = useBuyer();

  // This useEffect will handle the redirection
  useEffect(() => {
    if (isFarmerAuthenticated) {
      setLocation("/");
    } else if (isBuyerAuthenticated) {
      setLocation("/market");
    }
  }, [isFarmerAuthenticated, isBuyerAuthenticated, setLocation]);

  // Farmer login form
  const farmerLoginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Buyer login form
  const buyerLoginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Farmer Registration form
  const farmerRegisterForm = useForm<FarmerRegisterFormValues>({
    resolver: zodResolver(farmerRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      location: "",
      phoneNumber: "",
      preferredLanguage: "english",
    },
  });

  // Buyer Registration form
  const buyerRegisterForm = useForm<BuyerRegisterFormValues>({
    resolver: zodResolver(buyerRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      location: "",
      phoneNumber: "",
      email: "",
      businessType: "trader",
      companyName: "",
      preferredLanguage: "english",
    },
  });

  // Handle farmer login form submission
  const onFarmerLoginSubmit = async (data: LoginFormValues) => {
    try {
      await farmerLogin.mutateAsync({
        username: data.username,
        password: data.password
      });
      toast({
        title: t("Login Successful"),
        description: t("Welcome back to AgriAI!"),
      });
    } catch (error: any) {
      toast({
        title: t("Login Failed"),
        description: error.message || t("Invalid username or password. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Handle buyer login form submission
  const onBuyerLoginSubmit = async (data: LoginFormValues) => {
    try {
      await buyerLogin.mutateAsync({
        username: data.username,
        password: data.password
      });
      toast({
        title: t("Login Successful"),
        description: t("Welcome to AgriMarket!"),
      });
      // Redirect to market page after successful login
      navigate("/market");
    } catch (error: any) {
      toast({
        title: t("Login Failed"),
        description: error.message || t("Invalid username or password. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Handle farmer registration form submission
  const onFarmerRegisterSubmit = async (data: FarmerRegisterFormValues) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;
      await farmerRegister.mutateAsync(registrationData);
      toast({
        title: t("Registration Successful"),
        description: t("Your farmer account has been created. Please log in."),
      });
      setFarmerActiveTab("login");
      farmerRegisterForm.reset();
    } catch (error: any) {
      toast({
        title: t("Registration Failed"),
        description: error.message || t("Could not create account. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Handle buyer registration form submission
  const onBuyerRegisterSubmit = async (data: BuyerRegisterFormValues) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;
      await buyerRegister.mutateAsync(registrationData);
      toast({
        title: t("Registration Successful"),
        description: t("Your buyer account has been created. Please log in."),
      });
      setBuyerActiveTab("login");
      buyerRegisterForm.reset();
    } catch (error: any) {
      toast({
        title: t("Registration Failed"),
        description: error.message || t("Could not create account. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Reset role selection
  const resetRoleSelection = () => {
    setUserRole(null);
    setFarmerActiveTab("login");
    setBuyerActiveTab("login");
    farmerLoginForm.reset();
    buyerLoginForm.reset();
    farmerRegisterForm.reset();
    buyerRegisterForm.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sprout className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">AgriAI</h1>
          <p className="text-muted-foreground mt-2">
            {t("Smart Farming Assistant for Indian Farmers")}
          </p>
        </div>

        {/* Role Selection */}
        {!userRole ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">{t("Choose Your Role")}</CardTitle>
              <CardDescription className="text-center">
                {t("Select how you want to use our application")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Button
                onClick={() => setUserRole("farmer")}
                variant="outline"
                className="h-24 text-left flex items-center justify-between p-4 hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-center gap-4">
                  <Sprout className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium text-lg">{t("I am a Farmer")}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("Access crop management, weather insights, and farming tools")}
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setUserRole("buyer")}
                variant="outline"
                className="h-24 text-left flex items-center justify-between p-4 hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-center gap-4">
                  <Store className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium text-lg">{t("I am a Buyer")}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("Browse crops for sale, connect with farmers, and make purchases")}
                    </div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        ) : userRole === "farmer" ? (
          // Farmer Authentication
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Sprout className="h-6 w-6 text-primary mr-2" />
                  <CardTitle>{t("Farmer Account")}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetRoleSelection}
                  className="text-xs h-8"
                >
                  {t("Change Role")}
                </Button>
              </div>
            </CardHeader>
            <Tabs value={farmerActiveTab} onValueChange={setFarmerActiveTab} className="w-full">
              <CardContent className="pt-0 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t("Login")}</TabsTrigger>
                  <TabsTrigger value="register">{t("Register")}</TabsTrigger>
                </TabsList>
              </CardContent>

              <CardContent className="py-2">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <Form {...farmerLoginForm}>
                    <form onSubmit={farmerLoginForm.handleSubmit(onFarmerLoginSubmit)} className="space-y-4">
                      <FormField
                        control={farmerLoginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Username")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder={t("Enter your username")} 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={farmerLoginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder={t("Enter your password")} 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        disabled={isFarmerLoading}
                      >
                        {isFarmerLoading ? t("Logging in...") : t("Login as Farmer")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-4">
                  <Form {...farmerRegisterForm}>
                    <form onSubmit={farmerRegisterForm.handleSubmit(onFarmerRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={farmerRegisterForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Username")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder={t("Choose a username")} 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={farmerRegisterForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Password")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="password" 
                                      placeholder={t("Create password")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={farmerRegisterForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Confirm")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={t("Confirm password")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={farmerRegisterForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Full Name")}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t("Your full name")} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={farmerRegisterForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Location")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder={t("Your farm location")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={farmerRegisterForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Phone Number")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder={t("Your contact number")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={farmerRegisterForm.control}
                          name="preferredLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Preferred Language")}</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-wrap gap-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="english" />
                                    </FormControl>
                                    <FormLabel className="font-normal">English</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="hindi" />
                                    </FormControl>
                                    <FormLabel className="font-normal">हिंदी (Hindi)</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="tamil" />
                                    </FormControl>
                                    <FormLabel className="font-normal">தமிழ் (Tamil)</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="telugu" />
                                    </FormControl>
                                    <FormLabel className="font-normal">తెలుగు (Telugu)</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-4" 
                        disabled={isFarmerLoading}
                      >
                        {isFarmerLoading ? t("Creating account...") : t("Register as Farmer")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        ) : (
          // Buyer Authentication
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Store className="h-6 w-6 text-primary mr-2" />
                  <CardTitle>{t("Buyer Account")}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetRoleSelection}
                  className="text-xs h-8"
                >
                  {t("Change Role")}
                </Button>
              </div>
            </CardHeader>
            <Tabs value={buyerActiveTab} onValueChange={setBuyerActiveTab} className="w-full">
              <CardContent className="pt-0 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t("Login")}</TabsTrigger>
                  <TabsTrigger value="register">{t("Register")}</TabsTrigger>
                </TabsList>
              </CardContent>

              <CardContent className="py-2">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <Form {...buyerLoginForm}>
                    <form onSubmit={buyerLoginForm.handleSubmit(onBuyerLoginSubmit)} className="space-y-4">
                      <FormField
                        control={buyerLoginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Username")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder={t("Enter your username")} 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={buyerLoginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder={t("Enter your password")} 
                                  className="pl-10" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        disabled={isBuyerLoading}
                      >
                        {isBuyerLoading ? t("Logging in...") : t("Login as Buyer")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-4">
                  <Form {...buyerRegisterForm}>
                    <form onSubmit={buyerRegisterForm.handleSubmit(onBuyerRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={buyerRegisterForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Username")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder={t("Choose a username")} 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={buyerRegisterForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Password")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="password" 
                                      placeholder={t("Create password")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={buyerRegisterForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Confirm")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={t("Confirm password")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={buyerRegisterForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Full Name")}</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={t("Your full name")} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={buyerRegisterForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Email")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type="email"
                                    placeholder={t("Your email address")} 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={buyerRegisterForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Location")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder={t("Your location")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={buyerRegisterForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Phone Number")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder={t("Your contact number")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={buyerRegisterForm.control}
                            name="businessType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Business Type")}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="trader" />
                                      </FormControl>
                                      <FormLabel className="font-normal">{t("Trader")}</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="retailer" />
                                      </FormControl>
                                      <FormLabel className="font-normal">{t("Retailer")}</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="processor" />
                                      </FormControl>
                                      <FormLabel className="font-normal">{t("Processor")}</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={buyerRegisterForm.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Company Name")} <span className="text-xs text-muted-foreground">({t("optional")})</span></FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={t("Your company name")}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={buyerRegisterForm.control}
                          name="preferredLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("Preferred Language")}</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-wrap gap-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="english" />
                                    </FormControl>
                                    <FormLabel className="font-normal">English</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="hindi" />
                                    </FormControl>
                                    <FormLabel className="font-normal">हिंदी (Hindi)</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="tamil" />
                                    </FormControl>
                                    <FormLabel className="font-normal">தமிழ் (Tamil)</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="telugu" />
                                    </FormControl>
                                    <FormLabel className="font-normal">తెలుగు (Telugu)</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-4" 
                        disabled={isBuyerLoading}
                      >
                        {isBuyerLoading ? t("Creating account...") : t("Register as Buyer")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}