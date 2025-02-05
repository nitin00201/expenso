import { addDoc, collection } from "firebase/firestore";
import { db } from './../../config/firebaseConfig';
import { saveDataLocally, getDataFromLocal } from "./storageService";
import { checkInternetConnection } from "./networkService";

const LOCAL_STORAGE_KEY = "pending_transactions";

// Create Expense (Offline & Online)
export const createExpense = async (transaction, userId) => {
  const isConnected = await checkInternetConnection();

  if (isConnected) {
    try {
      await addDoc(collection(db, "expenses"), { ...transaction, user_id: userId });
      console.log("Transaction saved to Firebase");
    } catch (error) {
      console.error("Error saving transaction online:", error);
    }
  } else {
    // Store Locally if Offline
    let pendingTransactions = await getDataFromLocal(LOCAL_STORAGE_KEY) || [];
    pendingTransactions.push(transaction);
    await saveDataLocally(LOCAL_STORAGE_KEY, pendingTransactions);
    console.log("Transaction saved offline");
  }
};
