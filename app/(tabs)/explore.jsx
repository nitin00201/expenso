import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  TextInput,
  Alert
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Link,  useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, ProgressBar } from 'react-native-paper';
import { auth } from '../../config/firebaseConfig';
import { 
  createBudget, 
  deleteBudget, 
  getBudgets, 
  updateBudget, 
  updateBudgetByExpense
} from '../api/budget';
import { useBudgetStore } from '../stores/useBudgetStore';

const CATEGORIES = ["Food", "Transport", "Entertainment", "Health", "Shopping", "Other"];
const RESET_PERIODS = ["Daily", "Weekly", "Monthly", "Yearly"];

const BudgetManagementScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgets1, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: CATEGORIES[0],
    resetPeriod: RESET_PERIODS[2]
  });

  const router = useRouter()
  
  const { budgets } = useBudgetStore(); 

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [resetPeriodOpen, setResetPeriodOpen] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBudgets(auth.currentUser.uid);
      await updateBudgetByExpense(auth.currentUser.uid); // Calls the function, which updates Zustand

      setBudgets(response || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(()=>{
    updateBudgetByExpense(auth.currentUser.uid);

  },[])

  const handleSaveBudget = async () => {
    const { name, amount, category, resetPeriod } = formData;
    
    if (!name || !amount) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, name, amount, category, resetPeriod);
      } else {
        await createBudget(
          auth.currentUser.uid, 
          name, 
          amount, 
          category, 
          resetPeriod
        );
      }
      
      await fetchBudgets();
      setModalVisible(false);
      
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    Alert.alert(
      'Confirm Deletion', 
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteBudget(budgetId);
              fetchBudgets();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          }
        }
      ]
    );
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      amount: budget.limit.toString(),
      category: budget.category,
      resetPeriod: budget.reset_in
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: CATEGORIES[0],
      resetPeriod: RESET_PERIODS[2]
    });
    setEditingBudget(null);
  };
  

  const renderBudgetCard = (budget) => (
    <View key={budget.id} style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Link 
          href={{
            pathname: '/budget/[id]',
            params: { id: budget.id },
          }}
        >
          <Text style={styles.categoryTitle}>{budget.category}</Text>
        </Link>
        <View style={styles.budgetActions}>
          <TouchableOpacity 
            onPress={() => handleEditBudget(budget)} 
            style={styles.actionButton}
          >
            <MaterialIcons name="edit" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeleteBudget(budget.id)} 
            style={styles.actionButton}
          >
            <MaterialIcons name="delete" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.budgetInfo}>
        <Text style={styles.budgetText}>
          Spent: ₹{budget.spent} of ₹{budget.limit}
        </Text>
        <ProgressBar 
          progress={Math.min(budget.spent / budget.limit, 1)} 
          color="#4CAF50" 
          style={styles.progressBar} 
        />
      </View>
    </View>
  );

  const renderBudgetModal = () => (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={modalVisible} 
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingBudget ? "Edit Budget" : "Add New Budget"}
          </Text>

          <TextInput 
            style={styles.input} 
            placeholder="Budget Name" 
            value={formData.name} 
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Budget Amount" 
            value={formData.amount} 
            onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))} 
            keyboardType="numeric" 
          />

          <Text style={styles.label}>Category</Text>
          <DropDownPicker
            open={categoryOpen}
            value={formData.category}
            items={CATEGORIES.map(item => ({ label: item, value: item }))}
            setOpen={setCategoryOpen}
            setValue={(val) => setFormData(prev => ({ ...prev, category: val() }))}
            style={styles.picker}
          />

          <Text style={styles.label}>Reset Period</Text>
          <DropDownPicker
            open={resetPeriodOpen}
            value={formData.resetPeriod}
            items={RESET_PERIODS.map(item => ({ label: item, value: item }))}
            setOpen={setResetPeriodOpen}
            setValue={(val) => setFormData(prev => ({ ...prev, resetPeriod: val() }))}
            style={styles.picker}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]} 
              onPress={handleSaveBudget}
            >
              <Text style={[styles.buttonText, { color: "white" }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budget Management</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.budgetList}>
        {loading ? (
          <ActivityIndicator size="large" color="#212" />
        ) : budgets.length > 0 ? (
          budgets.map(renderBudgetCard)
        ) : (
          <Text style={styles.emptyState}>No budgets created yet</Text>
        )}
      </ScrollView>

      {renderBudgetModal()}
    </View>
  );
};
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 50,
    color: '#636e72',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  budgetList: {
    padding: 15,
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  budgetInfo: {
    gap: 8,
  },
  budgetText: {
    fontSize: 16,
    color: '#636e72',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e8e8e8',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d3436',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2d3436',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    marginBottom: 20,
    zIndex:25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BudgetManagementScreen;
