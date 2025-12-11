
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';
import { DayOfWeek, MenuCategory, DietaryInfo } from '@/lib/types';

const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const categories: MenuCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const dietaryInfos: DietaryInfo[] = ['veg', 'non-veg'];


export function AddMenuItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Firestore not available." });
        setIsSubmitting(false);
        return;
    }

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const newItem = {
      title: title,
      category: formData.get('category') as MenuCategory,
      day: formData.get('day') as DayOfWeek,
      dietaryInfo: formData.get('dietaryInfo') as DietaryInfo,
      ingredients: formData.get('ingredients') as string,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`,
      imageHint: "food meal",
      votes: 0,
    };

    if (!newItem.title || !newItem.category || !newItem.day || !newItem.dietaryInfo) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required fields." });
        setIsSubmitting(false);
        return;
    }

    try {
        const menuItemsCollection = collection(firestore, 'menuItems');
        await addDocumentNonBlocking(menuItemsCollection, newItem);
        
        toast({
            title: "Success",
            description: "Menu item has been added.",
        });
        setIsOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: error.message || "Could not add the menu item.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>
            Fill in the details for the new menu item. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select name="category" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Day
              </Label>
              <Select name="day" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dietaryInfo" className="text-right">
                Dietary Info
              </Label>
              <Select name="dietaryInfo" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select dietary type" />
                </SelectTrigger>
                <SelectContent>
                  {dietaryInfos.map(info => <SelectItem key={info} value={info}>{info.charAt(0).toUpperCase() + info.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ingredients" className="text-right">
                Ingredients
              </Label>
              <Textarea id="ingredients" name="ingredients" placeholder="e.g., Rice, lentils, spices" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
