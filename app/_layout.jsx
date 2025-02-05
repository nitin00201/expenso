import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from "react";
import {auth} from './../config/firebaseConfig'
import { Provider as PaperProvider, Provider } from 'react-native-paper';



export default function RootLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(()=>{
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          // User is signed in, redirect to Dashboard
          setUser(currentUser);
          router.push('/dashboard');
        } else {
          // No user is signed in, redirect to Sign In
          setUser(null);
          router.push('/signIn');
        }
        setLoading(false);
      });
      return () => unsubscribe();

      
    
  },[router])
  return (
    <Provider>
    <Stack
    screenOptions={{
      headerShown: false,
    }} />
    </Provider>
  )
  
 
}
