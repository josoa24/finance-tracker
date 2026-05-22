import axios from 'axios'
import { useState } from 'react'
import { API_URL } from '../../../url'
import CreateAccountForm from '../components/CreateAccountForm'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import type { CreateAccountPayload } from '../types'
import './create-account-page.css'

function CreateAccountPage() {
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('accounts')

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
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />

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
                <p className="dashboard-eyebrow">Dashboard</p>
                <h1>Creer un compte</h1>
              </div>
              <div className="dashboard-actions">
                <button type="button" className="secondary-button" onClick={() => window.location.assign('/dashboard')}>
                  <i className="bx bx-arrow-back" />
                  Retour
                </button>
              </div>
            </section>

            {error && (
              <p className="dashboard-error">
                <i className="bx bx-error-circle" />
                {error}
              </p>
            )}

            <section className="create-account-page">
              <CreateAccountForm onCancel={() => window.location.assign('/dashboard')} onSubmit={handleSubmit} />
            </section>
          </main>
        </div>
      </div>
    </>
  )
}

export default CreateAccountPage