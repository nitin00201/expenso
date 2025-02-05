import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Button, Menu, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getExpenses } from '../api/expense'; 
import { auth } from '../../config/firebaseConfig';  
import { exportToExcel } from './../api/utils'

const TransactionList = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    applyFilters();
  }, [transactions, sortOrder, categoryFilter]);

  const loadTransactions = async () => {
    try {
      const data = await getExpenses(auth.currentUser?.uid);
      setTransactions(data.data);
      setFilteredTransactions(data.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let tempTransactions = [...transactions];

    // Apply category filter if selected
    if (categoryFilter) {
      tempTransactions = tempTransactions.filter(txn => txn.category === categoryFilter);
    }

    // Sort transactions by date
    tempTransactions.sort((a, b) =>
      sortOrder === 'asc'
        ? parseInt(a.date) - parseInt(b.date)
        : parseInt(b.date) - parseInt(a.date)
    );

    setFilteredTransactions(tempTransactions);
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity onPress={() => router.push(`/transactions/${item.id}`)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.amount, { color: item.type === 'expense' ? '#FF4B4B' : '#4BB543' }]}>
              ₹ {item.amount}
            </Text>
          </View>
          <Text style={styles.date}>
            {item.date ? new Date(parseInt(item.date)).toLocaleDateString() : 'No Date'}
          </Text>
          {item.category && <Text style={styles.category}>{item.category}</Text>}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Transactions</Text>

      {/* Filter and Sort Section */}
      <View style={styles.filterSortSection}>
        {/* Filter Dropdown */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)}>
              {categoryFilter ? categoryFilter : "Filter by Category"}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setCategoryFilter(null); setMenuVisible(false); }} title="All Categories" />
          <Divider />
          <Menu.Item onPress={() => { setCategoryFilter("Food"); setMenuVisible(false); }} title="Food" />
          <Menu.Item onPress={() => { setCategoryFilter("Shopping"); setMenuVisible(false); }} title="Shopping" />
          <Menu.Item onPress={() => { setCategoryFilter("Transport"); setMenuVisible(false); }} title="Transport" />
          <Menu.Item onPress={() => { setCategoryFilter("Bills"); setMenuVisible(false); }} title="Bills" />
          <Menu.Item onPress={() => { setCategoryFilter("Entertainment"); setMenuVisible(false); }} title="Entertainment" />
          <Menu.Item onPress={() => { setCategoryFilter("Health"); setMenuVisible(false); }} title="Health" />

        </Menu>

        {/* Sort Button */}
        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <Text style={styles.sortButtonText}>
            Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
<Button 
  mode="contained" 
  onPress={() => exportToExcel(filteredTransactions)}
  style={styles.exportButton} 
  labelStyle={styles.exportButtonText}
>
  Share as XLS
</Button>
        

    </View>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    backgroundColor: '#000000', 
    paddingVertical: 2,
    borderRadius: 15,
    marginVertical: 5, 
    alignSelf: 'center', 
    width: '60%', 
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF', 
  },
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  filterSortSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sortButton: { backgroundColor: '#195253', padding: 10, borderRadius: 5 },
  sortButtonText: { color: 'white', fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  card: { marginBottom: 6, elevation: 2, backgroundColor: '#ffffff', borderRadius: 3, padding: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 16, fontWeight: '700' },
  date: { fontSize: 14, color: '#666', marginTop: 4 },
  category: { fontSize: 14, color: '#666', marginTop: 4, fontStyle: 'italic' },
});

export default TransactionList;
