
import { type MenuItem } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  return PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/600/400`;
};

export const initialMenuItems: Omit<MenuItem, "id" | "votes">[] = [];
