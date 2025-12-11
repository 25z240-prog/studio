
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
import { createUserWithEmailAndPassword, updateProfile, AuthErrorCodes, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

function CreatePasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const email = searchParams.get('email');

    useEffect(() => {
        if (!email) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Email not provided. Please go back and start again.",
            });
            router.push('/login/student');
            return;
        }

        if (!auth) {
            // Auth might not be initialized yet, wait for it.
            return;
        }

        const checkUser = async () => {
            try {
                const signInMethods = await fetchSignInMethodsForEmail(auth, email);
                if (signInMethods.length > 0) {
                    // User exists, redirect to enter password page
                    router.replace(`/login/student/enter-password?email=${encodeURIComponent(email)}`);
                } else {
                    // New user, show the page content
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error checking for email:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not verify your email. Please try again.",
                });
                setIsLoading(false);
            }
        };

        checkUser();

    }, [email, auth, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore || !email) return;

        if (password.length < 6) {
            toast({ variant: "destructive", title: "Password Too Short", description: "Password must be at least 6 characters long." });
            return;
        }

        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords Don't Match", description: "Please make sure your passwords match." });
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
                uid: user.uid,
                email: user.email,
                name: name,
                role: 'student',
                hasPassword: true
            });

            toast({
                title: "Account Ready!",
                description: "You are now logged in.",
            });
            router.push('/vote?role=student');

        } catch (error: any) {
            let description = "An unexpected error occurred. Please try again.";
            if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
                description = "This email is already registered. Please go back and log in.";
                router.push(`/login/student/enter-password?email=${encodeURIComponent(email)}`);
            } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
                description = "The password is too weak. Please use a stronger password.";
            }
            toast({ variant: "destructive", title: "Registration Failed", description });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading || !email) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <p>Verifying email...</p>
        </div>
      );
    }


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
                    <CardTitle className="text-2xl font-headline">
                       Create Your Password
                    </CardTitle>
                    <CardDescription>
                        You're almost there! Create a password for {email}.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2 relative">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} />
                        </div>
                         <div className="grid gap-2 relative">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isSubmitting} />
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
                           {isSubmitting ? "Creating Account..." : "Create Account & Login"}
                        </Button>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/login/student">Back to email</Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}


export default function StudentCreatePasswordPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <CreatePasswordPageContent />
      </Suspense>
    );
}
