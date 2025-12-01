
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
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { useAuth, useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { AuthErrorCodes, UserCredential } from "firebase/auth";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const password = "password"; // Hardcoded password for all student logins

  const handleLoginSuccess = (userCredential: UserCredential) => {
    if (!firestore || !userCredential.user) return;
    
    // Redirect first
    router.push('/vote?role=student');

    // Set user document in the background
    const userDocRef = doc(firestore, "users", userCredential.user.uid);
    const studentName = email.split('@')[0].replace(/[\._]/g, ' ');
    setDocumentNonBlocking(userDocRef, {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || studentName,
        email: email
    }, { merge: true });

    toast({
        title: "Logged In!",
        description: "Welcome!",
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    const emailRegex = /^(2[0-5])[a-z]+([0-9]{1,3})@psgitech\.ac\.in$/i;
    const match = email.match(emailRegex);

    if (!match) {
        toast({
            variant: "destructive",
            title: "Invalid Email Format",
            description: "Please use your official student email, e.g., '23cs001@psgitech.ac.in'.",
        });
        return;
    }

    const rollNumber = parseInt(match[2], 10);
    if (rollNumber < 0 || rollNumber > 500) {
        toast({
            variant: "destructive",
            title: "Invalid Roll Number",
            description: "The roll number in your email must be between 0 and 500.",
        });
        return;
    }

    // Try to sign in first
    initiateEmailSignIn(auth, email, password)
      .then(handleLoginSuccess)
      .catch(error => {
        // If user does not exist, create an account
        if (error.code === AuthErrorCodes.USER_NOT_FOUND) {
            const studentName = email.split('@')[0].replace(/[\._]/g, ' ');
            initiateEmailSignUp(auth, email, password, studentName)
                .then(handleLoginSuccess)
                .catch(signUpError => {
                    toast({
                        variant: "destructive",
                        title: "Registration Failed",
                        description: signUpError.message || "Could not create your account.",
                    });
                });
        } else {
          // Handle other sign-in errors (like wrong password for an existing user, though this is less likely now)
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "An unexpected error occurred.",
          });
        }
      });
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
               <Input id="email" type="email" placeholder="yourname@psgitech.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">Login / Register</Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/login">Back to role selection</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
