import { useState, useEffect, useRef } from "react";
import {
	Wifi,
	Battery,
	Signal,
	ChevronDown,
	Bell,
	BellRing,
	Utensils,
	CalendarClock,
	HeartPulse,
	Bot,
	Home,
	Droplets,
	Package,
	CheckCircle2,
	AlertTriangle,
	XCircle,
	Plus,
	Trash2,
	Send,
	Zap,
	Clock,
	Weight,
	Syringe,
	FileText,
	Cat,
	Dog,
	Loader2,
	ChevronRight,
	ToggleLeft,
	ToggleRight,
	X,
	ShieldCheck,
	TrendingUp,
	Activity,
	MessageCircle,
	Sparkles,
	PawPrint,
	PhoneCall,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const fmtTime = (d) =>
	`${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? "PM" : "AM"}`;
const fmtFull = (d) =>
	`${fmtTime(d)}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
const now = new Date();

// ─── Sample Data ────────────────────────────────────────────────────────────
const PETS = [
	{
		id: 1,
		name: "Bella",
		breed: "Golden Retriever",
		emoji: "🐕",
		weight: 24.5,
		age: "2 Years",
		kcal: 850,
		icon: Dog,
	},
	{
		id: 2,
		name: "Milo",
		breed: "British Shorthair",
		emoji: "🐈",
		weight: 5.2,
		age: "3 Years",
		kcal: 320,
		icon: Cat,
	},
];

const INIT_SCHEDULES = [
	{
		id: 1,
		label: "Breakfast",
		time: "08:00",
		ampm: "AM",
		portion: 100,
		active: true,
	},
	{
		id: 2,
		label: "Lunch",
		time: "01:30",
		ampm: "PM",
		portion: 80,
		active: true,
	},
	{
		id: 3,
		label: "Afternoon Snack",
		time: "04:00",
		ampm: "PM",
		portion: 50,
		active: false,
	},
	{
		id: 4,
		label: "Dinner",
		time: "07:00",
		ampm: "PM",
		portion: 100,
		active: true,
	},
];

const INIT_VACCINES = [
	{ id: 1, name: "Rabies Booster", due: "Due in 5 Days", done: false },
	{ id: 2, name: "DHPP Combo", due: "Completed", done: true },
	{ id: 3, name: "Leptospirosis", due: "Due in 23 Days", done: false },
	{ id: 4, name: "Bordetella", due: "Completed", done: true },
	{ id: 5, name: "Influenza H3N8", due: "Due in 60 Days", done: false },
];

const INIT_RECORDS = [
	{
		id: 1,
		date: "Nov 10, 2026",
		type: "Vet Visit",
		note: "Annual checkup – all clear. Weight 24.5 kg.",
	},
	{
		id: 2,
		date: "Sep 03, 2026",
		type: "Prescription",
		note: "Apoquel 16mg – 1 tab daily for 14 days.",
	},
	{
		id: 3,
		date: "Jul 20, 2026",
		type: "Allergy Note",
		note: "Mild skin reaction to chicken-based kibble.",
	},
	{
		id: 4,
		date: "Mar 15, 2026",
		type: "Vaccination",
		note: "DHPP combo administered. Next in 1 year.",
	},
];

const INIT_ACTIVITY = [
	{
		id: 1,
		time: "08:02 AM, Nov 20",
		label: "Auto-feed: Breakfast",
		grams: 100,
		type: "auto",
	},
	{
		id: 2,
		time: "07:58 AM, Nov 19",
		label: "Auto-feed: Dinner",
		grams: 100,
		type: "auto",
	},
	{
		id: 3,
		time: "04:00 PM, Nov 19",
		label: "Remote feed by Owner",
		grams: 50,
		type: "remote",
	},
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
	`I've analyzed your question about "${msg}" in context of Bella's profile. Based on her current weight (24.5 kg), recent feeding logs, and health records, everything appears within normal parameters. For a more detailed assessment, I recommend scheduling a vet check-in. Feel free to ask me anything else! 🐾`;

// ─── Reusable Components ────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
	<div
		className={`bg-white rounded-2xl shadow-sm border border-stone-100 ${className}`}
	>
		{children}
	</div>
);

const Badge = ({ children, variant = "green" }) => {
	const styles = {
		green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
		amber: "bg-amber-50  text-amber-700  border border-amber-200",
		red: "bg-red-50    text-red-700    border border-red-200",
		blue: "bg-blue-50   text-blue-700   border border-blue-200",
		gray: "bg-stone-100 text-stone-500  border border-stone-200",
	};
	return (
		<span
			className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[variant]}`}
		>
			{children}
		</span>
	);
};

