"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/vote');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center gap-3 mb-8">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-primary">
            Hostel Chow Vote
          </h1>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Student Login</CardTitle>
          <CardDescription>Enter your credentials to vote.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input id="student-id" type="text" placeholder="Your student ID" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">Login</Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/login">Back to role selection</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
