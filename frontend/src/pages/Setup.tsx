import { useState, useEffect } from "react"
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
import { Logo } from "../components/logo"
import { Button } from "../components/ui/button"
import { Card, Chip, Progress } from "../components/ui/primitives"
import { cn } from "../lib/utils"
import { MAX_SNACKS } from "../lib/mock-data"
import { healthProfileApi, rulesApi, type ApiRule } from "../lib/api"
import { useAuth } from "../lib/auth-context"
import styles from "./Setup.module.css"

// Activity level mapping: UI id → API value
const activityMap: Record<string, string> = {
  sedentary: "sedentary",
  light: "lightly_active",
  moderate: "moderately_active",
  very: "very_active",
}
// Goal mapping: UI id → API value
const goalMap: Record<string, string> = {
  loss: "weight_loss",
  maintain: "maintenance",
  gain: "muscle_gain",
  condition: "condition_management",
}

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

function Field({
  label,
  value,
  onChange,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input className={styles.textInput} value={value ?? ""} onChange={onChange} {...props} />
    </label>
  )
}

function SelectCard({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(styles.selectCard, active && styles.selectCardActive)}
    >
      <Icon size={26} />
      <span className={styles.selectLabel}>{label}</span>
    </button>
  )
}

/** Checkbox-card used for selecting dietary rules — bold label + tick, not a flat chip. */
function RuleCheckbox({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(styles.ruleBtn, active && styles.ruleBtnActive)}
      aria-pressed={active}
    >
      <span className={cn(styles.checkbox, active && styles.checkboxActive)}>
        {active && <Check size={14} />}
      </span>
      <span className={cn(styles.ruleLabel, active && styles.ruleLabelActive)}>{label}</span>
    </button>
  )
}

