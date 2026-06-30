/* =========================================================
   GADGET GANTENG — FIREBASE INIT
   File ini cuma boleh ada SATU instance di seluruh situs.
   admin.js dan catalog-live.js sama-sama import dari sini
   supaya tidak initializeApp() dua kali.
========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYLUuDDJK30BfHK92_8PVkFtUu2RCflWU",
  authDomain: "websiteggs-dfa23.firebaseapp.com",
  projectId: "websiteggs-dfa23",
  storageBucket: "websiteggs-dfa23.firebasestorage.app",
  messagingSenderId: "808307197800",
  appId: "1:808307197800:web:3ae0ce7ec461604ca7f8dd",
  measurementId: "G-27QQ7TNK6H"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics cuma jalan kalau browser support (hindari error di beberapa browser/privat mode)
analyticsSupported().then((ok) => {
  if (ok) getAnalytics(app);
}).catch(() => {});
