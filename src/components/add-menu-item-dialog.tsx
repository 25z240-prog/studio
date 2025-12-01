"use client";

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
import { useToast } from "@/hooks/use-toast";
import { type MenuItem, type MenuCategory } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.enum(["breakfast", "lunch", "snack", "dinner"], {
    required_error: "You need to select a category."
  }),
  ingredients: z.string().min(1, "Please list at least one ingredient."),
  instructions: z.string().min(10, "Instructions must be at least 10 characters."),
  imageUrl: z.string().url("Please enter a valid image URL."),
  dietaryInfo: z.enum(["vegan", "vegetarian", "none"]),
  calories: z.string().min(1, "Required"),
  protein: z.string().min(1, "Required"),
  carbs: z.string().min(1, "Required"),
  fat: z.string().min(1, "Required"),
});

type AddMenuItemDialogProps = {
  children: React.ReactNode;
  onAddItem: (item: Omit<MenuItem, "id" | "votes">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddMenuItemDialog({ children, onAddItem, open, onOpenChange }: AddMenuItemDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
      imageUrl: "",
      dietaryInfo: "none",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const url = new URL(values.imageUrl);
        // This is a placeholder for a server action that would update next.config.js
        // Since we can't directly modify server files from the client,
        // in a real app this would be an API call.
        console.log(`Ensuring hostname is allowed: ${url.hostname}`);

        const newItem = {
          title: values.title,
          description: values.description,
          category: values.category as MenuCategory,
          ingredients: values.ingredients.split(",").map((i) => i.trim()),
          instructions: values.instructions,
          imageUrl: values.imageUrl,
          imageHint: "custom dish",
          dietaryInfo: values.dietaryInfo,
          nutrition: {
            calories: values.calories,
            protein: values.protein,
            carbs: values.carbs,
            fat: values.fat,
          },
        };

        onAddItem(newItem);
        toast({
          title: "Success!",
          description: "Your menu item has been proposed.",
        });
        form.reset();
        onOpenChange(false);
    } catch(e) {
        console.error("Error submitting new item:", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add the new item. Please check the image URL and try again.",
        });
    }
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short, enticing description of the dish." {...field} />
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
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="breakfast" />
                        </FormControl>
                        <FormLabel className="font-normal">Breakfast</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lunch" />
                        </FormControl>
                        <FormLabel className="font-normal">Lunch</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="snack" />
                        </FormControl>
                        <FormLabel className="font-normal">Snack</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dinner" />
                        </FormControl>
                        <FormLabel className="font-normal">Dinner</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preparation Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Step-by-step instructions to prepare the dish." {...field} />
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
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="none" />
                        </FormControl>
                        <FormLabel className="font-normal">None</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="vegetarian" />
                        </FormControl>
                        <FormLabel className="font-normal">Vegetarian</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="vegan" />
                        </FormControl>
                        <FormLabel className="font-normal">Vegan</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <h3 className="mb-4 text-lg font-medium">Nutritional Facts (per serving)</h3>
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 550 kcal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 25g" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 60g" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 20g" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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
