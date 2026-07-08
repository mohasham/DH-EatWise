import { useState } from "react"
import { Plus, Pencil, Trash2, ScrollText, X } from "lucide-react"
import { Card, Badge } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { adminRules as seedRules } from "@/lib/mock-data"
import styles from "./AdminRules.module.css"

type Rule = {
  id: string
  description: string
  active: boolean
  addedBy: string
  date: string
}

export default function AdminRules() {
  const [rules, setRules] = useState<Rule[]>(seedRules)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [draftActive, setDraftActive] = useState(true)

  function addRule() {
    if (!draft.trim()) return
    setRules((prev) => [
      {
        id: crypto.randomUUID(),
        description: draft.trim(),
        active: draftActive,
        addedBy: "You (Admin)",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ])
    setDraft("")
    setDraftActive(true)
    setModalOpen(false)
  }

  function toggle(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  function remove(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dietary Rules</h1>
          <p className={styles.subtitle}>Global rules applied across all generated meal plans.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <ScrollText size={28} className={styles.emptyIcon} />
          </div>
          <div>
            <h3 className={styles.emptyTitle}>No rules yet</h3>
            <p className={`${styles.textMuted} text-sm`}>Create your first global dietary rule to get started.</p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
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
                  <th className={`${styles.th} styles.thRight`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdDescription}`}>{r.description}</td>
                    <td className={styles.td}>
                      <Badge tone={r.active ? "success" : "muted"}>{r.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className={`${styles.td} ${styles.textMuted}`}>{r.addedBy}</td>
                    <td className={`${styles.td} ${styles.textMuted}`}>{r.date}</td>
                    <td className={styles.td}>
                      <div className={styles.actionGroup}>
                        <Button variant="ghost" size="sm" onClick={() => toggle(r.id)}>
                          {r.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Edit rule">
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete rule"
                          className={styles.deleteButton}
                          onClick={() => remove(r.id)}
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
              <h2 className={styles.modalTitle}>Add Dietary Rule</h2>
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
                  className={`${styles.switchToggle} ${draftActive ? styles.switchActive : styles.switchInactive
                    }`}
                >
                  <span
                    className={`${styles.switchThumb} ${draftActive ? styles.thumbActive : styles.thumbInactive
                      }`}
                  />
                </button>
                <span className={styles.switchLabel}>Active</span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={addRule}>
                Save Rule
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}