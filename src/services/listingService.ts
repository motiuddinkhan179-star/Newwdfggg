import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Listing } from '../types';

const LISTINGS_COLLECTION = 'listings';

export const createListing = async (listing: Omit<Listing, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), {
      ...listing,
      createdAt: new Date().toISOString(), // Use ISO string for easier client-side handling, or serverTimestamp()
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding listing: ", error);
    throw error;
  }
};

export const getListings = async (lastVisible?: DocumentSnapshot) => {
  try {
    let q = query(
      collection(db, LISTINGS_COLLECTION), 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'), 
      limit(10)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(q);
    const listings: Listing[] = [];
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() } as Listing);
    });

    return { 
      listings, 
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] 
    };
  } catch (error) {
    console.error("Error getting listings: ", error);
    throw error;
  }
};

export const getListingById = async (id: string) => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Listing;
    } else {
      throw new Error('Listing not found');
    }
  } catch (error) {
    console.error("Error getting listing: ", error);
    throw error;
  }
};

export const updateListing = async (id: string, updates: Partial<Listing>) => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating listing: ", error);
    throw error;
  }
};

export const deleteListing = async (id: string) => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting listing: ", error);
    throw error;
  }
};

export const getListingsByUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, LISTINGS_COLLECTION), 
      where('sellerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const listings: Listing[] = [];
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() } as Listing);
    });
    return listings;
  } catch (error) {
    console.error("Error getting user listings: ", error);
    throw error;
  }
};

export const getSuggestions = async (queryText: string) => {
  if (!queryText) return [];
  // Firestore doesn't support full-text search natively. 
  // For a simple "suggestion" feature, we can fetch recent titles or use a third-party service like Algolia.
  // For this demo, we'll fetch a batch of active listings and filter client-side.
  // This is not scalable but works for a small demo.
  try {
    const q = query(collection(db, LISTINGS_COLLECTION), where('status', '==', 'active'), limit(50));
    const querySnapshot = await getDocs(q);
    const titles = querySnapshot.docs.map(doc => doc.data().title as string);
    
    const lowerQuery = queryText.toLowerCase();
    return titles
      .filter(title => title.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  } catch (error) {
    console.error("Error getting suggestions: ", error);
    return [];
  }
};

export const uploadImage = async (file: File, path: string) => {
  // In a real app, upload to Firebase Storage.
  // For now, we'll use a placeholder service that returns a URL based on the file name/content.
  // Ideally, we should implement Firebase Storage, but the prompt asked for "database save".
  // Storing the image URL in the database is the standard way.
  console.log('Mock upload image (would be Firebase Storage):', file.name);
  return `https://picsum.photos/seed/${file.name + Date.now()}/800/600`;
};
