'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, School } from 'lucide-react';

export default function RoleSelectionPage() {
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
          <CardTitle className="text-2xl font-headline">Choose Your Role</CardTitle>
          <CardDescription>Select your role to sign in and continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link href="/login/student" passHref legacyBehavior>
            <Button asChild className="w-full h-12 text-base">
              <a>
                <User className="mr-2 h-5 w-5" />
                Student
              </a>
            </Button>
          </Link>
          <Link href="/login/management" passHref legacyBehavior>
            <Button asChild variant="secondary" className="w-full h-12 text-base">
               <a>
                <School className="mr-2 h-5 w-5" />
                Management
              </a>
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="py-6 md:px-8 md:py-0 mt-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built for the PSG iTech hostel community. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
