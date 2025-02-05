import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { getDataFromLocal, removeLocalData } from './storageService'; 
import { db } from './../../config/firebaseConfig'

const LOCAL_STORAGE_KEY = "pending_transactions";

// Sync Offline Transactions to Firebase
export const syncOfflineData = async (userId) => {
  try {
    const transactions = await getDataFromLocal(LOCAL_STORAGE_KEY);
    if (transactions && transactions.length > 0) {
      for (const transaction of transactions) {
        const docRef = doc(collection(db, "expenses"), transaction.id);
        await setDoc(docRef, { ...transaction, user_id: userId });
      }
      await removeLocalData(LOCAL_STORAGE_KEY); // Clear local data after sync
      console.log("Offline data synced successfully");
    }
  } catch (error) {
    console.error("Error syncing offline data", error);
  }
};
