'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  useAuth,
  useFirestore,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const MANAGEMENT_EMAIL = 'management@psgitech.ac.in';

export default function ManagementLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [email, setEmail] = useState(MANAGEMENT_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pre-fill email and make it readonly
  useEffect(() => {
    setEmail(MANAGEMENT_EMAIL);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Initialization Error',
        description: 'Services are not ready.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, MANAGEMENT_EMAIL);

      if (signInMethods.length > 0) {
        // User exists, sign in
        await signInWithEmailAndPassword(auth, MANAGEMENT_EMAIL, password);
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Management!',
        });
      } else {
        // New user, create account
         if (password.length < 6) {
          toast({
            variant: 'destructive',
            title: 'Password Too Short',
            description: 'Your password must be at least 6 characters long.',
          });
          setIsSubmitting(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, MANAGEMENT_EMAIL, password);
        const user = userCredential.user;

        // Set display name for management
        await updateProfile(user, { displayName: 'Management' });

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocData = {
          id: user.uid,
          email: user.email,
          name: 'Management',
          hasPassword: true,
        };

        try {
            await setDoc(userDocRef, userDocData);
        } catch (docError: any) {
             if (docError.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: userDocData
                });
                errorEmitter.emit('permission-error', permissionError);
            }
             throw docError; // Re-throw to be caught by outer catch
        }
        
        toast({
          title: 'Account Created!',
          description: 'Welcome, Management! Your account has been set up.',
        });
      }

      router.push('/vote?role=management');

    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code) {
        switch (error.code) {
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Incorrect password. Please try again.';
            break;
          case 'auth/too-many-requests':
            description = 'Access to this account has been temporarily disabled due to many failed login attempts.';
            break;
          default:
             if (!error.message.includes('permission-denied')){ 
                description = error.message;
             }
        }
      }
      if (description) {
        toast({ variant: 'destructive', title: 'Authentication Failed', description });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
       <div className="flex items-center gap-3 mb-8">
        <Image
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s"
          width={40}
          height={40}
          alt="PSG iTech Logo"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-foreground whitespace-nowrap">
          PSG iTech Hostel Mess
        </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Management Sign In</CardTitle>
          <CardDescription>
            Enter the password for the management account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter or create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-[2.2rem] h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
             <p className="px-1 text-xs text-muted-foreground">
                Use 6 or more characters for a new password.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/">Back to role selection</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
