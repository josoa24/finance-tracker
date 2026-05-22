import { useState } from 'react'
import { authService } from '../../../utils/authService'
import './login.css'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login(username, password)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <i className="bx bxs-bank" />
            <span>FinBoard</span>
          </div>

          <div className="login-header">
            <h1>Connexion</h1>
            <p>Bienvenue, entrez vos identifiants pour continuer.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Nom d'utilisateur</label>
              <div className="login-input-wrap">
                <i className="bx bx-user" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre identifiant"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="login-input-wrap">
                <i className="bx bx-lock-alt" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="login-error">
                <i className="bx bx-error-circle" />
                {error}
              </div>
            )}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <><i className="bx bx-loader-alt bx-spin" /> Connexion…</>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="login-switch">
            Pas encore de compte ?{' '}
            <a href="/register">Créer un compte</a>
          </p>
        </div>
      </div>
    </>
  )
}