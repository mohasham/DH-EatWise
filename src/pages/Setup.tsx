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
import { cn } from "@/lib/utils"
import { dietaryRules, MAX_SNACKS } from "@/lib/mock-data"
import styles from "./Setup.module.css"

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
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input className={styles.textInput} {...props} />
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

function RuleCheckbox({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className={cn(styles.ruleBtn, active && styles.ruleBtnActive)}
    >
      <span className={cn(styles.checkbox, active && styles.checkboxActive)}>
        {active && <Check size={14} strokeWidth={3} />}
      </span>
      <span>
        <span className={cn(styles.ruleLabel, active && styles.ruleLabelActive)}>{label}</span>
        <span className={styles.ruleDesc}>{description}</span>
      </span>
    </button>
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

  function toggle(list: string[], setList: (v: string[]) => void, item: string) {
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
                <Field label="Age" type="number" placeholder="29" />
                <Field label="Weight (kg)" type="number" placeholder="64" />
                <Field label="Height (cm)" type="number" placeholder="168" />
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
              <TagInput label="Allergies" tags={forbidden} setTags={setForbidden} placeholder="e.g. Peanuts, Shellfish" />
              <div>
                <span className={styles.fieldLabel}>Dietary Rules</span>
                <p className={styles.ruleHint}>
                  Choose the rules you want applied to every generated meal plan.
                </p>
                <div className={styles.ruleGrid}>
                  {dietaryRules.map((rule) => (
                    <RuleCheckbox
                      key={rule.id}
                      active={activeRules.includes(rule.id)}
                      label={rule.label}
                      description={rule.description}
                      onClick={() => toggle(activeRules, setActiveRules, rule.id)}
                    />
                  ))}
                </div>
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
                  <Button type="button" variant="outline" size="icon" onClick={() => setMeals(Math.max(2, meals - 1))} aria-label="Decrease">
                    <Minus size={18} />
                  </Button>
                  <span className={styles.counterValue}>{meals}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => setMeals(Math.min(6, meals + 1))} aria-label="Increase">
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
                <Field label="Wake Time" type="time" defaultValue="07:00" />
                <Field label="Sleep Time" type="time" defaultValue="23:00" />
                <Field label="Work Start" type="time" defaultValue="09:00" />
                <Field label="Work End" type="time" defaultValue="17:00" />
                <Field label="Study Start" type="time" defaultValue="19:00" />
                <Field label="Study End" type="time" defaultValue="21:00" />
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
            </div>
          )}

          <div className={styles.navRow}>
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
