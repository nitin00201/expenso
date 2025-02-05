import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './../../config/firebaseConfig';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';

const ExpenseDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Animation values
  const printButtonScale = new Animated.Value(1);
  const backButtonScale = new Animated.Value(1);

  useEffect(() => {
    if (!id) return;

    const fetchExpense = async () => {
      try {
        const expenseRef = doc(db, 'expenses', id);
        const expenseSnap = await getDoc(expenseRef);

        if (expenseSnap.exists()) {
          setExpense({ id: expenseSnap.id, ...expenseSnap.data() });
        } else {
          setError('Expense not found');
        }
      } catch (err) {
        setError('Error fetching expense details');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  // Animation functions
  const createPressAnimation = (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ]);
  };

  const handlePrint = async () => {
    Animated.spring(printButtonScale, {
      toValue: 0.9,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #3498db;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .logo {
      background-color: #3498db;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-weight: bold;
    }
    .expense-title {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .detail-section {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 8px;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .detail-label {
      font-weight: bold;
      color: #3498db;
    }
    .detail-value {
      color: #2c3e50;
    }
    .receipt-section {
      margin-top: 20px;
      text-align: center;
    }
    .receipt-image {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Expense Tracker</div>
    <div>
      <strong>Expense Report</strong><br>
      Date: ${new Date().toLocaleDateString()}
    </div>
  </div>

  <h1 class="expense-title">${expense?.title || 'Expense Details'}</h1>

  <div class="detail-section">
    <div class="detail-row">
      <span class="detail-label">Amount</span>
      <span class="detail-value">₹${expense?.amount}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Transaction Date</span>
      <span class="detail-value">${formattedDate}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Created At</span>
      <span class="detail-value">${createdAtDate}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Category</span>
      <span class="detail-value">${expense?.category || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment Method</span>
      <span class="detail-value">${expense?.payment_method || 'N/A'}</span>
    </div>
  </div>

  <div class="detail-section">
    <div class="detail-row">
      <span class="detail-label">Notes</span>
      <span class="detail-value">${expense?.description || 'No additional notes'}</span>
    </div>
  </div>

  ${expense?.receipt_url ? `
    <div class="receipt-section">
      <h2>Receipt</h2>
      <img src="${expense.receipt_url}" class="receipt-image" alt="Expense Receipt" />
    </div>
  ` : ''}
</body>
</html>
`;

    await Print.printAsync({ html: htmlContent });
  };

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const formattedDate = expense?.date
    ? new Date(Number(expense.date)).toLocaleDateString()
    : 'N/A';

  const createdAtDate = expense?.created_at
    ? new Date(expense.created_at.seconds * 1000).toLocaleDateString()
    : 'N/A';

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{expense?.title}</Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <FontAwesome name="money" size={24} color="#2ecc71" />
            <Text style={styles.amount}>₹{expense?.amount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={24} color="#3498db" />
            <Text style={styles.detail}>Transaction: {formattedDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={24} color="#9b59b6" />
            <Text style={styles.detail}>Created: {createdAtDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="category" size={24} color="#f39c12" />
            <Text style={styles.detail}>Category: {expense?.category || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="payment" size={24} color="#e74c3c" />
            <Text style={styles.detail}>Payment: {expense?.payment_method || 'N/A'}</Text>
          </View>
        </View>

        {expense?.receipt_url && (
          <Image 
            source={{ uri: expense.receipt_url }} 
            style={styles.receiptImage} 
            resizeMode="cover" 
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={[
          styles.buttonWrapper, 
          { transform: [{ scale: printButtonScale }] }
        ]}>
          <TouchableOpacity 
            style={styles.printButton} 
            onPress={handlePrint}
          >
            <MaterialIcons name="print" size={24} color="white" />
            <Text style={styles.buttonText}>Print</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.buttonWrapper, 
          { transform: [{ scale: backButtonScale }] }
        ]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default ExpenseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  detailsContainer: {
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  amount: {
    fontSize: 22,
    color: '#2ecc71',
    marginLeft: 10,
    fontWeight: '600',
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  receiptImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  printButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  backButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});