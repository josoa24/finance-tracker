import { useState, useEffect } from 'react'
import { authService } from '../utils/authService'
import './user-profile.css'

interface Props {
  sidebarOpen: boolean
}

export default function UserProfile({ sidebarOpen }: Props) {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const user = authService.getUsernameFromToken()
    setUsername(user)
  }, [])

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  if (!username) return null

  return (
    <div className={`user-profile ${sidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="user-info">
        <div className="user-avatar">
          <i className="bx bx-user-circle" />
        </div>
        {sidebarOpen && (
          <div className="user-details">
            <p className="user-name">{username}</p>
            <p className="user-status">Connecté</p>
          </div>
        )}
      </div>
      <button className="btn-logout" onClick={handleLogout} title="Déconnexion">
        <i className="bx bx-log-out" />
        {sidebarOpen && <span>Déconnexion</span>}
      </button>
    </div>
  )
}
