

export type DietaryInfo = 'veg' | 'non-veg';

export type MenuCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MenuItem = {
  id: string;
  title: string;
  category: MenuCategory;
  day: DayOfWeek;
  ingredients: string[];
  imageUrl: string;
  imageHint: string;
  dietaryInfo: DietaryInfo;
  votes: number;
};
