import "../styles/UsersList.css";

export default function UsersList() {
  return (
    <div className="users-container">
      <h1>Utilisateurs</h1>
      <p className="error">L'API `users` n'est plus disponible côté backend. Cette vue a été désactivée.</p>
      <p>Retourner au <a href="/dashboard">Tableau de bord</a>.</p>
    </div>
  )
}
