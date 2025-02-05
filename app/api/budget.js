import { db } from "../../config/firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { useBudgetStore } from "../stores/useBudgetStore";

// Create Budget
export const createBudget = async (user_id, name, limit, category,reset_in) => {
  if (!user_id || !name || !limit || !category) {
    return { error: "Missing required fields" };
  }

  const newBudget = {
    user_id,
    name,
    limit: parseFloat(limit),
    category,
    spent: 0,
    reset_in: 'monthly',
    created_at: new Date(),
  };

  const docRef = await addDoc(collection(db, "budgets"), newBudget);
  return { id: docRef.id, message: "Budget created successfully" };
};

// Get Budgets
export const getBudgets = async (user_id) => {
  if (!user_id) {
    return { error: "User ID is required" };
  }

  try {
    const q = query(collection(db, "budgets"), where("user_id", "==", user_id));
    const snapshot = await getDocs(q);

    const budgets = [];
    let totalBudget = 0;

    snapshot.forEach((doc) => {
      const budgetData = doc.data();
      const { limit } = budgetData;

      console.log("Budget data:", budgetData);

      // Ensure amount is a number and add to total budget
      totalBudget += Math.abs(limit);

      budgets.push({ id: doc.id, ...budgetData });
    });

    console.log("Budgets:", budgets);
    console.log("Tota Budget:", totalBudget);

    useBudgetStore.getState().setTotalBudget(totalBudget);

    return { status: 200, data: budgets, totalBudget };
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return { status: 500, error: "Failed to fetch budgets", details: error.message };
  }
};

// Update Budget
export const updateBudget = async (budget_id, name, limit, category, spent) => {
  if (!budget_id) {
    return { error: "Budget ID is required" };
  }

  const budgetRef = doc(db, "budgets", budget_id);
  const updatedData = { name, limit: parseFloat(limit), category, spent: parseFloat(spent) };

  await updateDoc(budgetRef, updatedData);
  return { message: "Budget updated successfully" };
};

// Delete Budget
export const deleteBudget = async (budget_id) => {
  if (!budget_id) {
    return { error: "Budget ID is required" };
  }

  const budgetRef = doc(db, "budgets", budget_id);
  await deleteDoc(budgetRef);
  return { message: "Budget deleted successfully" };
};

export const updateBudgetByExpense = async (user_id) => {
  try {
    if (!user_id) {
      throw new Error("User ID is required");
    }

    const expenseQuery = query(collection(db, "expenses"), where("user_id", "==", user_id));
    const expenseSnapshot = await getDocs(expenseQuery);

    const categorySpending = {};

    expenseSnapshot.forEach((doc) => {
      const { category, amount } = doc.data();
      if (!categorySpending[category]) categorySpending[category] = 0;
      categorySpending[category] += Math.abs(amount); // Convert negative amounts to positive spending
    });

    console.log("Category Spending:", categorySpending);

    // Fetch all budgets for the user
    const budgetQuery = query(collection(db, "budgets"), where("user_id", "==", user_id));
    const budgetSnapshot = await getDocs(budgetQuery);

    const updatedBudgets = [];
    const updates = [];

    budgetSnapshot.forEach((doc) => {
      const budgetData = doc.data();
      const { category } = budgetData;

      if (categorySpending[category] !== undefined) {
        const spent = categorySpending[category];

        // Update the spent amount in Firestore
        updates.push(updateDoc(doc.ref, { spent }));

        // Prepare updated data for Zustand store
        updatedBudgets.push({ ...budgetData, spent, id: doc.id });
      }
    });

    await Promise.all(updates);

    useBudgetStore.getState().setBudgets(updatedBudgets);

    console.log("Budgets updated successfully");
    return { status: 200, message: "Budgets updated successfully", spending: categorySpending };

  } catch (error) {
    console.error("Error updating budgets:", error);
    return { status: 500, error: "Internal server error", details: error.message };
  }
};

export const fetchBudgetById = async (documentId) => {
  try {
    // Reference to the document
    const docRef = doc(db, "budgets", documentId); 

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