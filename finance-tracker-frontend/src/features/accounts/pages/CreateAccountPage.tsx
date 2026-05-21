import axios from 'axios'
import { useState } from 'react'
import { API_URL } from '../../../url'
import CreateAccountForm from '../components/CreateAccountForm'
import type { CreateAccountPayload } from '../types'
import './AccountsDashboardPage.css'

function CreateAccountPage() {
  const [error, setError] = useState('')

  const handleSubmit = async (payload: CreateAccountPayload) => {
    setError('')
    try {
      await axios.post(`${API_URL}/api/accounts`, payload)
      window.location.assign('/dashboard')
    } catch {
      setError('Impossible de creer le compte pour le moment.')
    }
  }

  return (
    <main className="accounts-dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Dashboard</p>
          <h1>Creer un compte</h1>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="secondary-button" onClick={() => window.location.assign('/dashboard')}>
            Retour
          </button>
        </div>
      </section>

      {error && <p className="dashboard-error">{error}</p>}

      <section className="create-account-page">
        <CreateAccountForm onCancel={() => window.location.assign('/dashboard')} onSubmit={handleSubmit} />
      </section>
    </main>
  )
}

export default CreateAccountPage
