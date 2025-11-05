import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@database/supabase-client";

// Debug component to check environment variables
function EnvDebug() {
  console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
  console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present (length: " + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ")" : "Missing");
  
  return (
    <div style={{ padding: "10px", background: "#ffeeee", border: "1px solid red", margin: "10px 0", fontSize: "12px" }}>
      <strong>Debug Info:</strong>
      <p>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? "✅ Present" : "❌ Missing"}</p>
      <p>SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing"}</p>
    </div>
  );
}
export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      password: "",
      fullName: "",
      email: "",
      role: "farmer",
      farmId: undefined,
    },
  });

  async function onSubmit(values: InsertUser) {
    setIsLoading(true);
    console.log("=== REGISTRATION ATTEMPT ===");
    console.log("Email:", values.email);
    console.log("Environment variables loaded:", !!import.meta.env.VITE_SUPABASE_URL, !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    try {
      // First create the Supabase auth user
      console.log("Attempting Supabase signUp...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      console.log("Supabase signUp result:", { authData, authError });

      if (authError) {
        console.error("Supabase auth error:", authError);
        throw new Error(authError.message);
      }

      if (authData.user) {
        console.log("Creating user profile...");
        // Create the user profile in the database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            username: values.email, // Use email as username
            full_name: values.fullName,
            role: values.role,
            email: values.email,
            farm_id: values.farmId,
          });

        console.log("User profile creation result:", { profileError });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw new Error(profileError.message);
        }
      }

      toast({
        title: "Registration successful!",
        description: "You can now sign in with your credentials",
      });
      
      setLocation("/login");
    } catch (error: any) {
      console.error("Registration error caught:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold">Farm MRL Portal</h1>
        <p className="text-muted-foreground">
          Create your account to get started
        </p>
        <EnvDebug />
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Fill in your details to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          data-testid="input-fullname"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          data-testid="input-email"
                          {...field}
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter a secure password"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="farmer">Farmer</SelectItem>
                          <SelectItem value="inspector">Inspector</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" data-testid="link-login">
                <span className="text-primary hover-elevate cursor-pointer font-medium">
                  Sign in here
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
