
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
import { Eye, EyeOff } from "lucide-react";
import { AuthErrorCodes, UserCredential } from "firebase/auth";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSuccess = (userCredential: UserCredential) => {
    if (!firestore || !userCredential.user) return;

    router.push('/vote?role=student');
    
    // Check if a user document already exists, if not create one.
    // This is useful for users created directly via Auth console.
    const userDocRef = doc(firestore, "users", userCredential.user.uid);
    const studentName = email.split('@')[0].replace(/[\._]/g, ' ');
    setDocumentNonBlocking(userDocRef, {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || studentName,
        email: email
    }, { merge: true }); // Use merge to avoid overwriting existing data

    toast({
        title: "Logged In!",
        description: "Welcome!",
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    // Regex to validate the student email format
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
        // If user does not exist, try to create an account with default password
        if (error.code === AuthErrorCodes.USER_NOT_FOUND) {
            if (password === 'password') {
                const studentName = email.split('@')[0].replace(/[\._]/g, ' ');
                initiateEmailSignUp(auth, email, 'password', studentName)
                    .then(handleLoginSuccess)
                    .catch(signUpError => {
                        toast({
                            variant: "destructive",
                            title: "Registration Failed",
                            description: signUpError.message || "Could not create your account. Please try again.",
                        });
                    });
            } else {
                 toast({
                    variant: "destructive",
                    title: "First Time Login Failed",
                    description: "Your account does not exist. Please use the default password 'password' to create it.",
                });
            }
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Incorrect password. If this is your first login, please use 'password'.",
            });
        }
        else {
          // Handle other sign-in errors
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
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
          <CardDescription>Enter your PSG iTech email. Use 'password' for your first login.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
               <Input id="email" type="email" placeholder="yourname@psgitech.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
               <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-[2.2rem] h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
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
