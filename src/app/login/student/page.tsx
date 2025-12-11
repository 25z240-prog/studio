
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
import { useAuth, useFirestore } from "@/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (!auth || !firestore) {
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

    if (password.length < 6) {
        toast({ variant: "destructive", title: "Password Too Short", description: "Password must be at least 6 characters long." });
        setIsSubmitting(false);
        return;
    }

    if (rememberMe) {
        localStorage.setItem("student_email", email);
    } else {
        localStorage.removeItem("student_email");
    }

    try {
      // First, try to sign in. This is the most common case.
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/vote?role=student');
    } catch (error: any) {
      // If sign-in fails, check the error code.
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        // User does not exist, so create a new account.
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
              hasPassword: true
          });

          toast({
              title: "Account Created!",
              description: "Welcome! You are now logged in.",
          });
          router.push('/vote?role=student');
        } catch (registrationError: any) {
          // Handle specific registration errors.
          let description = "An unexpected error occurred during registration. Please try again.";
          if (registrationError.code === 'auth/weak-password') {
              description = "The password is too weak. Please use a stronger password.";
          }
          toast({ variant: "destructive", title: "Registration Failed", description });
        }
      } else {
        // Handle other sign-in errors (e.g., wrong password).
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/wrong-password') {
            description = "The password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            description = "Access to this account has been temporarily disabled due to many failed login attempts.";
        }
        toast({ variant: "destructive", title: "Login Failed", description });
      }
    } finally {
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
          <CardDescription>Enter your PSG iTech email and password. An account will be created if you're new.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
               <Input id="email" type="email" placeholder="yourname@psgitech.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting}/>
            </div>
             <div className="grid gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-[2.2rem] h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
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
              {isSubmitting ? "Please wait..." : "Continue"}
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

    