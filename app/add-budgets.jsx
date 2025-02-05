import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { auth, db } from '../config/firebaseConfig';  // Import Firestore
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore methods
import { createBudget, getBudgets } from './api/budget';

const CreateBudgetScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    limit: '',
    reset_in: '',
    created_at: new Date().toISOString()
  });

  const categories = [
    { label: 'General', value: 'General' },
    { label: 'Food', value: 'Food' },
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Bills', value: 'Bills' },
    { label: 'Health', value: 'Health' },
    { label: 'Education', value: 'Education' },
  ];

  const resetPeriods = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.limit || !formData.reset_in) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const res  =await createBudget(auth.currentUser.uid, formData.name, formData.limit, formData.category, formData.reset_in);
     
      console.log("response created",res);
      await getBudgets(auth.currentUser.uid)

      Alert.alert('Success', 'Budget created successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/explore') }
      ]);
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to create budget. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Budget</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Budget Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Enter budget name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          <RNPickerSelect
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            items={categories}
            style={pickerSelectStyles}
            value={formData.category}
            placeholder={{ label: 'Select a category', value: null }}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Budget Limit *</Text>
          <TextInput
            style={styles.input}
            value={formData.limit}
            onChangeText={(value) => setFormData(prev => ({ ...prev, limit: value }))}
            keyboardType="numeric"
            placeholder="Enter budget limit"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reset Period *</Text>
          <RNPickerSelect
            onValueChange={(value) => setFormData(prev => ({ ...prev, reset_in: value }))}
            items={resetPeriods}
            style={pickerSelectStyles}
            value={formData.reset_in}
            placeholder={{ label: 'Select reset period', value: null }}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create Budget</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backButton: { padding: 5 },
  headerRight: { width: 34 },
  formContainer: { padding: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
  },
});

export default CreateBudgetScreen;
