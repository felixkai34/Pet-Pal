import { useState, useEffect, useRef } from "react";
import {
  Wifi, ChevronDown, BellRing,
  Utensils, CalendarClock, HeartPulse, Bot, Home,
  Droplets, Package, CheckCircle2, AlertTriangle,
  Plus, Trash2, Send, Zap, Clock, Weight, Syringe,
  FileText, Cat, Dog, Loader2,
  X, ShieldCheck, TrendingUp, Activity, Sparkles,
  PawPrint, PhoneCall, Menu
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (d) =>
  `${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? "PM" : "AM"}`;
const fmtFull = (d) =>
  `${fmtTime(d)}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

// ─── Sample Data ─────────────────────────────────────────────────────────────
const PETS = [
  { id: 1, name: "Bella", breed: "Golden Retriever", emoji: "🐕", weight: 24.5, age: "2 Years", kcal: 850, icon: Dog },
  { id: 2, name: "Milo",  breed: "British Shorthair", emoji: "🐈", weight: 5.2,  age: "3 Years", kcal: 320, icon: Cat },
];

const INIT_SCHEDULES = [
  { id: 1, label: "Breakfast",       time: "08:00", ampm: "AM", portion: 100, active: true },
  { id: 2, label: "Lunch",           time: "01:30", ampm: "PM", portion: 80,  active: true },
  { id: 3, label: "Afternoon Snack", time: "04:00", ampm: "PM", portion: 50,  active: false },
  { id: 4, label: "Dinner",          time: "07:00", ampm: "PM", portion: 100, active: true },
];

const INIT_VACCINES = [
  { id: 1, name: "Rabies Booster",  due: "Due in 5 Days",   done: false },
  { id: 2, name: "DHPP Combo",      due: "Completed",        done: true  },
  { id: 3, name: "Leptospirosis",   due: "Due in 23 Days",   done: false },
  { id: 4, name: "Bordetella",      due: "Completed",        done: true  },
  { id: 5, name: "Influenza H3N8",  due: "Due in 60 Days",   done: false },
];

const INIT_RECORDS = [
  { id: 1, date: "Nov 10, 2026", type: "Vet Visit",    note: "Annual checkup – all clear. Weight 24.5 kg." },
  { id: 2, date: "Sep 03, 2026", type: "Prescription", note: "Apoquel 16mg – 1 tab daily for 14 days." },
  { id: 3, date: "Jul 20, 2026", type: "Allergy Note", note: "Mild skin reaction to chicken-based kibble." },
  { id: 4, date: "Mar 15, 2026", type: "Vaccination",  note: "DHPP combo administered. Next in 1 year." },
];

const INIT_ACTIVITY = [
  { id: 1, time: "08:02 AM, Nov 20", label: "Auto-feed: Breakfast", grams: 100, type: "auto"   },
  { id: 2, time: "07:58 AM, Nov 19", label: "Auto-feed: Dinner",    grams: 100, type: "auto"   },
  { id: 3, time: "04:00 PM, Nov 19", label: "Remote feed by Owner", grams: 50,  type: "remote" },
];

const AI_RESPONSES = {
  "Bella ate less today, should I worry?":
    "Based on Bella's data, she consumed about 70% of her usual intake today. A single low-appetite day is typically harmless — it could be heat, minor nausea, or simply pickiness. I'd recommend monitoring for the next 24 hours. If she skips more than 2 consecutive meals, please consult your vet. 🐾",
  "Recommended daily portion for her weight?":
    "For Bella at 24.5 kg (adult Golden Retriever, moderate activity), I recommend **850–950 kcal/day**. That translates to roughly **280–320g** of a standard premium dry kibble (3,000 kcal/kg). Splitting into 3 meals (Breakfast 100g · Lunch 80g · Dinner 100g) is ideal for her metabolism. ✅",
  "When is her next vaccine?":
    "Bella's **Rabies Booster** is due in **5 days** (Nov 25, 2026). After that, the **Leptospirosis** vaccine is due in 23 days. I'd suggest booking a vet appointment for the Rabies booster this weekend to stay ahead of schedule. 💉",
};
const DEFAULT_RESPONSE = (msg) =>
  `I've analyzed your question about "${msg}" in context of ${PETS[0].name}'s profile. Based on her current weight, recent feeding logs, and health records, everything appears within normal parameters. For a more detailed assessment, I recommend scheduling a vet check-in. Feel free to ask me anything else! 🐾`;

// ─── Reusable Components ─────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, iconClass = "text-amber-500", children }) => (
  <h2 className="text-base font-bold text-stone-800 flex items-center gap-2 mb-4">
    <Icon size={16} className={iconClass} />
    {children}
  </h2>
);

const Badge = ({ children, variant = "green" }) => {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50  text-amber-700  border border-amber-200",
    red:   "bg-red-50    text-red-700    border border-red-200",
    blue:  "bg-blue-50   text-blue-700   border border-blue-200",
    gray:  "bg-stone-100 text-stone-500  border border-stone-200",
    purple:"bg-purple-50 text-purple-700 border border-purple-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${styles[variant]}`}>
      {children}
    </span>
  );
};

