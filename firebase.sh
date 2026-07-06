// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALv04AUUxMLyoUAdOnoerzjfZ_r6sig34",
  authDomain: "bingoproject-73c2b.firebaseapp.com",
  databaseURL: "https://bingoproject-73c2b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bingoproject-73c2b",
  storageBucket: "bingoproject-73c2b.firebasestorage.app",
  messagingSenderId: "96563584615",
  appId: "1:96563584615:web:62658ca41d7dd9d3f77ec2",
  measurementId: "G-L3SJ455D12"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);