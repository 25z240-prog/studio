
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

function EnterPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else {
      // If no email is in the URL, the user should start from the beginning.
      router.push("/login/student");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: "Authentication service not ready. Please try again.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to the voting page.",
      });
      router.push('/vote?role=student');
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "The password you entered is incorrect. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        description = "No account found with this email. Please go back and use a different email.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts.";
      }
      toast({ variant: "destructive", title: "Login Failed", description });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return null; // Don't render anything until email is loaded from params
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="text-center">
                 <div className="flex justify-center items-center gap-3 mb-4">
                    <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
                    <h1 className="font-headline text-xl font-semibold text-foreground">PSG iTech Hostel Mess</h1>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome</h2>
                <p className="mt-2 text-sm text-muted-foreground">{email}</p>
            </div>
        
            <form onSubmit={handleSubmit} className="mt-8">
                <div className="grid gap-2 relative">
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={isSubmitting} 
                        className="h-12 text-base"
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                    </Button>
                </div>

                <div className="mt-6 flex items-center justify-between">
                     <Button variant="link" asChild className="p-0">
                        <Link href="/login/student">Use a different email</Link>
                    </Button>
                    <Button className="w-24" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                </div>
            </form>
      </div>
    </div>
  );
}

export default function EnterPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EnterPasswordContent />
    </Suspense>
  );
}
