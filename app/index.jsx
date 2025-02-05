import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { auth } from "@/config/firebaseConfig"; // Ensure Firebase is properly configured

const LandingScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setTimeout(() => {
        if (user) {
          router.replace("/dashboard"); // Redirect to Dashboard if logged in
        } else {
          router.replace("/(auth)/signIn"); // Redirect to Sign In if not logged in
        }
      }, 3000); // 3-second delay
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Animated.Image
        source={require("./../assets/images/logo.png")}
        style={styles.logo}
        entering={FadeInDown.duration(1000)}
      />

      {/* App Name */}
      <Animated.Text style={styles.appName} entering={FadeInUp.duration(1200)}>
        Expense Manager
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={styles.tagline}
        entering={FadeInUp.delay(200).duration(1400)}
      >
        Track your expenses effortlessly
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  tagline: {
    fontSize: 16,
    color: "#777",
    marginVertical: 10,
  },
});

export default LandingScreen;
