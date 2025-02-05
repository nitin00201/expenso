import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Button } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/header';
import { createExpense, fetchExpenseById, getExpenses, getExpensesByCategory } from '../api/expense';
import { auth, db } from '../../config/firebaseConfig';
import { getBudgets, updateBudgetByExpense } from '../api/budget';
import { ActivityIndicator } from 'react-native-paper';
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { useBudgetStore } from '../stores/useBudgetStore';


const DashboardScreen = () => {
  const router = useRouter();

  
  
  const totalBudget = useBudgetStore((state) => state.totalBudget);
  const totalExpenses = useBudgetStore((state) => state.totalexpenses);
  
  const finances = {
    totalBalance: 5240.50,
    income: 6000,
    expenses: parseFloat(totalExpenses),
    budget: parseFloat(totalBudget),
  };
  

  useEffect(()=>{
    const fetchExpense = async ()=>{
      await getExpenses(auth.currentUser.uid);
      await getBudgets(auth.currentUser.uid)
    }
    fetchExpense();
  })
 
    const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pieChartData, setPiChartData] = useState([])

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const transactionsRef = collection(db, "expenses");
      const q = query(
        transactionsRef,
        where("user_id", "==", user.uid),
        orderBy("date", "desc"),
        limit(3)
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecentTransactions(transactions);
        console.log("Transactions updated:", transactions);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);
  useEffect(()=>{
    const fetchPieChart = async ()=>{
      const response = await getExpensesByCategory(auth.currentUser.uid);
    setPiChartData(response.data)
    }
    fetchPieChart()

  },[])

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [2000, 2500, 1800, 3000, 2800, 2600],
    }],
  };

  const handleAddTransaction = () => {
    router.push('/add-transaction');
  };

  const formatCurrency = (amount) => {
    return `₹ ${Math.abs(amount).toFixed(2)}`;
  };

  const handleTransactionClick = async(id) =>{
    console.log("handle click",id);
    const res = await fetchExpenseById(id)
    console.log("data fetched successfully");
    console.log("data is",res);
    
    
  }

  

  return (
    <ScrollView style={styles.container}>
            <Header/>
      
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.balanceTitle}>Total Balance</Text>
        <Text style={styles.balanceAmount}>₹{finances.totalBalance.toFixed(2)}</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>₹{finances.income}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>₹{finances.expenses}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Budget Left</Text>
            <Text
  style={[
    styles.summaryValue,
    { color: finances.budget < 0 ? 'red' : 'green' }
  ]}
>
  ₹{finances.budget - finances.expenses}
</Text>
          </View>
        </View>
      </View>

      {/* Spending Trends Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Spending Trends</Text>
        <LineChart
          data={monthlyData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Expense Categories */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Expense Categories</Text>

        {pieChartData.length > 0 && recentTransactions.length > 0 ? (
  <PieChart
    data={pieChartData.map(item => ({
      name: item.name,
      population: item.spending,
      color: item.color,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }))}
    width={Dimensions.get('window').width - 40}
    height={220}
    chartConfig={{
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }}
    accessor="population"
    backgroundColor="transparent"
    paddingLeft="15"
  />
) : (
  <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray', fontSize: 16 }}>
    No Data Found
  </Text>
)}

      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTransaction}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
  recentTransactions.map((transaction) => (
    <Link 
      key={transaction.id}
      href={{
        pathname: '/transactions/[id]',
        params: { id: transaction.id },
      }}
    >
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <FontAwesome name="money" size={20} color="#3498db" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: transaction.amount >= 0 ? '#2ecc71' : '#e74c3c' },
          ]}
        >
          {transaction.amount >= 0 ? '' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
    </Link>
  ))
) : (
  <View style={{ alignItems: 'center', marginTop: 20 }}>
    <FontAwesome name="exclamation-circle" size={24} color="gray" />
    <Text style={{ textAlign: 'center', marginTop: 5, color: 'gray', fontSize: 16 }}>
      No Transactions Found
    </Text>
  </View>
)}
      </View>
      <TouchableOpacity style={styles.button} onPress={()=>{router.push('/transactions/all-transactions')}}>
      <Text style={styles.buttonText}>All Transactions</Text>
    </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '90%',
    marginHorizontal: 'auto',
    backgroundColor: '#000000',
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.8, 
    shadowRadius: 2, 
    marginBottom: 24,
  },
  buttonText: {
    color: 'white', // Text color
    fontSize: 16, // Font size
    fontWeight: 'bold', // Make the text bold
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartContainer: {
    padding: 20,
    marginTop: 20,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  transactionsContainer: {
    padding: 20,
    marginTop: 20,
    backgroundColor: 'white',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;