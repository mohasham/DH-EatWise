import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, ScrollText, X } from "lucide-react"
import { Card, Badge } from "../../components/ui/primitives"
import { Button } from "../../components/ui/button"
import { rulesApi, type ApiRule } from "../../lib/api"
import styles from "./AdminRules.module.css"

export default function AdminRules() {
  const [rules, setRules] = useState<ApiRule[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ApiRule | null>(null)
  const [draft, setDraft] = useState("")
  const [draftActive, setDraftActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    rulesApi.getAll()
      .then((res) => setRules(res.data.rules))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setEditTarget(null)
    setDraft("")
    setDraftActive(true)
    setError("")
    setModalOpen(true)
  }

  function openEdit(r: ApiRule) {
    setEditTarget(r)
    setDraft(r.description)
    setDraftActive(r.isActive)
    setError("")
    setModalOpen(true)
  }

  async function saveRule() {
    if (!draft.trim()) return
    setSaving(true)
    setError("")
    try {
      if (editTarget) {
        const res = await rulesApi.update(editTarget._id, {
          description: draft.trim(),
          isActive: draftActive,
        })
        setRules((prev) => prev.map((r) => (r._id === editTarget._id ? res.data.rule : r)))
      } else {
        const res = await rulesApi.create({ description: draft.trim(), isActive: draftActive })
        setRules((prev) => [res.data.rule, ...prev])
      }
      setModalOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save rule.")
    } finally {
      setSaving(false)
    }
  }

  async function toggle(id: string, current: boolean) {
    try {
      const res = await rulesApi.update(id, { isActive: !current })
      setRules((prev) => prev.map((r) => (r._id === id ? res.data.rule : r)))
    } catch {
      // ignore
    }
  }

  async function remove(id: string) {
    try {
      await rulesApi.delete(id)
      setRules((prev) => prev.filter((r) => r._id !== id))
    } catch {
      // ignore
    }
  }

  const addedByName = (rule: ApiRule) => {
    if (typeof rule.addedBy === "object" && rule.addedBy !== null) {
      return (rule.addedBy as { name: string }).name
    }
    return "Admin"
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dietary Rules</h1>
          <p className={styles.subtitle}>Global rules applied across all generated meal plans.</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <Plus size={18} /> Add Rule
        </Button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading rules...</p>
      ) : rules.length === 0 ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <ScrollText size={28} className={styles.emptyIcon} />
          </div>
          <div>
            <h3 className={styles.emptyTitle}>No rules yet</h3>
            <p className={`${styles.textMuted} text-sm`}>Create your first global dietary rule to get started.</p>
          </div>
          <Button variant="primary" onClick={openAdd}>
            <Plus size={18} /> Add Rule
          </Button>
        </Card>
      ) : (
        <Card style={{ overflow: "hidden", padding: 0 }}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Added By</th>
                  <th className={styles.th}>Date</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r._id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdDescription}`}>{r.description}</td>
                    <td className={styles.td}>
                      <Badge tone={r.isActive ? "success" : "muted"}>{r.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className={`${styles.td} ${styles.textMuted}`}>{addedByName(r)}</td>
                    <td className={`${styles.td} ${styles.textMuted}`}>
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actionGroup}>
                        <Button variant="ghost" size="sm" onClick={() => toggle(r._id, r.isActive)}>
                          {r.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Edit rule" onClick={() => openEdit(r)}>
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete rule"
                          className={styles.deleteButton}
                          onClick={() => remove(r._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <Card
            style={{ width: "100%", maxWidth: "28rem", padding: "1.5rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editTarget ? "Edit Rule" : "Add Dietary Rule"}</h2>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </Button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <label htmlFor="rule-desc" className={styles.fieldLabel}>
                  Rule description
                </label>
                <textarea
                  id="rule-desc"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder="e.g. Limit added sugar to under 25g per day"
                  className={styles.textarea}
                />
              </div>

              <label className={styles.switchRow}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draftActive}
                  onClick={() => setDraftActive((v) => !v)}
                  className={`${styles.switchToggle} ${draftActive ? styles.switchActive : styles.switchInactive}`}
                >
                  <span className={`${styles.switchThumb} ${draftActive ? styles.thumbActive : styles.thumbInactive}`} />
                </button>
                <span className={styles.switchLabel}>Active</span>
              </label>

              {error && <p className={styles.errorMsg}>{error}</p>}
            </div>

            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveRule} disabled={saving}>
                {saving ? "Saving..." : "Save Rule"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
