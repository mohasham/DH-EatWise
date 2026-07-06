import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Mars,
  Venus,
  Armchair,
  Footprints,
  Bike,
  Dumbbell,
  TrendingDown,
  Scale,
  Plus,
  HeartPulse,
  Minus,
  X,
  ArrowLeft,
  ArrowRight,
  Wand2,
  Check,
  Cookie,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, Chip, Progress } from "@/components/ui/primitives"
import { dietaryRules, MAX_SNACKS } from "@/lib/mock-data"
import "./setup.styles.css"

const activities = [
  { id: "sedentary", label: "Sedentary", icon: Armchair },
  { id: "light", label: "Lightly Active", icon: Footprints },
  { id: "moderate", label: "Moderately Active", icon: Bike },
  { id: "very", label: "Very Active", icon: Dumbbell },
]

const goals = [
  { id: "loss", label: "Weight Loss", icon: TrendingDown },
  { id: "maintain", label: "Maintenance", icon: Scale },
  { id: "gain", label: "Muscle Gain", icon: Dumbbell },
  { id: "condition", label: "Condition Management", icon: HeartPulse },
]

const conditionsList = ["Diabetes", "Hypertension", "Heart Disease", "Celiac", "Lactose Intolerance", "None"]
const dietList = ["Vegan", "Vegetarian", "Keto", "Halal", "Gluten-Free", "Paleo"]

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

function Field({ label, ...props }: FieldProps) {
  return (
    <label className="setup-field-label">
      <span className="setup-field-title">{label}</span>
      <input className="setup-input-element" {...props} />
    </label>
  )
}

interface SelectCardProps {
  active: boolean
  icon: React.ElementType
  label: string
  onClick: () => void
}

function SelectCard({ active, icon: Icon, label, onClick }: SelectCardProps) {
  const cardClassName = `select-card-trigger ${active ? "select-card-trigger-active" : "select-card-trigger-inactive"}`
  
  return (
    <button type="button" onClick={onClick} className={cardClassName}>
      <Icon size={26} />
      <span className="select-card-trigger-text">{label}</span>
    </button>
  )
}

interface TagInputProps {
  label: string
  tags: string[]
  setTags: (t: string[]) => void
  placeholder: string
}

