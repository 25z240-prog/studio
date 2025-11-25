"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Plus, UtensilsCrossed, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuItemCard from "@/components/menu-item-card";
import AddMenuItemDialog from "@/components/add-menu-item-dialog";
import { initialMenuItems } from "@/lib/data";
import { type MenuItem } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role');

  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());

  const handleVote = (itemId: string) => {
    if (votedItems.has(itemId)) return;

    setMenuItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, votes: item.votes + 1 } : item
      )
    );
    setVotedItems(prev => new Set(prev).add(itemId));
  };

  const handleAddItem = (newItemData: Omit<MenuItem, "id" | "votes">) => {
    const fullNewItem: MenuItem = {
      ...newItemData,
      id: new Date().toISOString(),
      votes: 0,
    };
    setMenuItems((currentItems) => [fullNewItem, ...currentItems]);
  };
  
  const sortedMenuItems = [...menuItems].sort((a, b) => b.votes - a.votes);

  const showProposeButton = role === 'management';

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">
              Hostel Chow Vote
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              Weekly Menu Proposals
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
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
                  isVoted={votedItems.has(item.id)}
                />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight font-headline">
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
            Built for the hostel community. All rights reserved.
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
