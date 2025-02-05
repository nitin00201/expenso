import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { createExpense } from './api/expense';
import { auth } from '../config/firebaseConfig';
import NetInfo from "@react-native-community/netinfo";
import { checkInternetConnection } from './api/networkService';
import { getDataFromLocal, removeLocalData, saveDataLocally } from './api/storageService';
import { updateBudgetByExpense } from './api/budget';
import useBudgetStore from './stores/useBudgetStore';



const AddTransactionScreen = () => {
  const [transaction, setTransaction] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: new Date(),
    payment_method: '',
    receipt_photo: null

  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setTransaction(prev => ({ ...prev, receipt_photo: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const categories = [
    'Food', 'Transport', 'Shopping', 'Bills', 
    'Entertainment', 'Health', 'Education', 'Other'
  ];

  const paymentMethods = [
    'Cash', 'Credit Card', 'Debit Card', 
    'Bank Transfer', 'Mobile Wallet'
  ];

  // const handleSubmit = async() => {
  //   const { title, amount, category, payment_method } = transaction;
    
  //   if (!title || !amount || !category || !payment_method) {
  //     Alert.alert('Error', 'Please fill all required fields');
  //     return;
  //   }
  //   try {
  //     const response = await createExpense(auth.currentUser.uid,transaction.amount,transaction.category, transaction.description,transaction.date,transaction.receipt_photo,transaction.payment_method,transaction.title);
  //     console.log("saved to firebase",response);
  //     setTransaction({
  //       title: '',
  //   amount: '',
  //   category: '',
  //   description: '',
  //   date: new Date(),
  //   payment_method: '',
  //   receipt_photo: null
  //     })
      
  //   } catch (error) {
  //     console.log("error occured");
      
  //   }
  //   console.log('Transaction Submitted:', transaction);
  //   Alert.alert('Success', 'Transaction Added Successfully');
  // };

  const OFFLINE_TRANSACTIONS_KEY = "offline_transactions";

const handleSubmit = async () => {
  const { title, amount, category, payment_method } = transaction;

  if (!title || !amount || !category || !payment_method) {
    Alert.alert("Error", "Please fill all required fields");
    return;
  }

  const isConnected = await checkInternetConnection();
  console.log("is connected",isConnected);
  

  if (isConnected) {
    try {
      const response = await createExpense(
        auth.currentUser.uid,
        transaction.amount,
        transaction.category,
        transaction.description,
        transaction.date,
        transaction.receipt_photo,
        transaction.payment_method,
        transaction.title
      );

      console.log("Saved to Firebase:", response);

      setTransaction({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: new Date(),
        payment_method: "",
        receipt_photo: null,
      });
      await updateBudgetByExpense(auth.currentUser.uid);

      
      

      Alert.alert("Success", "Transaction Added Successfully");
    } catch (error) {
      console.error("Error saving transaction online:", error);
      Alert.alert("Error", "Failed to save transaction online.");
    }
  } else {
    try {
      const offlineTransactions = (await getDataFromLocal(OFFLINE_TRANSACTIONS_KEY)) || [];
      const newTransaction = {
        ...transaction,
        id: Date.now(), // Generate unique ID for offline transaction
        synced: false, // Mark as unsynced
      };

      offlineTransactions.push(newTransaction);
      await saveDataLocally(OFFLINE_TRANSACTIONS_KEY, offlineTransactions);

      console.log("Saved locally for offline sync:", newTransaction);

      Alert.alert("Offline Mode", "Transaction saved locally and will sync when online.");

      setTransaction({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: new Date(),
        payment_method: "",
        receipt_photo: null,
      });
    } catch (error) {
      console.error("Error saving transaction offline:", error);
    }
  }

  console.log("Transaction Submitted:", transaction);
};

const syncOfflineTransactions = async () => {
  const isConnected = await checkInternetConnection();
  if (!isConnected) return;

  const offlineTransactions = await getDataFromLocal(OFFLINE_TRANSACTIONS_KEY);

  if (offlineTransactions && offlineTransactions.length > 0) {
    for (const transaction of offlineTransactions) {
      try {
        const response = await createExpense(
          auth.currentUser.uid,
          transaction.amount,
          transaction.category,
          transaction.description,
          transaction.date,
          transaction.receipt_photo,
          transaction.payment_method,
          transaction.title
        );

        if (response) {
          console.log("Transaction synced:", transaction.id);
        } else {
          console.error("Failed to sync transaction:", transaction.id);
        }
      } catch (error) {
        console.error("Error syncing transaction:", error);
      }
    }

    // Clear stored offline transactions
    await removeLocalData(OFFLINE_TRANSACTIONS_KEY);
    console.log("All offline transactions synced successfully.");
  }
};
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncOfflineTransactions();
    }
  });

  return () => unsubscribe();
}, []);




  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Transaction</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Transaction Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            value={transaction.title}
            onChangeText={(text) => setTransaction(prev => ({...prev, title: text}))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="$ 0.00"
            keyboardType="numeric"
            value={transaction.amount}
            onChangeText={(text) => setTransaction(prev => ({...prev, amount: text}))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  transaction.category === cat && styles.selectedCategory
                ]}
                onPress={() => setTransaction(prev => ({...prev, category: cat}))}
              >
                <Text style={[
                  styles.categoryText,
                  transaction.category === cat && styles.selectedCategoryText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{transaction.date.toLocaleDateString()}</Text>
            <Ionicons name="calendar" size={20} color="#007AFF" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={transaction.date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setTransaction(prev => ({...prev, date: selectedDate}));
                }
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Payment Method</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.paymentScroll}
          >
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentButton,
                  transaction.payment_method === method && styles.selectedPayment
                ]}
                onPress={() => setTransaction(prev => ({...prev, payment_method: method}))}
              >
                <Text style={[
                  styles.paymentText,
                  transaction.payment_method === method && styles.selectedPaymentText
                ]}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Upload Receipt</Text>
        <TouchableOpacity 
          style={styles.photoUploadButton} 
          onPress={pickImage}
        >
          {transaction.receipt_photo ? (
            <Image 
              source={{ uri: transaction.receipt_photo }} 
              style={styles.uploadedImage} 
            />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.photoUploadText}>Add Receipt Photo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.multilineInput}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            value={transaction.description}
            onChangeText={(text) => setTransaction(prev => ({...prev, description: text}))}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  paymentScroll: {
    flexGrow: 0,
  },
  paymentButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedPayment: {
    backgroundColor: '#007AFF',
  },
  paymentText: {
    color: '#666',
  },
  selectedPaymentText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 60
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoUploadButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoUploadText: {
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default AddTransactionScreen;