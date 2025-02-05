import { create } from "zustand";

export const useBudgetStore = create((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  totalexpenses: 0,
  setTotalExpenses: (totalexpenses) => set({totalexpenses}),
  totalBudget: 0,
  setTotalBudget: (totalBudget)=> set({totalBudget}),
  expenses: [],
  setExpenses: (expenses)=> set({expenses})


}));
