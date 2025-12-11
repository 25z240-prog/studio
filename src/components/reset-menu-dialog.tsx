
"use client";

import React, { useState } from 'react';
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
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function ResetMenuDialog() {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleReset = async () => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Firestore not available." });
      return;
    }

    setIsResetting(true);
    
    try {
      const menuStateRef = doc(firestore, 'menuState', 'weekly');
      await setDoc(menuStateRef, { isFinalized: false }, { merge: true });
      
      toast({
        title: "Menu State Reset",
        description: "The menu has been unlocked. Voting is now open again.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Could not reset the menu state. Please try again.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Menu
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset the Weekly Menu State?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will un-finalize the menu, hide it from students, and re-open voting. This is useful if you need to make changes after finalization. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isResetting} className="bg-destructive hover:bg-destructive/90">
            {isResetting ? "Resetting..." : "Yes, Reset Menu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
