const { initializeApp } = require("firebase/app");
const { getAuth, connectAuthEmulator } = require("firebase/auth");
const {
  getFirestore,
  connectFirestoreEmulator,
} = require("firebase/firestore");
const {
  getFunctions,
  connectFunctionsEmulator,
} = require("firebase/functions");

// Test configuration for Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAIR3ImP6p3o83dYO5BLVTw52LKl-cZC-M",
  authDomain: "thato-nsala-ai-solutions.firebaseapp.com",
  databaseURL: "https://thato-nsala-ai-solutions-default-rtdb.firebaseio.com",
  projectId: "thato-nsala-ai-solutions",
  storageBucket: "thato-nsala-ai-solutions.appspot.com",
  messagingSenderId: "58843412740",
  appId: "1:58843412740:web:95a167d2537fc73677f851",
};

// Initialize Firebase for testing
function setupTestingEnvironment() {
  const app = initializeApp(firebaseConfig);

  // Set up Auth emulator
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://localhost:9099");

  // Set up Firestore emulator
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "localhost", 8080);

  // Set up Functions emulator
  const functions = getFunctions(app);
  connectFunctionsEmulator(functions, "localhost", 5001);

  return { app, auth, db, functions };
}

module.exports = { setupTestingEnvironment };