function TagInput({ label, tags, setTags, placeholder }: TagInputProps) {
  const [value, setValue] = useState("")
  
  function add() {
    const v = value.trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setValue("")
  }

  return (
    <div>
      <span className="setup-field-title">{label}</span>
      <div className="setup-tag-input-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="setup-input-element"
          style={{ flex: 1, height: "2.75rem", fontSize: "0.875rem" }}
        />
        <Button type="button" variant="subtle" size="icon" onClick={add} aria-label="Add">
          <Plus size={18} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="setup-pill-cloud">
          {tags.map((t) => (
            <span key={t} className="setup-tag-pill">
              {t}
              <button type="button" className="setup-tag-remove-btn" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface RuleCheckboxProps {
  active: boolean
  label: string
  description: string
  onClick: () => void
}

function RuleCheckbox({ active, label, description, onClick }: RuleCheckboxProps) {
  const checkboxBoxClass = `checkbox-visual-box ${active ? "checkbox-visual-box-active" : ""}`
  const textClass = `rule-inner-label ${active ? "rule-label-active" : "rule-label-inactive"}`

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={`rule-checkbox-trigger ${active ? "rule-checkbox-active" : "rule-checkbox-inactive"}`}
    >
      <span className={checkboxBoxClass}>
        {active && <Check size={14} strokeWidth={3} />}
      </span>
      <span>
        <span className={textClass}>{label}</span>
        <span className="rule-inner-desc">{description}</span>
      </span>
    </button>
  )
}

interface SnacksSectionProps {
  count: number
  setCount: (n: number) => void
}

function SnacksSection({ count, setCount }: SnacksSectionProps) {
  return (
    <div>
      <div className="snack-section-row">
        <div>
          <span className="setup-field-title">Snacks Between Meals</span>
          <p className="rule-inner-desc" style={{ margin: 0 }}>
            Just pick how many. Your plan automatically times each snack around meals and workouts.
          </p>
        </div>
        <div className="snack-counter-controls">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setCount(Math.max(0, count - 1))}
            disabled={count === 0}
            aria-label="Decrease snacks"
          >
            <Minus size={18} />
          </Button>
          <span className="snack-counter-digit">{count}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setCount(Math.min(MAX_SNACKS, count + 1))}
            disabled={count >= MAX_SNACKS}
            aria-label="Increase snacks"
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
      <p className="snack-status-banner">
        <Cookie size={14} style={{ flexShrink: 0 }} />
        {count === 0
          ? "No snacks between meals."
          : `${count} snack${count > 1 ? "s" : ""} will be spread across your day with full recipes.`}
      </p>
    </div>
  )
}

export const Setup = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const total = 4

  const [gender, setGender] = useState("")
  const [activity, setActivity] = useState("")
  const [goal, setGoal] = useState("")
  const [conditions, setConditions] = useState<string[]>([])
  const [diets, setDiets] = useState<string[]>([])
  const [preferred, setPreferred] = useState<string[]>([])
  const [forbidden, setForbidden] = useState<string[]>([])
  const [meals, setMeals] = useState(4)
  const [activeRules, setActiveRules] = useState<string[]>([])
  const [snackCount, setSnackCount] = useState(0)

  function toggleList(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  function next() {
    if (step < total) setStep(step + 1)
    else navigate("/dashboard")
  }
  function back() {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="setup-page-layout">
      <header className="setup-header">
        <div className="setup-header-inner">
          <Logo />
          <span className="setup-step-indicator">Step {step} of {total}</span>
        </div>
      </header>

      <div className="setup-main-content">
        <Progress value={(step / total) * 100} style={{ marginBottom: "2rem" }} />

        <Card style={{ padding: "1.5rem" }}>
          {step === 1 && (
            <div className="setup-form-stack">
              <div>
                <h2 className="setup-section-headline">Basic Info</h2>
                <p className="setup-section-subtext">Let&apos;s start with the essentials.</p>
              </div>
              <div>
                <span className="setup-field-title">Gender</span>
                <div className="setup-selection-matrix">
                  <SelectCard active={gender === "male"} icon={Mars} label="Male" onClick={() => setGender("male")} />
                  <SelectCard active={gender === "female"} icon={Venus} label="Female" onClick={() => setGender("female")} />
                </div>
              </div>
              <div className="setup-selection-matrix" style={{ gridTemplate-columns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                <Field label="Age" type="number" placeholder="29" />
                <Field label="Weight (kg)" type="number" placeholder="64" />
                <Field label="Height (cm)" type="number" placeholder="168" />
              </div>
              <div>
                <span className="setup-field-title">Activity Level</span>
                <div className="setup-selection-matrix matrix-cols-4">
                  {activities.map((a) => (
                    <SelectCard key={a.id} active={activity === a.id} icon={a.icon} label={a.label} onClick={() => setActivity(a.id)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="setup-form-stack">
              <div>
                <h2 className="setup-section-headline">Health &amp; Diet</h2>
                <p className="setup-section-subtext">Your goals and health context.</p>
              </div>
              <div>
                <span className="setup-field-title">Goal</span>
                <div className="setup-selection-matrix matrix-cols-4">
                  {goals.map((g) => (
                    <SelectCard key={g.id} active={goal === g.id} icon={g.icon} label={g.label} onClick={() => setGoal(g.id)} />
                  ))}
                </div>
              </div>
              <div>
                <span className="setup-field-title">Medical Conditions</span>
                <div className="setup-pill-cloud">
                  {conditionsList.map((c) => (
                    <Chip key={c} active={conditions.includes(c)} onClick={() => toggleList(conditions, setConditions, c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
              <TagInput label="Allergies" tags={forbidden} setTags={setForbidden} placeholder="e.g. Peanuts, Shellfish" />
              <div>
                <span className="setup-field-title">Dietary Rules</span>
                <p className="rule-inner-desc" style={{ marginBottom: "0.375rem" }}>
                  Choose the rules you want applied to every generated meal plan.
                </p>
                <div className="setup-selection-matrix">
                  {dietaryRules.map((rule) => (
                    <RuleCheckbox
                      key={rule.id}
                      active={activeRules.includes(rule.id)}
                      label={rule.label}
                      description={rule.description}
                      onClick={() => toggleList(activeRules, setActiveRules, rule.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="setup-form-stack">
              <div>
                <h2 className="setup-section-headline">Food Preferences</h2>
                <p className="setup-section-subtext">Tell us what you love and avoid.</p>
              </div>
              <div>
                <span className="setup-field-title">Dietary Preference</span>
                <div className="setup-pill-cloud">
                  {dietList.map((d) => (
                    <Chip key={d} active={diets.includes(d)} onClick={() => toggleList(diets, setDiets, d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
              </div>
              <TagInput label="Preferred Foods" tags={preferred} setTags={setPreferred} placeholder="e.g. Salmon, Spinach" />
              <TagInput label="Forbidden Foods" tags={forbidden} setTags={setForbidden} placeholder="e.g. Mushrooms" />
              <div>
                <span className="setup-field-title">Meals Per Day</span>
                <div className="snack-counter-controls" style={{ marginTop: "0.375rem", justifyContent: "flex-start" }}>
                  <Button type="button" variant="outline" size="icon" onClick={() => setMeals(Math.max(2, meals - 1))} aria-label="Decrease">
                    <Minus size={18} />
                  </Button>
                  <span className="snack-counter-digit">{meals}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => setMeals(Math.min(6, meals + 1))} aria-label="Increase">
                    <Minus size={18} style={{ transform: "rotate(90deg)" }} /> {/* Dynamic hack avoiding extra imports if needed, or stick to Plus */}
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
              <SnacksSection count={snackCount} setCount={setSnackCount} />
            </div>
          )}

          {step === 4 && (
            <div className="setup-form-stack">
              <div>
                <h2 className="setup-section-headline">Daily Schedule</h2>
                <p className="setup-section-subtext">We&apos;ll time your meals around your day.</p>
              </div>
              <div className="setup-selection-matrix">
                <Field label="Wake Time" type="time" defaultValue="07:00" />
                <Field label="Sleep Time" type="time" defaultValue="23:00" />
                <Field label="Work Start" type="time" defaultValue="09:00" />
                <Field label="Work End" type="time" defaultValue="17:00" />
                <Field label="Study Start" type="time" defaultValue="19:00" />
                <Field label="Study End" type="time" defaultValue="21:00" />
              </div>
              <div>
                <span className="setup-field-title">Your day at a glance</span>
                <div className="schedule-track-visualizer">
                  <div className="track-segment" style={{ width: "20%", backgroundColor: "rgba(var(--accent), 0.3)" }}>Morning</div>
                  <div className="track-segment" style={{ width: "35%", backgroundColor: "rgba(var(--primary), 0.2)" }}>Work</div>
                  <div className="track-segment" style={{ width: "20%", backgroundColor: "var(--secondary)", color: "var(--primary)" }}>Study</div>
                  <div className="track-segment" style={{ width: "25%", backgroundColor: "var(--muted)" }}>Rest</div>
                </div>
              </div>
            </div>
          )}

          <div className="setup-navigation-footer">
            <Button type="button" variant="outline" onClick={back} disabled={step === 1}>
              <ArrowLeft size={18} /> Back
            </Button>
            {step < total ? (
              <Button type="button" onClick={next}>
                Next <ArrowRight size={18} />
              </Button>
            ) : (
              <Button type="button" variant="accent" onClick={next}>
                <Wand2 size={18} /> Generate My Plan
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}