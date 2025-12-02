
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import type { MenuItem } from "@/lib/types";

interface MenuItemCardProps {
  item: MenuItem;
  role: 'student' | 'management';
}

export function MenuItemCard({ item, role }: MenuItemCardProps) {
  const handleVote = () => {
    // TODO: Implement voting logic
    console.log("Voting for", item.title);
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
      <CardFooter className="p-4 pt-0">
        {role === 'student' && (
          <Button onClick={handleVote} className="w-full">
            <ThumbsUp className="mr-2 h-4 w-4" /> Vote
          </Button>
        )}
        {role === 'management' && (
            <p className="text-sm text-muted-foreground w-full text-center">Votes will appear here</p>
        )}
      </CardFooter>
    </Card>
  );
}
