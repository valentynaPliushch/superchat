import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAijAgIc7qctgBbDE6Ipfh1H5ztAvoupsc",
  authDomain: "superchat-b492f.firebaseapp.com",
  projectId: "superchat-b492f",
  storageBucket: "superchat-b492f.appspot.com",
  messagingSenderId: "672756243835",
  appId: "1:672756243835:web:de721779bff36f0c4a31de",
  measurementId: "G-8GVP5DRCL7",
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
