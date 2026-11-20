import { useState, useEffect, useRef } from "react";
import {
  Wifi, ChevronDown, BellRing,
  Utensils, CalendarClock, HeartPulse, Bot, Home,
  Droplets, Package, CheckCircle2, AlertTriangle,
  Plus, Trash2, Send, Zap, Clock, Weight, Syringe,
  FileText, Cat, Dog, Loader2,
  X, ShieldCheck, TrendingUp, Activity, Sparkles,
  PawPrint, PhoneCall, Calendar, RotateCcw
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (d) =>
  `${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? "PM" : "AM"}`;
const fmtFull = (d) =>
  `${fmtTime(d)}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

// ─── Initial Pets & State Data ──────────────────────────────────────────────
const INIT_PETS = [
  { id: 1, name: "Bella", breed: "Golden Retriever", species: "Dog", emoji: "🐕", weight: 24.5, age: "2 Years", kcal: 850, icon: Dog },
  { id: 2, name: "Milo",  breed: "British Shorthair", species: "Cat", emoji: "🐈", weight: 5.2,  age: "3 Years", kcal: 320, icon: Cat },
];

const INITIAL_PET_DATA = {
  1: {
    foodLevel: 78,
    waterLevel: 90,
    schedules: [
      { id: 101, label: "Breakfast",       time: "08:00", ampm: "AM", portion: 100, active: true },
      { id: 102, label: "Lunch",           time: "01:30", ampm: "PM", portion: 80,  active: true },
      { id: 103, label: "Afternoon Snack", time: "04:00", ampm: "PM", portion: 50,  active: false },
      { id: 104, label: "Dinner",          time: "07:00", ampm: "PM", portion: 100, active: true },
    ],
    vaccines: [
      { id: 201, name: "Rabies Booster",  due: "Due in 5 Days",   done: false, lastDone: "Nov 2025" },
      { id: 202, name: "DHPP Combo",      due: "Completed",        done: true,  lastDone: "Mar 2026" },
      { id: 203, name: "Leptospirosis",   due: "Due in 23 Days",   done: false, lastDone: "Dec 2025" },
      { id: 204, name: "Bordetella",      due: "Completed",        done: true,  lastDone: "Apr 2026" },
      { id: 205, name: "Influenza H3N8",  due: "Due in 60 Days",   done: false, lastDone: "Jan 2026" },
    ],
    records: [
      { id: 301, date: "Nov 10, 2026", type: "Vet Visit",    note: "Annual checkup – all clear. Weight 24.5 kg." },
      { id: 302, date: "Sep 03, 2026", type: "Prescription", note: "Apoquel 16mg – 1 tab daily for 14 days." },
      { id: 303, date: "Jul 20, 2026", type: "Allergy Note", note: "Mild skin reaction to chicken-based kibble." },
      { id: 304, date: "Mar 15, 2026", type: "Vaccination",  note: "DHPP combo administered. Next in 1 year." },
    ],
    activity: [
      { id: 401, time: "08:02 AM, Nov 20", label: "Auto-feed: Breakfast", amount: "100g", type: "auto" },
      { id: 402, time: "07:58 AM, Nov 19", label: "Auto-feed: Dinner",    amount: "100g", type: "auto" },
      { id: 403, time: "04:00 PM, Nov 19", label: "Remote feed by Owner", amount: "50g",  type: "remote" },
    ],
  },
  2: {
    foodLevel: 65,
    waterLevel: 82,
    schedules: [
      { id: 501, label: "Morning Feed", time: "07:30", ampm: "AM", portion: 35, active: true },
      { id: 502, label: "Noon Nibble",  time: "01:00", ampm: "PM", portion: 25, active: true },
      { id: 503, label: "Evening Feed", time: "06:30", ampm: "PM", portion: 35, active: true },
    ],
    vaccines: [
      { id: 601, name: "FVRCP Booster", due: "Due in 12 Days",  done: false, lastDone: "Nov 2025" },
      { id: 602, name: "Rabies Core",   due: "Completed",        done: true,  lastDone: "Feb 2026" },
      { id: 603, name: "FeLV Vaccine",  due: "Due in 45 Days",   done: false, lastDone: "Dec 2025" },
    ],
    records: [
      { id: 701, date: "Oct 18, 2026", type: "Vet Visit",    note: "Dental cleaning and weight check (5.2 kg)." },
      { id: 702, date: "Jun 04, 2026", type: "Prescription", note: "Revolution Plus flea & tick topical prevention." },
      { id: 703, date: "Feb 12, 2026", type: "Vaccination",  note: "Rabies booster administered." },
    ],
    activity: [
      { id: 801, time: "07:30 AM, Nov 20", label: "Auto-feed: Morning Feed", amount: "35g", type: "auto" },
      { id: 802, time: "06:30 PM, Nov 19", label: "Auto-feed: Evening Feed", amount: "35g", type: "auto" },
    ],
  },
};

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
    green:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber:  "bg-amber-50  text-amber-700  border border-amber-200",
    red:    "bg-red-50    text-red-700    border border-red-200",
    blue:   "bg-blue-50   text-blue-700   border border-blue-200",
    teal:   "bg-teal-50   text-teal-700   border border-teal-200",
    gray:   "bg-stone-100 text-stone-500  border border-stone-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
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
const Toast = ({ msg, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "water" 
    ? "bg-teal-600" 
    : type === "info" 
    ? "bg-blue-600" 
    : "bg-emerald-600";

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`${bg} text-white text-sm font-medium px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 min-w-80`}>
        {type === "water" ? <Droplets size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
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
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md animate-slide-down">
        <div className="bg-red-600 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
            <BellRing size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold">🚨 Urgent Health Alert</p>
            <p className="text-red-200 text-sm">Pet Pal IoT · Just now</p>
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
              <CheckCircle2 size={16} /> Connecting to nearest vet clinic for {pet.name}... Stand by.
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

// ─── Add New Pet Modal ────────────────────────────────────────────────────────
const AddPetModal = ({ onSave, onDismiss }) => {
  const [form, setForm] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "1 Year",
    weight: "10.0",
    kcal: "600",
    emoji: "🐕",
  });

  const emojis = ["🐕", "🐶", "🐩", "🐈", "🐱", "🐾", "🐇", "🦊"];

  const handleSpeciesChange = (species) => {
    const defaultEmoji = species === "Cat" ? "🐈" : species === "Rabbit" ? "🐇" : "🐕";
    const defaultKcal = species === "Cat" ? "300" : "650";
    const defaultWeight = species === "Cat" ? "4.5" : "15.0";
    setForm((f) => ({
      ...f,
      species,
      emoji: defaultEmoji,
      kcal: defaultKcal,
      weight: defaultWeight,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.breed.trim()) return;
    onSave({
      ...form,
      weight: parseFloat(form.weight) || 10.0,
      kcal: parseInt(form.kcal) || 600,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md animate-slide-down">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <PawPrint size={20} />
            </div>
            <div>
              <p className="font-bold text-base">Add New Pet</p>
              <p className="text-amber-100 text-xs">Connect bowl & configure profile</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Pet Name</label>
            <input
              required
              className="w-full text-sm border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              placeholder="e.g. Coco, Luna, Charlie"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Species</label>
            <div className="grid grid-cols-3 gap-2">
              {["Dog", "Cat", "Other"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSpeciesChange(s)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    form.species === s
                      ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {s === "Dog" ? "🐶 Dog" : s === "Cat" ? "🐱 Cat" : "🐾 Other"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Breed</label>
              <input
                required
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                placeholder="e.g. Corgi, Siamese"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Age</label>
              <input
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                placeholder="e.g. 1 Year, 8 Mos"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Target Kcal/day</label>
              <input
                type="number"
                min="100"
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                value={form.kcal}
                onChange={(e) => setForm({ ...form, kcal: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Avatar Emoji</label>
            <div className="flex gap-2">
              {emojis.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setForm({ ...form, emoji: em })}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.emoji === em
                      ? "bg-amber-100 ring-2 ring-amber-500 scale-110"
                      : "bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-200 text-sm"
            >
              Add Pet & Connect Feeder
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Reschedule Vaccine Modal ─────────────────────────────────────────────────
const RescheduleVaccineModal = ({ vaccine, pet, onSave, onDismiss }) => {
  const [mode, setMode] = useState("days"); // 'days' | 'date'
  const [days, setDays] = useState(30);
  const [customDate, setCustomDate] = useState("");
  const [notes, setNotes] = useState("");

  const presetDays = [14, 30, 90, 180, 365];

  const handleSave = () => {
    let dueString = "";
    if (mode === "days") {
      dueString = `Due in ${days} Days`;
    } else {
      if (!customDate) return;
      const d = new Date(customDate);
      dueString = `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    onSave(vaccine.id, dueString, notes);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md animate-slide-down">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-bold text-base">Reschedule Vaccine Dose</p>
              <p className="text-blue-100 text-xs">{vaccine.name} · {pet.name}</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-stone-50 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-stone-500">Current Status:</span>
            <Badge variant={vaccine.done ? "green" : "amber"}>{vaccine.due}</Badge>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1.5 block">Schedule Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("days")}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  mode === "days"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                In [X] Days
              </button>
              <button
                type="button"
                onClick={() => setMode("date")}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  mode === "date"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Specific Calendar Date
              </button>
            </div>
          </div>

          {mode === "days" ? (
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1.5 block">
                Next booster interval:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {presetDays.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      days === d
                        ? "bg-blue-100 text-blue-700 font-bold border border-blue-300"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {d === 365 ? "1 Year (365d)" : `${d} Days`}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-stone-500">Or custom days:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="w-24 text-xs border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Select Date</label>
              <input
                type="date"
                className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Optional Clinic Notes</label>
            <input
              className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              placeholder="e.g. Scheduled with Dr. Vance at Westside Vet"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 text-sm"
            >
              Update Schedule
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tab: HOME ────────────────────────────────────────────────────────────────
const HomeTab = ({
  pet,
  data,
  onFeed,
  onDispenseWater,
}) => {
  const [foodPortion, setFoodPortion] = useState("Medium (100g)");
  const [waterPortion, setWaterPortion] = useState("200ml");
  const [dispensingFood, setDispensingFood] = useState(false);
  const [dispensingWater, setDispensingWater] = useState(false);

  const foodPortions = ["Small (50g)", "Medium (100g)", "Large (150g)"];
  const foodGrams = { "Small (50g)": 50, "Medium (100g)": 100, "Large (150g)": 150 };

  const waterPortions = ["100ml", "200ml", "300ml"];

  const handleFeed = () => {
    if (dispensingFood || dispensingWater) return;
    setDispensingFood(true);
    setTimeout(() => {
      setDispensingFood(false);
      onFeed(foodGrams[foodPortion]);
    }, 1500);
  };

  const handleWater = () => {
    if (dispensingFood || dispensingWater) return;
    setDispensingWater(true);
    setTimeout(() => {
      setDispensingWater(false);
      onDispenseWater(waterPortion);
    }, 1500);
  };

  const { foodLevel, waterLevel, activity } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── LEFT column (Status & Remote Dispense Controls) ── */}
      <div className="lg:col-span-6 space-y-6">
        {/* Device Status */}
        <Card className="p-6">
          <SectionTitle icon={Wifi} iconClass="text-blue-500">Smart Bowl Status</SectionTitle>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-stone-800">Pet Pal Hub · {pet.name}'s Feeder</p>
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
                Connected via Wi-Fi · Signal Strong (-54 dBm)
              </p>
            </div>
            <Badge variant="green">Online</Badge>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-stone-600 font-medium flex items-center gap-1.5">
                  <Package size={14} className="text-stone-500" /> Food Tank Level
                </span>
                <span className="text-sm font-bold text-stone-800">{foodLevel}%</span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${foodLevel}%`,
                    background: foodLevel > 50 ? "#10b981" : foodLevel > 25 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-stone-600 font-medium flex items-center gap-1.5">
                  <Droplets size={14} className="text-teal-500" /> Fresh Water Reservoir
                </span>
                <span className="text-sm font-bold text-stone-800">{waterLevel}%</span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${waterLevel}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Dual Controls: Remote Food & Water Dispense Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Food Control */}
          <Card className="p-5 flex flex-col justify-between border-amber-100 bg-gradient-to-b from-white to-amber-50/20">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-600">
                <Utensils size={16} />
                <h3 className="font-bold text-stone-800 text-sm">Remote Food Dispenser</h3>
              </div>
              <p className="text-xs text-stone-500 mb-3">Dispense dry kibble to {pet.name}'s bowl.</p>
              
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {foodPortions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFoodPortion(p)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      foodPortion === p
                        ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {p.split(" ")[0]}
                    <br />
                    <span className="text-[10px] opacity-80">{p.match(/\(.*\)/)?.[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFeed}
              disabled={dispensingFood || dispensingWater}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                dispensingFood
                  ? "bg-amber-300 text-white cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 active:scale-95"
              }`}
            >
              {dispensingFood ? (
                <><Loader2 size={16} className="animate-spin" /> Dispensing Food...</>
              ) : (
                <><Zap size={16} /> Feed Now</>
              )}
            </button>
          </Card>

          {/* Water Control */}
          <Card className="p-5 flex flex-col justify-between border-teal-100 bg-gradient-to-b from-white to-teal-50/20">
            <div>
              <div className="flex items-center gap-2 mb-2 text-teal-600">
                <Droplets size={16} />
                <h3 className="font-bold text-stone-800 text-sm">Remote Water Control</h3>
              </div>
              <p className="text-xs text-stone-500 mb-3">Refill fresh filtered water bowl.</p>
              
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {waterPortions.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWaterPortion(w)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      waterPortion === w
                        ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleWater}
              disabled={dispensingFood || dispensingWater}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                dispensingWater
                  ? "bg-teal-300 text-white cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 active:scale-95"
              }`}
            >
              {dispensingWater ? (
                <><Loader2 size={16} className="animate-spin" /> Dispensing Water...</>
              ) : (
                <><Droplets size={16} /> Dispense Water</>
              )}
            </button>
          </Card>
        </div>
      </div>

      {/* ── RIGHT column (Pet Summary & Activity Log) ── */}
      <div className="lg:col-span-6 space-y-6">
        {/* Pet Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
              {pet.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-stone-800">{pet.name}</p>
                <Badge variant="teal">{pet.species}</Badge>
              </div>
              <p className="text-sm text-stone-500">{pet.breed} · {pet.age}</p>
            </div>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Fed Today",   value: "2x",          sub: "120g total"   },
              { label: "Daily Kcal",  value: `${pet.kcal}`, sub: "kcal target"  },
              { label: "Weight",      value: `${pet.weight} kg`, sub: "optimal" },
            ].map((s) => (
              <div key={s.label} className="bg-stone-50 rounded-xl p-3.5 text-center">
                <p className="text-lg font-bold text-stone-800">{s.value}</p>
                <p className="text-xs text-stone-500 font-medium mt-0.5">{s.label}</p>
                <p className="text-[11px] text-stone-400">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-teal-50/70 border border-teal-100 rounded-xl px-4 py-2.5 text-xs text-teal-800 flex items-center gap-2">
            <Sparkles size={14} className="text-teal-600 shrink-0" />
            <span>Smart bowl sensors confirm {pet.name} has healthy hydration and balanced feeding cadence.</span>
          </div>
        </Card>

        {/* Activity Log */}
        <Card className="p-6">
          <SectionTitle icon={Activity} iconClass="text-blue-500">Recent Activity Log</SectionTitle>
          <div className="divide-y divide-stone-50">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  a.type === "water"
                    ? "bg-teal-50"
                    : a.type === "remote"
                    ? "bg-amber-50"
                    : "bg-blue-50"
                }`}>
                  {a.type === "water" ? (
                    <Droplets size={15} className="text-teal-600" />
                  ) : a.type === "remote" ? (
                    <Zap size={15} className="text-amber-500" />
                  ) : (
                    <CalendarClock size={15} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-700 truncate">{a.label}</p>
                  <p className="text-xs text-stone-400">{a.time}</p>
                </div>
                <Badge variant={a.type === "water" ? "teal" : a.type === "remote" ? "amber" : "blue"}>
                  {a.amount}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Tab: SCHEDULE ────────────────────────────────────────────────────────────
const ScheduleTab = ({ pet, schedules, onToggle, onDelete, onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", time: "12:00", ampm: "PM", portion: 80 });

  const handleAdd = () => {
    if (!form.label.trim()) return;
    onAdd({ ...form, portion: Number(form.portion) || 50 });
    setForm({ label: "", time: "12:00", ampm: "PM", portion: 80 });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-800">{pet.name}'s Automated Meal Schedule</h2>
          <p className="text-sm text-stone-400 mt-0.5">
            {schedules.filter((s) => s.active).length} of {schedules.length} feeding slots active
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors self-start sm:self-auto shadow-md shadow-amber-200"
        >
          <Plus size={15} /> Add New Schedule
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="p-6 border border-amber-200 bg-amber-50/40 animate-slide-down">
          <h3 className="text-sm font-bold text-stone-700 mb-4">New Feeding Schedule for {pet.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="text-sm border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
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
              type="number" min={10} max={400}
              placeholder="Portion (g)"
              className="text-sm border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              value={form.portion}
              onChange={(e) => setForm((f) => ({ ...f, portion: e.target.value }))}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
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
              <Toggle active={s.active} onChange={() => onToggle(s.id)} />
              <button
                onClick={() => onDelete(s.id)}
                className="text-stone-300 hover:text-red-400 transition-colors p-1"
                title="Delete Schedule"
              >
                <Trash2 size={16} />
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
            <p className="font-bold text-blue-800">Autonomous Hardware Cache Active</p>
            <p className="text-sm text-blue-600 mt-0.5 leading-relaxed">
              Schedules are synced to the bowl's local microcontroller. Meals will be dispensed right on time even if Wi-Fi or Internet disconnects.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── Tab: HEALTH ──────────────────────────────────────────────────────────────
const HealthTab = ({
  pet,
  vaccines,
  records,
  onMarkVaccineDone,
  onRescheduleVaccine,
  onAddRecord,
  onUpdateWeight,
}) => {
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(pet.weight);
  const [recForm, setRecForm] = useState({ type: "Vet Visit", note: "" });
  const [selectedVaccineForReschedule, setSelectedVaccineForReschedule] = useState(null);

  const handleAddRec = () => {
    if (!recForm.note.trim()) return;
    onAddRecord({
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      ...recForm,
    });
    setRecForm({ type: "Vet Visit", note: "" });
    setShowRecordForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Reschedule Modal */}
      {selectedVaccineForReschedule && (
        <RescheduleVaccineModal
          vaccine={selectedVaccineForReschedule}
          pet={pet}
          onSave={(id, due, notes) => {
            onRescheduleVaccine(id, due, notes);
            setSelectedVaccineForReschedule(null);
          }}
          onDismiss={() => setSelectedVaccineForReschedule(null)}
        />
      )}

      {/* Pet Profile banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center text-5xl shadow-sm shrink-0">
            {pet.emoji}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-stone-800">{pet.name}</h2>
              <Badge variant="green">Healthy & Active</Badge>
              <Badge variant="teal">{pet.species}</Badge>
            </div>
            <p className="text-stone-500">{pet.breed} · {pet.age}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-auto w-full">
            {[
              { label: "Weight", value: `${pet.weight} kg`, icon: Weight },
              { label: "Age",    value: pet.age,            icon: Clock  },
              { label: "Kcal",   value: `${pet.kcal}`,      icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-stone-50 rounded-xl p-3 text-center min-w-[80px]">
                <Icon size={14} className="text-stone-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-stone-800">{value}</p>
                <p className="text-xs text-stone-400">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setNewWeight(pet.weight); setShowWeightModal(true); }}
            className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto shadow-md shadow-amber-200"
          >
            Log Weight
          </button>
        </div>
      </Card>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-down">
            <p className="font-bold text-stone-800 mb-4">Log New Weight for {pet.name}</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number" step="0.1"
                className="w-full text-sm border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={newWeight}
                onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
              />
              <span className="text-stone-500 text-sm font-semibold">kg</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { onUpdateWeight(newWeight); setShowWeightModal(false); }}
                className="flex-1 bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 bg-stone-100 text-stone-600 font-semibold py-3 rounded-xl hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vaccines */}
        <Card className="p-6">
          <SectionTitle icon={Syringe} iconClass="text-blue-500">Vaccination Reminders & Management</SectionTitle>
          <div className="space-y-3">
            {vaccines.map((v) => (
              <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-stone-50/70 border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    v.done ? "bg-emerald-100" : "bg-amber-100"
                  }`}>
                    {v.done
                      ? <CheckCircle2 size={16} className="text-emerald-600" />
                      : <Syringe size={16} className="text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{v.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-semibold ${v.done ? "text-emerald-600" : "text-amber-600"}`}>
                        {v.due}
                      </span>
                      {v.lastDone && (
                        <span className="text-[11px] text-stone-400">· Last: {v.lastDone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!v.done ? (
                    <button
                      onClick={() => onMarkVaccineDone(v.id)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Mark as Done
                    </button>
                  ) : (
                    <Badge variant="green">Completed</Badge>
                  )}

                  <button
                    onClick={() => setSelectedVaccineForReschedule(v)}
                    className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    title="Reschedule next booster"
                  >
                    <Calendar size={13} />
                    <span>Reschedule</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Health Records */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon={FileText} iconClass="text-purple-500">Medical & Health Records Vault</SectionTitle>
            <button
              onClick={() => setShowRecordForm((v) => !v)}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors -mt-4"
            >
              <Plus size={14} /> Add Record
            </button>
          </div>

          {showRecordForm && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4 space-y-3 animate-slide-down">
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
                rows={2} placeholder="Notes, dosage, clinical observations..."
                value={recForm.note}
                onChange={(e) => setRecForm((f) => ({ ...f, note: e.target.value }))}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddRec}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                >
                  Save Record
                </button>
                <button
                  onClick={() => setShowRecordForm(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="border border-stone-100 rounded-xl p-4 bg-white hover:border-stone-200 transition-colors">
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
const AiVetTab = ({ pet, vaccines }) => {
  const [messages, setMessages] = useState([
    {
      id: 1, role: "ai",
      text: `Hi! I'm **Dr. Paws AI** 🐾 — your 24/7 AI-powered pet health assistant. I'm connected to **${pet.name}**'s Smart Feeder logs, vaccination dates, and dietary profile (${pet.weight} kg, ${pet.kcal} kcal/day target). How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  // Update welcome when switching pet
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        role: "ai",
        text: `Hi! I'm **Dr. Paws AI** 🐾 — your 24/7 AI health assistant. I have loaded **${pet.name}**'s (${pet.breed}, ${pet.weight} kg) telemetry data and health history. Ask me anything about ${pet.name}'s feeding schedule, weight, or vaccines!`,
      },
    ]);
  }, [pet.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const chips = [
    `${pet.name} ate less today, should I worry?`,
    `Recommended daily portion for ${pet.name}'s weight?`,
    `When is ${pet.name}'s next vaccine?`,
  ];

  const generateResponse = (msg) => {
    const nextVaccine = vaccines.find((v) => !v.done) || vaccines[0];
    
    if (msg.includes("ate less today")) {
      return `Based on ${pet.name}'s Smart Feeder data today, she ate slightly below her average target. An isolated light day is common due to room temperature, nap cycles, or minor pickiness. As long as bowl activity stays active and she remains energetic, monitor for the next 24 hours. If she skips 2 consecutive meals, our Emergency Alert will alert you! 🐾`;
    }
    if (msg.includes("Recommended daily portion")) {
      const dailyGrams = Math.round(pet.kcal / 3.2);
      return `For ${pet.name} at **${pet.weight} kg** (${pet.breed}), our nutritional model recommends **${pet.kcal} kcal/day**. With a standard premium kibble (~3,200 kcal/kg), that translates to approximately **${dailyGrams}g per day**, divided into 2-3 balanced meals via your Smart Bowl schedule. ✅`;
    }
    if (msg.includes("next vaccine")) {
      return `${pet.name}'s next upcoming immunization is **${nextVaccine.name}** (${nextVaccine.due}). You can reschedule this anytime in the Health & Vaccines tab, and Pet Pal will remind you 3 days prior! 💉`;
    }
    return `I've analyzed your question regarding "${msg}" against ${pet.name}'s active telemetry (${pet.weight} kg, ${pet.breed}, daily target ${pet.kcal} kcal). All health metrics and feeder records are in optimal ranges. Let me know if you would like me to adjust portion sizes or log a new symptom! 🐾`;
  };

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
        text: generateResponse(msg),
      }]);
    }, 1100);
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
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bot size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-stone-800">Dr. Paws AI Assistant</p>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> Active context: {pet.name} ({pet.breed})
                </p>
              </div>
            </div>
            <Badge variant="blue">Smart Telemetry Synced</Badge>
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
                <div className={`max-w-[78%] text-sm leading-relaxed rounded-2xl px-4 py-3 ${
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

      {/* ── Right Panel: Insight + Snapshot ── */}
      <div className="lg:col-span-4 space-y-5">
        {/* AI Insight Banner */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-blue-500" />
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Proactive AI Insight</p>
          </div>
          <p className="text-sm text-blue-900 leading-relaxed">
            {pet.name}'s eating speed and bowl approach intervals have remained consistent this week. Daily target of <strong>{pet.kcal} kcal</strong> is right on target.
          </p>
        </Card>

        {/* Quick Stats */}
        <Card className="p-5">
          <p className="text-sm font-bold text-stone-700 mb-3">{pet.name}'s Snapshot</p>
          <div className="space-y-2.5">
            {[
              { label: "Species / Breed", value: `${pet.species} (${pet.breed})`, color: "text-stone-800" },
              { label: "Current Weight",  value: `${pet.weight} kg`,             color: "text-blue-600"   },
              { label: "Daily Target",    value: `${pet.kcal} kcal`,             color: "text-amber-600" },
              { label: "Next Vaccine",    value: vaccines.find((v) => !v.done)?.name || "All Done", color: "text-emerald-600"},
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-stone-500">{label}</span>
                <span className={`font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-4 border-amber-100 bg-amber-50/70">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">⚠️ Clinical Disclaimer:</span> Dr. Paws AI provides decision support based on IoT telemetry. Always contact your licensed vet clinic for emergency triage.
          </p>
        </Card>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [pets, setPets] = useState(INIT_PETS);
  const [activePetId, setActivePetId] = useState(1);
  const [petOpen, setPetOpen] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [petData, setPetData] = useState(INITIAL_PET_DATA);

  const [toast, setToast] = useState(null); // { msg, type }
  const [emergency, setEmergency] = useState(false);

  const activePet = pets.find((p) => p.id === activePetId) || pets[0];
  const activeData = petData[activePet.id] || {
    foodLevel: 80,
    waterLevel: 85,
    schedules: [],
    vaccines: [],
    records: [],
    activity: [],
  };

  const tabs = [
    { id: "home",   label: "Home",      icon: Home        },
    { id: "sched",  label: "Schedule",  icon: CalendarClock},
    { id: "health", label: "Health",    icon: HeartPulse  },
    { id: "ai",     label: "Dr. Paws",  icon: Bot         },
  ];

  // Helper to mutate active pet's data
  const updateActiveData = (updater) => {
    setPetData((prev) => ({
      ...prev,
      [activePet.id]: {
        ...prev[activePet.id],
        ...updater(prev[activePet.id]),
      },
    }));
  };

  // 1. Food dispense
  const handleFeed = (grams) => {
    const drain = grams === 50 ? 3 : grams === 100 ? 6 : 9;
    updateActiveData((data) => ({
      foodLevel: Math.max(0, data.foodLevel - drain),
      activity: [
        {
          id: Date.now(),
          time: fmtFull(new Date()),
          label: "Remote feed by Owner",
          amount: `${grams}g`,
          type: "remote",
        },
        ...data.activity,
      ],
    }));
    setToast({ msg: `✅ Successful Feed! Dispensed ${grams}g to ${activePet.name}'s bowl.`, type: "success" });
  };

  // 2. Water dispense
  const handleDispenseWater = (portionStr) => {
    const ml = parseInt(portionStr) || 200;
    const drain = ml === 100 ? 4 : ml === 200 ? 8 : 12;
    updateActiveData((data) => ({
      waterLevel: Math.max(0, data.waterLevel - drain),
      activity: [
        {
          id: Date.now(),
          time: fmtFull(new Date()),
          label: "Remote water refill",
          amount: `${ml}ml`,
          type: "water",
        },
        ...data.activity,
      ],
    }));
    setToast({ msg: `💧 Fresh Water Dispensed! Refilled ${ml}ml into ${activePet.name}'s bowl`, type: "water" });
  };

  // 3. Schedules
  const handleToggleSchedule = (id) => {
    updateActiveData((data) => ({
      schedules: data.schedules.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    }));
  };

  const handleDeleteSchedule = (id) => {
    updateActiveData((data) => ({
      schedules: data.schedules.filter((s) => s.id !== id),
    }));
  };

  const handleAddSchedule = (scheduleItem) => {
    updateActiveData((data) => ({
      schedules: [...data.schedules, { id: Date.now(), active: true, ...scheduleItem }],
    }));
    setToast({ msg: `📅 Added new feeding schedule: ${scheduleItem.label} (${scheduleItem.portion}g)`, type: "info" });
  };

  // 4. Vaccines
  const handleMarkVaccineDone = (vaccineId) => {
    updateActiveData((data) => ({
      vaccines: data.vaccines.map((v) =>
        v.id === vaccineId
          ? { ...v, done: true, due: "Completed", lastDone: fmtTime(new Date()) }
          : v
      ),
    }));
    setToast({ msg: `✅ Vaccine marked as completed!`, type: "success" });
  };

  const handleRescheduleVaccine = (vaccineId, newDue, notes) => {
    updateActiveData((data) => {
      const vName = data.vaccines.find((x) => x.id === vaccineId)?.name || "Vaccine";
      const newRec = notes.trim()
        ? [{
            id: Date.now() + 10,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            type: "Vaccination",
            note: `${vName} rescheduled: ${newDue}. Note: ${notes}`,
          }]
        : [];
      return {
        vaccines: data.vaccines.map((v) =>
          v.id === vaccineId ? { ...v, done: false, due: newDue } : v
        ),
        records: [...newRec, ...data.records],
      };
    });
    setToast({ msg: `📅 Vaccine rescheduled: ${newDue}`, type: "info" });
  };

  // 5. Health Records & Weight
  const handleAddRecord = (recordItem) => {
    updateActiveData((data) => ({
      records: [{ id: Date.now(), ...recordItem }, ...data.records],
    }));
    setToast({ msg: `📋 Health record added to ${activePet.name}'s vault`, type: "info" });
  };

  const handleUpdateWeight = (newW) => {
    setPets((prev) =>
      prev.map((p) => (p.id === activePet.id ? { ...p, weight: newW } : p))
    );
    handleAddRecord({
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "Vet Visit",
      note: `Weight logged: ${newW} kg.`,
    });
    setToast({ msg: `⚖️ Updated ${activePet.name}'s weight to ${newW} kg`, type: "success" });
  };

  // 6. Add Pet
  const handleSaveNewPet = (newPetForm) => {
    const newId = Date.now();
    const newPetObj = {
      id: newId,
      name: newPetForm.name,
      species: newPetForm.species,
      breed: newPetForm.breed,
      emoji: newPetForm.emoji,
      weight: newPetForm.weight,
      age: newPetForm.age,
      kcal: newPetForm.kcal,
      icon: newPetForm.species === "Cat" ? Cat : Dog,
    };

    // Starter dataset for the new pet
    const starterData = {
      foodLevel: 85,
      waterLevel: 95,
      schedules: [
        { id: newId + 1, label: "Morning Breakfast", time: "08:00", ampm: "AM", portion: Math.round(newPetObj.weight * 3.5), active: true },
        { id: newId + 2, label: "Evening Dinner",    time: "06:30", ampm: "PM", portion: Math.round(newPetObj.weight * 3.5), active: true },
      ],
      vaccines: [
        { id: newId + 3, name: newPetObj.species === "Cat" ? "FVRCP Booster" : "Rabies Booster", due: "Due in 30 Days", done: false, lastDone: "Starter" },
        { id: newId + 4, name: "Core Deworming", due: "Completed", done: true, lastDone: "Nov 2026" },
      ],
      records: [
        {
          id: newId + 5,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          type: "Vet Visit",
          note: `Profile initialized on Pet Pal IoT for ${newPetObj.name} (${newPetObj.breed}). Initial weight ${newPetObj.weight} kg.`,
        },
      ],
      activity: [
        { id: newId + 6, time: fmtFull(new Date()), label: "Smart Bowl linked to " + newPetObj.name, amount: "Ready", type: "auto" },
      ],
    };

    setPets((prev) => [...prev, newPetObj]);
    setPetData((prev) => ({ ...prev, [newId]: starterData }));
    setActivePetId(newId);
    setShowAddPetModal(false);
    setToast({ msg: `🎉 Welcome ${newPetObj.name}! Smart Bowl connected and ready.`, type: "success" });
  };

  return (
    <div className="min-h-screen w-full" style={{ background: "#FAF8F5" }}>
      {/* Viewport Toasts & Modals */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
      {emergency && (
        <EmergencyModal pet={activePet} onDismiss={() => setEmergency(false)} />
      )}
      {showAddPetModal && (
        <AddPetModal
          onSave={handleSaveNewPet}
          onDismiss={() => setShowAddPetModal(false)}
        />
      )}

      {/* ── Top Navigation Bar (Full-Width Header) ── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
                <PawPrint size={18} className="text-white" />
              </div>
              <span className="text-lg font-black text-stone-800 tracking-tight">Pet Pal</span>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
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
          </div>

          {/* Right: Wi-Fi Pill, Pet Switcher (+ Add Pet), Emergency Button */}
          <div className="flex items-center gap-3">
            {/* Wi-Fi Status Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Connected · Signal Strong
            </div>

            {/* Pet Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPetOpen((v) => !v)}
                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 transition-colors px-3 py-2 rounded-xl"
              >
                <span className="text-lg">{activePet.emoji}</span>
                <span className="text-sm font-semibold text-stone-700 max-w-[100px] truncate">
                  {activePet.name}
                </span>
                <ChevronDown size={14} className={`text-stone-500 transition-transform ${petOpen ? "rotate-180" : ""}`} />
              </button>

              {petOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-30 w-64 animate-slide-down">
                  <div className="p-2 border-b border-stone-100">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                      Your Pets ({pets.length})
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {pets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActivePetId(p.id);
                          setPetOpen(false);
                        }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50 transition-colors ${
                          activePet.id === p.id ? "bg-amber-50/70" : ""
                        }`}
                      >
                        <span className="text-xl">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-800 truncate">{p.name}</p>
                          <p className="text-xs text-stone-400 truncate">{p.breed}</p>
                        </div>
                        {activePet.id === p.id && <CheckCircle2 size={15} className="text-amber-500 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* + Add New Pet Button */}
                  <div className="p-2 border-t border-stone-100 bg-stone-50/50">
                    <button
                      onClick={() => {
                        setPetOpen(false);
                        setShowAddPetModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors border border-amber-200"
                    >
                      <Plus size={14} />
                      Add New Pet
                    </button>
                  </div>
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
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-8">
        {/* Page Title & Subtitle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-stone-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-stone-400 mt-0.5">
              {activeTab === "home"   && `Managing ${activePet.name}'s smart feeder and fresh water reservoir in real-time`}
              {activeTab === "sched"  && `Automated meal schedules configured for ${activePet.name}`}
              {activeTab === "health" && `Health records, immunization schedule, and clinical history for ${activePet.name}`}
              {activeTab === "ai"     && `AI-powered vet assistant — ask anything about ${activePet.name}'s wellness`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100 px-3 py-1.5 rounded-xl text-xs text-stone-600 font-medium">
            <span>Active Pet:</span>
            <span className="font-bold text-stone-800">{activePet.name} ({activePet.breed})</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "home" && (
          <HomeTab
            pet={activePet}
            data={activeData}
            onFeed={handleFeed}
            onDispenseWater={handleDispenseWater}
          />
        )}
        {activeTab === "sched" && (
          <ScheduleTab
            pet={activePet}
            schedules={activeData.schedules}
            onToggle={handleToggleSchedule}
            onDelete={handleDeleteSchedule}
            onAdd={handleAddSchedule}
          />
        )}
        {activeTab === "health" && (
          <HealthTab
            pet={activePet}
            vaccines={activeData.vaccines}
            records={activeData.records}
            onMarkVaccineDone={handleMarkVaccineDone}
            onRescheduleVaccine={handleRescheduleVaccine}
            onAddRecord={handleAddRecord}
            onUpdateWeight={handleUpdateWeight}
          />
        )}
        {activeTab === "ai" && (
          <AiVetTab
            pet={activePet}
            vaccines={activeData.vaccines}
          />
        )}

        {/* ── Footer ── */}
        <footer className="mt-16 pt-6 pb-24 md:pb-8 border-t border-[#E6DFD5] flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-stone-500 text-center md:text-left">
          <p>
            © 2026 PawSync IoT. All rights reserved. • Smart Pet Care Management
          </p>
          <p>
            Designed & Developed by{" "}
            <a
              href="https://felixkai.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E07A5F] font-semibold hover:underline transition-colors"
            >
              Felix Kai
            </a>
          </p>
        </footer>
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
    </div>
  );
}
