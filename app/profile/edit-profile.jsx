import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { updateEmail, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import useAuthStore from '../stores/useAuthStore';

const EditProfileScreen = () => {
  const router = useRouter();
  const { setProfileImage, setFullName, setEmail, fullName, email, profileImage } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: fullName,
    email: email,
    profile_picture: profileImage,
  });
  const [isEditing, setIsEditing] = useState({ name: false, email: false });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user logged in');
        router.replace('/(auth)/signIn');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setFormData({
        name: userData?.name || fullName,
        email: userData?.email || email,
        profile_picture: userData?.profile_picture || profileImage,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setFormData((prev) => ({ ...prev, profile_picture: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Invalid email address');
      return;
    }
    if (formData.name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const updates = {};

      if (formData.profile_picture && !formData.profile_picture.startsWith('http')) {
        setProfileImage(formData.profile_picture);
        await updateProfile(user, { photoURL: formData.profile_picture });
      }
      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
        setEmail(formData.email);
      }
      if (user.displayName !== formData.name) {
        await updateProfile(user, { displayName: formData.name });
        setFullName(formData.name);
      }
      updates.name = formData.name;
      updates.email = formData.email;
      await updateDoc(doc(db, 'users', user.uid), updates);

      Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image source={{ uri: formData.profile_picture }} style={styles.profileImage} />
          <Ionicons name="camera" size={20} color="white" style={styles.cameraIcon} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
          placeholder="Full Name"
        />
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
          placeholder="Email"
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  imageContainer: { alignSelf: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#007AFF', padding: 5, borderRadius: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 20, fontSize: 16, paddingVertical: 5 },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;
