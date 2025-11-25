import { type MenuItem } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  return PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/600/400`;
};

export const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    title: 'Masala Dosa',
    description: 'A crispy and savory crepe made from fermented rice and lentil batter, filled with a spiced potato mash. A South Indian classic.',
    ingredients: ['Dosa Batter', 'Potatoes', 'Onions', 'Turmeric Powder', 'Mustard Seeds', 'Curry Leaves', 'Ghee/Oil'],
    instructions: '1. Prepare the spiced potato filling.\n2. Heat a non-stick tawa or griddle.\n3. Pour a ladleful of dosa batter and spread it in a circular motion to form a thin crepe.\n4. Drizzle with oil or ghee and cook until golden and crisp.\n5. Place the potato filling in the center, fold the dosa, and serve hot with sambar and chutney.',
    imageUrl: getImage('masala-dosa'),
    imageHint: 'masala dosa',
    dietaryInfo: 'vegetarian',
    nutrition: { calories: '380 kcal', protein: '8g', carbs: '65g', fat: '10g' },
    votes: 45,
  },
  {
    id: '2',
    title: 'Idli with Sambar & Chutney',
    description: 'Soft, fluffy steamed rice cakes made from a fermented rice and lentil batter. Served with a flavorful lentil-based vegetable stew (sambar) and coconut chutney.',
    ingredients: ['Idli Batter', 'Toor Dal (Pigeon Peas)', 'Mixed Vegetables', 'Sambar Masala', 'Tamarind', 'Mustard Seeds', 'Coconut', 'Green Chilies'],
    instructions: '1. Pour idli batter into greased idli molds.\n2. Steam for 10-12 minutes until cooked through.\n3. Prepare sambar by cooking lentils and vegetables with spices.\n4. Prepare chutney by grinding coconut, green chilies, and other ingredients.\n5. Serve hot idlis with a generous portion of sambar and chutney.',
    imageUrl: getImage('idli-sambar'),
    imageHint: 'idli sambar',
    dietaryInfo: 'vegan',
    nutrition: { calories: '250 kcal', protein: '10g', carbs: '45g', fat: '5g' },
    votes: 62,
  },
  {
    id: '3',
    title: 'Ven Pongal',
    description: 'A savory and comforting South Indian breakfast dish made from rice and yellow moong dal, cooked to a creamy consistency and tempered with spices.',
    ingredients: ['Raw Rice', 'Moong Dal', 'Ghee', 'Black Peppercorns', 'Cumin Seeds', 'Cashew Nuts', 'Ginger', 'Curry Leaves'],
    instructions: '1. Dry roast moong dal until aromatic. Cook rice and dal together with water until soft and mushy.\n2. In a pan, heat ghee and temper with peppercorns, cumin seeds, ginger, and curry leaves.\n3. Fry cashews until golden brown.\n4. Add the tempering and fried cashews to the cooked rice and dal mixture. Mix well and serve hot.',
    imageUrl: getImage('ven-pongal'),
    imageHint: 'pongal dish',
    dietaryInfo: 'vegetarian',
    nutrition: { calories: '450 kcal', protein: '15g', carbs: '60g', fat: '18g' },
    votes: 38,
  },
  {
    id: '4',
    title: 'Bisi Bele Bath',
    description: 'A traditional Karnataka dish, this is a flavorful and aromatic rice, lentil, and vegetable medley, cooked with a special spice blend (bisi bele bath powder).',
    ingredients: ['Rice', 'Toor Dal', 'Mixed Vegetables', 'Bisi Bele Bath Powder', 'Tamarind', 'Ghee', 'Mustard Seeds', 'Peanuts'],
    instructions: '1. Cook rice, dal, and vegetables together until soft.\n2. Prepare a tempering with ghee, mustard seeds, peanuts, and curry leaves.\n3. Mix the cooked rice-dal mixture with tamarind extract and bisi bele bath powder.\n4. Add the tempering and mix everything well. Serve hot with a side of chips or boondi.',
    imageUrl: getImage('bisi-bele-bath'),
    imageHint: 'rice dish',
    dietaryInfo: 'vegetarian',
    nutrition: { calories: '550 kcal', protein: '20g', carbs: '80g', fat: '15g' },
    votes: 29,
  },
  {
    id: '5',
    title: 'Lemon Rice (Chitranna)',
    description: 'A tangy, flavorful, and light rice dish from South India. Cooked rice is tossed with a tempering of spices and a generous amount of lemon juice.',
    ingredients: ['Cooked Rice', 'Lemon Juice', 'Mustard Seeds', 'Urad Dal', 'Chana Dal', 'Peanuts', 'Turmeric Powder', 'Green Chilies', 'Curry Leaves'],
    instructions: '1. Fluff up the cooked rice and let it cool slightly.\n2. Heat oil in a pan and add mustard seeds, urad dal, chana dal, and peanuts. Sauté until golden.\n3. Add green chilies, curry leaves, and turmeric powder. Sauté for a minute.\n4. Pour this tempering over the rice. Add salt and fresh lemon juice.\n5. Mix gently until everything is well combined. Garnish with coriander.',
    imageUrl: getImage('lemon-rice'),
    imageHint: 'lemon rice',
    dietaryInfo: 'vegan',
    nutrition: { calories: '400 kcal', protein: '9g', carbs: '75g', fat: '8g' },
    votes: 51,
  }
];
