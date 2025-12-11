
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCreatePasswordDialog, setShowCreatePasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("student_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPassword(""); // Reset password field
    setShowPassword(false); // Reset password visibility
    
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
        setShowPasswordDialog(true);
      } else {
        setShowCreatePasswordDialog(true);
      }
    } catch (error) {
      console.error("Error checking sign-in methods:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Could not verify your email at this time. Please try again.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Auth service not available." });
        setIsSubmitting(false);
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting to the voting page.",
        });
        setShowPasswordDialog(false);
        router.push('/vote?role=student');
    } catch (error: any) {
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-password') {
            description = "The password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            description = "Access to this account has been temporarily disabled due to many failed login attempts.";
        }
        toast({ variant: "destructive", title: "Login Failed", description });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Initialization Error", description: "Services are not ready." });
      return;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Password Too Short", description: "Password must be at least 6 characters long." });
      return;
    }
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const name = email.split('@')[0].replace(/[0-9.]/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()).trim();
      await updateProfile(user, { displayName: name });
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          name: name,
          hasPassword: true,
      });
      toast({ title: "Account Created!", description: "Welcome! You are now being logged in." });
      setShowCreatePasswordDialog(false);
      router.push('/vote?role=student');
    } catch (error: any) {
      // This error should not happen with the new flow, but as a safeguard:
      if (error.code === 'auth/email-already-in-use') {
         toast({ variant: "destructive", title: "Account Exists", description: "An account with this email already exists. Please try logging in." });
         setShowCreatePasswordDialog(false); // Close create dialog
         setShowPasswordDialog(true); // Open login dialog
      } else {
         toast({ variant: "destructive", title: "Registration Failed", description: error.message || "An unexpected error occurred." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closePasswordDialog = () => {
    setShowPasswordDialog(false);
    setPassword("");
    setShowPassword(false);
  }

  const closeCreatePasswordDialog = () => {
    setShowCreatePasswordDialog(false);
    setPassword("");
    setShowPassword(false);
  }

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

      {/* Enter Password Dialog for Existing Users */}
      <Dialog open={showPasswordDialog} onOpenChange={closePasswordDialog}>
          <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">Welcome back</DialogTitle>
                  <DialogDescription>
                      Enter your password to sign in as <span className="font-medium text-foreground">{email}</span>.
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLoginSubmit}>
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
                              disabled={isSubmitting}
                              className="h-12 text-base pr-12"
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
                  </div>
                   <DialogFooter>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Signing in..." : "Sign In"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

      {/* Create Password Dialog for New Users */}
      <Dialog open={showCreatePasswordDialog} onOpenChange={closeCreatePasswordDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Enter password</DialogTitle>
              <DialogDescription>
                Enter a password for <span className="font-medium text-foreground">{email}</span>.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAccountSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2 relative">
                        <Label htmlFor="create-password-dialog" className="sr-only">Password</Label>
                        <Input
                            id="create-password-dialog"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="h-12 text-base pr-12"
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
                     <p className="mt-2 px-1 text-xs text-muted-foreground">
                        Use 6 or more characters with a mix of letters, numbers & symbols.
                    </p>
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Login"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
