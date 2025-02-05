import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';
export const exportToExcel = async (transactions) => {
  try {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(transactions);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Write workbook to binary string
    const excelData = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

    // Define file path
    const fileUri = FileSystem.documentDirectory + "transactions.xlsx";

    // Write file to device storage
    await FileSystem.writeAsStringAsync(fileUri, excelData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share the file
    if (!(await Sharing.isAvailableAsync())) {
      alert("Sharing is not available on this device");
      return;
    }

    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Error exporting transactions:', error);
  }
};
