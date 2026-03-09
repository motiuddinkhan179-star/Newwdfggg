import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

export const createConversation = async (participants: string[], listingId?: string) => {
  // Check if conversation already exists
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION), 
    where('participants', 'array-contains', participants[0])
  );
  const querySnapshot = await getDocs(q);
  const existing = querySnapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(participants[1]) && data.listingId === listingId;
  });

  if (existing) {
    return existing.id;
  }

  const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
    participants,
    listingId,
    lastMessage: '',
    lastMessageTimestamp: new Date().toISOString()
  });
  return docRef.id;
};

export const sendMessage = async (conversationId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
  await addDoc(messagesRef, {
    conversationId,
    senderId,
    text,
    timestamp: new Date().toISOString()
  });

  // Update conversation last message
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageTimestamp: new Date().toISOString()
  });
};

export const subscribeToConversations = (userId: string, callback: (conversations: any[]) => void) => {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION), 
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(conversations);
  });
};

export const subscribeToMessages = (conversationId: string, callback: (messages: any[]) => void) => {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};
