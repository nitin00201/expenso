import AsyncStorage from "@react-native-async-storage/async-storage";

// Save Data Locally
export const saveDataLocally = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data locally", error);
  }
};

// Get Data from Local Storage
export const getDataFromLocal = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error retrieving local data", error);
  }
};

// Remove Data Locally
export const removeLocalData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing local data", error);
  }
};
