import { useCallback, useEffect, useState } from "react";

import { ApiError } from "../api/client.js";
import { deleteTransaction, listTransactions } from "../api/transactions.js";

/** Loads the signed-in user's transactions. `transactions` is null until the first response arrives. */
export function useTransactions() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    listTransactions()
      .then((data) => {
        if (!ignore) setTransactions(data);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "Could not load transactions");
      });

    return () => {
      ignore = true;
    };
  }, []);

  const remove = useCallback(async (id) => {
    await deleteTransaction(id);
    setTransactions((current) => current.filter((t) => t._id !== id));
  }, []);

  return { transactions, error, remove };
}
