
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
import { collection, doc, updateDoc, increment } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type MenuItem as MenuItemType, DayOfWeek, MenuCategory } from "@/lib/types";
import { MenuItemCard } from "@/components/menu-item-card";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const daysOfWeek: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const categories: MenuCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  
  const { toast } = useToast();
  const { user, isUserLoading, firestore } = useFirebase();
  const auth = useAuth();
  
  const menuItemsRef = useMemoFirebase(() => firestore ? collection(firestore, 'menuItems') : null, [firestore]);
  const { data: menuItems, isLoading: isLoadingMenuItems } = useCollection<MenuItemType>(menuItemsRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth?.signOut();
    router.push('/login');
  };

  const handleVote = (itemId: string) => {
    if (!firestore || role !== 'student') return;

    const itemRef = doc(firestore, 'menuItems', itemId);
    updateDocumentNonBlocking(itemRef, { votes: increment(1) });
    
    toast({
        title: "Vote Cast!",
        description: "Your vote has been successfully recorded.",
    });
  };
  
  const groupedMenuItems = useMemo(() => {
    const grouped: Record<DayOfWeek, Record<MenuCategory, MenuItemType[]>> = {
      sunday: { breakfast: [], lunch: [], snack: [], dinner: [] },
      monday: { breakfast: [], lunch: [], snack: [], dinner: [] },
      tuesday: { breakfast: [], lunch: [], snack: [], dinner: [] },
      wednesday: { breakfast: [], lunch: [], snack: [], dinner: [] },
      thursday: { breakfast: [], lunch: [], snack: [], dinner: [] },
      friday: { breakfast: [], lunch: [], snack: [], dinner: [] },
      saturday: { breakfast: [], lunch: [], snack: [], dinner: [] },
    };

    menuItems.forEach((item) => {
        if (item.day && item.category && grouped[item.day] && grouped[item.day][item.category]) {
            grouped[item.day][item.category].push(item);
        }
    });

    return grouped;
  }, [menuItems]);

  const renderCategory = (day: DayOfWeek, category: MenuCategory) => {
    const items = groupedMenuItems[day]?.[category] ?? [];
    if (items.length === 0) return null;

    return (
      <div key={`${day}-${category}`} className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 capitalize text-foreground/90">{category}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              onVote={handleVote} 
              role={role as 'student' | 'management'} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (isUserLoading || isLoadingMenuItems) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center"><p>Loading...</p></div>;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;

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
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline text-foreground">
              Weekly Menu & Voting
            </h2>
            {menuItems.length === 0 ? (
                 <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                 The menu is not available yet. Management can add items to begin.
               </p>
            ) : (
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                    Vote for your favorite dishes to see them on the menu more often!
                </p>
            )}
           
          </div>

          {menuItems.length > 0 && (
            <Tabs defaultValue={today} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-8">
                {daysOfWeek.map(day => (
                  <TabsTrigger key={day} value={day} className="capitalize">{day}</TabsTrigger>
                ))}
              </TabsList>
              {daysOfWeek.map(day => (
                  <TabsContent key={day} value={day}>
                    {categories.map(category => renderCategory(day, category))}
                    {categories.every(category => (groupedMenuItems[day]?.[category] ?? []).length === 0) && (
                         <div className="text-center py-16">
                            <p className="text-muted-foreground">No menu items scheduled for {day}.</p>
                        </div>
                    )}
                  </TabsContent>
              ))}
            </Tabs>
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