function TagInput({
  label,
  tags,
  setTags,
  placeholder,
}: {
  label: string
  tags: string[]
  setTags: (t: string[]) => void
  placeholder: string
}) {
  const [value, setValue] = useState("")
  function add() {
    const v = value.trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setValue("")
  }
  return (
    <div>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.tagRow}>
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
          className={styles.tagInput}
        />
        <Button type="button" variant="subtle" size="icon" onClick={add} aria-label="Add">
          <Plus size={18} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className={styles.tagList}>
          {tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
              <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SnacksSection({
  count,
  setCount,
}: {
  count: number
  setCount: (n: number) => void
}) {
  return (
    <div>
      <div className={styles.snackTop}>
        <div>
          <span className={styles.fieldLabel}>Snacks Between Meals</span>
          <p className={styles.snackHint}>
            Just pick how many. Your plan automatically times each snack around meals and workouts.
          </p>
        </div>
        <div className={styles.counterRow}>
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
          <span className={styles.counterValue}>{count}</span>
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
      <p className={styles.snackNote}>
        <Cookie size={14} />
        {count === 0
          ? "No snacks between meals."
          : `${count} snack${count > 1 ? "s" : ""} will be spread across your day with full recipes.`}
      </p>
    </div>
  )
}

export default function Setup() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [step, setStep] = useState(1)
  const total = 4
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [stepError, setStepError] = useState("")

  // Step 1 – Basic Info
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [activity, setActivity] = useState("")

  // Step 2 – Health & Diet
  const [goal, setGoal] = useState("")
  const [conditions, setConditions] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [rules, setRules] = useState<ApiRule[]>([])
  const [rulesLoading, setRulesLoading] = useState(true)
  const [ruleIds, setRuleIds] = useState<string[]>([])

  // Step 3 – Food Preferences
  const [diets, setDiets] = useState<string[]>([])
  const [preferred, setPreferred] = useState<string[]>([])
  const [forbidden, setForbidden] = useState<string[]>([])
  const [meals, setMeals] = useState(3)
  const [snackCount, setSnackCount] = useState(0)

  // Step 4 – Schedule
  const [wakeTime, setWakeTime] = useState("07:00")
  const [sleepTime, setSleepTime] = useState("23:00")
  const [workStart, setWorkStart] = useState("09:00")
  const [workEnd, setWorkEnd] = useState("17:00")
  const [studyStart, setStudyStart] = useState("19:00")
  const [studyEnd, setStudyEnd] = useState("21:00")

  useEffect(() => {
    rulesApi.getAll()
      .then((res) => setRules(res.data.rules.filter((r) => r.isActive)))
      .catch(() => {})
      .finally(() => setRulesLoading(false))
  }, [])

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  /** Validate only the fields relevant to the step currently on screen. */
  function validateStep(): string {
    if (step === 1) {
      if (!gender) return "Please select your gender."
      if (!age || Number(age) <= 0) return "Please enter a valid age."
      if (!weight || Number(weight) <= 0) return "Please enter a valid weight."
      if (!height || Number(height) <= 0) return "Please enter a valid height."
      if (!activity) return "Please select your activity level."
    }
    if (step === 2) {
      if (!goal) return "Please select a goal."
    }
    if (step === 3) {
      if (meals < 1) return "You need at least 1 meal per day."
    }
    if (step === 4) {
      if (!wakeTime) return "Please set your wake time."
      if (!sleepTime) return "Please set your sleep time."
    }
    return ""
  }

  async function handleFinish() {
    setSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        gender: gender as "male" | "female",
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        activityLevel: activityMap[activity] as
          | "sedentary"
          | "lightly_active"
          | "moderately_active"
          | "very_active",
        goal: goalMap[goal] as
          | "weight_loss"
          | "maintenance"
          | "muscle_gain"
          | "condition_management",
        conditions: conditions.filter((c) => c !== "None"),
        allergies,
        dietaryPreference: diets,
        preferredFoods: preferred,
        forbiddenFoods: forbidden,
        ruleIds,
        mealsPerDay: meals + snackCount,
        wakeTime,
        sleepTime,
        workStart: workStart || null,
        workEnd: workEnd || null,
        studyStart: studyStart || null,
        studyEnd: studyEnd || null,
      }
      await healthProfileApi.upsert(payload)
      // Mark profileComplete in local state
      if (user) setUser({ ...user, profileComplete: true })
      navigate("/dashboard")
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save profile.")
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    const error = validateStep()
    if (error) {
      setStepError(error)
      return
    }
    setStepError("")
    if (step < total) setStep(step + 1)
    else handleFinish()
  }
  function back() {
    setStepError("")
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo />
          <span className={styles.headerStep}>Step {step} of {total}</span>
        </div>
      </header>

      <div className={styles.content}>
        <Progress value={(step / total) * 100} className={styles.progressSpacing} />

        <Card className={styles.card}>
          {step === 1 && (
            <div className={styles.stepBody}>
              <div>
                <h2 className={styles.stepTitle}>Basic Info</h2>
                <p className={styles.stepSub}>Let&apos;s start with the essentials.</p>
              </div>
              <div>
                <span className={styles.fieldLabel}>Gender</span>
                <div className={styles.grid2}>
                  <SelectCard active={gender === "male"} icon={Mars} label="Male" onClick={() => setGender("male")} />
                  <SelectCard active={gender === "female"} icon={Venus} label="Female" onClick={() => setGender("female")} />
                </div>
              </div>
              <div className={styles.infoGrid}>
                <Field label="Age" type="number" placeholder="29" value={age} onChange={(e) => setAge(e.target.value)} />
                <Field label="Weight (kg)" type="number" placeholder="64" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <Field label="Height (cm)" type="number" placeholder="168" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <span className={styles.fieldLabel}>Activity Level</span>
                <div className={styles.selectGrid}>
                  {activities.map((a) => (
                    <SelectCard key={a.id} active={activity === a.id} icon={a.icon} label={a.label} onClick={() => setActivity(a.id)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepBody}>
              <div>
                <h2 className={styles.stepTitle}>Health &amp; Diet</h2>
                <p className={styles.stepSub}>Your goals and health context.</p>
              </div>
              <div>
                <span className={styles.fieldLabel}>Goal</span>
                <div className={styles.selectGrid}>
                  {goals.map((g) => (
                    <SelectCard key={g.id} active={goal === g.id} icon={g.icon} label={g.label} onClick={() => setGoal(g.id)} />
                  ))}
                </div>
              </div>
              <div>
                <span className={styles.fieldLabel}>Medical Conditions</span>
                <div className={styles.chipRow}>
                  {conditionsList.map((c) => (
                    <Chip key={c} active={conditions.includes(c)} onClick={() => toggle(conditions, setConditions, c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
              <TagInput label="Allergies" tags={allergies} setTags={setAllergies} placeholder="e.g. Peanuts, Shellfish" />
              <div>
                <span className={styles.fieldLabel}>Dietary Rules</span>
                <p className={styles.ruleHint}>Select any rules that apply to you.</p>
                {rulesLoading ? (
                  <p className={styles.stepSub}>Loading rules...</p>
                ) : rules.length === 0 ? (
                  <p className={styles.stepSub}>No dietary rules have been added yet.</p>
                ) : (
                  <div className={styles.ruleGrid}>
                    {rules.map((r) => (
                      <RuleCheckbox
                        key={r._id}
                        active={ruleIds.includes(r._id)}
                        label={r.description}
                        onClick={() => toggle(ruleIds, setRuleIds, r._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepBody}>
              <div>
                <h2 className={styles.stepTitle}>Food Preferences</h2>
                <p className={styles.stepSub}>Tell us what you love and avoid.</p>
              </div>
              <div>
                <span className={styles.fieldLabel}>Dietary Preference</span>
                <div className={styles.chipRow}>
                  {dietList.map((d) => (
                    <Chip key={d} active={diets.includes(d)} onClick={() => toggle(diets, setDiets, d)}>
                      {d}
                    </Chip>
                  ))}
                </div>
              </div>
              <TagInput label="Preferred Foods" tags={preferred} setTags={setPreferred} placeholder="e.g. Salmon, Spinach" />
              <TagInput label="Forbidden Foods" tags={forbidden} setTags={setForbidden} placeholder="e.g. Mushrooms" />
              <div>
                <span className={styles.fieldLabel}>Meals Per Day</span>
                <div className={styles.counterRowWide}>
                  <Button type="button" variant="outline" size="icon" onClick={() => setMeals(Math.max(1, meals - 1))} aria-label="Decrease">
                    <Minus size={18} />
                  </Button>
                  <span className={styles.counterValue}>{meals}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => setMeals(Math.min(8, meals + 1))} aria-label="Increase">
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
              <SnacksSection count={snackCount} setCount={setSnackCount} />
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepBody}>
              <div>
                <h2 className={styles.stepTitle}>Daily Schedule</h2>
                <p className={styles.stepSub}>We&apos;ll time your meals around your day.</p>
              </div>
              <div className={styles.scheduleGrid}>
                <Field label="Wake Time" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
                <Field label="Sleep Time" type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
                <Field label="Work Start" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
                <Field label="Work End" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
                <Field label="Study Start" type="time" value={studyStart} onChange={(e) => setStudyStart(e.target.value)} />
                <Field label="Study End" type="time" value={studyEnd} onChange={(e) => setStudyEnd(e.target.value)} />
              </div>
              <div>
                <span className={styles.fieldLabel}>Your day at a glance</span>
                <div className={styles.dayBar}>
                  <div className={cn(styles.daySeg, styles.dayMorning)} style={{ width: "20%" }}>Morning</div>
                  <div className={cn(styles.daySeg, styles.dayWork)} style={{ width: "35%" }}>Work</div>
                  <div className={cn(styles.daySeg, styles.dayStudy)} style={{ width: "20%" }}>Study</div>
                  <div className={cn(styles.daySeg, styles.dayRest)} style={{ width: "25%" }}>Rest</div>
                </div>
              </div>
              {submitError && <p className={styles.submitError}>{submitError}</p>}
            </div>
          )}

          {stepError && <p className={styles.submitError}>{stepError}</p>}

          <div className={styles.navRow}>
            <Button type="button" variant="outline" onClick={back} disabled={step === 1 || submitting}>
              <ArrowLeft size={18} /> Back
            </Button>
            {step < total ? (
              <Button type="button" onClick={next}>
                Next <ArrowRight size={18} />
              </Button>
            ) : (
              <Button type="button" variant="accent" onClick={next} disabled={submitting}>
                <Wand2 size={18} /> {submitting ? "Saving..." : "Generate My Plan"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}