import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../stores/useAuthStore';

const ProfileScreen = () => {
  const { profileImage, listenToAuthChanges, fullName, email } = useAuthStore();
  useEffect(() => {
    listenToAuthChanges(); // Start listening to auth changes
  }, []);

  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImage: null,
    currency: 'USD'
  });

  const currencies = [
    { label: 'USD - US Dollar', value: 'USD', symbol: '$' },
    { label: 'EUR - Euro', value: 'EUR', symbol: '€' },
    { label: 'GBP - British Pound', value: 'GBP', symbol: '£' },
    { label: 'JPY - Japanese Yen', value: 'JPY', symbol: '¥' },
  ];

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUserInfo(prev => ({
          ...prev,
          profileImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  // useEffect(() => {
  //   const reloadUser = async () => {
  //     try {
  //       if (auth.currentUser) {
  //         await auth.currentUser.reload();
  //         console.log("User reloaded successfully:", auth.currentUser);
  //       } else {
  //         console.log("No user is signed in.");
  //       }
  //     } catch (error) {
  //       console.error("Error reloading user:", error);
  //     }
  //   };

  //   reloadUser();
  // }, [router,auth.currentUser.photoURL]);

  const handleChangeCurrency = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      currencies.map(currency => ({
        text: currency.label,
        onPress: () => setUserInfo(prev => ({ ...prev, currency: currency.value }))
      }))
    );
  };

  const handleSignOut = async() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async() => {
            await auth.signOut()
            router.replace('/');
          }
        }
      ]
    );
  };



  const ProfileOption = ({ icon, title, onPress, showBadge }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
      <View style={styles.optionContent}>
        <Ionicons name={icon} size={24} color="#007AFF" />
        <Text style={styles.optionText}>{title}</Text>
      </View>
      <View style={styles.optionRight}>
        {showBadge && <View style={styles.badge} />}
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handlePickImage}>
            {auth.currentUser?.photoURL ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#666" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/add-transaction')}
          >
            <Ionicons name="add-circle" size={28} color="#007AFF" />
            <Text style={styles.actionText}>New Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/add-budgets')}
          >
            <Ionicons name="wallet" size={28} color="#007AFF" />
            <Text style={styles.actionText}>Set Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <ProfileOption
            icon="person-outline"
            title="Edit Profile"
            onPress={() => router.push('/profile/edit-profile')}
          />
          <ProfileOption
            icon="calculator-outline"
            title="Calculator"
            onPress={() => router.push('/calculator')}
          />
          <ProfileOption
            icon="chatbubbles-outline"
            title="Ai Recomendation"
            onPress={() => router.push('/ai-recomend')}
          />
          <ProfileOption
            icon="key-outline"
            title="Change Password"
            onPress={() => router.push('/profile/forgot-password')}
          />
          <ProfileOption
            icon="cash-outline"
            title="Currency"
            onPress={()=>{router.push('/currency')}}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  actionText: {
    marginTop: 8,
    color: '#333',
    fontSize: 14,
  },
  optionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  signOutText: {
    marginLeft: 10,
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;