
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
import { ThumbsUp, Trash2, CheckCheck } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, runTransaction, getDoc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface MenuItemCardProps {
  item: MenuItem;
  role: 'student' | 'management';
  rank?: number;
  isFinalized?: boolean;
}

export function MenuItemCard({ item, role, rank, isFinalized = false }: MenuItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (role === 'student' && user && firestore && item.id) {
      const voteRef = doc(firestore, 'userVotes', `${user.uid}_${item.id}`);
      getDoc(voteRef).then(docSnap => {
        if (docSnap.exists()) {
          setHasVoted(true);
        }
      });
    }
  }, [user, firestore, item.id, role]);

  const handleVote = async () => {
    if (!firestore || !user || !item.id) return;
    setIsVoting(true);

    const itemRef = doc(firestore, 'menuItems', item.id);
    const voteRef = doc(firestore, 'userVotes', `${user.uid}_${item.id}`);
    const voteData = { userId: user.uid, menuItemId: item.id, votedAt: new Date() };

    try {
      await runTransaction(firestore, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);
        if (voteDoc.exists()) {
          toast({
            variant: "destructive",
            title: "Already Voted",
            description: "You have already voted for this item.",
          });
          return; // Stop the transaction
        }

        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
          throw new Error("Menu item does not exist!");
        }

        const newVoteCount = (itemDoc.data().votes || 0) + 1;
        transaction.update(itemRef, { votes: newVoteCount });
        transaction.set(voteRef, voteData);
      });

      setHasVoted(true); // Update UI to reflect the vote
      toast({
        title: "Vote Cast!",
        description: `Your vote for "${item.title}" has been recorded.`,
      });

    } catch (error: any) {
      // This is where we catch permission errors from the transaction
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: voteRef.path, // The vote creation is the most likely failure point
          operation: 'create',
          requestResourceData: voteData,
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
         console.error("Voting failed:", error);
         toast({
           variant: "destructive",
           title: "Vote Failed",
           description: error.message || "Could not record your vote. Please try again.",
         });
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !item.id) return;
    setIsDeleting(true);
    
    try {
        const itemRef = doc(firestore, 'menuItems', item.id);
        // Use the non-blocking delete function which has built-in contextual error handling
        deleteDocumentNonBlocking(itemRef);
        toast({
            title: "Item Deleted",
            description: `"${item.title}" has been removed from the menu.`,
        });
    } catch (error: any) {
        // This catch is a fallback, but the non-blocking function will emit the detailed error
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || "Could not remove the menu item.",
        });
        setIsDeleting(false);
    }
    // The component will unmount on success, so no need to setIsDeleting(false) in the success path.
  };
  
  const currentVotes = item.votes || 0;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/80 text-yellow-950 border-yellow-600/50'; // Gold
    if (rank === 2) return 'bg-slate-400/80 text-slate-950 border-slate-500/50'; // Silver
    if (rank === 3) return 'bg-orange-400/80 text-orange-950 border-orange-500/50'; // Bronze
    return 'bg-secondary/80 text-secondary-foreground border-border';
  };

  return (
    <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="flex flex-col overflow-hidden h-full">
        <CardHeader className="p-0 relative">
          <Image
            src={item.imageUrl}
            alt={item.title}
            data-ai-hint={item.imageHint}
            width={600}
            height={400}
            className="aspect-video w-full object-cover"
          />
           {role === 'management' && rank && (
            <Badge
              className={`absolute top-2 left-2 text-base font-bold backdrop-blur-sm ${getRankColor(rank)}`}
            >
              #{rank}
            </Badge>
          )}
           {isFinalized && role === 'student' && (
              <Badge
                  variant="default"
                  className="absolute top-2 right-2 text-base font-bold backdrop-blur-sm bg-green-600/90 text-white border-green-700/80"
              >
                  <CheckCheck className="mr-2 h-5 w-5" />
                  Finalized
              </Badge>
          )}
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
        <CardFooter className="p-4 pt-0 flex gap-2 items-center">
          {role === 'student' && !isFinalized && (
            <Button onClick={handleVote} className="w-full" disabled={isVoting || hasVoted}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              <span className="flex-1">{hasVoted ? 'Voted' : 'Vote'}</span>
               {currentVotes > 0 && (
                  <Badge variant="outline" className="ml-2 bg-background/50 backdrop-blur-sm">
                    {currentVotes}
                  </Badge>
                )}
            </Button>
          )}
           {role === 'student' && isFinalized && (
               <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{currentVotes} {currentVotes === 1 ? 'Vote' : 'Votes'}</span>
              </div>
          )}
          {role === 'management' && (
            <>
               <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{currentVotes} {currentVotes === 1 ? 'Vote' : 'Votes'}</span>
              </div>
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
    </motion.div>
  );
}
