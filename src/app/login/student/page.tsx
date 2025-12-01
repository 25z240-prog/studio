
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, AuthErrorCodes, UserCredential } from "firebase/auth";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function is called after a successful sign-in or sign-up
  const handleLoginSuccess = async (userCredential: UserCredential) => {
    if (!firestore) return;
    
    const user = userCredential.user;
    const isNewUser = userCredential.operationType === 'signIn' ? false : true;

    // Sanitize email to create a display name, e.g., '23cs001' -> '23cs 001'
    const studentName = email.split('@')[0].replace(/[\._]/g, ' ');
    
    try {
      // If it's a new user or their profile name is not set, update it
      if (isNewUser || !user.displayName) {
        await updateProfile(user, { displayName: studentName });
      }
      
      // Create or update the user document in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
          id: user.uid,
          name: studentName,
          email: email
      }, { merge: true });

      toast({
          title: "Logged In!",
          description: "Welcome!",
      });

      router.push('/vote?role=student');

    } catch (error) {
      console.error("Error during profile update or firestore write:", error);
      toast({
          variant: "destructive",
          title: "Setup Failed",
          description: "Your account was created, but we couldn't save your profile. Please try logging in again.",
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    setIsSubmitting(true);

    const password = "password"; // Hardcoded password for all student logins

    const emailRegex = /^(2[0-9])[a-z]+([0-9]{1,3})@psgitech\.ac\.in$/i;
    const match = email.match(emailRegex);

    if (!match) {
        toast({
            variant: "destructive",
            title: "Invalid Email Format",
            description: "Please use your official student email, e.g., '23cs001@psgitech.ac.in'.",
        });
        setIsSubmitting(false);
        return;
    }

    try {
      // 1. Always try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(userCredential);

    } catch (error: any) {
      // 2. If user not found, create a new account
      if (error.code === AuthErrorCodes.USER_DELETED || error.code === AuthErrorCodes.USER_NOT_FOUND) {
        try {
          const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
          await handleLoginSuccess(newUserCredential);
        } catch (signUpError: any) {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: signUpError.message || "Could not create your account. Please try again.",
          });
        }
      } else if (error.code === AuthErrorCodes.INVALID_PASSWORD || error.code === AuthErrorCodes.WRONG_PASSWORD) {
         toast({
            variant: "destructive",
            title: "Login Failed",
            description: "The password for this account is incorrect. Please contact management if you changed it and need a reset.",
          });
      } else {
        // 3. Handle other errors
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
      <div className="flex items-center gap-3 mb-8">
          <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={40} height={40} alt="PSG iTech Logo" />
          <h1 className="text-3xl font-bold font-headline text-foreground">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login / Register"}
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
