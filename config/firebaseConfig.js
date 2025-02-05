// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {initializeAuth , getReactNativePersistence} from 'firebase/auth'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfA7WuZbfgH2ktsQQFlhi4x2b0GFrHY8U",
  authDomain: "expenseapp-ea3f2.firebaseapp.com",
  projectId: "expenseapp-ea3f2",
  storageBucket: "expenseapp-ea3f2.firebasestorage.app",
  messagingSenderId: "886587036590",
  appId: "1:886587036590:web:5127165619fd93850d6e3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app,
   {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
}
)
export const db = getFirestore(app)