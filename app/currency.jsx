import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import useAuthStore from './stores/useAuthStore'; 
export default function CurrencyPage() {
  const { currency, setCurrency } = useAuthStore(); 

  const currencies = [
    { id: '1', name: 'USD - United States Dollar' },
    { id: '2', name: 'EUR - Euro' },
    { id: '3', name: 'INR - Indian Rupee' },
    { id: '4', name: 'GBP - British Pound' },
    { id: '5', name: 'JPY - Japanese Yen' },
  ];

  useEffect(() => {
    if (!currency) {
      setCurrency(currencies[0]); 
    }
  }, [currency, setCurrency]);

  const handleCurrencySelect = (selected) => {
    setCurrency(selected);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Currency</Text>

      <FlatList
        data={currencies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.currencyItem,
              currency?.id === item.id && styles.selectedItem,
            ]}
            onPress={() => handleCurrencySelect(item)}
          >
            <Text style={styles.currencyText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  currencyItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#3498db',
  },
  currencyText: {
    fontSize: 18,
    color: '#333',
  },
  selectedContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 3,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedCurrency: {
    color: '#3498db',
  },
});
