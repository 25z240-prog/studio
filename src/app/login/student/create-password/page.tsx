
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

function CreatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
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
      // If no email is in the query params, redirect back to the start of the login flow
      router.push("/login/student");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: "Services are not ready. Please try again.",
      });
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

      toast({
          title: "Account Created!",
          description: "Welcome! You are now logged in.",
      });
      router.push('/vote?role=student');
    } catch (error: any) {
      let description = "An unexpected error occurred during registration. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
          description = "This email is already registered. Please go back and log in.";
      } else if (error.code === 'auth/weak-password') {
          description = "The password is too weak. Please use a stronger password.";
      }
      toast({ variant: "destructive", title: "Registration Failed", description });
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
          <CardTitle className="text-2xl font-headline">Enter Password</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Login"}
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/login/student">Back to email entry</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePasswordContent />
    </Suspense>
  );
}
