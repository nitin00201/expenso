import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const ExpenseCalculator = () => {
  const [input, setInput] = useState("");
  const [splitCount, setSplitCount] = useState("");
  const [splitResult, setSplitResult] = useState(null);

  const handleButtonPress = (value) => {
    setInput((prev) => prev + value);
  };

  const clearInput = () => {
    setInput("");
    setSplitResult(null);
  };

  const calculateResult = () => {
    try {
      setInput(eval(input).toString());
    } catch (error) {
      setInput("Error");
    }
  };

 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Calculator</Text>
      <TextInput 
        style={styles.input} 
        value={input} 
        editable={false} 
        placeholderTextColor="#888"
      />
   
      <View style={styles.keypadContainer}>
        <View style={styles.row}>
          {["7", "8", "9", "/"].map((item) => (
            <TouchableOpacity 
              key={item} 
              style={styles.numberButton} 
              onPress={() => handleButtonPress(item)}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {["4", "5", "6", "*"].map((item) => (
            <TouchableOpacity 
              key={item} 
              style={styles.numberButton} 
              onPress={() => handleButtonPress(item)}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {["1", "2", "3", "-"].map((item) => (
            <TouchableOpacity 
              key={item} 
              style={styles.numberButton} 
              onPress={() => handleButtonPress(item)}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {["0", ".", "=", "+"].map((item) => (
            <TouchableOpacity 
              key={item} 
              style={styles.numberButton} 
              onPress={item === "=" ? calculateResult : () => handleButtonPress(item)}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.additionalControls}>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearInput}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f5", // Neutral gray background
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "#27272a", // Deep gray for title
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    height: 70,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "right",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  keypadContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  numberButton: {
    flex: 1,
    backgroundColor: "#e4e4e7", // Soft gray
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#27272a",
    fontSize: 20,
    fontWeight: "600",
  },
  additionalControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#ef4444", // Soft red
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
  },
  splitButton: {
    flex: 1,
    backgroundColor: "#22c55e", // Soft green
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  splitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  splitResultText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#27272a",
    marginBottom: 15,
  },
});

export default ExpenseCalculator;