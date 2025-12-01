
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
import { useAuth, useFirestore } from "@/firebase/provider";
import { doc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, UserCredential, AuthErrorCodes } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

function PasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const email = searchParams.get('email');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    useEffect(() => {
        if (!email) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Email not provided. Please go back and start again.",
            });
            router.push('/login/student');
        }
    }, [email, router, toast]);

    const handleLoginSuccess = async (userCredential: UserCredential) => {
        if (!firestore || !userCredential.user) return;

        router.push('/vote?role=student');
        
        const user = userCredential.user;
        const studentName = user.email!.split('@')[0];

        try {
            if (!user.displayName) {
                await updateProfile(user, { displayName: studentName });
            }
            
            const userDocRef = doc(firestore, "users", user.uid);
            await setDoc(userDocRef, {
                id: user.uid,
                name: studentName,
                email: user.email
            }, { merge: true });

            toast({
                title: "Success!",
                description: "You are now logged in.",
            });

        } catch (error) {
            console.error("Error during profile update or firestore write:", error);
            toast({
                variant: "destructive",
                title: "Setup Failed",
                description: "You are logged in, but we couldn't save your profile. Please try refreshing the page.",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !email) return;

        if (isNewUser && password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "Please re-enter your password and confirm it.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let userCredential;
            if (isNewUser) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            await handleLoginSuccess(userCredential);
        } catch (error: any) {
            let description = "An unexpected error occurred. Please try again.";
            if (error.code === AuthErrorCodes.INVALID_PASSWORD || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "The password you entered is incorrect. Please try again.";
            } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
                description = "Your password is too weak. Please choose a stronger one with at least 6 characters.";
            } else if (error.code === 'auth/too-many-requests') {
                description = "Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.";
            }
            toast({
                variant: "destructive",
                title: isNewUser ? "Registration Failed" : "Login Failed",
                description: description,
            });
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
                    <CardTitle className="text-2xl font-headline">
                        {isNewUser ? "Create Your Password" : "Welcome Back!"}
                    </CardTitle>
                    <CardDescription>
                        {isNewUser ? `You're new here! Set a password for ${email}.` : `Enter your password to sign in.`}
                    </CardDescription>
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
                            </Button>
                        </div>
                        {isNewUser && (
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isSubmitting} />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : (isNewUser ? "Create Account & Login" : "Login")}
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


export default function StudentPasswordPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <PasswordPageContent />
      </Suspense>
    );
  }
