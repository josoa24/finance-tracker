import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UsersList.css";
import { API_URL } from "../url";

interface User {
  id: number;
  name: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>(API_URL + "/api/users");
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des utilisateurs");
        setLoading(false);
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="users-container">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <h1>Liste des Utilisateurs</h1>
      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé</p>
      ) : (
        <ul className="users-list">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <span className="user-id">ID: {user.id}</span>
              <span className="user-name">Nom: {user.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
