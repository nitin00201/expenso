import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { auth } from '../config/firebaseConfig';   // Adjust based on Firebase setup
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import useAuthStore from '../app/stores/useAuthStore';

const Header = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profileImage, listenToAuthChanges,fullName } = useAuthStore();
  useEffect(() => {
    listenToAuthChanges(); // Start listening to auth changes
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setModalVisible(false);
      router.replace('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left Section - Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hi,</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#495057" />
        ) : (
          <Text style={styles.userName}>{fullName || "Guest"}</Text>
        )}
      </View>

      {/* Right Section - Profile Image */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileContainer}>
        <Image
          source={{
            uri: profileImage || `https://ui-avatars.com/api/?name=${fullName}`,
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Modal for User Info & Sign Out */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={{ uri: user?.photoURL || 'https://as1.ftcdn.net/jpg/09/25/30/14/1000_F_925301474_dO34niv3EjP5YPLh0GrN3qlyUlwgypQh.webp' }} style={styles.modalImage} />
            <Text style={styles.modalTitle}>{fullName || "Guest"}</Text>
            <Text style={styles.modalText}>{user?.email || "No email available"}</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#495057',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  profileContainer: {
    borderWidth: 2,
    borderColor: '#6c757d',
    borderRadius: 50,
    padding: 3,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 280,
    alignItems: 'center',
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default Header;
