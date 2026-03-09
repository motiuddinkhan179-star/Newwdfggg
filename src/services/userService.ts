import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

export const toggleLikeListing = async (userId: string, listingId: string, isLiked: boolean) => {
  const userRef = doc(db, 'users', userId);
  
  if (isLiked) {
    await updateDoc(userRef, {
      likedListings: arrayRemove(listingId)
    });
  } else {
    await updateDoc(userRef, {
      likedListings: arrayUnion(listingId)
    });
  }
};

export const toggleFollowUser = async (currentUserId: string, targetUserId: string, isFollowing: boolean) => {
  const userRef = doc(db, 'users', currentUserId);
  
  if (isFollowing) {
    await updateDoc(userRef, {
      following: arrayRemove(targetUserId)
    });
  } else {
    await updateDoc(userRef, {
      following: arrayUnion(targetUserId)
    });
  }
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};
