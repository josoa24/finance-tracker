import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../../../url'
import Sidebar from '../../../layout/Sidebar'
import { navItems } from '../../../config/navigationItems'
import '../../accounts/pages/create-account-page.css'
import './category-limits-page.css'

type CategoryLimit = {
  id: number
  name: string
  monthlyLimit: number | null
}

export default function CategoryLimitsPage() {
  const [categories, setCategories] = useState<CategoryLimit[]>([])
  const [draftLimits, setDraftLimits] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('settings')

  useEffect(() => {
    const fetchCategories = async () => {
      setError('')
      try {
        const response = await axios.get<CategoryLimit[]>(`${API_URL}/api/categories`)
        setCategories(response.data)
        setDraftLimits(
          Object.fromEntries(
            response.data.map((category) => [category.id, category.monthlyLimit === null ? '' : String(category.monthlyLimit)]),
          ),
        )
      } catch {
        setError('Impossible de charger les catégories.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const hasCategories = useMemo(() => categories.length > 0, [categories])

  const updateDraft = (categoryId: number, value: string) => {
    setDraftLimits((current) => ({ ...current, [categoryId]: value }))
  }

  const saveLimit = async (category: CategoryLimit) => {
    setError('')
    setSuccess('')

    const rawValue = draftLimits[category.id]?.trim() ?? ''
    const monthlyLimit = rawValue === '' ? null : Number(rawValue)

    if (monthlyLimit !== null && (!Number.isFinite(monthlyLimit) || monthlyLimit < 0)) {
      setError('La limite mensuelle doit être un nombre positif ou vide.')
      return
    }

    setSavingId(category.id)
    try {
      const response = await axios.put<CategoryLimit>(`${API_URL}/api/categories/${category.id}/monthly-limit`, {
        monthlyLimit,
      })

      const updatedCategory = response.data
      setCategories((current) => current.map((item) => (item.id === updatedCategory.id ? updatedCategory : item)))
      setDraftLimits((current) => ({
        ...current,
        [updatedCategory.id]: updatedCategory.monthlyLimit === null ? '' : String(updatedCategory.monthlyLimit),
      }))
      setSuccess(`Limite enregistrée pour ${updatedCategory.name}.`)
    } catch {
      setError('Impossible d’enregistrer la limite mensuelle.')
    } finally {
      setSavingId(null)
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
          <main className="accounts-dashboard settings-page">
            <section className="dashboard-hero">
              <div>
                <p className="dashboard-eyebrow">Paramètres</p>
                <h1>Limites mensuelles par catégorie</h1>
              </div>
              <div className="dashboard-actions">
                <button type="button" className="secondary-button" onClick={() => window.location.assign('/dashboard/history')}>
                  <i className="bx bx-history" />
                  Historique
                </button>
              </div>
            </section>

            {error && (
              <p className="dashboard-error">
                <i className="bx bx-error-circle" />
                {error}
              </p>
            )}

            {success && (
              <p className="dashboard-success">
                <i className="bx bx-check-circle" />
                {success}
              </p>
            )}

            {isLoading ? (
              <p className="dashboard-state">Chargement des catégories...</p>
            ) : hasCategories ? (
              <section className="settings-grid">
                {categories.map((category) => (
                  <article key={category.id} className="form-card limit-card">
                    <div className="limit-card-header">
                      <div>
                        <p className="form-card-title">{category.name}</p>
                        <p className="form-card-subtitle">
                          {category.monthlyLimit === null ? 'Aucune limite définie.' : `Limite actuelle: ${category.monthlyLimit}`}
                        </p>
                      </div>
                      <span className="limit-pill">{category.monthlyLimit === null ? 'Sans limite' : 'Limitée'}</span>
                    </div>

                    <div className="form-grid full-width">
                      <label className="form-field">
                        <span className="form-label">Limite mensuelle</span>
                        <input
                          className="form-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={draftLimits[category.id] ?? ''}
                          onChange={(e) => updateDraft(category.id, e.target.value)}
                          placeholder="Laisser vide pour aucune limite"
                        />
                      </label>
                    </div>

                    <div className="form-actions limit-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => saveLimit(category)}
                        disabled={savingId === category.id}
                      >
                        <i className={`bx ${savingId === category.id ? 'bx-loader-alt bx-spin' : 'bx-save'}`} />
                        {savingId === category.id ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <p className="dashboard-state">Aucune catégorie trouvée.</p>
            )}
          </main>
        </div>
      </div>
    </>
  )
}