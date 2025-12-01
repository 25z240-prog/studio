export type NutritionInfo = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export type DietaryInfo = 'vegan' | 'vegetarian' | 'none';

export type MenuCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type MenuItem = {
  id: string;
  title: string;
  description: string;
  category: MenuCategory;
  ingredients: string[];
  instructions: string;
  imageUrl: string;
  imageHint: string;
  dietaryInfo: DietaryInfo;
  nutrition: NutritionInfo;
  votes: number;
};