const Toggle = ({ active, onChange }) => (
	<button
		onClick={onChange}
		className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${active ? "bg-amber-500" : "bg-stone-200"
			}`}
	>
		<span
			className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${active ? "translate-x-5" : "translate-x-0"
				}`}
		/>
	</button>
);

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ msg, onClose }) => {
	useEffect(() => {
		const t = setTimeout(onClose, 4000);
		return () => clearTimeout(t);
	}, [onClose]);
	return (
		<div className="absolute top-16 left-3 right-3 z-50 animate-slide-down">
			<div className="bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2">
				<CheckCircle2 size={16} className="shrink-0" />
				<span className="flex-1">{msg}</span>
				<button onClick={onClose}>
					<X size={14} />
				</button>
			</div>
		</div>
	);
};

// ─── Emergency Modal ─────────────────────────────────────────────────────────
const EmergencyModal = ({ pet, onDismiss }) => {
	const [contacted, setContacted] = useState(false);
	return (
		<div className="absolute inset-0 z-50 bg-black/60 flex items-end pb-6 px-4 backdrop-blur-sm">
			<div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
				<div className="bg-red-600 px-5 py-4 flex items-center gap-3">
					<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
						<BellRing size={20} className="text-white" />
					</div>
					<div>
						<p className="text-white font-bold text-sm">
							🚨 Urgent Health Alert
						</p>
						<p className="text-red-200 text-xs">PawSync • Just now</p>
					</div>
				</div>
				<div className="px-5 py-4 space-y-3">
					<p className="text-stone-800 font-semibold text-sm leading-relaxed">
						Abnormal Eating Behavior Detected!
					</p>
					<p className="text-stone-600 text-xs leading-relaxed">
						{pet.name} has skipped{" "}
						<span className="text-red-600 font-bold">2 consecutive meals</span>{" "}
						and bowl activity is{" "}
						<span className="text-red-600 font-bold">0%</span> for the last
						<span className="text-red-600 font-bold"> 14 hours</span>. This may
						indicate illness, stress, or a physical obstruction. Immediate
						attention is recommended.
					</p>
					<div className="flex gap-2 items-center text-xs text-stone-500 bg-red-50 rounded-xl px-3 py-2">
						<AlertTriangle size={14} className="text-red-500 shrink-0" />
						<span>
							AI Confidence: 94% — Pattern deviates significantly from baseline
						</span>
					</div>
					{contacted ? (
						<div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-700 font-medium flex items-center gap-2">
							<CheckCircle2 size={14} /> Connecting to nearest vet clinic...
							Stand by.
						</div>
					) : (
						<div className="flex gap-2 pt-1">
							<button
								onClick={() => setContacted(true)}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
							>
								<PhoneCall size={14} /> Contact Vet
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
						<button
							onClick={onDismiss}
							className="w-full text-stone-400 text-xs py-2"
						>
							Dismiss alert
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

// ─── Tab: HOME ───────────────────────────────────────────────────────────────
const HomeTab = ({
	pet,
	foodLevel,
	setFoodLevel,
	waterLevel,
	activity,
	setActivity,
	toast,
	setToast,
}) => {
	const [portion, setPortion] = useState("Medium (100g)");
	const [dispensing, setDispensing] = useState(false);
	const portions = ["Small (50g)", "Medium (100g)", "Large (150g)"];
	const portionGrams = {
		"Small (50g)": 50,
		"Medium (100g)": 100,
		"Large (150g)": 150,
	};
	const portionDrain = {
		"Small (50g)": 3,
		"Medium (100g)": 6,
		"Large (150g)": 9,
	};

	const feedNow = () => {
		if (dispensing) return;
		setDispensing(true);
		setTimeout(() => {
			setDispensing(false);
			const g = portionGrams[portion];
			const drain = portionDrain[portion];
			setFoodLevel((f) => Math.max(0, f - drain));
			const entry = {
				id: Date.now(),
				time: fmtFull(new Date()),
				label: `Remote feed by Owner`,
				grams: g,
				type: "remote",
			};
			setActivity((a) => [entry, ...a]);
			setToast(`✅ Dispensed ${g}g to ${pet.name}'s bowl successfully!`);
		}, 1800);
	};

	return (
		<div
			className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
			style={{ scrollbarWidth: "none" }}
		>
			{/* Device Status */}
			<Card className="p-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
							<Wifi size={15} className="text-blue-600" />
						</div>
						<div>
							<p className="text-xs font-bold text-stone-800">
								Smart Bowl • {pet.name}
							</p>
							<p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
								Connected via Wi-Fi · Signal Strong
							</p>
						</div>
					</div>
					<Badge variant="green">Online</Badge>
				</div>
				{/* Food Level */}
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
							<Package size={12} /> Food Tank
						</div>
						<span className="text-xs font-bold text-stone-800">
							{foodLevel}%
						</span>
					</div>
					<div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
						<div
							className="h-full rounded-full transition-all duration-700"
							style={{
								width: `${foodLevel}%`,
								background:
									foodLevel > 50
										? "#10b981"
										: foodLevel > 25
											? "#f59e0b"
											: "#ef4444",
							}}
						/>
					</div>
					{/* Water Level */}
					<div className="flex justify-between items-center mt-2">
						<div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
							<Droplets size={12} className="text-blue-500" /> Water Level
						</div>
						<span className="text-xs font-bold text-stone-800">
							{waterLevel}%
						</span>
					</div>
					<div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-blue-400 rounded-full transition-all duration-700"
							style={{ width: `${waterLevel}%` }}
						/>
					</div>
				</div>
			</Card>

			{/* Pet Quick Stats */}
			<Card className="p-4">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">
						{pet.emoji}
					</div>
					<div className="flex-1">
						<p className="text-sm font-bold text-stone-800">
							{pet.name} · {pet.breed}
						</p>
						<p className="text-xs text-stone-500 mt-0.5">Today's summary</p>
					</div>
					<TrendingUp size={16} className="text-emerald-500" />
				</div>
				<div className="mt-3 grid grid-cols-3 gap-2">
					{[
						{ label: "Fed Today", value: "2x", sub: "120g total" },
						{ label: "Calories", value: `${pet.kcal}`, sub: "kcal target" },
						{ label: "Meals Left", value: "1", sub: "Dinner 7PM" },
					].map((s) => (
						<div
							key={s.label}
							className="bg-stone-50 rounded-xl p-2 text-center"
						>
							<p className="text-sm font-bold text-stone-800">{s.value}</p>
							<p className="text-[9px] text-stone-500 font-medium leading-tight mt-0.5">
								{s.label}
							</p>
							<p className="text-[9px] text-stone-400">{s.sub}</p>
						</div>
					))}
				</div>
			</Card>

			{/* Feed Now */}
			<Card className="p-4">
				<p className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
					<Utensils size={14} className="text-amber-500" /> Remote Feed Control
				</p>
				<div className="flex gap-2 mb-4">
					{portions.map((p) => (
						<button
							key={p}
							onClick={() => setPortion(p)}
							className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${portion === p
									? "bg-amber-500 text-white shadow-md shadow-amber-200"
									: "bg-stone-100 text-stone-600 hover:bg-stone-200"
								}`}
						>
							{p.split(" ")[0]}
							<br />
							<span className="text-[9px] opacity-80">{p.split(" ")[1]}</span>
						</button>
					))}
				</div>
				<button
					onClick={feedNow}
					disabled={dispensing}
					className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${dispensing
							? "bg-amber-300 text-white cursor-not-allowed"
							: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 active:scale-95"
						}`}
				>
					{dispensing ? (
						<>
							<Loader2 size={16} className="animate-spin" />
							Dispensing via Wi-Fi...
						</>
					) : (
						<>
							<Zap size={16} />
							Feed Now
						</>
					)}
				</button>
			</Card>

			{/* Activity Log */}
			<Card className="p-4">
				<p className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
					<Activity size={14} className="text-blue-500" /> Recent Activity
				</p>
				<div className="space-y-2">
					{activity.slice(0, 5).map((a) => (
						<div
							key={a.id}
							className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0"
						>
							<div
								className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${a.type === "remote" ? "bg-amber-50" : "bg-blue-50"
									}`}
							>
								{a.type === "remote" ? (
									<Wifi size={12} className="text-amber-500" />
								) : (
									<CalendarClock size={12} className="text-blue-500" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs font-semibold text-stone-700 truncate">
									{a.label}
								</p>
								<p className="text-[10px] text-stone-400">{a.time}</p>
							</div>
							<span className="text-xs font-bold text-stone-600 shrink-0">
								{a.grams}g
							</span>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
};

// ─── Tab: SCHEDULE ───────────────────────────────────────────────────────────
const ScheduleTab = ({ pet }) => {
	const [schedules, setSchedules] = useState(INIT_SCHEDULES);
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({
		label: "",
		time: "12:00",
		ampm: "PM",
		portion: 80,
	});

	const toggleSchedule = (id) =>
		setSchedules((s) =>
			s.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
		);
	const deleteSchedule = (id) =>
		setSchedules((s) => s.filter((x) => x.id !== id));
	const addSchedule = () => {
		if (!form.label.trim()) return;
		setSchedules((s) => [...s, { ...form, id: Date.now() }]);
		setForm({ label: "", time: "12:00", ampm: "PM", portion: 80 });
		setShowForm(false);
	};

	return (
		<div
			className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
			style={{ scrollbarWidth: "none" }}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-bold text-stone-800">
						{pet.name}'s Feeding Schedule
					</p>
					<p className="text-xs text-stone-400">
						{schedules.filter((s) => s.active).length} active schedules
					</p>
				</div>
				<button
					onClick={() => setShowForm((v) => !v)}
					className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-600 transition-colors"
				>
					<Plus size={13} /> Add
				</button>
			</div>

			{showForm && (
				<Card className="p-4 border border-amber-200 bg-amber-50/40">
					<p className="text-xs font-bold text-stone-700 mb-3">
						New Feeding Schedule
					</p>
					<div className="space-y-2">
						<input
							className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
							placeholder="Meal label (e.g. Afternoon Snack)"
							value={form.label}
							onChange={(e) =>
								setForm((f) => ({ ...f, label: e.target.value }))
							}
						/>
						<div className="flex gap-2">
							<input
								type="time"
								className="flex-1 text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
								value={form.time}
								onChange={(e) =>
									setForm((f) => ({ ...f, time: e.target.value }))
								}
							/>
							<select
								className="text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
								value={form.ampm}
								onChange={(e) =>
									setForm((f) => ({ ...f, ampm: e.target.value }))
								}
							>
								<option>AM</option>
								<option>PM</option>
							</select>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-xs text-stone-500 w-24 shrink-0">
								Portion (g):
							</label>
							<input
								type="number"
								min={10}
								max={300}
								className="flex-1 text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
								value={form.portion}
								onChange={(e) =>
									setForm((f) => ({ ...f, portion: Number(e.target.value) }))
								}
							/>
						</div>
						<div className="flex gap-2 pt-1">
							<button
								onClick={addSchedule}
								className="flex-1 bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-amber-600"
							>
								Save Schedule
							</button>
							<button
								onClick={() => setShowForm(false)}
								className="flex-1 bg-stone-100 text-stone-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-stone-200"
							>
								Cancel
							</button>
						</div>
					</div>
				</Card>
			)}

			<div className="space-y-2">
				{schedules.map((s) => (
					<Card key={s.id} className="px-4 py-3.5 flex items-center gap-3">
						<div
							className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.active ? "bg-amber-50" : "bg-stone-100"
								}`}
						>
							<Clock
								size={16}
								className={s.active ? "text-amber-500" : "text-stone-400"}
							/>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-stone-800 truncate">
								{s.label}
							</p>
							<p className="text-xs text-stone-400">
								{s.time} {s.ampm} · {s.portion}g
							</p>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<Toggle active={s.active} onChange={() => toggleSchedule(s.id)} />
							<button
								onClick={() => deleteSchedule(s.id)}
								className="text-stone-300 hover:text-red-400 transition-colors ml-1"
							>
								<Trash2 size={14} />
							</button>
						</div>
					</Card>
				))}
			</div>

			<Card className="p-4 bg-blue-50 border-blue-100">
				<div className="flex items-start gap-3">
					<div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
						<ShieldCheck size={15} className="text-blue-600" />
					</div>
					<div>
						<p className="text-xs font-bold text-blue-800">
							Auto-Schedule Active
						</p>
						<p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">
							Smart Bowl will automatically dispense food at the scheduled times
							even if your phone is offline. Schedules sync via cloud every 30
							minutes.
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
};

// ─── Tab: HEALTH ─────────────────────────────────────────────────────────────
const HealthTab = ({ pet }) => {
	const [vaccines, setVaccines] = useState(INIT_VACCINES);
	const [records, setRecords] = useState(INIT_RECORDS);
	const [showRecordForm, setShowRecordForm] = useState(false);
	const [showWeightModal, setShowWeightModal] = useState(false);
	const [weight, setWeight] = useState(pet.weight);
	const [newWeight, setNewWeight] = useState(pet.weight);
	const [recForm, setRecForm] = useState({ type: "Vet Visit", note: "" });

	const markVaccineDone = (id) =>
		setVaccines((v) =>
			v.map((x) => (x.id === id ? { ...x, done: true, due: "Completed" } : x)),
		);

	const addRecord = () => {
		if (!recForm.note.trim()) return;
		setRecords((r) => [
			{
				id: Date.now(),
				date: new Date().toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				}),
				...recForm,
			},
			...r,
		]);
		setRecForm({ type: "Vet Visit", note: "" });
		setShowRecordForm(false);
	};

	return (
		<div
			className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
			style={{ scrollbarWidth: "none" }}
		>
			{/* Pet Profile */}
			<Card className="p-4">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center text-3xl">
						{pet.emoji}
					</div>
					<div className="flex-1">
						<p className="text-sm font-bold text-stone-800">{pet.name}</p>
						<p className="text-xs text-stone-500">
							{pet.breed} · {pet.age}
						</p>
						<div className="flex items-center gap-1.5 mt-1">
							<Badge variant="blue">{weight} kg</Badge>
							<Badge variant="green">Healthy</Badge>
						</div>
					</div>
					<button
						onClick={() => setShowWeightModal(true)}
						className="text-xs bg-stone-100 text-stone-600 font-semibold px-3 py-2 rounded-xl hover:bg-stone-200 transition-colors"
					>
						Log Weight
					</button>
				</div>
				<div className="grid grid-cols-3 gap-2">
					{[
						{ label: "Weight", value: `${weight} kg`, icon: Weight },
						{ label: "Age", value: pet.age, icon: Clock },
						{ label: "Calories", value: `${pet.kcal} kcal`, icon: TrendingUp },
					].map(({ label, value, icon: Icon }) => (
						<div
							key={label}
							className="bg-stone-50 rounded-xl p-2.5 text-center"
						>
							<Icon size={13} className="text-stone-400 mx-auto mb-1" />
							<p className="text-xs font-bold text-stone-800">{value}</p>
							<p className="text-[9px] text-stone-400">{label}</p>
						</div>
					))}
				</div>
			</Card>

			{/* Weight Modal */}
			{showWeightModal && (
				<div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center px-6">
					<div className="bg-white rounded-3xl p-5 w-full shadow-2xl">
						<p className="text-sm font-bold text-stone-800 mb-3">
							Log New Weight
						</p>
						<input
							type="number"
							step="0.1"
							className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 mb-3"
							value={newWeight}
							onChange={(e) => setNewWeight(parseFloat(e.target.value))}
						/>
						<div className="flex gap-2">
							<button
								onClick={() => {
									setWeight(newWeight);
									setShowWeightModal(false);
								}}
								className="flex-1 bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-amber-600"
							>
								Save
							</button>
							<button
								onClick={() => setShowWeightModal(false)}
								className="flex-1 bg-stone-100 text-stone-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-stone-200"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Vaccines */}
			<Card className="p-4">
				<p className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
					<Syringe size={14} className="text-blue-500" /> Vaccination Tracker
				</p>
				<div className="space-y-2">
					{vaccines.map((v) => (
						<div key={v.id} className="flex items-center gap-3 py-1.5">
							<div
								className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${v.done ? "bg-emerald-50" : "bg-amber-50"
									}`}
							>
								{v.done ? (
									<CheckCircle2 size={14} className="text-emerald-500" />
								) : (
									<Syringe size={14} className="text-amber-500" />
								)}
							</div>
							<div className="flex-1">
								<p className="text-xs font-semibold text-stone-700">{v.name}</p>
								<p
									className={`text-[10px] font-medium ${v.done ? "text-emerald-600" : "text-amber-600"}`}
								>
									{v.due}
								</p>
							</div>
							{!v.done && (
								<button
									onClick={() => markVaccineDone(v.id)}
									className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors whitespace-nowrap"
								>
									Mark Done
								</button>
							)}
							{v.done && <Badge variant="green">Done</Badge>}
						</div>
					))}
				</div>
			</Card>

			{/* Health Records */}
			<Card className="p-4">
				<div className="flex items-center justify-between mb-3">
					<p className="text-sm font-bold text-stone-800 flex items-center gap-2">
						<FileText size={14} className="text-purple-500" /> Health Records
					</p>
					<button
						onClick={() => setShowRecordForm((v) => !v)}
						className="flex items-center gap-1 bg-stone-100 text-stone-600 text-xs font-semibold px-2.5 py-1.5 rounded-xl hover:bg-stone-200 transition-colors"
					>
						<Plus size={12} /> Add
					</button>
				</div>

				{showRecordForm && (
					<div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-3 space-y-2">
						<select
							className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
							value={recForm.type}
							onChange={(e) =>
								setRecForm((f) => ({ ...f, type: e.target.value }))
							}
						>
							{[
								"Vet Visit",
								"Prescription",
								"Allergy Note",
								"Vaccination",
								"Surgery",
								"Lab Result",
							].map((t) => (
								<option key={t}>{t}</option>
							))}
						</select>
						<textarea
							className="w-full text-xs border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white resize-none"
							rows={2}
							placeholder="Notes..."
							value={recForm.note}
							onChange={(e) =>
								setRecForm((f) => ({ ...f, note: e.target.value }))
							}
						/>
						<div className="flex gap-2">
							<button
								onClick={addRecord}
								className="flex-1 bg-purple-500 text-white text-xs font-semibold py-2 rounded-xl hover:bg-purple-600"
							>
								Save
							</button>
							<button
								onClick={() => setShowRecordForm(false)}
								className="flex-1 bg-stone-100 text-stone-600 text-xs font-semibold py-2 rounded-xl"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				<div className="space-y-2">
					{records.map((r) => (
						<div key={r.id} className="border border-stone-100 rounded-xl p-3">
							<div className="flex items-center justify-between mb-1">
								<Badge
									variant={
										r.type === "Vet Visit"
											? "blue"
											: r.type === "Vaccination"
												? "green"
												: r.type === "Allergy Note"
													? "amber"
													: "gray"
									}
								>
									{r.type}
								</Badge>
								<span className="text-[10px] text-stone-400">{r.date}</span>
							</div>
							<p className="text-xs text-stone-600 leading-relaxed">{r.note}</p>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
};

// ─── Tab: AI VET ─────────────────────────────────────────────────────────────
const AiVetTab = ({ pet }) => {
	const [messages, setMessages] = useState([
		{
			id: 1,
			role: "ai",
			text: `Hi! I'm **Dr. Paws AI** 🐾 — your 24/7 AI-powered pet health assistant. I have access to ${pet.name}'s full profile, feeding history, and health records. How can I help you today?`,
		},
	]);
	const [input, setInput] = useState("");
	const [typing, setTyping] = useState(false);
	const endRef = useRef(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, typing]);

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
			const response = AI_RESPONSES[msg] || DEFAULT_RESPONSE(msg);
			setMessages((m) => [
				...m,
				{ id: Date.now() + 1, role: "ai", text: response },
			]);
		}, 1200);
	};

	const renderText = (text) =>
		text
			.split(/\*\*(.+?)\*\*/g)
			.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			{/* AI Insight Banner */}
			<div className="mx-4 mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3 shrink-0">
				<Sparkles size={15} className="text-blue-500 mt-0.5 shrink-0" />
				<div>
					<p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">
						AI Insight
					</p>
					<p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
						{pet.name}'s eating speed has been normal this week, and her daily
						calorie intake is right on target ({pet.kcal} kcal). No anomalies
						detected. 🎉
					</p>
				</div>
			</div>

			{/* Messages */}
			<div
				className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
				style={{ scrollbarWidth: "none" }}
			>
				{messages.map((m) => (
					<div
						key={m.id}
						className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
					>
						{m.role === "ai" && (
							<div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center mr-2 shrink-0 mt-0.5">
								<Bot size={13} className="text-blue-600" />
							</div>
						)}
						<div
							className={`max-w-[78%] text-xs leading-relaxed rounded-2xl px-3.5 py-3 ${m.role === "user"
									? "bg-amber-500 text-white rounded-br-sm"
									: "bg-white border border-stone-100 text-stone-700 rounded-bl-sm shadow-sm"
								}`}
						>
							{renderText(m.text)}
						</div>
					</div>
				))}
				{typing && (
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
							<Bot size={13} className="text-blue-600" />
						</div>
						<div className="bg-white border border-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
							<div className="flex gap-1 items-center">
								{[0, 1, 2].map((i) => (
									<span
										key={i}
										className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
										style={{ animationDelay: `${i * 0.15}s` }}
									/>
								))}
							</div>
						</div>
					</div>
				)}
				<div ref={endRef} />
			</div>

			{/* Quick Chips */}
			<div
				className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0"
				style={{ scrollbarWidth: "none" }}
			>
				{chips.map((c) => (
					<button
						key={c}
						onClick={() => sendMsg(c)}
						className="shrink-0 bg-blue-50 text-blue-700 text-[10px] font-medium px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
					>
						{c}
					</button>
				))}
			</div>

			{/* Input */}
			<div className="px-4 pb-4 shrink-0">
				<div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-3 py-2 shadow-sm">
					<input
						className="flex-1 text-xs focus:outline-none bg-transparent text-stone-700 placeholder-stone-400"
						placeholder={`Ask Dr. Paws about ${pet.name}...`}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && sendMsg()}
					/>
					<button
						onClick={() => sendMsg()}
						className="w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center transition-colors active:scale-95"
					>
						<Send size={13} className="text-white" />
					</button>
				</div>
			</div>
		</div>
	);
};

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
	const [activeTab, setActiveTab] = useState("home");
	const [activePetIdx, setActivePetIdx] = useState(0);
	const [petOpen, setPetOpen] = useState(false);
	const [foodLevel, setFoodLevel] = useState(78);
	const [waterLevel] = useState(90);
	const [activity, setActivity] = useState(INIT_ACTIVITY);
	const [toast, setToast] = useState(null);
	const [emergency, setEmergency] = useState(false);
	const [clockStr, setClockStr] = useState(fmtTime(new Date()));

	const pet = PETS[activePetIdx];

	useEffect(() => {
		const t = setInterval(() => setClockStr(fmtTime(new Date())), 10000);
		return () => clearInterval(t);
	}, []);

	const tabs = [
		{ id: "home", label: "Home", icon: Home },
		{ id: "sched", label: "Schedule", icon: CalendarClock },
		{ id: "health", label: "Health", icon: HeartPulse },
		{ id: "ai", label: "Dr. Paws", icon: Bot },
	];

	return (
		<div
			className="min-h-screen flex items-center justify-center py-8 px-4"
			style={{
				background: "#F5EFE6",
				fontFamily: "'Inter', system-ui, sans-serif",
			}}
		>
			{/* Phone Frame */}
			<div
				className="relative flex flex-col overflow-hidden w-full"
				style={{
					maxWidth: 390,
					height: 844,
					background: "#FAF8F5",
					borderRadius: 44,
					border: "8px solid #1c1917",
					boxShadow: "0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px #44403c",
				}}
			>
				{/* Notch */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-stone-900 rounded-b-2xl z-20 flex items-center justify-center">
					<div className="w-16 h-1 bg-stone-700 rounded-full" />
				</div>

				{/* Status Bar */}
				<div className="shrink-0 flex items-center justify-between px-6 pt-9 pb-1 bg-white/80 backdrop-blur-sm z-10">
					<span className="text-[11px] font-bold text-stone-800">
						{clockStr}
					</span>
					<div className="flex items-center gap-2">
						<Wifi size={12} className="text-stone-700" />
						<Signal size={12} className="text-stone-700" />
						<Battery size={13} className="text-stone-700" />
					</div>
				</div>

				{/* Header */}
				<div className="shrink-0 bg-white/90 backdrop-blur-sm border-b border-stone-100 px-4 py-3 flex items-center justify-between z-10">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
							<PawPrint size={15} className="text-white" />
						</div>
						<span className="text-sm font-black text-stone-800 tracking-tight">
							PawSync
						</span>
					</div>

					{/* Pet Switcher */}
					<div className="relative">
						<button
							onClick={() => setPetOpen((v) => !v)}
							className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 transition-colors px-2.5 py-1.5 rounded-xl"
						>
							<span className="text-sm">{pet.emoji}</span>
							<span className="text-xs font-semibold text-stone-700 max-w-[90px] truncate">
								{pet.name}
							</span>
							<ChevronDown
								size={12}
								className={`text-stone-500 transition-transform ${petOpen ? "rotate-180" : ""}`}
							/>
						</button>
						{petOpen && (
							<div className="absolute top-full mt-1 right-0 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-30 w-52">
								{PETS.map((p, i) => (
									<button
										key={p.id}
										onClick={() => {
											setActivePetIdx(i);
											setPetOpen(false);
										}}
										className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs hover:bg-stone-50 transition-colors ${activePetIdx === i ? "bg-amber-50" : ""
											}`}
									>
										<span className="text-lg">{p.emoji}</span>
										<div>
											<p className="font-bold text-stone-800">{p.name}</p>
											<p className="text-stone-500">{p.breed}</p>
										</div>
										{activePetIdx === i && (
											<CheckCircle2
												size={13}
												className="text-amber-500 ml-auto"
											/>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Emergency Trigger */}
					<button
						onClick={() => setEmergency(true)}
						className="w-8 h-8 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center transition-colors group"
						title="Trigger Demo Alert"
					>
						<BellRing
							size={14}
							className="text-red-500 group-hover:animate-wiggle"
						/>
					</button>
				</div>

				{/* Content Area */}
				<div className="flex-1 flex flex-col overflow-hidden relative">
					{toast && <Toast msg={toast} onClose={() => setToast(null)} />}
					{emergency && (
						<EmergencyModal pet={pet} onDismiss={() => setEmergency(false)} />
					)}

					{activeTab === "home" && (
						<HomeTab
							pet={pet}
							foodLevel={foodLevel}
							setFoodLevel={setFoodLevel}
							waterLevel={waterLevel}
							activity={activity}
							setActivity={setActivity}
							toast={toast}
							setToast={setToast}
						/>
					)}
					{activeTab === "sched" && <ScheduleTab pet={pet} />}
					{activeTab === "health" && <HealthTab pet={pet} />}
					{activeTab === "ai" && <AiVetTab pet={pet} />}
				</div>

				{/* Bottom Nav */}
				<div className="shrink-0 bg-white border-t border-stone-100 flex items-center px-2 pb-4 pt-2 z-10">
					{tabs.map(({ id, label, icon: Icon }) => (
						<button
							key={id}
							onClick={() => setActiveTab(id)}
							className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${activeTab === id
									? "text-amber-600"
									: "text-stone-400 hover:text-stone-600"
								}`}
						>
							<div
								className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${activeTab === id ? "bg-amber-100" : ""
									}`}
							>
								<Icon size={16} strokeWidth={activeTab === id ? 2.5 : 1.8} />
							</div>
							<span
								className={`text-[9px] font-semibold ${activeTab === id ? "text-amber-600" : "text-stone-400"}`}
							>
								{label}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
