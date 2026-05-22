import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "../../../url";
import Sidebar from "../../../layout/Sidebar";
import { navItems } from "../../../config/navigationItems";
import AccountCard from "../components/AccountCard";
import type { Account } from "../types";
import "./account-table.css";
export default function AccountsListPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("accounts");

  const fetchAccounts = async () => {
    setError("");
    try {
      const res = await axios.get<Account[]>(`${API_URL}/api/accounts`);
      setAccounts(res.data);
    } catch {
      setError("Impossible de charger les comptes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDeleteSuccess = (id: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      <link
        href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
        rel="stylesheet"
      />
      <div className="app-shell">
        <Sidebar
          navItems={navItems}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <div className="main-wrapper">
          <main className="accounts-dashboard">
            <section className="dashboard-hero">
              <div>
                <p className="dashboard-eyebrow">Comptes</p>
                <h1>Liste des comptes</h1>
              </div>
            </section>

            {isLoading && (
              <p className="dashboard-state">Chargement des comptes…</p>
            )}
            {error && <p className="dashboard-error">{error}</p>}

            {!isLoading &&
              !error &&
              (accounts.length === 0 ? (
                <div className="empty-accounts">
                  <i className="bx bx-folder-open" />
                  <h3>Aucun compte trouvé</h3>
                  <p>Créez un compte pour commencer.</p>
                </div>
              ) : (
                <div className="accounts-table-wrapper">
                  <table className="accounts-table">
                    <thead>
                      <tr>
                        <th className="col-name">Nom</th>
                        <th className="col-type">Type</th>
                        <th className="col-balance">Solde</th>
                        <th className="col-currency">Devise</th>
                        <th className="col-action">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                          onDeleteSuccess={handleDeleteSuccess}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </main>
        </div>
      </div>
    </>
  );
}
