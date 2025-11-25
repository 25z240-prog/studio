"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, User, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="flex items-center gap-3 mb-8">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-primary">
              Hostel Chow Vote
            </h1>
        </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Select Your Role</CardTitle>
          <CardDescription>Please choose your login type to continue.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link href="/login/student" passHref>
            <Button variant="outline" className="w-full h-16 text-lg">
              <User className="mr-3 h-6 w-6" />
              Student Login
            </Button>
          </Link>
          <Link href="/login/management" passHref>
            <Button variant="outline" className="w-full h-16 text-lg">
              <Shield className="mr-3 h-6 w-6" />
              Management Login
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="py-6 md:px-8 md:py-0 mt-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built for the hostel community. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
