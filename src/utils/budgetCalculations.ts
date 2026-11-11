import { Budget, BudgetWithStats, Transaction } from '../types';

export function calculateBudgetStats(budget: Budget, transactions: Transaction[]): BudgetWithStats {
  const budgetTransactions = transactions.filter((t) => t.budget_id === budget.id);
  const total_expenses = budgetTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const remaining_amount = budget.amount - total_expenses;
  const consumed_percentage = budget.amount > 0 ? (total_expenses / budget.amount) * 100 : 0;
  
  const threshold_amount = (budget.amount * budget.threshold_percentage) / 100;
  const is_threshold_reached = budget.threshold_enabled && remaining_amount <= threshold_amount;
  const is_over_budget = remaining_amount < 0;

  return {
    ...budget,
    total_expenses,
    remaining_amount,
    consumed_percentage,
    threshold_amount,
    is_threshold_reached,
    is_over_budget,
  };
}

export function calculateMonthlyStats(
  budgets: Budget[],
  transactions: Transaction[],
  monthlyThresholdEnabled: boolean,
  monthlyThresholdPercentage: number
) {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Transactions belonging to this month
  const monthlyTransactions = transactions.filter((t) => t.transaction_date.startsWith(currentMonthStr));
  const total_monthly_expenses = monthlyTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Active budgets covering this month
  const activeBudgets = budgets.filter((b) => {
    return b.start_date <= `${currentMonthStr}-31` && b.end_date >= `${currentMonthStr}-01`;
  });

  const total_monthly_budget = activeBudgets.reduce((acc, curr) => acc + curr.amount, 0);
  const monthly_remaining = total_monthly_budget - total_monthly_expenses;
  const monthly_consumed_percentage = total_monthly_budget > 0 ? (total_monthly_expenses / total_monthly_budget) * 100 : 0;

  const monthly_threshold_amount = (total_monthly_budget * monthlyThresholdPercentage) / 100;
  const is_monthly_threshold_reached =
    monthlyThresholdEnabled &&
    total_monthly_budget > 0 &&
    monthly_remaining <= monthly_threshold_amount;
  const is_monthly_over_budget = total_monthly_budget > 0 && monthly_remaining < 0;

  return {
    total_monthly_budget,
    total_monthly_expenses,
    monthly_remaining,
    monthly_consumed_percentage,
    monthly_threshold_amount,
    is_monthly_threshold_reached,
    is_monthly_over_budget,
    monthlyTransactionsCount: monthlyTransactions.length,
  };
}
