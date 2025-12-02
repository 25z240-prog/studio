
"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThumbsUp, Trash2 } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

interface MenuItemCardProps {
  item: MenuItem;
  role: 'student' | 'management';
}

export function MenuItemCard({ item, role }: MenuItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleVote = () => {
    // TODO: Implement voting logic
    console.log("Voting for", item.title);
  };

  const handleDelete = async () => {
    if (!firestore || !item.id) return;
    setIsDeleting(true);

    try {
        const itemRef = doc(firestore, 'menuItems', item.id);
        await deleteDocumentNonBlocking(itemRef);
        toast({
            title: "Item Deleted",
            description: `"${item.title}" has been removed from the menu.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || "Could not remove the menu item.",
        });
        setIsDeleting(false);
    }
    // No need to set isDeleting to false here, as the component will unmount on success.
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl}
          alt={item.title}
          data-ai-hint={item.imageHint}
          width={600}
          height={400}
          className="aspect-video w-full object-cover"
        />
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-headline mb-2">{item.title}</CardTitle>
        {item.ingredients && (
            <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-2">
                Ingredients: {item.ingredients}
            </CardDescription>
        )}
        <Badge variant={item.dietaryInfo === 'veg' ? 'secondary' : 'destructive'}>
          {item.dietaryInfo.toUpperCase()}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {role === 'student' && (
          <Button onClick={handleVote} className="w-full">
            <ThumbsUp className="mr-2 h-4 w-4" /> Vote
          </Button>
        )}
        {role === 'management' && (
          <>
            <p className="text-sm text-muted-foreground w-full text-center flex-1">Votes will appear here</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Item</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the menu item
                    <span className="font-semibold text-foreground"> "{item.title}"</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
