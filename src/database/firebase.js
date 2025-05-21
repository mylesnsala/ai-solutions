// import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { collection, getFirestore, query, where, getDocs } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
// dotenv.config();

const firebaseConfig = {
  apiKey: 'AIzaSyAIR3ImP6p3o83dYO5BLVTw52LKl-cZC-M',
  authDomain: 'thato-nsala-ai-solutions.firebaseapp.com',
  databaseURL: 'https://thato-nsala-ai-solutions-default-rtdb.firebaseio.com',
  projectId: 'thato-nsala-ai-solutions',
  storageBucket: 'thato-nsala-ai-solutions.firebasestorage.app',
  messagingSenderId: '58843412740',
  appId: '1:58843412740:web:95a167d2537fc73677f851',
  measurementId: 'G-WK3S4N773V',
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);
const analytics = getAnalytics(firebaseApp);

export { auth, firestore, database, storage, analytics, firebaseApp };
