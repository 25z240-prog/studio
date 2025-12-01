"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuItemCard from "@/components/menu-item-card";
import AddMenuItemDialog from "@/components/add-menu-item-dialog";
import { initialMenuItems } from "@/lib/data";
import { type MenuItem } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LOCAL_STORAGE_KEY = 'hostelMenuItems';

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItems) {
        setMenuItems(JSON.parse(storedItems));
      } else {
        setMenuItems(initialMenuItems);
      }
    } catch (error) {
      console.error("Could not load menu items from local storage", error);
      setMenuItems(initialMenuItems);
    } finally {
        setIsLoaded(true);
    }
    
    const storedVotedItems = localStorage.getItem('votedItems');
    if(storedVotedItems) {
        setVotedItems(new Set(JSON.parse(storedVotedItems)));
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(menuItems));
        } catch (error) {
            console.error("Could not save menu items to local storage", error);
        }
    }
  }, [menuItems, isLoaded]);
  
  useEffect(() => {
    if(isLoaded) {
      try {
        localStorage.setItem('votedItems', JSON.stringify(Array.from(votedItems)));
      } catch (error) {
        console.error("Could not save voted items to local storage", error);
      }
    }
  }, [votedItems, isLoaded]);


  const handleVote = (itemId: string) => {
    if (votedItems.has(itemId) || role === 'management') return;

    setMenuItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, votes: item.votes + 1 } : item
      )
    );
    setVotedItems(prev => new Set(prev).add(itemId));
  };

  const handleRevokeVote = (itemId: string) => {
    if (!votedItems.has(itemId) || role === 'management') return;

    setMenuItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, votes: Math.max(0, item.votes - 1) } : item
      )
    );
    setVotedItems(prev => {
        const newVoted = new Set(prev);
        newVoted.delete(itemId);
        return newVoted;
    });
  };

  const handleAddItem = (newItemData: Omit<MenuItem, "id" | "votes">) => {
    const fullNewItem: MenuItem = {
      ...newItemData,
      id: new Date().toISOString(),
      votes: 0,
    };
    setMenuItems((currentItems) => [fullNewItem, ...currentItems]);
  };

  const handleDeleteItem = (itemId: string) => {
    setMenuItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };
  
  const sortedMenuItems = [...menuItems].sort((a, b) => b.votes - a.votes);

  const showProposeButton = role === 'management';

  const handleLogout = () => {
    // Voted items are cleared for the next user, but menu items persist.
    localStorage.removeItem('votedItems');
    router.push('/login');
  };

  if (!isLoaded) {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center"><p>Loading menu...</p></div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
             <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={32} height={32} alt="PSG iTech Logo" />
            <h1 className="text-2xl font-bold font-headline text-primary">
              PSG iTech Hostel Mess
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {showProposeButton && (
              <AddMenuItemDialog
                onAddItem={handleAddItem}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              >
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Propose an Item
                </Button>
              </AddMenuItemDialog>
            )}
             <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-foreground">
              Weekly Menu Proposals
            </h2>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl mt-4">
              Vote for your favorite dishes to see them on next week&apos;s menu! The most popular items win.
            </p>
          </div>

          {sortedMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedMenuItems.map((item, index) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  rank={index + 1}
                  onVote={() => handleVote(item.id)}
                  onRevokeVote={() => handleRevokeVote(item.id)}
                  isVoted={votedItems.has(item.id)}
                  onDeleteItem={() => handleDeleteItem(item.id)}
                  role={role}
                />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Y3hSktYhqo6-09Gyrt3YmhIBpJesKIdIxw&s" width={48} height={48} alt="PSG iTech Logo" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight font-headline text-foreground">
                    No menu items proposed yet.
                </h3>
                <p className="text-muted-foreground mt-2">
                    {showProposeButton ? "Be the first to propose a delicious new dish for the menu!" : "No items have been proposed for voting yet."}
                </p>
                {showProposeButton && (
                    <AddMenuItemDialog
                    onAddItem={handleAddItem}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    >
                    <Button className="mt-6">
                        <Plus className="mr-2 h-4 w-4" />
                        Propose an Item
                    </Button>
                    </AddMenuItemDialog>
                )}
            </div>
          )}
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
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
