import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';

export default function BudgetDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!id) return;

    const fetchBudget = async () => {
      try {
        const budgetRef = doc(db, 'budgets', id);
        const budgetSnap = await getDoc(budgetRef);

        if (budgetSnap.exists()) {
          const data = { id: budgetSnap.id, ...budgetSnap.data() };
          setBudget(data);

          // Start animations
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
              toValue: Math.min((data.spent / data.limit) * 100, 100),
              duration: 1500,
              useNativeDriver: false,
            }),
          ]).start();
        } else {
          setError('Budget not found');
        }
      } catch (err) {
        setError('Error fetching budget details');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [id]);

  const handlePrint = async () => {
    if (!budget) return;

    const htmlContent = `
      <html>
        <body style="font-family: Arial;">
          <h1>Budget Details</h1>
          <p><strong>Name:</strong> ${budget.name}</p>
          <p><strong>Category:</strong> ${budget.category}</p>
          <p><strong>Limit:</strong> ₹${budget.limit}</p>
          <p><strong>Spent:</strong> ₹${budget.spent}</p>
          <p><strong>Reset Cycle:</strong> ${budget.reset_in}</p>
        </body>
      </html>
    `;

    await Print.printAsync({ html: htmlContent });
  };

  if (loading) return <ActivityIndicator size="large" color="#3498db" style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const percentageSpent = Math.min((budget.spent / budget.limit) * 100, 100);
  const progressColor = percentageSpent > 80 ? '#e74c3c' : percentageSpent > 60 ? '#f39c12' : '#2ecc71';

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        <Text style={styles.budgetName}>{budget.name}</Text>

        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={24} color="#3498db" />
            <View style={styles.detailText}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{budget.category}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="speedometer" size={24} color="#3498db" />
            <View style={styles.detailText}>
              <Text style={styles.label}>Limit</Text>
              <Text style={styles.value}>₹{budget.limit}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={24} color="#3498db" />
            <View style={styles.detailText}>
              <Text style={styles.label}>Spent</Text>
              <Text style={styles.value}>₹{budget.spent}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="repeat" size={24} color="#3498db" />
            <View style={styles.detailText}>
              <Text style={styles.label}>Reset Cycle</Text>
              <Text style={styles.value}>{budget.reset_in}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              Spent: {percentageSpent.toFixed(1)}%
            </Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: progressColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.button, { backgroundColor: '#34495e' }]}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePrint}
            style={[styles.button, { backgroundColor: '#3498db' }]}
          >
            <Ionicons name="print" size={24} color="white" />
            <Text style={styles.buttonText}>Print</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: '#e74c3c',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  budgetName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailText: {
    marginLeft: 16,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});