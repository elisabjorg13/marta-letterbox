import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Letter {
  id?: string;
  title: string;
  imageUrl: string;
  textContent?: string;
  createdAt?: Date;
}

export const useLetters = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch letters from Firebase
  const fetchLetters = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'letters'));
      const lettersData: Letter[] = [];
      querySnapshot.forEach((doc) => {
        lettersData.push({ id: doc.id, ...doc.data() } as Letter);
      });
      setLetters(lettersData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch letters');
      console.error('Error fetching letters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new letter
  const addLetter = async (letter: Omit<Letter, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'letters'), {
        ...letter,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (err) {
      setError('Failed to add letter');
      console.error('Error adding letter:', err);
      throw err;
    }
  };

  // Delete a letter
  const deleteLetter = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'letters', id));
    } catch (err) {
      setError('Failed to delete letter');
      console.error('Error deleting letter:', err);
      throw err;
    }
  };

  // Real-time listener for letters
  useEffect(() => {
    const q = query(collection(db, 'letters'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lettersData: Letter[] = [];
      querySnapshot.forEach((doc) => {
        lettersData.push({ id: doc.id, ...doc.data() } as Letter);
      });
      setLetters(lettersData);
      setLoading(false);
    }, (err) => {
      setError('Failed to listen to letters');
      console.error('Error listening to letters:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    letters,
    loading,
    error,
    addLetter,
    deleteLetter,
    fetchLetters
  };
};
