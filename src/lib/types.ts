
export type NutritionInfo = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export type DietaryInfo = 'veg' | 'non-veg';

export type MenuCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MenuItem = {
  id: string;
  title: string;
  description: string;
  category: MenuCategory;
  day: DayOfWeek;
  ingredients: string[];
  instructions: string;
  imageUrl: string;
  imageHint: string;
  dietaryInfo: DietaryInfo;
  nutrition: NutritionInfo;
  votes: number;
  submitterId?: string;
};
