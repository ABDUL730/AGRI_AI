import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Farmer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
import { Loader2, Lock, Mail, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [tabValue, setTabValue] = useState("farmer");
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation<Farmer, Error, LoginFormValues>({
    mutationFn: (data) => apiRequest("/api/auth/login", "POST", JSON.stringify(data)),
    onSuccess: () => {
      toast({
        title: t("Login Successful"),
        description: t("Welcome back to AgriAI!"),
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: t("Login Failed"),
        description: error.message || t("Invalid username or password"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
            {t("AgriAI")}
          </CardTitle>
          <CardDescription>
            {t("Your smart farming assistant")}
          </CardDescription>
        </CardHeader>
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="farmer" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t("Farmer")}</span>
            </TabsTrigger>
            <TabsTrigger value="expert" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t("Expert")}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="farmer">
            <CardContent className="pt-4">
              <div className="mb-4 text-center">
                <h3 className="font-medium">{t("Farmer Login")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Access your farm analytics and management tools")}
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("Login")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="expert">
            <CardContent className="pt-4">
              <div className="mb-4 text-center">
                <h3 className="font-medium">{t("Expert Login")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Login as an agricultural expert or advisor")}
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Username")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    control={form.control}
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
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t("Login")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex flex-col space-y-2 border-t pt-4">
          <div className="text-sm text-center text-muted-foreground">
            {t("Don't have an account?")}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/register">{t("Create an Account")}</Link>
          </Button>
          <div className="text-xs text-center text-muted-foreground mt-2">
            <Link href="/" className="hover:underline">
              {t("Continue as guest")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}