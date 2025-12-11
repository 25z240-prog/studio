
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    const storedEmail = localStorage.getItem("student_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingEmail(true);
    
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: "Authentication service is not ready. Please try again.",
      });
      setIsCheckingEmail(false);
      return;
    }
    
    const emailRegex = /^(2[0-5])([a-z]+[0-9]{1,3}|[0-9]{1,3}[a-z]+)@psgitech\.ac\.in$/i;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email Format",
        description: "Please use your official student email. e.g., '24cs100@psgitech.ac.in'.",
      });
      setIsCheckingEmail(false);
      return;
    }

    try {
      localStorage.setItem("student_email", email);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length > 0) {
        // User exists, show password dialog.
        setShowPasswordDialog(true);
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
    } finally {
        setIsCheckingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Auth service not available." });
        setIsLoggingIn(false);
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting to the voting page.",
        });
        router.push('/vote?role=student');
    } catch (error: any) {
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-password') {
            description = "The password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/user-not-found') {
            description = "No account found with this email. This shouldn't happen here.";
        } else if (error.code === 'auth/too-many-requests') {
            description = "Access to this account has been temporarily disabled due to many failed login attempts.";
        }
        toast({ variant: "destructive", title: "Login Failed", description });
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <>
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
        
        <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-2 mt-8">
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={isCheckingEmail}
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
                <Button type="submit" disabled={isCheckingEmail} className="w-24">
                    {isCheckingEmail ? "Checking..." : "Next"}
                </Button>
            </div>
        </form>
      </div>
    </div>
    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
             <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Welcome back</DialogTitle>
                <DialogDescription>
                    Enter your password to sign in as <span className="font-medium text-foreground">{email}</span>.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2 relative">
                        <Label htmlFor="password-dialog" className="sr-only">Password</Label>
                        <Input
                            id="password-dialog"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoggingIn}
                            className="h-12 text-base pr-12"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-10 w-10 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoggingIn}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                        </Button>
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                        {isLoggingIn ? "Signing in..." : "Sign In"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
