
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-lg">
        <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
                <h1 className="font-headline text-xl font-semibold text-foreground">PSG iTech Hostel Mess</h1>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">{email}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8">
            <div className="grid gap-2 relative">
                <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isSubmitting}
                    className="h-12 text-base"
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

            <div className="mt-6 flex items-center justify-between">
                <Button variant="link" asChild className="p-0">
                    <Link href="/login/student">Back to email entry</Link>
                </Button>
                <Button className="w-36" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
            </div>
        </form>
      </div>
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
