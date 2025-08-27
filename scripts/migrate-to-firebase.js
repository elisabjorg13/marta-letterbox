// Migration script to move letters to Firebase
// Run this in your browser console after setting up Firebase

const lettersToMigrate = [
  {
    title: "Fyrsta bréf",
    imageUrl: "/images/rename.png"
  },
  {
    title: "Skemmtileg mynd",
    imageUrl: "/images/skor.jpeg"
  }
];

// Function to migrate letters to Firebase
async function migrateLetters() {
  try {
    console.log('Starting migration...');
    
    // Import Firebase functions (you'll need to run this in the browser)
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('../app/firebase');
    
    for (const letter of lettersToMigrate) {
      const docRef = await addDoc(collection(db, 'letters'), {
        ...letter,
        createdAt: new Date()
      });
      console.log(`Migrated: ${letter.title} with ID: ${docRef.id}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
// migrateLetters();
