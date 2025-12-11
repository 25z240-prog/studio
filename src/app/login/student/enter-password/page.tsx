
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
import { useAuth } from "@/firebase/provider";
import { signInWithEmailAndPassword, AuthErrorCodes } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

function EnterPasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const { toast } = useToast();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const email = searchParams.get('email');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !email) return;

        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Success!",
                description: "You are now logged in.",
            });
            router.push('/vote?role=student');
        } catch (error: any) {
             let description = "An unexpected error occurred. Please try again.";
            if (error.code === AuthErrorCodes.INVALID_PASSWORD || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "The email or password you entered is incorrect. Please try again.";
            } else if (error.code === 'auth/user-not-found') {
                 description = "No account found with this email.";
            } else if (error.code === 'auth/too-many-requests') {
                description = "Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.";
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: description,
            });
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
                    <CardTitle className="text-2xl font-headline">
                        Welcome Back!
                    </CardTitle>
                    <CardDescription>
                        Enter your password for {email} to sign in.
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
                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Logging In..." : "Login"}
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

export default function StudentEnterPasswordPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <EnterPasswordPageContent />
      </Suspense>
    );
}
