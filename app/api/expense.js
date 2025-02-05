import { addDoc, collection, getDocs, where, query, updateDoc, doc,deleteDoc, getDoc, serverTimestamp  } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useBudgetStore, setTotalExpenses } from "../stores/useBudgetStore";


export const createExpense = async ( user_id, amount, category, description, date, receipt_url, payment_method,title ) => {
  try {
    console.log("API started");

    if (!user_id || !amount || !category || !date) {
      console.error("Error: Missing required fields");
      return { status: 400, error: "Missing required fields" };
    }

    const newExpense = {
      title: title || 'title',
      user_id:user_id || '555',
      amount: amount ||'25' ,
      category: category || "353",
      description: description || "",
      date: Date.now().toString(),
      receipt_url: receipt_url || "",
      payment_method: payment_method || "Cash",
      created_at: serverTimestamp(),
    };

    console.log("New Expense:", newExpense);

    const docRef = await addDoc(collection(db, "expenses"), newExpense);

    console.log("API completed. Expense ID:", docRef.id);
    return { status: 201, id: docRef.id, message: "Expense added successfully" };

  } catch (error) {
    console.error("Error creating expense:", error);
    return { status: 500, error: "Failed to add expense", details: error.message };
  }
};





export const getExpenses = async (user_id) => {
  try {
    if (!user_id) {
      return { status: 400, error: "User ID is required" };
    }
console.log("api started getExpense");

    const q = query(collection(db, "expenses"), where("user_id", "==", user_id));
    const querySnapshot = await getDocs(q);

    const expenses = [];
    let totalExpense = 0; 

    querySnapshot.forEach((doc) => {
      const expenseData = doc.data();
      const { amount } = expenseData;

      console.log("Expense data:", expenseData);

      totalExpense += Math.abs(amount);

      expenses.push({ id: doc.id, ...expenseData });
    });

    console.log("Expenses:", expenses);
    console.log("Total Expense:", totalExpense);

    useBudgetStore.getState().setExpenses(expenses);
    useBudgetStore.getState().setTotalExpenses(totalExpense);

    return { status: 200, data: expenses, totalExpense };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { status: 500, error: "Failed to fetch expenses", details: error.message };
  }
};



export const updateExpense = async (expense_id, updatedFields) => {
  try {
    if (!expense_id || !updatedFields) {
      return { status: 400, error: "Expense ID and update fields are required" };
    }

    const expenseRef = doc(db, "expenses", expense_id);
    const expenseSnap = await getDoc(expenseRef);

    if (!expenseSnap.exists()) {
      return { status: 404, error: "Expense not found" };
    }

    await updateDoc(expenseRef, updatedFields);

    return { status: 200, message: "Expense updated successfully" };
  } catch (error) {
    return { status: 500, error: "Failed to update expense", details: error.message };
  }
};



export const deleteExpense = async (expense_id) => {
  try {
    if (!expense_id) {
      return { status: 400, error: "Expense ID is required" };
    }

    const expenseRef = doc(db, "expenses", expense_id);
    await deleteDoc(expenseRef);

    return { status: 200, message: "Expense deleted successfully" };
  } catch (error) {
    return { status: 500, error: "Failed to delete expense", details: error.message };
  }
};

export const getExpensesByCategory = async (user_id) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const expenseQuery = query(collection(db, "expenses"), where("user_id", "==", user_id));
    const expenseSnapshot = await getDocs(expenseQuery);

    const categoryData = {};

    expenseSnapshot.forEach((doc) => {
      const { category, amount } = doc.data();
      if (!categoryData[category]) categoryData[category] = 0;
      categoryData[category] += Math.abs(amount); 
    });

    const formattedData = Object.keys(categoryData).map((category, index) => ({
      name: category,
      spending: categoryData[category],
      color: getRandomColor(index), 
    }));
    console.log("formatted data",formattedData);
    

    return { status: 200, data: formattedData };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { status: 500, error: "Failed to fetch expenses", details: error.message };
  }
};

const getRandomColor = (index) => {
  const colors = ["#e74c3c", "#3498db", "#f39c12", "#2ecc71", "#9b59b6", '#541254', '#kjjkjj','#jv526v'];
  return colors[index % colors.length];
};

export const fetchExpenseById = async (documentId) => {
  try {
    // Reference to the document
    const docRef = doc(db, "expenses", documentId); 

    // Fetch the document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Document exists, return the data
      return { success: true, data: docSnap.data() };
    } else {
      // Document does not exist
      return { success: false, message: "Document not found" };
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return { success: false, error: error.message };
  }
};