const Toggle = ({ active, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${
      active ? "bg-amber-500" : "bg-stone-200"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
        active ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className="bg-emerald-600 text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 min-w-80">
        <CheckCircle2 size={18} className="shrink-0" />
        <span className="flex-1">{msg}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Emergency Modal ──────────────────────────────────────────────────────────
const EmergencyModal = ({ pet, onDismiss }) => {
  const [contacted, setContacted] = useState(false);
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md">
        <div className="bg-red-600 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
            <BellRing size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold">🚨 Urgent Health Alert</p>
            <p className="text-red-200 text-sm">PawSync IoT · Just now</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-stone-800 font-semibold">Abnormal Eating Behavior Detected!</p>
          <p className="text-stone-600 text-sm leading-relaxed">
            {pet.name} has skipped{" "}
            <span className="text-red-600 font-bold">2 consecutive meals</span> and bowl activity
            is <span className="text-red-600 font-bold">0%</span> for the last{" "}
            <span className="text-red-600 font-bold">14 hours</span>. This may indicate illness,
            stress, or a physical obstruction. Immediate attention is recommended.
          </p>
          <div className="flex gap-2 items-center text-sm text-stone-500 bg-red-50 rounded-xl px-4 py-3">
            <AlertTriangle size={15} className="text-red-500 shrink-0" />
            <span>AI Confidence: 94% — Pattern deviates significantly from baseline</span>
          </div>
          {contacted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} /> Connecting to nearest vet clinic... Stand by.
            </div>
          ) : (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setContacted(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall size={15} /> Contact Vet
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
          {contacted && (
            <button onClick={onDismiss} className="w-full text-stone-400 text-xs py-1 hover:text-stone-600">
              Dismiss alert
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Tab: HOME ────────────────────────────────────────────────────────────────
const HomeTab = ({ pet, foodLevel, setFoodLevel, waterLevel, activity, setActivity, setToast }) => {
  const [portion, setPortion] = useState("Medium (100g)");
  const [dispensing, setDispensing] = useState(false);
  const portions = ["Small (50g)", "Medium (100g)", "Large (150g)"];
  const portionGrams = { "Small (50g)": 50, "Medium (100g)": 100, "Large (150g)": 150 };
  const portionDrain = { "Small (50g)": 3,  "Medium (100g)": 6,   "Large (150g)": 9  };

  const feedNow = () => {
    if (dispensing) return;
    setDispensing(true);
    setTimeout(() => {
      setDispensing(false);
      const g = portionGrams[portion];
      setFoodLevel((f) => Math.max(0, f - portionDrain[portion]));
      setActivity((a) => [
        { id: Date.now(), time: fmtFull(new Date()), label: "Remote feed by Owner", grams: g, type: "remote" },
        ...a,
      ]);
      setToast(`✅ Dispensed ${g}g to ${pet.name}'s bowl successfully!`);
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── LEFT column ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Device Status */}
        <Card className="p-6">
          <SectionTitle icon={Wifi} iconClass="text-blue-500">Smart Bowl Status</SectionTitle>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-stone-800">Smart Bowl · {pet.name}</p>
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
                Connected via Wi-Fi · Signal Strong
              </p>
            </div>
            <Badge variant="green">Online</Badge>
          </div>
          <div className="space-y-4">
            {[
              { label: "Food Tank", icon: Package, value: foodLevel, color: foodLevel > 50 ? "#10b981" : foodLevel > 25 ? "#f59e0b" : "#ef4444", iconClass: "text-stone-500" },
              { label: "Water Level", icon: Droplets, value: waterLevel, color: "#60a5fa", iconClass: "text-blue-400" },
            ].map(({ label, icon: Icon, value, color, iconClass }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-stone-600 font-medium flex items-center gap-1.5">
                    <Icon size={13} className={iconClass} /> {label}
                  </span>
                  <span className="text-sm font-bold text-stone-800">{value}%</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Remote Feed Control */}
        <Card className="p-6">
          <SectionTitle icon={Utensils}>Remote Feed Control</SectionTitle>
          <p className="text-sm text-stone-500 mb-4">Select a portion size and dispense food remotely to {pet.name}'s bowl.</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {portions.map((p) => (
              <button
                key={p}
                onClick={() => setPortion(p)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  portion === p
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {p.split(" ")[0]}
                <br />
                <span className="text-xs opacity-75">{p.match(/\(.*\)/)?.[0]}</span>
              </button>
            ))}
          </div>
          <button
            onClick={feedNow}
            disabled={dispensing}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              dispensing
                ? "bg-amber-300 text-white cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-200 active:scale-95"
            }`}
          >
            {dispensing ? (
              <><Loader2 size={18} className="animate-spin" /> Dispensing via Wi-Fi...</>
            ) : (
              <><Zap size={18} /> Feed Now</>
            )}
          </button>
        </Card>
      </div>

      {/* ── RIGHT column ── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Pet Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
              {pet.emoji}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-stone-800">{pet.name}</p>
              <p className="text-sm text-stone-500">{pet.breed} · {pet.age}</p>
            </div>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Fed Today",   value: "2x",          sub: "120g total"   },
              { label: "Daily Kcal",  value: `${pet.kcal}`, sub: "kcal target"  },
              { label: "Meals Left",  value: "1",           sub: "Dinner 7 PM"  },
            ].map((s) => (
              <div key={s.label} className="bg-stone-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-stone-800">{s.value}</p>
                <p className="text-xs text-stone-500 font-medium mt-1">{s.label}</p>
                <p className="text-xs text-stone-400">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            <span className="font-semibold">Today's insight:</span> {pet.name} ate 120g at 8:00 AM — on track with her daily schedule.
          </div>
        </Card>

        {/* Activity Log */}
        <Card className="p-6">
          <SectionTitle icon={Activity} iconClass="text-blue-500">Recent Activity Log</SectionTitle>
          <div className="divide-y divide-stone-50">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  a.type === "remote" ? "bg-amber-50" : "bg-blue-50"
                }`}>
                  {a.type === "remote"
                    ? <Wifi size={15} className="text-amber-500" />
                    : <CalendarClock size={15} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-700 truncate">{a.label}</p>
                  <p className="text-xs text-stone-400">{a.time}</p>
                </div>
                <Badge variant={a.type === "remote" ? "amber" : "blue"}>{a.grams}g</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Tab: SCHEDULE ────────────────────────────────────────────────────────────
const ScheduleTab = ({ pet }) => {
  const [schedules, setSchedules] = useState(INIT_SCHEDULES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", time: "12:00", ampm: "PM", portion: 80 });

  const toggleSchedule = (id) =>
    setSchedules((s) => s.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  const deleteSchedule = (id) =>
    setSchedules((s) => s.filter((x) => x.id !== id));
  const addSchedule = () => {
    if (!form.label.trim()) return;
    setSchedules((s) => [...s, { ...form, id: Date.now() }]);
    setForm({ label: "", time: "12:00", ampm: "PM", portion: 80 });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800">{pet.name}'s Feeding Schedule</h2>
          <p className="text-sm text-stone-400 mt-0.5">
            {schedules.filter((s) => s.active).length} of {schedules.length} schedules active
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Plus size={15} /> Add New Schedule
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="p-6 border border-amber-200 bg-amber-50/40">
          <h3 className="text-sm font-bold text-stone-700 mb-4">New Feeding Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="text-sm border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white col-span-1 sm:col-span-2 lg:col-span-1"
              placeholder="Label (e.g. Afternoon Snack)"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
            <div className="flex gap-2">
              <input
                type="time"
                className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
              <select
                className="text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                value={form.ampm}
                onChange={(e) => setForm((f) => ({ ...f, ampm: e.target.value }))}
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
            <input
              type="number" min={10} max={300}
              placeholder="Portion (g)"
              className="text-sm border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              value={form.portion}
              onChange={(e) => setForm((f) => ({ ...f, portion: Number(e.target.value) }))}
            />
            <div className="flex gap-2">
              <button onClick={addSchedule} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Save
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Schedule grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((s) => (
          <Card key={s.id} className="px-5 py-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              s.active ? "bg-amber-50" : "bg-stone-100"
            }`}>
              <Clock size={18} className={s.active ? "text-amber-500" : "text-stone-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-800">{s.label}</p>
              <p className="text-sm text-stone-400">{s.time} {s.ampm} · {s.portion}g</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-stone-400 hidden sm:block">{s.active ? "Active" : "Paused"}</span>
              <Toggle active={s.active} onChange={() => toggleSchedule(s.id)} />
              <button onClick={() => deleteSchedule(s.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Info card */}
      <Card className="p-5 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-blue-800">Auto-Schedule Active</p>
            <p className="text-sm text-blue-600 mt-0.5 leading-relaxed">
              Smart Bowl will automatically dispense food at the scheduled times even if your phone is offline.
              Schedules sync via cloud every 30 minutes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── Tab: HEALTH ──────────────────────────────────────────────────────────────
const HealthTab = ({ pet }) => {
  const [vaccines, setVaccines] = useState(INIT_VACCINES);
  const [records, setRecords] = useState(INIT_RECORDS);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weight, setWeight] = useState(pet.weight);
  const [newWeight, setNewWeight] = useState(pet.weight);
  const [recForm, setRecForm] = useState({ type: "Vet Visit", note: "" });

  const markDone = (id) =>
    setVaccines((v) => v.map((x) => (x.id === id ? { ...x, done: true, due: "Completed" } : x)));
  const addRecord = () => {
    if (!recForm.note.trim()) return;
    setRecords((r) => [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        ...recForm,
      },
      ...r,
    ]);
    setRecForm({ type: "Vet Visit", note: "" });
    setShowRecordForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Pet Profile banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center text-5xl shadow-sm shrink-0">
            {pet.emoji}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-stone-800">{pet.name}</h2>
              <Badge variant="green">Healthy</Badge>
            </div>
            <p className="text-stone-500">{pet.breed} · {pet.age}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-auto w-full">
            {[
              { label: "Weight", value: `${weight} kg`, icon: Weight },
              { label: "Age",    value: pet.age,         icon: Clock  },
              { label: "Kcal",   value: `${pet.kcal}`,   icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-stone-50 rounded-xl p-3 text-center min-w-[80px]">
                <Icon size={14} className="text-stone-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-stone-800">{value}</p>
                <p className="text-xs text-stone-400">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowWeightModal(true)}
            className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Log Weight
          </button>
        </div>
      </Card>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className="font-bold text-stone-800 mb-4">Log New Weight for {pet.name}</p>
            <input
              type="number" step="0.1"
              className="w-full text-sm border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300 mb-4"
              value={newWeight}
              onChange={(e) => setNewWeight(parseFloat(e.target.value))}
            />
            <div className="flex gap-3">
              <button onClick={() => { setWeight(newWeight); setShowWeightModal(false); }}
                className="flex-1 bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 transition-colors">Save</button>
              <button onClick={() => setShowWeightModal(false)}
                className="flex-1 bg-stone-100 text-stone-600 font-semibold py-3 rounded-xl hover:bg-stone-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vaccines */}
        <Card className="p-6">
          <SectionTitle icon={Syringe} iconClass="text-blue-500">Vaccination Tracker</SectionTitle>
          <div className="space-y-3">
            {vaccines.map((v) => (
              <div key={v.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  v.done ? "bg-emerald-50" : "bg-amber-50"
                }`}>
                  {v.done
                    ? <CheckCircle2 size={16} className="text-emerald-500" />
                    : <Syringe size={16} className="text-amber-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-700">{v.name}</p>
                  <p className={`text-xs font-medium ${v.done ? "text-emerald-600" : "text-amber-600"}`}>{v.due}</p>
                </div>
                {!v.done ? (
                  <button
                    onClick={() => markDone(v.id)}
                    className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Mark Done
                  </button>
                ) : (
                  <Badge variant="green">Done</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Health Records */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={FileText} iconClass="text-purple-500">Health Records</SectionTitle>
            <button
              onClick={() => setShowRecordForm((v) => !v)}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold px-3 py-2 rounded-xl transition-colors -mt-4"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {showRecordForm && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4 space-y-3">
              <select
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                value={recForm.type}
                onChange={(e) => setRecForm((f) => ({ ...f, type: e.target.value }))}
              >
                {["Vet Visit", "Prescription", "Allergy Note", "Vaccination", "Surgery", "Lab Result"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <textarea
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white resize-none"
                rows={2} placeholder="Notes..."
                value={recForm.note}
                onChange={(e) => setRecForm((f) => ({ ...f, note: e.target.value }))}
              />
              <div className="flex gap-2">
                <button onClick={addRecord} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors">Save</button>
                <button onClick={() => setShowRecordForm(false)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold py-2 rounded-xl transition-colors">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="border border-stone-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant={
                    r.type === "Vet Visit" ? "blue" : r.type === "Vaccination" ? "green" :
                    r.type === "Allergy Note" ? "amber" : r.type === "Prescription" ? "purple" : "gray"
                  }>
                    {r.type}
                  </Badge>
                  <span className="text-xs text-stone-400">{r.date}</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{r.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Tab: AI VET ──────────────────────────────────────────────────────────────
const AiVetTab = ({ pet }) => {
  const [messages, setMessages] = useState([
    {
      id: 1, role: "ai",
      text: `Hi! I'm **Dr. Paws AI** 🐾 — your 24/7 AI-powered pet health assistant. I have full access to ${pet.name}'s profile, feeding history, and health records. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const chips = [
    `${pet.name} ate less today, should I worry?`,
    "Recommended daily portion for her weight?",
    "When is her next vaccine?",
  ];

  const sendMsg = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        id: Date.now() + 1, role: "ai",
        text: AI_RESPONSES[msg] || DEFAULT_RESPONSE(msg),
      }]);
    }, 1200);
  };

  const renderText = (text) =>
    text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* ── Chat Area ── */}
      <div className="lg:col-span-8 flex flex-col" style={{ minHeight: 520 }}>
        <Card className="flex flex-col flex-1 overflow-hidden p-0">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Dr. Paws AI</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> Online · Response in &lt;1s
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ maxHeight: 380 }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "ai" && (
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Bot size={14} className="text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[75%] text-sm leading-relaxed rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-amber-500 text-white rounded-br-sm"
                    : "bg-stone-50 border border-stone-100 text-stone-700 rounded-bl-sm"
                }`}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-blue-600" />
                </div>
                <div className="bg-stone-50 border border-stone-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Chips + Input */}
          <div className="px-6 pb-5 pt-3 border-t border-stone-100 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => sendMsg(c)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5">
              <input
                className="flex-1 text-sm focus:outline-none bg-transparent text-stone-700 placeholder-stone-400"
                placeholder={`Ask Dr. Paws about ${pet.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              />
              <button
                onClick={() => sendMsg()}
                className="w-9 h-9 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center transition-colors active:scale-95"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Right Panel: Insight + Tips ── */}
      <div className="lg:col-span-4 space-y-5">
        {/* AI Insight Banner */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-blue-500" />
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">AI Insight</p>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            {pet.name}'s eating speed has been normal this week, and her daily calorie intake is right on target ({pet.kcal} kcal). No anomalies detected. 🎉
          </p>
        </Card>

        {/* Quick Stats */}
        <Card className="p-5">
          <p className="text-sm font-bold text-stone-700 mb-3">{pet.name}'s Snapshot</p>
          <div className="space-y-2.5">
            {[
              { label: "Weight",       value: "24.5 kg",    color: "text-blue-600"   },
              { label: "Daily target", value: `${pet.kcal} kcal`, color: "text-amber-600" },
              { label: "Next vaccine", value: "5 days",     color: "text-red-500"    },
              { label: "Meals today",  value: "2 / 3",      color: "text-emerald-600"},
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{label}</span>
                <span className={`font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-4 border-amber-100 bg-amber-50">
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-bold">⚠️ Note:</span> Dr. Paws AI provides general guidance. Always consult a licensed veterinarian for medical decisions.
          </p>
        </Card>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activePetIdx, setActivePetIdx] = useState(0);
  const [petOpen, setPetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [foodLevel, setFoodLevel] = useState(78);
  const [waterLevel] = useState(90);
  const [activity, setActivity] = useState(INIT_ACTIVITY);
  const [toast, setToast] = useState(null);
  const [emergency, setEmergency] = useState(false);

  const pet = PETS[activePetIdx];

  const tabs = [
    { id: "home",   label: "Home",      icon: Home        },
    { id: "sched",  label: "Schedule",  icon: CalendarClock},
    { id: "health", label: "Health",    icon: HeartPulse  },
    { id: "ai",     label: "Dr. Paws",  icon: Bot         },
  ];

  const tabContent = {
    home:   <HomeTab   pet={pet} foodLevel={foodLevel} setFoodLevel={setFoodLevel} waterLevel={waterLevel} activity={activity} setActivity={setActivity} setToast={setToast} />,
    sched:  <ScheduleTab pet={pet} />,
    health: <HealthTab   pet={pet} />,
    ai:     <AiVetTab    pet={pet} />,
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#FAF8F5" }}>
      {/* Toasts & Modals (viewport-level) */}
      {toast    && <Toast msg={toast} onClose={() => setToast(null)} />}
      {emergency && <EmergencyModal pet={pet} onDismiss={() => setEmergency(false)} />}

      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
              <PawPrint size={18} className="text-white" />
            </div>
            <span className="text-lg font-black text-stone-800 tracking-tight hidden sm:block">PawSync</span>
          </div>

          {/* Desktop Tab Bar */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-amber-100 text-amber-700"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Wi-Fi Status Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Connected · Signal Strong
          </div>

          {/* Pet Switcher */}
          <div className="relative">
            <button
              onClick={() => setPetOpen((v) => !v)}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 transition-colors px-3 py-2 rounded-xl"
            >
              <span className="text-lg">{pet.emoji}</span>
              <span className="text-sm font-semibold text-stone-700 hidden sm:block max-w-[90px] truncate">{pet.name}</span>
              <ChevronDown size={14} className={`text-stone-500 transition-transform ${petOpen ? "rotate-180" : ""}`} />
            </button>
            {petOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-30 w-56">
                {PETS.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setActivePetIdx(i); setPetOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-stone-50 transition-colors ${activePetIdx === i ? "bg-amber-50" : ""}`}
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <div>
                      <p className="font-bold text-stone-800">{p.name}</p>
                      <p className="text-xs text-stone-500">{p.breed}</p>
                    </div>
                    {activePetIdx === i && <CheckCircle2 size={14} className="text-amber-500 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Trigger */}
          <button
            onClick={() => setEmergency(true)}
            title="Trigger Demo Emergency Alert"
            className="w-9 h-9 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center transition-colors group"
          >
            <BellRing size={16} className="text-red-500 group-hover:animate-wiggle" />
          </button>

          {/* Mobile menu burger */}
          <button
            className="md:hidden w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <Menu size={18} className="text-stone-600" />
          </button>
        </div>

        {/* Mobile Tab Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 flex gap-2 flex-wrap">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-amber-100 text-amber-700"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-stone-800">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {activeTab === "home"   && `Managing ${pet.name}'s smart feeder in real-time`}
            {activeTab === "sched"  && `Automated meal schedules for ${pet.name}`}
            {activeTab === "health" && `Health records & vaccination tracker for ${pet.name}`}
            {activeTab === "ai"     && `AI-powered vet assistant — ask anything about ${pet.name}`}
          </p>
        </div>

        {tabContent[activeTab]}
      </main>

      {/* ── Mobile Bottom Nav (xs–md only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex shadow-lg z-40">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
              activeTab === id ? "text-amber-600" : "text-stone-400"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
              activeTab === id ? "bg-amber-100" : ""
            }`}>
              <Icon size={17} strokeWidth={activeTab === id ? 2.5 : 1.8} />
            </div>
            <span className={`text-[9px] font-semibold ${activeTab === id ? "text-amber-600" : "text-stone-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
