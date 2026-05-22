import { useState } from 'react'
import { authService } from '../../../utils/authService'
import './login.css'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    try {
      await authService.register(username, password)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'inscription. Ce nom d'utilisateur existe peut-être déjà.")
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
            <h1>Créer un compte</h1>
            <p>Remplissez les champs ci-dessous pour vous inscrire.</p>
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
                  placeholder="Choisissez un identifiant"
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
                  placeholder="Minimum 6 caractères"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="login-input-wrap">
                <i className="bx bx-lock-open-alt" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  required
                  autoComplete="new-password"
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
                <><i className="bx bx-loader-alt bx-spin" /> Inscription…</>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          <p className="login-switch">
            Déjà un compte ?{' '}
            <a href="/login">Se connecter</a>
          </p>
        </div>
      </div>
    </>
  )
}