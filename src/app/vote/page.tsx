
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Plus, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuItemCard from "@/components/menu-item-card";
import AddMenuItemDialogClient from "@/components/add-menu-item-dialog";
import { type MenuItem, type MenuCategory, type DayOfWeek } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, increment } from "firebase/firestore";


const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const categories: MenuCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');
  
  const { firestore, user, isUserLoading } = useFirebase();
  const auth = useAuth();
  
  const menuItemsQuery = useMemoFirebase(() => 
    firestore && !isUserLoading && user ? collection(firestore, 'menuItems') : null, 
    [firestore, isUserLoading, user]
  );
  const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsQuery);
  
  const votesQuery = useMemoFirebase(() =>
    firestore && user ? collection(firestore, `users/${user.uid}/votes`) : null,
    [firestore, user]
  );
  const { data: userVotes, isLoading: isLoadingVotes } = useCollection(votesQuery);

  const votedItems = useMemo(() => new Set(userVotes?.map(v => v.menuItemId) || []), [userVotes]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleVote = (itemId: string) => {
    if (!firestore || !user || votedItems.has(itemId) || role === 'management') return;
    
    const menuItemRef = doc(firestore, "menuItems", itemId);
    const voteRef = doc(firestore, `users/${user.uid}/votes`, itemId);

    setDocumentNonBlocking(menuItemRef, { votes: increment(1) }, { merge: true });
    setDocumentNonBlocking(voteRef, { menuItemId: itemId, voterId: user.uid, rank: 1, id: itemId }, {merge: true});
  };

  const handleRevokeVote = (itemId: string) => {
    if (!firestore || !user || !votedItems.has(itemId) || role === 'management') return;
    
    const menuItemRef = doc(firestore, "menuItems", itemId);
    const voteRef = doc(firestore, `users/${user.uid}/votes`, itemId);

    setDocumentNonBlocking(menuItemRef, { votes: increment(-1) }, { merge: true });
    deleteDocumentNonBlocking(voteRef);
  };

  const handleAddItem = (newItemData: Omit<MenuItem, "id" | "votes">) => {
    if (!firestore || !user) return;
    const menuItemsCollection = collection(firestore, 'menuItems');
    addDocumentNonBlocking(menuItemsCollection, { ...newItemData, votes: 0, submitterId: user.uid });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!firestore) return;
    const menuItemRef = doc(firestore, "menuItems", itemId);
    deleteDocumentNonBlocking(menuItemRef);
  };

  
  const sortedMenuItems = useMemo(() => 
    [...(menuItems || [])].sort((a, b) => b.votes - a.votes),
    [menuItems]
  );

  const showProposeButton = role === 'management';

  const handleLogout = () => {
    auth?.signOut();
    router.push('/login');
  };
  
  const renderCategory = (day: DayOfWeek, category: MenuCategory) => {
    const categoryItems = sortedMenuItems.filter(item => item.day === day && item.category === category);

    if (categoryItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center mt-6">
            <h3 className="text-xl font-bold tracking-tight font-headline text-foreground">
                No {category} items for {day}.
            </h3>
            <p className="text-muted-foreground mt-2">
                {showProposeButton ? "Propose a dish to get started!" : `Check back later.`}
            </p>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
            {categoryItems.map((item) => (
            <MenuItemCard 
                key={item.id} 
                item={item} 
                rank={sortedMenuItems.findIndex(sortedItem => sortedItem.id === item.id) + 1}
                onVote={() => handleVote(item.id)}
                onRevokeVote={() => handleRevokeVote(item.id)}
                isVoted={votedItems.has(item.id)}
                onDeleteItem={() => handleDeleteItem(item.id)}
                role={role}
            />
            ))}
        </div>
    );
  };

  if (isUserLoading || isLoadingMenu || isLoadingVotes) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center"><p>Loading menu...</p></div>;
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
            {showProposeButton && (
              <AddMenuItemDialogClient
                onAddItem={handleAddItem}
              >
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Propose an Item
                </Button>
              </AddMenuItemDialogClient>
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
              Weekly Menu Proposals
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              Vote for your favorite dishes to see them on next week&apos;s menu! The most popular items win.
            </p>
          </div>

          {(menuItems?.length || 0) > 0 ? (
             <Tabs defaultValue="monday" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    {daysOfWeek.map(day => (
                        <TabsTrigger key={day} value={day} className="capitalize">{day}</TabsTrigger>
                    ))}
                </TabsList>
                {daysOfWeek.map(day => (
                  <TabsContent key={day} value={day}>
                    <Tabs defaultValue="breakfast" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-4">
                          {categories.map(category => (
                            <TabsTrigger key={category} value={category} className="capitalize">{category}</TabsTrigger>
                          ))}
                      </TabsList>
                      {categories.map(category => (
                          <TabsContent key={category} value={category}>
                              {renderCategory(day, category)}
                          </TabsContent>
                      ))}
                    </Tabs>
                  </TabsContent>
                ))}
            </Tabs>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={48} height={48} alt="PSG iTech Logo" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight font-headline text-foreground">
                    No menu items have been proposed yet.
                </h3>
                <p className="text-muted-foreground mt-2">
                    {showProposeButton ? "As management, you can be the first to propose a dish!" : "Please check back later to see the menu proposals."}
                </p>
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
