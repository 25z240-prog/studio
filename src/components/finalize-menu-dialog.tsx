
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
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function FinalizeMenuDialog() {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleFinalize = async () => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Firestore not available." });
      return;
    }

    setIsFinalizing(true);
    
    try {
      const menuStateRef = doc(firestore, 'menuState', 'weekly');
      await setDoc(menuStateRef, { isFinalized: true }, { merge: true });
      
      toast({
        title: "Menu Finalized",
        description: "The menu for the week has been locked in and is now visible to students.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Finalization Failed",
        description: error.message || "Could not finalize the menu. Please try again.",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <CheckCircle className="mr-2 h-4 w-4" />
          Finalize Menu
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalize the Weekly Menu?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will lock the menu for the upcoming week based on the current votes. This process cannot be undone. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isFinalizing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleFinalize} disabled={isFinalizing}>
            {isFinalizing ? "Finalizing..." : "Yes, Finalize Menu"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    