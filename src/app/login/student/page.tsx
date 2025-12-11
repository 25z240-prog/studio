
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase/provider";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { Checkbox } from "@/components/ui/checkbox";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("student_email");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    } else {
      setRememberMe(false);
    }
  }, []);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem("student_email");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strict guard clause: do not proceed if auth is not ready.
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Initialization Error",
            description: "Authentication service is not ready. Please wait a moment and try again.",
        });
        return;
    }

    setIsSubmitting(true);
    
    const emailRegex = /^(2[0-5])([a-z]+[0-9]{1,3}|[0-9]{1,3}[a-z]+)@psgitech\.ac\.in$/i;
    if (!emailRegex.test(email)) {
        toast({
            variant: "destructive",
            title: "Invalid Email Format",
            description: "Please use your official student email. Format examples: '25cs240@psgitech.ac.in' or '25z240@psgitech.ac.in'. Year must be 20-25.",
        });
        setIsSubmitting(false);
        return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (rememberMe) {
        localStorage.setItem("student_email", email);
      } else {
        localStorage.removeItem("student_email");
      }
      
      if (signInMethods.length > 0) {
        // User exists, go to enter password page
        router.push(`/login/student/enter-password?email=${encodeURIComponent(email)}`);
      } else {
        // New user, go to create password page
        router.push(`/login/student/create-password?email=${encodeURIComponent(email)}`);
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred while checking your email. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
      <div className="flex flex-shrink-1 min-w-0 items-center gap-3 mb-8">
          <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={40} height={40} alt="PSG iTech Logo" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-foreground whitespace-nowrap">
            PSG iTech Hostel Mess
          </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Student Login</CardTitle>
          <CardDescription>Enter your PSG iTech email to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
               <Input id="email" type="email" placeholder="yourname@psgitech.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting}/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => handleRememberMeChange(checked as boolean)} disabled={isSubmitting}/>
              <label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Checking..." : "Continue"}
            </Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/login">Back to role selection</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
