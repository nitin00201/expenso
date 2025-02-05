import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { auth, db } from "../../config/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const router = useRouter();

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      console.log(user);
      const data ={
        name:fullName,
        email:email,
        uid: user?.uid,
      }
await updateProfile(auth.currentUser, {
    displayName: fullName, photoURL: `https://ui-avatars.com/api/?name=${data.name}`
  })
   
      
      await setDoc(doc(db, 'users', user.uid), data);
      router.push('/(tabs)/dashboard')
    } catch (error) {
      Alert.alert('Error', error.message);
      console.log(error);
      
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("./../../assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Sign Up</Text>

      <Animated.View entering={FadeInDown.delay(100)} style={styles.inputContainer}>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)}>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>


      <Text style={styles.signupText}>
        Already have an account?{" "}
        <Text style={styles.signupLink} onPress={() => router.push("(auth)/signIn")}>
          Sign In
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { width: "80%", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, width: "100%" },
  button: { backgroundColor: "#6200EE", padding: 15, borderRadius: 8, width: "80%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  signupText: { marginTop: 20, fontSize: 14, color: "#777" },
  signupLink: { color: "#6200EE", fontWeight: "bold" },
});
