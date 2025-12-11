
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("student_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: "Authentication service is not ready. Please try again.",
      });
      setIsSubmitting(false);
      return;
    }
    
    const emailRegex = /^(2[0-5])([a-z]+[0-9]{1,3}|[0-9]{1,3}[a-z]+)@psgitech\.ac\.in$/i;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email Format",
        description: "Please use your official student email. e.g., '24cs100@psgitech.ac.in'.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      localStorage.setItem("student_email", email);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length > 0) {
        // User exists, go to password page.
        router.push(`/login/student/enter-password?email=${encodeURIComponent(email)}`);
      } else {
        // User does not exist, go to create password page.
        router.push(`/login/student/create-password?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Error checking sign-in methods:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Could not verify your email at this time. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-lg">
        <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
                <h1 className="font-headline text-xl font-semibold text-foreground">PSG iTech Hostel Mess</h1>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">to continue to Hostel Mess Voting</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="grid gap-2 mt-8">
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                    className="h-12 text-base"
                />
            </div>

            <p className="mt-4 px-1 text-sm text-muted-foreground">
                Not your computer? Use a private window to sign in.
            </p>

            <div className="mt-6 flex items-center justify-between">
                <Button variant="link" asChild className="p-0">
                    <Link href="/login">Back to role selection</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-24">
                    {isSubmitting ? "Checking..." : "Next"}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
