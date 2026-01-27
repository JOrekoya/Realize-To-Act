// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5cozxNZONTimP2XS4HY4cZimvkPQFVaI",
  authDomain: "realize-to-act-1.firebaseapp.com",
  projectId: "realize-to-act-1",
  storageBucket: "realize-to-act-1.firebasestorage.app",
  messagingSenderId: "325794608728",
  appId: "1:325794608728:web:b982802d4d64ac58c17c2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);