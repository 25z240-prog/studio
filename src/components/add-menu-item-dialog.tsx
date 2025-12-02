
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type MenuItem, type MenuCategory, type DayOfWeek } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  imageUrl: z.string().url("Please enter a valid image URL."),
  day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
    required_error: "You need to select a day."
  }),
  category: z.enum(["breakfast", "lunch", "snack", "dinner"], {
    required_error: "You need to select a category."
  }),
  ingredients: z.string().min(1, "Please list at least one ingredient."),
  dietaryInfo: z.enum(["veg", "non-veg"], {
    required_error: "You need to select a dietary option."
  }),
});


type AddMenuItemDialogProps = {
  children: React.ReactNode;
  onAddItem: (item: Omit<MenuItem, "id" | "votes">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddMenuItemDialog({ children, onAddItem, open, onOpenChange }: AddMenuItemDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      ingredients: "",
      imageUrl: "",
      dietaryInfo: "veg",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newItem: Omit<MenuItem, "id" | "votes"> = {
        title: values.title,
        day: values.day as DayOfWeek,
        category: values.category as MenuCategory,
        ingredients: values.ingredients.split(",").map((i) => i.trim()),
        imageUrl: values.imageUrl,
        imageHint: "custom dish",
        dietaryInfo: values.dietaryInfo as 'veg' | 'non-veg',
    };
    onAddItem(newItem);
    toast({
        title: "Success!",
        description: "Your menu item has been proposed.",
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Propose a New Menu Item</DialogTitle>
          <DialogDescription>
            Have a great idea for a dish? Fill out the details below to add it to the running.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dish Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Spicy Chicken Ramen'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-image-source.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please provide a direct link to an image of the dish.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of the Week</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List ingredients, separated by commas." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryInfo"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Dietary Information</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="veg" />
                        </FormControl>
                        <FormLabel className="font-normal">Veg</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="non-veg" />
                        </FormControl>
                        <FormLabel className="font-normal">Non-Veg</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit Proposal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Client wrapper to prevent hydration errors
type AddMenuItemDialogClientProps = {
    onAddItem: (item: Omit<MenuItem, "id" | "votes">) => void;
    children: React.ReactNode;
}

export default function AddMenuItemDialogClient({ children, onAddItem }: AddMenuItemDialogClientProps) {
    const [open, setOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Return a placeholder or the trigger itself to prevent layout shift
        // and to ensure the trigger is always rendered on the server and client.
        return <div className="contents" onClick={() => setOpen(true)}>{children}</div>;
    }

    return (
        <AddMenuItemDialog onAddItem={onAddItem} open={open} onOpenChange={setOpen}>
            {children}
        </AddMenuItemDialog>
    );
}
