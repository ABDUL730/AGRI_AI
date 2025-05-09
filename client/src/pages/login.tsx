import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { Sprout, User, Lock, Phone, MapPin } from "lucide-react";

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

// Registration form schema
const registerSchema = z.object({
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

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetRequestFormValues = z.infer<typeof resetRequestSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
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

  // Password reset request form
  const resetRequestForm = useForm<ResetRequestFormValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      username: "",
    },
  });

  // Password reset form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Reset password UI state
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);

  // Use authentication hook
  const { 
    login, 
    register: registerUser, 
    requestPasswordReset: requestReset,
    resetPassword: resetPass,
    isLoading: isAuthLoading 
  } = useAuth();

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.username, data.password);
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

  // Handle registration form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;
      await registerUser(registrationData);
      toast({
        title: t("Registration Successful"),
        description: t("Your account has been created. Please log in."),
      });
      setActiveTab("login");
      registerForm.reset();
    } catch (error: any) {
      toast({
        title: t("Registration Failed"),
        description: error.message || t("Could not create account. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Handle password reset request
  const onRequestPasswordReset = async (data: ResetRequestFormValues) => {
    try {
      await requestReset(data.username);
      setResetRequested(true);
      toast({
        title: t("Password Reset Requested"),
        description: t("Check your email for the reset token. If you don't see it, check your spam folder."),
      });
    } catch (error: any) {
      toast({
        title: t("Reset Request Failed"),
        description: error.message || t("Could not request password reset. Please try again."),
        variant: "destructive",
      });
    }
  };

  // Handle password reset
  const onResetPassword = async (data: ResetPasswordFormValues) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...resetData } = data;
      await resetPass(resetData.token, resetData.newPassword);
      toast({
        title: t("Password Reset Successful"),
        description: t("Your password has been reset. Please log in with your new password."),
      });
      setShowResetForm(false);
      setResetRequested(false);
      resetPasswordForm.reset();
      resetRequestForm.reset();
    } catch (error: any) {
      toast({
        title: t("Password Reset Failed"),
        description: error.message || t("Could not reset password. Please try again."),
        variant: "destructive",
      });
    }
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

        <Card className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("Login")}</TabsTrigger>
                <TabsTrigger value="register">{t("Register")}</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login" className="mt-0">
                {!showResetForm ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
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
                        disabled={isAuthLoading}
                      >
                        {isAuthLoading ? t("Logging in...") : t("Login")}
                      </Button>
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          {t("Forgot your password?")}
                        </button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <>
                    {!resetRequested ? (
                      <Form {...resetRequestForm}>
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">{t("Reset Password")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("Enter your username to request a password reset.")}
                          </p>
                        </div>
                        <form onSubmit={resetRequestForm.handleSubmit(onRequestPasswordReset)} className="space-y-4">
                          <FormField
                            control={resetRequestForm.control}
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
                          <div className="flex space-x-2 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowResetForm(false)}
                            >
                              {t("Cancel")}
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1" 
                              disabled={isAuthLoading}
                            >
                              {isAuthLoading ? t("Requesting...") : t("Request Reset")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <Form {...resetPasswordForm}>
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">{t("Enter Reset Details")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("Enter the reset token sent to your email and your new password.")}
                          </p>
                        </div>
                        <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                          <FormField
                            control={resetPasswordForm.control}
                            name="token"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Reset Token")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={t("Enter the token from your email")} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={resetPasswordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("New Password")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="password" 
                                      placeholder={t("Enter new password")} 
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
                            control={resetPasswordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Confirm New Password")}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      type="password" 
                                      placeholder={t("Confirm new password")} 
                                      className="pl-10" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex space-x-2 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setShowResetForm(false);
                                setResetRequested(false);
                              }}
                            >
                              {t("Cancel")}
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1" 
                              disabled={isAuthLoading}
                            >
                              {isAuthLoading ? t("Resetting...") : t("Reset Password")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder={t("Create a password")} 
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
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Confirm Password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder={t("Confirm password")} 
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
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Full Name")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t("Enter your full name")} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Location")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder={t("Village/District")} 
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
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Phone Number")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder={t("Mobile number")} 
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
                      control={registerForm.control}
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
                                <FormLabel className="font-normal cursor-pointer">
                                  English
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="hindi" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  हिंदी (Hindi)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="tamil" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  தமிழ் (Tamil)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="telugu" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  తెలుగు (Telugu)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="kannada" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  ಕನ್ನಡ (Kannada)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={isAuthLoading}
                    >
                      {isAuthLoading ? t("Creating account...") : t("Create Account")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <p>{t("Don't have an account?")}{" "}
                  <button 
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab("register")}
                  >
                    {t("Register here")}
                  </button>
                </p>
              ) : (
                <p>{t("Already have an account?")}{" "}
                  <button 
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setActiveTab("login")}
                  >
                    {t("Login here")}
                  </button>
                </p>
              )}
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}