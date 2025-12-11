
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
import { DayOfWeek, MenuCategory, type MenuItem } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard } from "@/components/menu-item-card";

const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const categories: MenuCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  
  const { user, isUserLoading, firestore } = useFirebase();
  const auth = useAuth();
  
  const menuItemsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'menuItems');
  }, [firestore, user]);
  const { data: menuItems, isLoading: isLoadingMenuItems } = useCollection<MenuItem>(menuItemsRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth?.signOut();
    router.push('/login');
  };

  const groupedMenuItems = useMemo(() => {
    if (!menuItems) return {};
    return menuItems.reduce((acc, item) => {
      const day = item.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    }, {} as { [key in DayOfWeek]?: MenuItem[] });
  }, [menuItems]);

  const defaultDay = useMemo(() => {
    const todayIndex = new Date().getDay(); // Sunday: 0, Monday: 1, etc.
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    return daysOfWeek[adjustedIndex];
  }, []);


  if (isUserLoading || isLoadingMenuItems) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center"><p>Loading...</p></div>;
  }
  
  const renderCategory = (day: DayOfWeek, category: MenuCategory) => {
    const items = groupedMenuItems[day]?.filter(item => item.category === category);
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No items for {category} on {day}.</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <MenuItemCard key={item.id} item={item} role={role as 'student' | 'management'} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-card/50 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/login" className="flex items-center gap-3 flex-shrink-1 min-w-0">
             <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
            <h1 className="text-base sm:text-xl md:text-2xl font-bold font-headline text-foreground whitespace-nowrap">
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
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline text-foreground">
              Weekly Mess Menu
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              Here's what's cooking this week. {role === 'student' ? 'Vote for your favorite dishes!' : 'Manage the weekly menu.'}
            </p>
          </div>

          {(menuItems || []).length > 0 ? (
            <Accordion type="single" collapsible className="w-full" defaultValue={`${defaultDay}-menu`}>
              {daysOfWeek.map(day => (
                <AccordionItem value={`${day}-menu`} key={day}>
                  <AccordionTrigger className="text-2xl font-headline capitalize">
                    {day}
                  </AccordionTrigger>
                  <AccordionContent>
                     <Tabs defaultValue="breakfast" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                           {categories.map(category => (
                            <TabsTrigger key={category} value={category} className="capitalize">{category}</TabsTrigger>
                          ))}
                        </TabsList>
                        {categories.map(category => (
                          <TabsContent key={category} value={category} className="mt-6">
                            {renderCategory(day, category)}
                          </TabsContent>
                        ))}
                      </Tabs>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No menu items have been added yet.</p>
               {role === 'management' && (
                <p className="text-muted-foreground mt-2">Click "Add Menu Item" in the header to get started.</p>
              )}
            </div>
          )}

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
