import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAZQ1fxyHQ3cDU0mpGm80zMuc9ipTT5oa0",
  authDomain: "olx-clone-25bf8.firebaseapp.com",
  projectId: "olx-clone-25bf8",
  storageBucket: "olx-clone-25bf8.firebasestorage.app",
  messagingSenderId: "455789651568",
  appId: "1:455789651568:web:db0257ed6dcdb1e5d476b5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Firestore and Storage are disabled for this stage as requested
