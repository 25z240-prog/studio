
"use client";

import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Beef, Vegan } from 'lucide-react';
import { type MenuItem } from '@/lib/types';

interface MenuItemCardProps {
  item: MenuItem;
  onVote: (id: string) => void;
  role: 'student' | 'management' | null;
}

export function MenuItemCard({ item, onVote, role }: MenuItemCardProps) {

  const getDietaryIcon = () => {
    if (item.dietaryInfo === 'non-veg') {
      return <Beef className="h-4 w-4 text-red-500" />;
    }
    return <Vegan className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl}
          alt={item.title}
          data-ai-hint={item.imageHint}
          width={400}
          height={250}
          className="object-cover w-full h-48"
        />
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg font-bold mb-2">{item.title}</CardTitle>
        {item.ingredients && <p className="text-sm text-muted-foreground line-clamp-2">{item.ingredients}</p>}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Badge variant={item.dietaryInfo === 'non-veg' ? 'destructive' : 'secondary'} className="capitalize flex items-center gap-1">
                {getDietaryIcon()}
                {item.dietaryInfo}
            </Badge>
        </div>
         <div className="flex items-center gap-2 text-foreground">
            <ThumbsUp className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">{item.votes}</span>
        </div>
      </CardFooter>
        {role === 'student' && (
            <div className="p-4 pt-0">
                 <Button className="w-full" onClick={() => onVote(item.id)}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> Vote
                </Button>
            </div>
        )}
    </Card>
  );
}
