import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ToastAndroid, Alert, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '../../config/firebaseConfig'

export default function SignInScreen() {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Handle back button press to close the app
  useEffect(() => {
    const backAction = () => {
      // Close the app on back press
      BackHandler.exitApp();
      return true; // Return true to indicate the action is handled
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    // Clean up the event listener when the component is unmounted
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  const handleSignIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = response.user;
      console.log(user);
      Alert.alert("Success", "Login Successful");
      router.push('/(tabs)/dashboard');
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Login failed. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("./../../assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Sign In</Text>

      <Animated.View entering={FadeInDown.delay(100)} style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)}>
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Text style={styles.signupLink} onPress={() => router.push("/(auth)/signUp")}>
          Sign Up
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
