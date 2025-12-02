
"use client";

import { useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { AddMenuItemDialog } from "@/components/add-menu-item-dialog";
import { collection } from 'firebase/firestore';

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  
  const { user, isUserLoading, firestore } = useFirebase();
  const auth = useAuth();
  
  const menuItemsRef = useMemoFirebase(() => firestore ? collection(firestore, 'menuItems') : null, [firestore]);
  const { data: menuItems, isLoading: isLoadingMenuItems } = useCollection(menuItemsRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  const handleLogout = () => {
    auth?.signOut();
    router.push('/login');
  };
  
  if (isUserLoading || isLoadingMenuItems) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-card/50 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
             <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
            <h1 className="text-2xl font-bold font-headline text-foreground">
              PSG iTech Hostel Mess
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {role === 'management' && <AddMenuItemDialog />}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <UserCircle className="h-8 w-8 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || (role === 'management' ? 'Management' : 'Student')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-foreground">
              Welcome
            </h2>
            {menuItems.length === 0 ? (
                 <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                 No menu items available for voting. Management can add items.
               </p>
            ) : (
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                    The menu voting system is currently not active. Please check back later.
                </p>
            )}
           
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t border-white/10">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built for the PSG iTech hostel community. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function VotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VotePageContent />
    </Suspense>
  );
}
