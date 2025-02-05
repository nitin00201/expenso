# Expense Manager App

## Overview
The Expense Manager App is a React Native-based mobile application that helps users track their expenses, create budgets, and manage their financial activities efficiently. The app integrates Firebase for authentication, real-time data management, and cloud storage.

## Tech Stack

### Frontend:
- React Native (Expo)
- React Navigation
- React Native Gesture Handler
- React Native Vector Icons
- React Native Reanimated

### Backend:
- Firebase Authentication (User Management)
- Firestore (Database)
- Firebase Storage (Receipt Uploads)
- Firebase Cloud Messaging (Notifications)

## Features
- **User Authentication**: Login/Signup using Firebase Authentication.
- **Expense Creation**: Add, edit, and delete expenses with categories.
- **Budget Management**: Set and track budgets for different spending categories.
- **Receipt Upload**: Upload and store receipts using Firebase Storage.
- **Dashboard**: Visual representation of spending trends.
- **Notifications**: Get reminders for budget limits and expense tracking.
- **Basic Calculator**: Perform quick financial calculations within the app.

## Future Scope
- **AI-Powered Expense Categorization**: Use AI to automatically classify expenses.
- **OCR Integration**: Extract data from receipts using Optical Character Recognition (OCR).
- **Bank Account Integration**: Sync with bank accounts for automated expense tracking.
- **Multi-Currency Support**: Enable users to manage expenses in different currencies.
- **Voice Input for Expense Logging**: Allow users to log expenses using voice commands.
- **Gamification & Rewards**: Introduce achievements and rewards for saving money.

## Installation & Setup
1. Clone the repository:
   ```bash
   https://github.com/nitin00201/expenso.git
   cd expense-manager
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase by adding your Firebase credentials in a `.env` file.
4. Start the Expo development server:
   ```bash
   expo start
   ```

## Contributing
We welcome contributions! Feel free to fork the repository and submit pull requests.

## License
This project is licensed under the MIT License.
