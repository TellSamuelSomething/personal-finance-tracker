export const formatAmount = (amount) =>
  amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The API sends ISO timestamps, the date part is what the user picked. */
export const formatDate = (isoDate) => isoDate.slice(0, 10);

/** Today's date as YYYY-MM-DD in the user's own time zone, for date inputs. */
export function todayInputValue() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function summarize(transactions) {
  const total = (type) => transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
  const income = total("Income");
  const expense = total("Expense");
  return { income, expense, balance: income - expense };
}
