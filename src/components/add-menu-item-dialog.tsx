
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
import { useFirestore, useStorage } from "@/firebase";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle, Upload } from 'lucide-react';
import { DayOfWeek, MenuCategory, DietaryInfo } from '@/lib/types';

const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const categories: MenuCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const dietaryInfos: DietaryInfo[] = ['veg', 'non-veg'];


export function AddMenuItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!firestore || !storage) {
        toast({ variant: "destructive", title: "Error", description: "Services not available." });
        setIsSubmitting(false);
        return;
    }

    if (!selectedFile) {
        toast({ variant: "destructive", title: "Missing Image", description: "Please upload an image for the menu item." });
        setIsSubmitting(false);
        return;
    }

    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const category = formData.get('category') as MenuCategory;
    const day = formData.get('day') as DayOfWeek;
    const dietaryInfo = formData.get('dietaryInfo') as DietaryInfo;

    if (!title || !category || !day || !dietaryInfo) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required fields." });
        setIsSubmitting(false);
        return;
    }

    try {
        // 1. Upload image to Firebase Storage
        const imageRef = ref(storage, `menuItems/${Date.now()}_${selectedFile.name}`);
        const uploadResult = await uploadBytes(imageRef, selectedFile);
        
        // 2. Get the public URL of the uploaded image
        const imageUrl = await getDownloadURL(uploadResult.ref);

        // 3. Create the new menu item object with the image URL
        const newItem = {
          title,
          category,
          day,
          dietaryInfo,
          ingredients: formData.get('ingredients') as string,
          imageUrl,
          imageHint: "food meal",
          votes: 0,
        };

        // 4. Add the new item document to Firestore
        const menuItemsCollection = collection(firestore, 'menuItems');
        await addDocumentNonBlocking(menuItemsCollection, newItem);
        
        toast({
            title: "Success",
            description: "Menu item has been added.",
        });
        
        // Reset form and close dialog
        setIsOpen(false);
        setSelectedFile(null);
        setFileName('');
        (event.target as HTMLFormElement).reset();

    } catch (error: any) {
        console.error("Error adding menu item:", error);
        let description = "Could not add the menu item.";
        if(error.code?.includes('storage')) {
          description = "Image upload failed. Please try again."
        }
        toast({
            variant: "destructive",
            title: "Submission Error",
            description,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            setSelectedFile(null);
            setFileName('');
        }
    }}>
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
                <Label htmlFor="picture" className="text-right">Image</Label>
                <div className="col-span-3">
                  <Input id="picture-input" type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
                  <Label htmlFor="picture-input" className="cursor-pointer">
                      <div className="flex items-center gap-2 rounded-md border border-input p-2 hover:bg-accent hover:text-accent-foreground">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                              {fileName || 'Upload an image'}
                          </span>
                      </div>
                  </Label>
                </div>
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
