
'use server';
import { collection, writeBatch, Firestore } from 'firebase/firestore';
import { initialMenuItems } from './data';

export async function seedDatabase(db: Firestore, userId: string) {
  if (!db || !userId) {
    console.error("Firestore instance or user ID is missing.");
    return;
  }

  const menuItemsCollection = collection(db, 'menuItems');
  const batch = writeBatch(db);

  initialMenuItems.forEach((item) => {
    const docRef = collection(db, 'menuItems').doc();
    batch.set(docRef, { ...item, votes: 0, submitterId: userId });
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
