import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJjDeGmgLWbKl1tA9Jh8-bAF0xfDzfwgQ",
  authDomain: "realtime-database-b5320.firebaseapp.com",
  databaseURL: "https://realtime-database-b5320-default-rtdb.firebaseio.com",
  projectId: "realtime-database-b5320",
  storageBucket: "realtime-database-b5320.appspot.com",
  messagingSenderId: "565232932288",
  appId: "1:565232932288:web:8f4c34e412d53c3b8c1577"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);