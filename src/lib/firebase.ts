import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQzDOIEtPUvN-0LKs0xCH_hAUGZJDgpJA",
  authDomain: "realtime-database-b5320.firebaseapp.com",
  databaseURL: "https://realtime-database-b5320-default-rtdb.firebaseio.com",
  projectId: "realtime-database-b5320",
  storageBucket: "realtime-database-b5320.appspot.com",
  messagingSenderId: "1015240617673",
  appId: "1:1015240617673:web:8e9e8c8c8c8c8c8c8c8c8c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;