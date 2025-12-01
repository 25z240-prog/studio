
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
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { useAuth, useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function StudentLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("Test Student");
  const [email, setEmail] = useState("student@psgitech.ac.in");
  const [password, setPassword] = useState("password");

  // This effect will attempt to create the management user once.
  // It will silently fail if the user already exists, which is fine.
  useEffect(() => {
    if (auth) {
      initiateEmailSignUp(auth, "management@psgitech.ac.in", "psg@123@Management", "Management")
        .then(userCredential => {
            if (userCredential?.user && firestore) {
                 const userDocRef = doc(firestore, "users", userCredential.user.uid);
                 setDocumentNonBlocking(userDocRef, { 
                    id: userCredential.user.uid,
                    name: "Management",
                    email: "management@psgitech.ac.in"
                 }, {});
            }
        })
        .catch(() => {
          // Ignore errors (e.g., user already exists)
        });
    }
  }, [auth, firestore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;

    if (isSignUp) {
      initiateEmailSignUp(auth, email, password, name)
        .then(userCredential => {
          if (userCredential?.user) {
              const userDocRef = doc(firestore, "users", userCredential.user.uid);
              setDocumentNonBlocking(userDocRef, { 
                id: userCredential.user.uid,
                name: name,
                email: email 
              }, {});
              toast({
                  title: "Account Created!",
                  description: "You've been successfully signed up.",
              });
              router.push('/vote?role=student');
          }
        })
        .catch(error => {
           toast({
              variant: "destructive",
              title: "Sign Up Failed",
              description: error.message || "An unexpected error occurred.",
          });
        });
      
    } else {
      initiateEmailSignIn(auth, email, password)
       .then(() => {
          toast({
              title: "Logging in...",
              description: "Please wait while we log you in.",
          });
          router.push('/vote?role=student');
       })
       .catch(() => {
           toast({
              variant: "destructive",
              title: "Login Failed",
              description: "User does not exist or incorrect password.",
          });
       });
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
          <CardTitle className="text-2xl font-headline">{isSignUp ? 'Create Student Account' : 'Student Login'}</CardTitle>
          <CardDescription>{isSignUp ? 'Enter your details to create an account.' : 'Enter your credentials to vote.'}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
               <Input id="email" type="email" placeholder="student@psgitech.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">{isSignUp ? 'Sign Up' : 'Login'}</Button>
             <Button variant="link" size="sm" type="button" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
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
