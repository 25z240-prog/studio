
'use client';

import { collection, writeBatch, getDocs, Firestore, doc } from 'firebase/firestore';
import { initialMenuItems } from '@/lib/data';

/**
 * Seeds the 'menuItems' collection in Firestore with initial data
 * if the collection is currently empty.
 * @param {Firestore} db - The Firestore database instance.
 */
export const seedDatabase = async (db: Firestore) => {
  const menuItemsCollection = collection(db, 'menuItems');
  
  try {
    const snapshot = await getDocs(menuItemsCollection);
    
    // Only seed if the collection is empty
    if (snapshot.empty) {
      console.log('No menu items found. Seeding database...');
      const batch = writeBatch(db);

      initialMenuItems.forEach((item) => {
        // We can't know the doc ID beforehand, so Firestore will generate it.
        const docRef = doc(menuItemsCollection);
        batch.set(docRef, { ...item, votes: 0 }); // Ensure votes start at 0
      });

      await batch.commit();
      console.log('Database seeded successfully!');
      // Reload the page to show the new data
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } else {
      console.log('Menu items already exist. No seeding necessary.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
