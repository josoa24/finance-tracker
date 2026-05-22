import { useState } from "react";
import { API_URL } from "../../../url";
import type { Account } from "../types";

type Props = {
  account: Account;
  onDeleteSuccess?: (id: number) => void;
};

export default function AccountCard({ account, onDeleteSuccess }: Props) {
  const { id, name, type, balance, currency, hasTransactions, active } =
    account;
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (active === false) return null;

  const readErrorMessage = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return (
        data?.message ||
        data?.error ||
        data?.detail ||
        "Une erreur est survenue."
      );
    }

    const text = await response.text().catch(() => "");
    return text.trim() || "Une erreur est survenue.";
  };

  const handleDelete = async () => {
    if (hasTransactions) {
      setError(
        "Impossible de supprimer : ce compte contient des transactions."
      );
      return;
    }

    if (
      !window.confirm(`Voulez-vous vraiment supprimer le compte "${name}" ?`)
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/accounts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      onDeleteSuccess?.(id as number);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="account-card">
      <div className="account-header">
        <h3>{name}</h3>
        <span className="account-type">{type}</span>
      </div>

      <div className="account-body">
        <p className="balance">
          {balance.toLocaleString()} {currency?.code || "EUR"}
        </p>
      </div>

      <div className="account-footer">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`btn-delete ${hasTransactions ? "disabled" : ""}`}
          title={
            hasTransactions
              ? "Ce compte contient des transactions et ne peut pas être supprimé."
              : ""
          }
        >
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
