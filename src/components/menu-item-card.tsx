"use client";

import Image from "next/image";
import { ArrowUp, Leaf, Check, Trash2, RotateCcw, Drumstick } from "lucide-react";
import { type MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog"

interface MenuItemCardProps {
  item: MenuItem;
  rank: number;
  onVote: () => void;
  onRevokeVote: () => void;
  isVoted: boolean;
  onDeleteItem: () => void;
  role: string | null;
}

const DietaryBadge: React.FC<{ info: MenuItem["dietaryInfo"] }> = ({ info }) => {
  if (info === "veg") {
    return (
      <Badge className={cn("text-white absolute top-3 right-3 border-0", "bg-green-600 hover:bg-green-600")}>
        <Leaf className="mr-1 h-3 w-3" />
        Veg
      </Badge>
    );
  }
  if (info === "non-veg") {
    return (
      <Badge className={cn("text-white absolute top-3 right-3 border-0", "bg-red-600 hover:bg-red-600")}>
        <Drumstick className="mr-1 h-3 w-3" />
        Non-Veg
      </Badge>
    );
  }
  return null;
};


export default function MenuItemCard({ item, rank, onVote, onRevokeVote, isVoted, onDeleteItem, role }: MenuItemCardProps) {
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
        <DietaryBadge info={item.dietaryInfo} />
      </CardHeader>
      <CardContent className="flex-1 p-4 bg-transparent">
        <CardTitle className="font-headline text-xl mb-1">{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
        
        <Tabs defaultValue="ingredients" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="text-sm mt-4 min-h-[100px]">
            <ul className="list-disc pl-5 space-y-1">
              {item.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </TabsContent>
          <TabsContent value="nutrition" className="text-sm mt-4 min-h-[100px]">
             <div className="grid grid-cols-2 gap-2">
                <p><strong>Calories:</strong> {item.nutrition.calories}</p>
                <p><strong>Protein:</strong> {item.nutrition.protein}</p>
                <p><strong>Carbs:</strong> {item.nutrition.carbs}</p>
                <p><strong>Fat:</strong> {item.nutrition.fat}</p>
             </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="p-4 bg-transparent border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div 
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg font-headline",
                    rank === 1 && "bg-amber-400 text-amber-900",
                    rank === 2 && "bg-slate-400 text-slate-900",
                    rank === 3 && "bg-orange-400 text-orange-900",
                    rank > 3 && "bg-primary/10 text-primary"
                )}
            >
                {rank}
            </div>
            <div>
                <p className="font-bold text-lg">{item.votes} Votes</p>
                <p className="text-xs text-muted-foreground">Current Rank</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          {role === 'management' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the menu item &quot;{item.title}&quot;.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteItem}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {isVoted && role === 'student' ? (
             <Button 
                onClick={onRevokeVote} 
                variant="secondary"
                className="transition-all duration-200 active:scale-95" 
                aria-label={`Revoke vote for ${item.title}`}
              >
                <RotateCcw className="mr-2 h-4 w-4"/>
                Revoke
              </Button>
          ) : (
            <Button 
              onClick={onVote} 
              disabled={isVoted || role === 'management'}
              className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed" 
              aria-label={`Vote for ${item.title}`}
            >
              {isVoted ? <Check className="mr-2 h-4 w-4"/> : <ArrowUp className="mr-2 h-4 w-4" />}
              {isVoted ? 'Voted' : 'Vote'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
