
"use client";

import { useEffect, Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth, useFirebase, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { AddMenuItemDialog } from "@/components/add-menu-item-dialog";
import { collection, doc, setDoc } from 'firebase/firestore';
import { DayOfWeek, MenuCategory, type MenuItem, type MenuState } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard } from "@/components/menu-item-card";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { FinalizeMenuDialog } from "@/components/finalize-menu-dialog";
import { ResetMenuDialog } from "@/components/reset-menu-dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const categories: MenuCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};


function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  const { toast } = useToast();
  
  const { user, isUserLoading, firestore } = useFirebase();
  const auth = useAuth();

  const [finalizationTriggered, setFinalizationTriggered] = useState(false);
  
  const menuItemsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'menuItems');
  }, [firestore, user]);
  const { data: menuItems, isLoading: isLoadingMenuItems } = useCollection<MenuItem>(menuItemsRef);

  const menuStateRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'menuState', 'weekly');
  }, [firestore, user]);
  const { data: menuState, isLoading: isLoadingMenuState } = useDoc<MenuState>(menuStateRef);

  const isFinalized = menuState?.isFinalized || false;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  // Effect for automatic finalization
  useEffect(() => {
    if (isLoadingMenuState || isFinalized || finalizationTriggered || !firestore || !user) {
      return;
    }

    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday: 0, Monday: 1, ...

    // Check if it's Monday (day 1)
    if (dayOfWeek === 1) {
      const finalize = async () => {
        setFinalizationTriggered(true); // Prevent multiple triggers in the same session
        try {
          const menuStateRef = doc(firestore, 'menuState', 'weekly');
          await setDoc(menuStateRef, { isFinalized: true }, { merge: true });
          
          toast({
            title: "Menu Automatically Finalized",
            description: "The menu for the week has been locked in based on votes.",
          });
        } catch (error: any) {
          console.error("Auto-finalization failed:", error);
          toast({
            variant: "destructive",
            title: "Auto-Finalization Failed",
            description: "Could not automatically finalize the menu.",
          });
           setFinalizationTriggered(false); // Allow retry if it failed
        }
      };
      
      finalize();
    }
  }, [isLoadingMenuState, isFinalized, firestore, user, toast, finalizationTriggered]);

  const handleLogout = () => {
    auth?.signOut();
    router.push('/');
  };

  const groupedMenuItems = useMemo(() => {
    if (!menuItems) return {};
    const grouped = menuItems.reduce((acc, item) => {
      const day = item.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    }, {} as { [key in DayOfWeek]?: MenuItem[] });

    if (isFinalized && role === 'student') {
        const finalMenu: { [key in DayOfWeek]?: MenuItem[] } = {};
        for (const day in grouped) {
            finalMenu[day as DayOfWeek] = [];
            for (const category of categories) {
                const categoryItems = grouped[day as DayOfWeek]?.filter(item => item.category === category);
                if (categoryItems && categoryItems.length > 0) {
                    const topItem = categoryItems.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
                    finalMenu[day as DayOfWeek]?.push(topItem);
                }
            }
        }
        return finalMenu;
    }

    return grouped;
  }, [menuItems, isFinalized, role]);

  const defaultDay = useMemo(() => {
    const todayIndex = new Date().getDay(); // Sunday: 0, Monday: 1, etc.
    const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    return daysOfWeek[adjustedIndex];
  }, []);


  if (isUserLoading || isLoadingMenuItems || isLoadingMenuState) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center"><p>Loading...</p></div>;
  }
  
  const renderCategory = (day: DayOfWeek, category: MenuCategory) => {
    let items = groupedMenuItems[day]
      ?.filter(item => item.category === category);
  
    if (role === 'management' && items) {
        items = items.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
  
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No items for {category} on {day}.</p>;
    }
  
    return (
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, index) => (
          <motion.div key={item.id} variants={itemVariants}>
            <MenuItemCard 
              item={item} 
              role={role as 'student' | 'management'} 
              rank={role === 'management' ? index + 1 : undefined}
              isFinalized={isFinalized}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-card/50 backdrop-blur-lg">
        <div className="container flex h-auto min-h-16 flex-wrap items-center justify-end gap-x-4 gap-y-2 py-2 md:flex-nowrap">
          <Link href={`/vote?role=${role}`} className="mr-auto flex items-center gap-3">
             <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
            <h1 className="text-base sm:text-xl md:text-2xl font-bold font-headline text-foreground whitespace-nowrap">
              PSG iTech Hostel Mess
            </h1>
          </Link>
           <div className="flex items-center gap-2">
             {role === 'management' && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {isFinalized ? (
                  <ResetMenuDialog />
                ) : (
                  <>
                    <FinalizeMenuDialog />
                    <AddMenuItemDialog />
                  </>
                )}
              </div>
            )}
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
                {user && <EditProfileDialog user={user} />}
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
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline text-foreground">
              Weekly Mess Menu
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              {isFinalized && role === 'student' 
                ? "This week's official menu has been finalized." 
                : (role === 'student' ? 'Vote for your favorite dishes!' : 'Manage the weekly menu.')}
            </p>
            {role === 'student' && !isFinalized && (
                <p className="mx-auto max-w-[700px] text-sky-400 text-sm mt-2">
                  Note: Voting closes and the menu is finalized automatically every Monday at 12:00 AM.
                </p>
            )}
             {isFinalized && role === 'management' && (
                <p className="mxauto max-w-[700px] text-amber-400 md:text-xl mt-4">
                  The menu has been finalized. To make changes, reset the menu state.
                </p>
            )}
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
               {role === 'management' && !isFinalized && (
                <p className="text-muted-foreground mt-2">Click "Add Menu Item" in the header to get started.</p>
              )}
            </div>
          )}

        </motion.section>
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
