import { supabase } from './supabaseClient';
import { useState, useEffect, useCallback } from "react";
import { Bell, ClipboardList, Puzzle, Camera, Settings, X, ChevronRight, Plus, Pill, Phone, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun } from "lucide-react";

const menuItems = [
  { label: "Reminders", icon: Bell },
  { label: "Routine", icon: ClipboardList },
  { label: "Games", icon: Puzzle },
  { label: "Photos", icon: Camera },
];

const repeatOptions = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "yearly", label: "Every year" },
];

const initialRoutineData = [
  { section: "Morning", items: [
    { id: 1, label: "Wake up and get dressed", time: "7:00 AM" },
    { id: 2, label: "Take morning medication", time: "8:00 AM" },
    { id: 3, label: "Eat breakfast", time: "8:15 AM" },
    { id: 4, label: "Morning walk", time: "9:30 AM" },
  ]},
  { section: "Afternoon", items: [
    { id: 5, label: "Eat lunch", time: "12:00 PM" },
    { id: 6, label: "Rest time", time: "1:00 PM" },
    { id: 7, label: "Call family", time: "2:30 PM" },
    { id: 8, label: "Gardening or hobby", time: "3:30 PM" },
  ]},
  { section: "Evening", items: [
    { id: 9, label: "Eat dinner", time: "6:00 PM" },
    { id: 10, label: "Take evening medication", time: "7:00 PM" },
    { id: 11, label: "Watch television", time: "7:30 PM" },
    { id: 12, label: "Wind down and get ready for bed", time: "9:00 PM" },
  ]},
];


function useBodyScrollLock(active) {
  useEffect(() => {
    if (active) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);
}

// ── Upload to Supabase Storage ─────────────────────────────────────────────
async function uploadToStorage(file, userId, folder) {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('photos').upload(fileName, file, { upsert: true });
  if (error) { console.error('Upload error:', error); return null; }
  const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
  return data.publicUrl;
}

// ── Welcome Screen (shown once after onboarding) ───────────────────────────
function WelcomeScreen({ name, onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "#4a90e2", zIndex: 3000,
      maxWidth: "390px", margin: "0 auto",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fading ? 0 : 1,
      transition: "opacity 0.6s ease",
    }}>
      <p style={{ margin: "0 0 10px 0", fontSize: "17px", color: "rgba(255,255,255,0.8)", fontFamily: "'Inter', sans-serif" }}>Welcome to Remembrit</p>
      <h1 style={{ margin: 0, fontSize: "38px", fontWeight: "600", color: "white", fontFamily: "'Inter', sans-serif" }}>{name}</h1>
    </div>
  );
}

// ── Auth Screen ────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const inputStyle = {
    width: "100%", padding: "14px", fontSize: "16px",
    border: "1px solid #eee", borderRadius: "12px", fontFamily: "inherit",
    color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none",
  };

  const handleSubmit = async () => {
    setLoading(true); setError(null); setMessage(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Account created! You can now sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "390px", margin: "0 auto", minHeight: "100vh", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "36px", color: "#333", fontWeight: "600" }}>Remembrit</h1>
        <p style={{ margin: 0, fontSize: "16px", color: "#aaa" }}>Care made simple</p>
      </div>
      <div style={{ display: "flex", backgroundColor: "#f5f5f5", borderRadius: "12px", padding: "4px", marginBottom: "28px" }}>
        <button onClick={() => { setMode("signin"); setError(null); setMessage(null); }}
          style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: mode === "signin" ? "#fff" : "transparent", color: mode === "signin" ? "#333" : "#aaa", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", boxShadow: mode === "signin" ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
          Sign In
        </button>
        <button onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
          style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: mode === "signup" ? "#fff" : "transparent", color: mode === "signup" ? "#333" : "#aaa", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", boxShadow: mode === "signup" ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
          Sign Up
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        <input style={inputStyle} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
      </div>
      {error && <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#e25555", textAlign: "center" }}>{error}</p>}
      {message && <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#3a7d44", textAlign: "center" }}>{message}</p>}
      <button onClick={handleSubmit} disabled={loading || !email || !password}
        style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", backgroundColor: email && password ? "#4a90e2" : "#ddd", color: email && password ? "white" : "#aaa", fontSize: "17px", fontWeight: "600", cursor: email && password ? "pointer" : "default", fontFamily: "inherit", transition: "background-color 0.2s" }}>
        {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
      </button>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}

// ── Onboarding Screen ──────────────────────────────────────────────────────
function OnboardingScreen({ session, onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%", padding: "14px", fontSize: "16px",
    border: "1px solid #eee", borderRadius: "12px", fontFamily: "inherit",
    color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none",
  };
  const labelStyle = { display: "block", fontSize: "13px", color: "#aaa", marginBottom: "6px", fontWeight: "500" };

  const steps = [
    {
      title: "Welcome to Remembrit",
      subtitle: "Let's set up the app for your loved one. This only takes a minute.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>What is their name?</label>
            <input style={inputStyle} placeholder="e.g. Margaret" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>A short description about them</label>
            <textarea style={{ ...inputStyle, height: "90px", resize: "none" }}
              placeholder="e.g. You live in Acton, Massachusetts. You love gardening and classical music."
              value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
        </div>
      ),
      canAdvance: name.trim().length > 0,
    },
    {
      title: `A bit more about ${name || "them"}`,
      subtitle: "This helps personalize their experience.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Birthday</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={birthday.split(" ")[0] || ""} onChange={(e) => { const parts = birthday.split(" "); setBirthday(`${e.target.value} ${parts[1] || ""} ${parts[2] || ""}`.trim()); }} style={{ ...inputStyle, flex: 2 }}>
                <option value="">Month</option>
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={birthday.split(" ")[1]?.replace(",","") || ""} onChange={(e) => { const parts = birthday.split(" "); setBirthday(`${parts[0] || ""} ${e.target.value}, ${parts[2] || ""}`.trim()); }} style={{ ...inputStyle, flex: 1 }}>
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input placeholder="Year" value={birthday.split(" ")[2] || ""} onChange={(e) => { const parts = birthday.split(" "); setBirthday(`${parts[0] || ""} ${parts[1] || ""} ${e.target.value}`.trim()); }} style={{ ...inputStyle, flex: 1 }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Home address</label>
            <input style={inputStyle} placeholder="e.g. 123 Maple Street, Acton, MA" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
      ),
      canAdvance: true,
    },
    {
      title: "Set a caregiver PIN",
      subtitle: "This PIN protects the caregiver side of the app. Choose 4 digits you will remember.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>4-digit PIN</label>
            <input style={{ ...inputStyle, fontSize: "24px", letterSpacing: "8px", textAlign: "center" }}
              type="tel" maxLength={4} placeholder="· · · ·"
              value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#aaa", textAlign: "center" }}>You can change this later in Settings.</p>
        </div>
      ),
      canAdvance: pin.length === 4,
    },
  ];

  const current = steps[step];

  const handleNext = async () => {
    if (step < steps.length - 1) { setStep(step + 1); return; }
    setLoading(true);
    try {
      const computeAge = (bday) => {
        const parts = bday.split(" ");
        if (parts.length < 3) return 0;
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const month = months.indexOf(parts[0]);
        const day = parseInt(parts[1].replace(",", ""));
        const year = parseInt(parts[2]);
        if (month === -1 || isNaN(day) || isNaN(year)) return 0;
        const today = new Date();
        let age = today.getFullYear() - year;
        if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) age--;
        return age;
      };
      const age = computeAge(birthday);
      await supabase.from('patient_info').upsert({
        profile_id: session.user.id,
        name: name.trim(),
        bio: bio.trim(),
        birthday,
        address: address.trim(),
        age,
        photo: "",
        pin: pin || "1234",
        onboarded: true,
      });
      onComplete({ name: name.trim(), bio: bio.trim(), birthday, address: address.trim(), age, photo: "", pin: pin || "1234", profileId: session.user.id });
    } catch (err) {
      console.error("Onboarding error:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "390px", margin: "0 auto", minHeight: "100vh", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", padding: "60px 24px 40px 24px" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "40px" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", backgroundColor: i <= step ? "#4a90e2" : "#eee", transition: "background-color 0.3s" }} />
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "26px", color: "#333", fontWeight: "600" }}>{current.title}</h1>
        <p style={{ margin: "0 0 32px 0", fontSize: "15px", color: "#aaa", lineHeight: "1.5" }}>{current.subtitle}</p>
        {current.content}
      </div>
      <button onClick={handleNext} disabled={!current.canAdvance || loading}
        style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", backgroundColor: current.canAdvance ? "#4a90e2" : "#ddd", color: current.canAdvance ? "white" : "#aaa", fontSize: "17px", fontWeight: "600", cursor: current.canAdvance ? "pointer" : "default", fontFamily: "inherit", marginTop: "32px", transition: "background-color 0.2s" }}>
        {loading ? "Setting up..." : step < steps.length - 1 ? "Continue" : "Get Started"}
      </button>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}

// ── Caregiver Transition ───────────────────────────────────────────────────
function CaregiverTransition({ direction, onComplete }) {
  const [phase, setPhase] = useState("in");

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const t1 = setTimeout(() => setPhase("out"), 600);
    const t2 = setTimeout(() => stableOnComplete(), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [stableOnComplete]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: direction === "unlock" ? "#4a90e2" : "#333", zIndex: 2000, maxWidth: "390px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: phase === "in" ? 1 : 0, transition: "opacity 0.5s ease" }}>
      <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: "500", letterSpacing: "0.05em" }}>
        {direction === "unlock" ? "Switching to Caregiver View" : "Returning to Patient View"}
      </p>
    </div>
  );
}

// ── Caregiver PIN Screen ───────────────────────────────────────────────────
function CaregiverPINScreen({ onClose, onUnlock, correctPin }) {
  useBodyScrollLock(true);
  const [digits, setDigits] = useState([]);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  const handleDigit = (d) => {
    if (digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      if (next.join("") === (correctPin || "1234")) {
        setTimeout(() => onUnlock(), 200);
      } else {
        setShake(true); setError(true);
        setTimeout(() => { setShake(false); setError(false); setDigits([]); }, 600);
      }
    }
  };

  const handleDelete = () => { setDigits((prev) => prev.slice(0, -1)); setError(false); };
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1100, maxWidth: "390px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onClose} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Caregiver Access</h2>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <p style={{ fontSize: "16px", color: "#888", marginBottom: "32px" }}>Enter your PIN</p>
        <div style={{ display: "flex", gap: "20px", marginBottom: "48px", animation: shake ? "shake 0.4s ease" : "none" }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: digits.length > i ? (error ? "#e25555" : "#4a90e2") : "#ddd", transition: "background-color 0.15s" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", width: "100%", maxWidth: "280px" }}>
          {keys.map((key, i) => {
            if (key === null) return <div key={i} />;
            return (
              <button key={i} onClick={() => key === "del" ? handleDelete() : handleDigit(String(key))}
                style={{ width: "72px", height: "72px", borderRadius: "50%", border: "none", backgroundColor: key === "del" ? "transparent" : "#f5f5f5", fontSize: key === "del" ? "14px" : "26px", color: key === "del" ? "#888" : "#333", cursor: "pointer", fontFamily: "inherit", fontWeight: "500", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {key === "del" ? "⌫" : key}
              </button>
            );
          })}
        </div>
        {error && <p style={{ marginTop: "24px", fontSize: "14px", color: "#e25555" }}>Incorrect PIN. Try again.</p>}
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-10px)} 80%{transform:translateX(10px)} }`}</style>
    </div>
  );
}

function ArchiveSection({ reminders, setReminders }) {
  const [expanded, setExpanded] = useState(false);

  const deleteArchived = async (id) => {
    await supabase.from('reminders').delete().eq('id', id);
    setReminders((prev) => prev.filter((x) => x.id !== id));
  };

  const restore = async (id) => {
    await supabase.from('reminders').update({ archived: false, done: false }).eq('id', id);
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, archived: false, done: false } : r));
  };

  return (
    <div style={{ margin: "20px 20px 0 20px" }}>
      <div onClick={() => setExpanded((p) => !p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>Archive ({reminders.length})</p>
        <ChevronRight size={16} color="#ccc" style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </div>
      {expanded && (
        <div>
          <p style={{ margin: "10px 0 12px 0", fontSize: "12px", color: "#bbb" }}>Completed reminders are archived for 30 days, then automatically deleted.</p>
          {reminders.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#aaa", textDecoration: "line-through" }}>{r.label}</p>
                {r.time && <p style={{ margin: 0, fontSize: "12px", color: "#ccc" }}>{r.time}</p>}
              </div>
              <button onClick={() => restore(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a90e2", fontSize: "13px", fontFamily: "inherit", fontWeight: "500" }}>Restore</button>
              <button onClick={() => deleteArchived(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "20px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Caregiver Sub-Pages ────────────────────────────────────────────────────
function CaregiverRemindersPage({ reminders, setReminders, session, onBack }) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editRepeat, setEditRepeat] = useState("none");

  const toggle = async (id) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    const nowDone = !reminder.done;
    await supabase.from('reminders').update({ done: nowDone }).eq('id', id);
    if (nowDone) {
      await supabase.from('reminders').update({ archived: true }).eq('id', id);
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, done: true, archived: true } : r));
    } else {
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, done: false } : r));
    }
  };

  const startEdit = (reminder) => {
    setEditingId(reminder.id);
    setEditLabel(reminder.label);
    setEditTime(reminder.time);
    setEditDate(reminder.date || "");
    setEditRepeat(reminder.repeat || "none");
  };

  const saveEdit = async () => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let displayTime = editTime;
    let displayDate = editDate;
    let section = "today";
    if (editDate) {
      const d = new Date(editDate + "T00:00:00");
      const todayMidnight = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      const picked = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (picked > todayMidnight) { section = "upcoming"; displayDate = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`; }
    }
    await supabase.from('reminders').update({ label: editLabel, time: displayTime, date: displayDate, repeat: editRepeat, section }).eq('id', editingId);
    const updatedId = editingId;
    setEditingId(null);
    setReminders((prev) => prev.map((r) => r.id === updatedId ? { ...r, label: editLabel, time: displayTime, date: displayDate, repeat: editRepeat, section } : r));
  };

  const deleteReminder = async (id) => {
    await supabase.from('reminders').delete().eq('id', id);
    setReminders((prev) => prev.filter((x) => x.id !== id));
  };

  const cancelEdit = () => setEditingId(null);
  const activeReminders = reminders.filter((r) => !r.archived);
  const archivedReminders = reminders.filter((r) => r.archived);
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const parseToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [t, ap] = timeStr.split(" ");
    let [h, m] = t.split(":").map(Number);
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };
  const overdueItems = activeReminders.filter((r) => {
    const mins = parseToMinutes(r.time);
    return r.section === "today" && !r.done && mins !== null && mins < currentMinutes;
  });
  const todayItems = activeReminders.filter((r) => {
    return r.section === "today" && !r.done && !overdueItems.includes(r);
  });
  const upcomingItems = activeReminders.filter((r) => r.section === "upcoming");
  const repeatLabel = (val) => { const f = repeatOptions.find((o) => o.value === val); return f && val !== "none" ? f.label : null; };

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: "15px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };

  const SectionLabel = ({ label, color }) => (
    <p style={{ margin: "20px 20px 4px 20px", fontSize: "12px", fontWeight: "600", color: color || "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
  );

  const ReminderItem = ({ reminder }) => {
    const sub = [reminder.date, reminder.time, repeatLabel(reminder.repeat)].filter(Boolean).join(" · ");
    const isEditing = editingId === reminder.id;

    if (isEditing) {
      return (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input style={inputStyle} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Reminder title" />
            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#aaa" }}>
              Current: {reminder.time || "no time"}{reminder.date ? ` · ${reminder.date}` : ""}
            </p>
            <input type="time" style={inputStyle} value={editTime} onChange={(e) => setEditTime(e.target.value)} />
            <input type="date" style={inputStyle} value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {repeatOptions.map((opt) => (
                <button key={opt.value} onClick={() => setEditRepeat(opt.value)} style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid", borderColor: editRepeat === opt.value ? "#4a90e2" : "#eee", backgroundColor: editRepeat === opt.value ? "#eef4ff" : "#fff", color: editRepeat === opt.value ? "#4a90e2" : "#888", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>{opt.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={saveEdit} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#4a90e2", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Save</button>
              <button onClick={cancelEdit} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#f0f0f0", color: "#888", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
        <div onClick={() => toggle(reminder.id)} style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "2px", border: reminder.done ? "none" : "2px solid #ccc", backgroundColor: reminder.done ? "#4a90e2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", cursor: "pointer" }}>
          {reminder.done && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px 0", fontSize: "17px", color: reminder.done ? "#aaa" : "#333", textDecoration: reminder.done ? "line-through" : "none" }}>{reminder.label}</p>
          {sub ? <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>{sub}</p> : null}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
          <button onClick={() => startEdit(reminder)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a90e2", fontSize: "13px", fontFamily: "inherit", fontWeight: "500", padding: "0" }}>Edit</button>
          <button onClick={() => deleteReminder(reminder.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "20px", paddingLeft: "4px" }}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1200, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
          <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onBack} />
          <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Reminders</h2>
        </div>
        {overdueItems.length > 0 && (
  <>
    <SectionLabel label="Overdue" color="#e25555" />
    {overdueItems.map((r) => <ReminderItem key={r.id} reminder={r} />)}
  </>
)}
{todayItems.length > 0 && <><SectionLabel label="Today" />{todayItems.map((r) => <ReminderItem key={r.id} reminder={r} />)}</>}
        {upcomingItems.length > 0 && <><SectionLabel label="Upcoming" />{upcomingItems.map((r) => <ReminderItem key={r.id} reminder={r} />)}</>}
        {activeReminders.length === 0 && archivedReminders.length === 0 && <p style={{ textAlign: "center", color: "#aaa", fontSize: "16px", marginTop: "60px" }}>No reminders yet.</p>}
        {archivedReminders.length > 0 && <ArchiveSection reminders={archivedReminders} setReminders={setReminders} />}
        <div style={{ padding: "20px" }}>
          <button onClick={() => setShowAddSheet(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#f5f5f5", border: "none", fontSize: "16px", color: "#555", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={18} color="#555" /> Add Reminder
          </button>
        </div>
      </div>
      {showAddSheet && <AddReminderSheet onClose={() => setShowAddSheet(false)} onSave={async (r) => {
        const { data } = await supabase.from('reminders').insert({ profile_id: session?.user?.id, label: r.label, time: r.time, date: r.date, repeat: r.repeat, section: r.section, done: false }).select().single();
        if (data) setReminders((prev) => [...prev, { ...r, id: data.id }]);
      }} />}
    </>
  );
}

function MedArchiveSection({ medications, setMedicationList }) {
  const [expanded, setExpanded] = useState(false);
  const archived = medications.filter((m) => m.archived);

  const restore = async (id) => {
    await supabase.from('medications').update({ archived: false }).eq('id', id);
    setMedicationList((prev) => prev.map((m) => m.id === id ? { ...m, archived: false } : m));
  };

  const deleteMed = async (id) => {
    await supabase.from('medications').delete().eq('id', id);
    setMedicationList((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <div onClick={() => setExpanded((p) => !p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>Archive ({archived.length})</p>
        <ChevronRight size={16} color="#ccc" style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </div>
      {expanded && (
        <div>
          <p style={{ margin: "10px 0 12px 0", fontSize: "12px", color: "#bbb" }}>Archived medications are kept for reference and can be restored at any time.</p>
          {archived.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#aaa", textDecoration: "line-through" }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#ccc" }}>{m.dosage} — {m.time}</p>
              </div>
              <button onClick={() => restore(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a90e2", fontSize: "13px", fontFamily: "inherit", fontWeight: "500" }}>Restore</button>
              <button onClick={() => deleteMed(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "20px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaregiverMedicationsPage({ medicationList, setMedicationList, sharedReminders, setSharedReminders, session, onBack }) {
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTime, setNewTime] = useState("Morning");
  const [createReminder, setCreateReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  const inputStyle = { width: "100%", padding: "12px 14px", fontSize: "15px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };
  const addBtnStyle = (active) => ({ width: "100%", padding: "13px", borderRadius: "10px", border: "none", backgroundColor: active ? "#4a90e2" : "#ddd", color: active ? "white" : "#aaa", fontSize: "15px", cursor: active ? "pointer" : "default", fontFamily: "inherit", fontWeight: "500" });

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { data } = await supabase.from('medications').insert({ profile_id: session?.user?.id, name: newName.trim(), dosage: newDosage.trim(), time: newTime }).select().single();
    if (data) setMedicationList((prev) => [...prev, { id: data.id, name: data.name, dosage: data.dosage, time: data.time }]);

    if (createReminder) {
      let displayTime = "";
      if (reminderTime) {
        const [h, m] = reminderTime.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 || 12;
        displayTime = `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
      }
      const { data: rData } = await supabase.from('reminders').insert({ profile_id: session?.user?.id, label: `Take ${newName.trim()}${newDosage.trim() ? ` ${newDosage.trim()}` : ""}`, time: displayTime, date: "", repeat: "daily", section: "today", done: false }).select().single();
      if (rData) setSharedReminders((prev) => [...prev, { id: rData.id, label: rData.label, time: rData.time, date: rData.date, repeat: rData.repeat, section: rData.section, done: rData.done }]);
    }
    setNewName(""); setNewDosage(""); setNewTime("Morning"); setCreateReminder(false); setReminderTime("");
  };

  const deleteMed = async (id) => {
    await supabase.from('medications').update({ archived: true }).eq('id', id);
    setMedicationList((prev) => prev.map((m) => m.id === id ? { ...m, archived: true } : m));
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1200, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onBack} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Medications</h2>
      </div>
      <div style={{ padding: "24px 20px" }}>
        {medicationList.filter((m) => !m.archived).length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "15px", marginBottom: "24px" }}>No medications yet.</p>
        )}
        {medicationList.filter((m) => !m.archived).map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div>
              <p style={{ margin: "0 0 2px 0", fontSize: "16px", color: "#333" }}>{m.name}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>{m.dosage} — {m.time}</p>
            </div>
            <button onClick={() => deleteMed(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "13px", fontFamily: "inherit", paddingLeft: "12px" }}>Archive</button>
          </div>
        ))}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {medicationList.filter((m) => m.archived).length > 0 && (
            <MedArchiveSection medications={medicationList} setMedicationList={setMedicationList} />
          )}
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Add New</p>
          <input style={inputStyle} placeholder="Medication name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Dosage (e.g. 10mg)" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} />
            <select value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
              <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option>
            </select>
          </div>
          <div onClick={() => setCreateReminder((p) => !p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #eee", cursor: "pointer" }}>
            <p style={{ margin: 0, fontSize: "15px", color: "#333" }}>Also create a reminder</p>
            <div style={{ width: "44px", height: "26px", borderRadius: "13px", padding: "3px", backgroundColor: createReminder ? "#4a90e2" : "#ddd", display: "flex", alignItems: "center", justifyContent: createReminder ? "flex-end" : "flex-start", transition: "all 0.2s" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "white" }} />
            </div>
          </div>
          {createReminder && (
            <div>
              <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#aaa", fontWeight: "500" }}>Reminder time</p>
              <input type="time" style={inputStyle} value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
            </div>
          )}
          <button style={addBtnStyle(newName.trim().length > 0)} onClick={handleAdd}>Add Medication</button>
        </div>
      </div>
    </div>
  );
}

function CaregiverContactsPage({ contactList, setContactList, session, onBack }) {
  const [newName, setNewName] = useState("");
  const [newRel, setNewRel] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const inputStyle = { width: "100%", padding: "12px 14px", fontSize: "15px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };
  const addBtnStyle = (active) => ({ width: "100%", padding: "13px", borderRadius: "10px", border: "none", backgroundColor: active ? "#4a90e2" : "#ddd", color: active ? "white" : "#aaa", fontSize: "15px", cursor: active ? "pointer" : "default", fontFamily: "inherit", fontWeight: "500" });

  const deleteContact = async (id) => {
    await supabase.from('contacts').delete().eq('id', id);
    setContactList((prev) => prev.filter((x) => x.id !== id));
  };

  const addContact = async () => {
    if (!newName.trim()) return;
    const { data } = await supabase.from('contacts').insert({ profile_id: session?.user?.id, name: newName.trim(), relationship: newRel.trim(), phone: newPhone.trim() }).select().single();
    if (data) setContactList((prev) => [...prev, { id: data.id, name: data.name, relationship: data.relationship, phone: data.phone }]);
    setNewName(""); setNewRel(""); setNewPhone("");
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1200, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onBack} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Contacts</h2>
      </div>
      <div style={{ padding: "24px 20px" }}>
        {contactList.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "15px", marginBottom: "24px" }}>No contacts yet.</p>
        )}
        {contactList.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div>
              <p style={{ margin: "0 0 2px 0", fontSize: "16px", color: "#333" }}>{c.name}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>{c.relationship} · {c.phone}</p>
            </div>
            <button onClick={() => deleteContact(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "20px", paddingLeft: "12px" }}>✕</button>
          </div>
        ))}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Add New</p>
          <input style={inputStyle} placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input style={inputStyle} placeholder="Relationship (e.g. Daughter)" value={newRel} onChange={(e) => setNewRel(e.target.value)} />
          <input style={inputStyle} placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <button style={addBtnStyle(newName.trim().length > 0)} onClick={addContact}>Add Contact</button>
        </div>
      </div>
    </div>
  );
}

// ── Family Members Page (with Supabase Storage) ────────────────────────────
function FamilyMembersPage({ familyMembers, setFamilyMembers, session, onBack }) {
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputStyle = { width: "100%", padding: "12px 14px", fontSize: "15px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };

  const handleImageChange = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToStorage(file, session.user.id, 'family');
    if (!url) return;
    await supabase.from('family_members').update({ image: url }).eq('id', id);
    setFamilyMembers((prev) => prev.map((m) => m.id === id ? { ...m, image: url } : m));
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const deleteMember = async (id) => {
    await supabase.from('family_members').delete().eq('id', id);
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const addMember = async () => {
    if (!newName.trim()) return;
    setUploading(true);
    let imageUrl = "";
    if (newImageFile) {
      const uploaded = await uploadToStorage(newImageFile, session.user.id, 'family');
      if (uploaded) imageUrl = uploaded;
    }
    const { data } = await supabase.from('family_members').insert({ profile_id: session?.user?.id, name: newName.trim(), relationship: newRelationship.trim(), image: imageUrl, sort_order: familyMembers.length }).select().single();
    if (data) setFamilyMembers((prev) => [...prev, { id: data.id, name: data.name, relationship: data.relationship, image: data.image }]);
    setNewName(""); setNewRelationship(""); setNewImageFile(null); setNewImagePreview("");
    setUploading(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1200, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onBack} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Family Photos</h2>
      </div>
      <div style={{ padding: "20px" }}>
        {familyMembers.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "15px", marginBottom: "24px" }}>No photos added yet.</p>
        )}
        {familyMembers.map((member) => (
          <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: "#ddd" }}>
              {member.image ? <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", backgroundColor: "#c8d8f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#4a90e2", fontWeight: "600" }}>{member.name.charAt(0)}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px 0", fontSize: "16px", color: "#333" }}>{member.name}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>{member.relationship}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label style={{ fontSize: "13px", color: "#4a90e2", cursor: "pointer", fontWeight: "500" }}>
                Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageChange(e, member.id)} />
              </label>
              <button onClick={() => deleteMember(member.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "20px" }}>✕</button>
            </div>
          </div>
        ))}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Add Person</p>
          <input style={inputStyle} placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input style={inputStyle} placeholder="Relationship (e.g. Your Son)" value={newRelationship} onChange={(e) => setNewRelationship(e.target.value)} />
          {newImagePreview && (
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", border: "2px solid #eee" }}>
              <img src={newImagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <label style={{ fontSize: "14px", color: "#4a90e2", cursor: "pointer", fontWeight: "500" }}>
            {newImagePreview ? "Change Photo" : "Select Photo"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleNewImageChange} />
          </label>
          <button onClick={addMember} disabled={uploading} style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", backgroundColor: newName.trim() && !uploading ? "#4a90e2" : "#ddd", color: newName.trim() && !uploading ? "white" : "#aaa", fontSize: "15px", cursor: newName.trim() && !uploading ? "pointer" : "default", fontFamily: "inherit", fontWeight: "500" }}>
            {uploading ? "Uploading..." : "Add Person"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Caregiver Settings Page (with Supabase Storage) ────────────────────────
function CaregiverSettingsPage({ patientInfo, setPatientInfo, session, onBack }) {
  const [name, setName] = useState(patientInfo.name);
  const [bio, setBio] = useState(patientInfo.bio);
  const [birthday, setBirthday] = useState(patientInfo.birthday);
  const [address, setAddress] = useState(patientInfo.address);
  const [photo, setPhoto] = useState(patientInfo.photo || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [pin, setPin] = useState(patientInfo.pin || "1234");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(patientInfo.name);
    setBio(patientInfo.bio);
    setBirthday(patientInfo.birthday);
    setAddress(patientInfo.address);
    setPhoto(patientInfo.photo || null);
    setPin(patientInfo.pin || "1234");
  }, [patientInfo]);

  const inputStyle = { width: "100%", padding: "12px 14px", fontSize: "15px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };
  const labelStyle = { display: "block", fontSize: "13px", color: "#aaa", marginBottom: "6px", fontWeight: "500" };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
  };

  const computeAge = (bday) => {
    const parts = bday.split(" ");
    if (parts.length !== 3) return patientInfo.age;
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const month = months.indexOf(parts[0]);
    const day = parseInt(parts[1].replace(",", ""));
    const year = parseInt(parts[2]);
    if (month === -1 || isNaN(day) || isNaN(year)) return patientInfo.age;
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) age--;
    return age;
  };

  const handleSave = async () => {
    setUploading(true);
    let finalPhoto = photo;
    if (photoFile) {
      const uploaded = await uploadToStorage(photoFile, session.user.id, 'profile');
      if (uploaded) finalPhoto = uploaded;
    }
    const age = computeAge(birthday);
    const updatedInfo = { ...patientInfo, name, bio, birthday, address, photo: finalPhoto, age, pin };
    setPatientInfo(updatedInfo);
    if (patientInfo.profileId) {
      await supabase.from('patient_info').update({ name, bio, birthday, address, photo: finalPhoto, age, pin }).eq('profile_id', patientInfo.profileId);
    }
    setPhotoFile(null);
    setUploading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1200, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onBack} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Patient Profile</h2>
      </div>
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", paddingBottom: "8px" }}>
          <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "#ddd", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#aaa", fontWeight: "600" }}>
            {photo ? <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name.charAt(0)}
          </div>
          <label style={{ fontSize: "14px", color: "#4a90e2", cursor: "pointer", fontWeight: "500" }}>
            {photo ? "Change Photo" : "Add Photo"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </label>
        </div>
        <div><label style={labelStyle}>Name</label><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label style={labelStyle}>Bio</label><textarea style={{ ...inputStyle, height: "80px", resize: "none" }} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Birthday</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <select value={birthday.split(" ")[0] || ""} onChange={(e) => { const parts = birthday.split(" "); setBirthday(`${e.target.value} ${parts[1] || ""} ${parts[2] || ""}`.trim()); }} style={{ ...inputStyle, flex: 2 }}>
              <option value="">Month</option>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={birthday.split(" ")[1]?.replace(",","") || ""} onChange={(e) => { const parts = birthday.split(" "); setBirthday(`${parts[0] || ""} ${e.target.value}, ${parts[2] || ""}`.trim()); }} style={{ ...inputStyle, flex: 1 }}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input placeholder="Year" value={birthday.split(" ")[2] || ""} onChange={(e) => { const parts = birthday.split(" "); setBirthday(`${parts[0] || ""} ${parts[1] || ""} ${e.target.value}`.trim()); }} style={{ ...inputStyle, flex: 1 }} />
          </div>
        </div>
        <div><label style={labelStyle}>Address</label><input style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Caregiver PIN</label>
          <input style={inputStyle} value={pin} maxLength={4} placeholder="4-digit PIN" onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </div>
        <button onClick={handleSave} disabled={uploading} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", backgroundColor: saved ? "#5cb85c" : "#4a90e2", color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "background-color 0.3s" }}>
          {uploading ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function CaregiverRoutinePage({ routineData, setRoutineData, session, onBack }) {
  const [newLabels, setNewLabels] = useState({ Morning: "", Afternoon: "", Evening: "" });
  const [newTimes, setNewTimes] = useState({ Morning: "", Afternoon: "", Evening: "" });

  const inputStyle = { width: "100%", padding: "10px 12px", fontSize: "15px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const deleteItem = async (section, id) => {
    await supabase.from('routine_items').delete().eq('id', id);
    setRoutineData((prev) => prev.map((g) => g.section === section ? { ...g, items: g.items.filter((i) => i.id !== id) } : g));
  };

  const addItem = async (section) => {
    const label = newLabels[section].trim();
    const rawTime = newTimes[section];
    if (!label) return;
    let displayTime = ""; let minutes = 0;
    if (rawTime) {
      const [h, m] = rawTime.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      displayTime = `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
      minutes = h * 60 + m;
    }
    const isPast = minutes < currentMinutes;
    const { data } = await supabase.from('routine_items').insert({
      profile_id: session?.user?.id,
      section,
      label,
      time: displayTime,
      done: isPast,
      sort_order: Date.now(),
    }).select().single();

    if (data) {
      setRoutineData((prev) => prev.map((g) => {
        if (g.section !== section) return g;
        const newItem = { id: data.id, label, time: displayTime, done: isPast };
        return { ...g, items: [...g.items, newItem].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)) };
      }));
    }
    setNewLabels((prev) => ({ ...prev, [section]: "" }));
    setNewTimes((prev) => ({ ...prev, [section]: "" }));
  };

  const sectionColors = {
    Morning: { bg: "#fff8ee", border: "#fde8c0", label: "#d4900a" },
    Afternoon: { bg: "#eef4ff", border: "#c8d8f5", label: "#4a90e2" },
    Evening: { bg: "#f3f0ff", border: "#d8cff5", label: "#7c5cbf" },
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1200, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onBack} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Daily Routine</h2>
      </div>
      <div style={{ padding: "20px" }}>
        {routineData.map((group) => {
          const colors = sectionColors[group.section];
          return (
            <div key={group.section} style={{ marginBottom: "24px" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "600", color: colors.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>{group.section}</p>
              <div style={{ backgroundColor: colors.bg, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden", marginBottom: "10px" }}>
                {group.items.length === 0 && (
                  <p style={{ margin: 0, padding: "16px", fontSize: "14px", color: "#bbb", textAlign: "center" }}>No activities yet.</p>
                )}
                {group.items.map((item, index) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: index < group.items.length - 1 ? `1px solid ${colors.border}` : "none", opacity: item.done ? 0.45 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#333", textDecoration: item.done ? "line-through" : "none" }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: colors.label }}>{item.time}</p>
                    </div>
                    <button onClick={() => deleteItem(group.section, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "18px", flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input style={inputStyle} placeholder="New activity" value={newLabels[group.section]} onChange={(e) => setNewLabels((prev) => ({ ...prev, [group.section]: e.target.value }))} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="time" style={{ ...inputStyle, flex: 1 }} value={newTimes[group.section]} onChange={(e) => setNewTimes((prev) => ({ ...prev, [group.section]: e.target.value }))} />
                  <button onClick={() => addItem(group.section)} style={{ padding: "10px 16px", borderRadius: "10px", border: "none", backgroundColor: newLabels[group.section].trim() ? colors.label : "#ddd", color: newLabels[group.section].trim() ? "white" : "#aaa", fontSize: "14px", cursor: newLabels[group.section].trim() ? "pointer" : "default", fontFamily: "inherit", fontWeight: "500", whiteSpace: "nowrap" }}>Add</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Caregiver Dashboard ────────────────────────────────────────────────────
function CaregiverDashboard({ onLock, session, sharedReminders, setSharedReminders, sharedRoutine, setSharedRoutine, sharedMedications, setSharedMedications, sharedContacts, setSharedContacts, sharedPatientInfo, setSharedPatientInfo, familyMembers, setFamilyMembers }) {
  useBodyScrollLock(true);
  const [activePage, setActivePage] = useState(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const reminders = sharedReminders;
  const setReminders = setSharedReminders;
  const medicationList = sharedMedications;
  const setMedicationList = setSharedMedications;
  const contactList = sharedContacts;
  const setContactList = setSharedContacts;
  const routineData = sharedRoutine;
  const setRoutineData = setSharedRoutine;

  const completedToday = reminders.filter((r) => r.section === "today" && r.done).length;
  const totalToday = reminders.filter((r) => r.section === "today").length;
  const nextReminder = reminders.find((r) => r.section === "today" && !r.done);

  if (activePage === "reminders") return <CaregiverRemindersPage reminders={reminders} setReminders={setReminders} session={session} onBack={() => setActivePage(null)} />;
  if (activePage === "medications") return <CaregiverMedicationsPage medicationList={medicationList} setMedicationList={setMedicationList} sharedReminders={reminders} setSharedReminders={setReminders} session={session} onBack={() => setActivePage(null)} />;
  if (activePage === "contacts") return <CaregiverContactsPage contactList={contactList} setContactList={setContactList} session={session} onBack={() => setActivePage(null)} />;
  if (activePage === "routine") return <CaregiverRoutinePage routineData={routineData} setRoutineData={setRoutineData} session={session} onBack={() => setActivePage(null)} />;
  if (activePage === "settings") return <CaregiverSettingsPage patientInfo={sharedPatientInfo} setPatientInfo={setSharedPatientInfo} session={session} onBack={() => setActivePage(null)} />;
  if (activePage === "photos") return <FamilyMembersPage familyMembers={familyMembers} setFamilyMembers={setFamilyMembers} session={session} onBack={() => setActivePage(null)} />;

  const caregiverMenuItems = [
    { label: "Reminders", icon: Bell, key: "reminders", count: `${completedToday}/${totalToday} done` },
    { label: "Medications", icon: Pill, key: "medications", count: `${medicationList.filter((m) => !m.archived).length} medications` },
    { label: "Contacts", icon: Phone, key: "contacts", count: `${contactList.length} contacts` },
    { label: "Routine", icon: ClipboardList, key: "routine", count: `${routineData.reduce((acc, g) => acc + g.items.length, 0)} activities` },
    { label: "Photos", icon: Camera, key: "photos", count: `${familyMembers.length} people` },
    { label: "Settings", icon: Settings, key: "settings", count: "Patient profile" },
  ];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1100, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Caregiver View</h2>
        <button onClick={onLock} style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #eee", backgroundColor: "#f5f5f5", fontSize: "14px", color: "#888", cursor: "pointer", fontFamily: "inherit" }}>Lock</button>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ backgroundColor: "#f0f4ff", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#c8d8f5", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#4a90e2", fontWeight: "600" }}>
              {sharedPatientInfo.photo ? <img src={sharedPatientInfo.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : sharedPatientInfo.name.charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "18px", color: "#333", fontWeight: "600" }}>{sharedPatientInfo.name}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>{sharedPatientInfo.address}</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #dce8fb", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>Today's reminders</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#4a90e2", fontWeight: "500" }}>{completedToday} of {totalToday} completed</p>
            </div>
            {nextReminder && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>Up next</p>
                <p style={{ margin: 0, fontSize: "14px", color: "#333", fontWeight: "500" }}>{nextReminder.label}{nextReminder.time ? ` · ${nextReminder.time}` : ""}</p>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>Medications</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#333", fontWeight: "500" }}>{medicationList.filter((m) => !m.archived).length} active</p>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {caregiverMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} onClick={() => setActivePage(item.key)} style={{ backgroundColor: "#f5f5f5", borderRadius: "16px", padding: "20px", cursor: "pointer" }}>
                <Icon size={30} color="#555" />
                <p style={{ fontSize: "16px", margin: "10px 0 4px 0", color: "#333", fontWeight: "500" }}>{item.label}</p>
                <p style={{ fontSize: "12px", margin: 0, color: "#aaa" }}>{item.count}</p>
              </div>
            );
          })}
        </div>

        {/* Sign out — buried at bottom, requires confirmation */}
        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
          {!showSignOutConfirm ? (
            <button onClick={() => setShowSignOutConfirm(true)} style={{ background: "none", border: "none", fontSize: "13px", color: "#ccc", cursor: "pointer", fontFamily: "inherit" }}>
              Sign Out
            </button>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#888" }}>Are you sure you want to sign out?</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={() => supabase.auth.signOut()} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", backgroundColor: "#e25555", color: "white", fontSize: "14px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>Sign Out</button>
                <button onClick={() => setShowSignOutConfirm(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", backgroundColor: "#f0f0f0", color: "#888", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────
function SettingsPage({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1100, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onClose} />
        <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>{title}</h2>
      </div>
      <div style={{ padding: "24px 20px" }}>{children}</div>
    </div>
  );
}

function SettingsScreen({ onClose, session, sharedReminders, setSharedReminders, sharedRoutine, setSharedRoutine, sharedMedications, setSharedMedications, sharedContacts, setSharedContacts, sharedPatientInfo, setSharedPatientInfo, familyMembers, setFamilyMembers }) {
  useBodyScrollLock(true);
  const [page, setPage] = useState(null);

  if (page === "personal") {
    const computedAge = sharedPatientInfo.birthday ? (() => {
      const parts = sharedPatientInfo.birthday.split(" ");
      if (parts.length === 3) {
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const month = months.indexOf(parts[0]);
        const day = parseInt(parts[1].replace(",", ""));
        const year = parseInt(parts[2]);
        if (month !== -1 && !isNaN(day) && !isNaN(year)) {
          const today = new Date();
          let age = today.getFullYear() - year;
          if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) age--;
          return age;
        }
      }
      return null;
    })() : null;

    return (
      <SettingsPage title="Personal Information" onClose={() => setPage(null)}>
        <div style={{ marginBottom: "20px" }}><p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa" }}>About</p><p style={{ margin: 0, fontSize: "18px", color: "#333", lineHeight: "1.5" }}>{sharedPatientInfo.bio}</p></div>
        <div style={{ marginBottom: "20px" }}><p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa" }}>Birthday</p><p style={{ margin: 0, fontSize: "20px", color: "#333" }}>{sharedPatientInfo.birthday}</p></div>
        {computedAge !== null && <div style={{ marginBottom: "20px" }}><p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa" }}>Age</p><p style={{ margin: 0, fontSize: "20px", color: "#333" }}>{computedAge}</p></div>}
        <div><p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#aaa" }}>Address</p><p style={{ margin: 0, fontSize: "20px", color: "#333" }}>{sharedPatientInfo.address}</p></div>
      </SettingsPage>
    );
  }

  if (page === "medications") {
    const activeMeds = sharedMedications.filter((m) => !m.archived);
    const archivedMeds = sharedMedications.filter((m) => m.archived);
    return (
      <SettingsPage title="My Medications" onClose={() => setPage(null)}>
        {activeMeds.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "15px", marginTop: "20px" }}>No medications yet.</p>
        ) : activeMeds.map((med) => (
          <div key={med.id} style={{ backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#333", fontWeight: "bold" }}>{med.name}</p>
            <p style={{ margin: 0, fontSize: "16px", color: "#888" }}>{med.dosage} — {med.time}</p>
          </div>
        ))}
        {archivedMeds.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <button onClick={() => setPage("medicationsArchive")} style={{ background: "none", border: "none", fontSize: "13px", color: "#aaa", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
              View past medications ({archivedMeds.length})
            </button>
          </div>
        )}
      </SettingsPage>
    );
  }

  if (page === "medicationsArchive") {
    return (
      <SettingsPage title="Past Medications" onClose={() => setPage("medications")}>
        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#bbb" }}>These medications are no longer active but are kept for reference.</p>
        {sharedMedications.filter((m) => m.archived).map((med) => (
          <div key={med.id} style={{ backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#aaa", fontWeight: "bold", textDecoration: "line-through" }}>{med.name}</p>
            <p style={{ margin: 0, fontSize: "15px", color: "#ccc" }}>{med.dosage} — {med.time}</p>
          </div>
        ))}
      </SettingsPage>
    );
  }

  if (page === "remindersArchive") {
    const archived = sharedReminders.filter((r) => r.archived);
    return (
      <SettingsPage title="Past Reminders" onClose={() => setPage(null)}>
        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#bbb" }}>Completed reminders are kept here for 30 days.</p>
        {archived.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "15px", marginTop: "20px" }}>No archived reminders.</p>
        ) : archived.map((r) => (
          <div key={r.id} style={{ padding: "14px 0", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: "16px", color: "#aaa", textDecoration: "line-through" }}>{r.label}</p>
            {r.time && <p style={{ margin: 0, fontSize: "13px", color: "#ccc" }}>{r.time}</p>}
          </div>
        ))}
      </SettingsPage>
    );
  }

  if (page === "contacts") {
    return (
      <SettingsPage title="My Contacts" onClose={() => setPage(null)}>
        {sharedContacts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "15px", marginTop: "20px" }}>No contacts yet.</p>
        ) : sharedContacts.map((contact) => (
          <div key={contact.id} style={{ backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#333", fontWeight: "bold" }}>{contact.name}</p>
            <p style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#888" }}>{contact.relationship}</p>
            <p style={{ margin: 0, fontSize: "16px", color: "#555" }}>{contact.phone}</p>
          </div>
        ))}
      </SettingsPage>
    );
  }

  if (page === "photosView") {
    return <FamilyMembersPage familyMembers={familyMembers} setFamilyMembers={setFamilyMembers} session={session} onBack={() => setPage(null)} />;
  }

  if (page === "caregiver") return <CaregiverPINScreen onClose={() => setPage(null)} onUnlock={() => setPage("unlocking")} correctPin={sharedPatientInfo.pin} />;

  if (page === "unlocking") {
    return (
      <>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1999, maxWidth: "390px", margin: "0 auto" }} />
        <CaregiverTransition direction="unlock" onComplete={() => setPage("dashboard")} />
      </>
    );
  }

  if (page === "dashboard") {
    return (
      <CaregiverDashboard
        onLock={() => setPage("locking")}
        session={session}
        sharedReminders={sharedReminders} setSharedReminders={setSharedReminders}
        sharedRoutine={sharedRoutine} setSharedRoutine={setSharedRoutine}
        sharedMedications={sharedMedications} setSharedMedications={setSharedMedications}
        sharedContacts={sharedContacts} setSharedContacts={setSharedContacts}
        sharedPatientInfo={sharedPatientInfo} setSharedPatientInfo={setSharedPatientInfo}
        familyMembers={familyMembers} setFamilyMembers={setFamilyMembers}
      />
    );
  }

  if (page === "locking") return <CaregiverTransition direction="lock" onComplete={() => { setPage(null); onClose(); }} />;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1000, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 20px 0 20px" }}>
        <X size={28} color="#555" style={{ cursor: "pointer" }} onClick={onClose} />
      </div>
      <div style={{ textAlign: "center", padding: "10px 20px 30px 20px", borderBottom: "1px solid #eee" }}>
        <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#ddd", margin: "0 auto 16px auto", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", color: "#aaa", fontWeight: "600" }}>
          {sharedPatientInfo.photo ? <img src={sharedPatientInfo.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : sharedPatientInfo.name.charAt(0)}
        </div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", color: "#333" }}>{sharedPatientInfo.name}</h2>
        <p style={{ margin: 0, fontSize: "16px", color: "#888", lineHeight: "1.5" }}>{sharedPatientInfo.bio}</p>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {[
          { key: "personal", label: "Personal Information", icon: Settings },
          { key: "medications", label: "My Medications", icon: Pill },
          { key: "contacts", label: "My Contacts", icon: Phone },
          { key: "photosView", label: "Family Photos", icon: Camera },
          { key: "remindersArchive", label: "Past Reminders", icon: Bell },
          { key: "caregiver", label: "Caregiver Access", icon: ChevronRight },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} onClick={() => setPage(item.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: "1px solid #eee", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Icon size={20} color="#aaa" />
                <p style={{ margin: 0, fontSize: "18px", color: "#333" }}>{item.label}</p>
              </div>
              <ChevronRight size={20} color="#ccc" />
            </div>
          );
        })}
      </div>

      {/* Sign out — buried at bottom, requires confirmation */}
      <div style={{ textAlign: "center", padding: "30px 20px" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#bbb" }}>Remembrit</p>
        <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#ccc" }}>Version 0.1.0</p>
      </div>
    </div>
  );
}

// ── Add Reminder Sheet ─────────────────────────────────────────────────────
function AddReminderSheet({ onClose, onSave }) {
  const [label, setLabel] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [repeat, setRepeat] = useState("none");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 300); };

  const handleSave = () => {
    if (!label.trim()) return;
    const today = new Date();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let displayTime = "";
    if (time) {
      const [h, m] = time.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 || 12;
      displayTime = `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
    }
    let displayDate = ""; let section = "today";
    if (date) {
      const d = new Date(date + "T00:00:00");
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const picked = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (picked > todayMidnight) { section = "upcoming"; displayDate = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`; }
    }
    onSave({ id: Date.now(), label: label.trim(), time: displayTime, date: displayDate, repeat, section, done: false });
    handleClose();
  };

  const inputStyle = { width: "100%", padding: "14px", fontSize: "16px", border: "1px solid #eee", borderRadius: "12px", fontFamily: "inherit", color: "#333", backgroundColor: "#fafafa", boxSizing: "border-box", outline: "none" };
  const labelStyle = { display: "block", fontSize: "13px", color: "#aaa", marginBottom: "6px", fontWeight: "500" };

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1200, transition: "opacity 0.3s", opacity: visible ? 1 : 0 }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: "390px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "20px 20px 0 0", zIndex: 1300, padding: "0 20px 40px 20px", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.3s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 20px 0" }}>
          <div style={{ width: "40px", height: "4px", borderRadius: "2px", backgroundColor: "#ddd" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>New Reminder</h2>
          <X size={22} color="#aaa" style={{ cursor: "pointer" }} onClick={handleClose} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>What is the reminder?</label>
          <input style={inputStyle} placeholder="e.g. Take morning medication" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div><label style={labelStyle}>Time</label><input type="time" style={inputStyle} value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: "28px" }}>
          <label style={labelStyle}>Repeat</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {repeatOptions.map((opt) => (
              <button key={opt.value} onClick={() => setRepeat(opt.value)} style={{ padding: "8px 14px", borderRadius: "20px", border: "1px solid", borderColor: repeat === opt.value ? "#4a90e2" : "#eee", backgroundColor: repeat === opt.value ? "#eef4ff" : "#fafafa", color: repeat === opt.value ? "#4a90e2" : "#888", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSave} style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", backgroundColor: label.trim() ? "#4a90e2" : "#ddd", color: label.trim() ? "white" : "#aaa", fontSize: "17px", fontWeight: "600", cursor: label.trim() ? "pointer" : "default", fontFamily: "inherit", transition: "background-color 0.2s" }}>
          Save Reminder
        </button>
      </div>
    </>
  );
}

// ── Routine Overlay ────────────────────────────────────────────────────────
function RoutineOverlay({ onClose, routineData }) {
  useBodyScrollLock(true);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const getCurrentSection = () => { const hour = now.getHours(); if (hour < 12) return "Morning"; if (hour < 17) return "Afternoon"; return "Evening"; };
  const currentSection = getCurrentSection();
  const sectionColors = {
    Morning: { bg: "#fff8ee", border: "#fde8c0", label: "#d4900a" },
    Afternoon: { bg: "#eef4ff", border: "#c8d8f5", label: "#4a90e2" },
    Evening: { bg: "#f3f0ff", border: "#d8cff5", label: "#7c5cbf" },
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1000, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onClose} />
        <h2 style={{ margin: 0, fontSize: "22px", color: "#333" }}>Daily Routine</h2>
      </div>
      <div style={{ padding: "20px" }}>
        {routineData.map((group) => {
          const colors = sectionColors[group.section];
          const isCurrentSection = group.section === currentSection;
          return (
            <div key={group.section} style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: colors.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>{group.section}</p>
                {isCurrentSection && <div style={{ backgroundColor: colors.label, borderRadius: "20px", padding: "2px 10px", fontSize: "11px", color: "white", fontWeight: "500" }}>Now</div>}
              </div>
              <div style={{ backgroundColor: colors.bg, borderRadius: "16px", border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                {group.items.map((item, index) => {
                  const itemMinutes = parseTime(item.time);
                  const isPast = itemMinutes < currentMinutes;
                  const isCurrent = isCurrentSection && index === group.items.findIndex((it) => parseTime(it.time) >= currentMinutes);
                  return (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderBottom: index < group.items.length - 1 ? `1px solid ${colors.border}` : "none", opacity: isPast ? 0.45 : 1 }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, backgroundColor: isCurrent ? colors.label : isPast ? "#ccc" : colors.border, boxShadow: isCurrent ? `0 0 0 3px ${colors.bg}, 0 0 0 5px ${colors.label}` : "none" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 2px 0", fontSize: "16px", color: isCurrent ? "#333" : isPast ? "#aaa" : "#333", fontWeight: isCurrent ? "600" : "normal" }}>{item.label}</p>
                        <p style={{ margin: 0, fontSize: "13px", color: colors.label }}>{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reminders Overlay ──────────────────────────────────────────────────────
function RemindersOverlay({ onClose, reminders, setReminders, session }) {
  useBodyScrollLock(true);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const toggle = async (id) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    const nowDone = !reminder.done;
    await supabase.from('reminders').update({ done: nowDone }).eq('id', id);
    if (nowDone) {
      await supabase.from('reminders').update({ archived: true }).eq('id', id);
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, done: true, archived: true } : r));
    } else {
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, done: false } : r));
    }
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [time, ampm] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };
  const overdueItems = reminders.filter((r) => r.section === "today" && !r.done && parseTimeToMinutes(r.time) !== null && parseTimeToMinutes(r.time) < currentMinutes);
  const todayItems = reminders.filter((r) => r.section === "today" && !overdueItems.includes(r));
  const upcomingItems = reminders.filter((r) => r.section === "upcoming");
  const repeatLabel = (val) => { const f = repeatOptions.find((o) => o.value === val); return f && val !== "none" ? f.label : null; };

  const SectionLabel = ({ label }) => (
    <p style={{ margin: "20px 20px 4px 20px", fontSize: "12px", fontWeight: "600", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
  );

  const ReminderItem = ({ reminder }) => {
    const sub = [reminder.date, reminder.time, repeatLabel(reminder.repeat)].filter(Boolean).join(" · ");
    return (
      <div onClick={() => toggle(reminder.id)} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 20px", borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "2px", border: reminder.done ? "none" : "2px solid #ccc", backgroundColor: reminder.done ? "#4a90e2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          {reminder.done && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px 0", fontSize: "17px", color: reminder.done ? "#aaa" : "#333", textDecoration: reminder.done ? "line-through" : "none" }}>{reminder.label}</p>
          {sub ? <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>{sub}</p> : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1000, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
          <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onClose} />
          <h2 style={{ margin: 0, fontSize: "22px", color: "#333" }}>Reminders</h2>
        </div>
        {overdueItems.length > 0 && (
  <>
    <p style={{ margin: "20px 20px 4px 20px", fontSize: "12px", fontWeight: "600", color: "#e25555", letterSpacing: "0.06em", textTransform: "uppercase" }}>Overdue</p>
    {overdueItems.map((r) => (
      <div key={r.id} onClick={() => toggle(r.id)} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 20px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", backgroundColor: "#fff5f5" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, marginTop: "2px", border: "2px solid #e25555", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px 0", fontSize: "17px", color: "#e25555" }}>{r.label}</p>
          {r.time && <p style={{ margin: 0, fontSize: "13px", color: "#e25555", opacity: 0.7 }}>{r.time} · Overdue</p>}
        </div>
      </div>
    ))}
  </>
)}
        {todayItems.length > 0 && <><SectionLabel label="Today" />{todayItems.map((r) => <ReminderItem key={r.id} reminder={r} />)}</>}
        {upcomingItems.length > 0 && <><SectionLabel label="Upcoming" />{upcomingItems.map((r) => <ReminderItem key={r.id} reminder={r} />)}</>}
        {reminders.filter((r) => !r.archived).length === 0 && <p style={{ textAlign: "center", color: "#aaa", fontSize: "16px", marginTop: "60px" }}>No reminders yet.</p>}
        <div style={{ padding: "20px" }}>
          <button onClick={() => setShowAddSheet(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#f5f5f5", border: "none", fontSize: "16px", color: "#555", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={18} color="#555" /> Add Reminder
          </button>
        </div>
      </div>
      {showAddSheet && <AddReminderSheet onClose={() => setShowAddSheet(false)} onSave={async (r) => {
        const { data } = await supabase.from('reminders').insert({ profile_id: session?.user?.id, label: r.label, time: r.time, date: r.date, repeat: r.repeat, section: r.section, done: false }).select().single();
        if (data) setReminders((prev) => [...prev, { ...r, id: data.id }]);
      }} />}
    </>
  );
}

// ── Photos Overlay ─────────────────────────────────────────────────────────
function PhotosOverlay({ onClose, familyMembers }) {
  useBodyScrollLock(true);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [sliding, setSliding] = useState(null);

  const goLeft = () => { setSliding("right"); setTimeout(() => { setCurrent((prev) => (prev === 0 ? familyMembers.length - 1 : prev - 1)); setSliding(null); }, 400); };
  const goRight = () => { setSliding("left"); setTimeout(() => { setCurrent((prev) => (prev === familyMembers.length - 1 ? 0 : prev + 1)); setSliding(null); }, 400); };
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50) goRight(); else if (diff < -50) goLeft();
    setTouchStart(null);
  };

  if (familyMembers.length === 0) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1000, maxWidth: "390px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
          <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onClose} />
          <h2 style={{ margin: 0, fontSize: "22px", color: "#333" }}>Photos</h2>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#aaa", fontSize: "16px" }}>No photos added yet.</p>
        </div>
      </div>
    );
  }

  const member = familyMembers[current];
  const slideStyle = { transform: sliding === "left" ? "translateX(-100%)" : sliding === "right" ? "translateX(100%)" : "translateX(0)", transition: sliding ? "transform 0.4s ease-in-out" : "none" };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", backgroundColor: "#000", zIndex: 1000, maxWidth: "390px", margin: "0 auto", overflow: "hidden" }}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "20px", display: "flex", justifyContent: "flex-end", background: "linear-gradient(rgba(0,0,0,0.5), transparent)" }}>
        <X size={28} color="white" style={{ cursor: "pointer" }} onClick={onClose} />
      </div>
      <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", ...slideStyle }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.75))", padding: "60px 30px 50px 30px" }}>
        <h1 style={{ margin: "0 0 6px 0", fontSize: "42px", color: "white", fontWeight: "600" }}>{member.name}</h1>
        <p style={{ margin: 0, fontSize: "22px", color: "rgba(255,255,255,0.85)" }}>{member.relationship}</p>
      </div>
      <div style={{ position: "absolute", bottom: "20px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "8px" }}>
        {familyMembers.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: i === current ? "white" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "background-color 0.2s" }} />
        ))}
      </div>
      {familyMembers.length > 1 && (
        <>
          <button onClick={goLeft} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "22px", color: "white", cursor: "pointer" }}>‹</button>
          <button onClick={goRight} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "50%", width: "44px", height: "44px", fontSize: "22px", color: "white", cursor: "pointer" }}>›</button>
        </>
      )}
    </div>
  );
}

// ── Games ──────────────────────────────────────────────────────────────────
function GamesOverlay({ onClose }) {
  useBodyScrollLock(true);
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { key: "memory", label: "Memory Match", description: "Flip cards to find matching pairs" },
    { key: "wordguess", label: "Word Guess", description: "Guess the hidden word one letter at a time" },
    { key: "scramble", label: "Word Scramble", description: "Unscramble the mixed up word" },
    { key: "math", label: "Simple Math", description: "Solve easy addition and subtraction problems" },
  ];

  const GameWrapper = ({ title, children }) => (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1000, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={() => setActiveGame(null)} />
        <h2 style={{ margin: 0, fontSize: "22px", color: "#333" }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  if (activeGame === "memory") return <GameWrapper title="Memory Match"><MemoryMatchGame /></GameWrapper>;
  if (activeGame === "wordguess") return <GameWrapper title="Word Guess"><WordGuessGame /></GameWrapper>;
  if (activeGame === "scramble") return <GameWrapper title="Word Scramble"><WordScrambleGame /></GameWrapper>;
  if (activeGame === "math") return <GameWrapper title="Simple Math"><SimpleMathGame /></GameWrapper>;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", zIndex: 1000, overflowY: "auto", maxWidth: "390px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
        <X size={24} color="#555" style={{ cursor: "pointer", marginRight: "16px" }} onClick={onClose} />
        <h2 style={{ margin: 0, fontSize: "22px", color: "#333" }}>Games</h2>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <p style={{ margin: "0 0 20px 0", fontSize: "15px", color: "#aaa" }}>Choose a game to play.</p>
        {games.map((game) => (
          <div key={game.key} onClick={() => setActiveGame(game.key)} style={{ backgroundColor: "#f5f5f5", borderRadius: "16px", padding: "20px 22px", marginBottom: "14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#333", fontWeight: "500" }}>{game.label}</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#aaa" }}>{game.description}</p>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryMatchGame() {
  const wordPairs = ["Apple","Bird","Cat","Dog","Fish","Hat","Sun","Moon","Tree","Rain","Flower","House","Cup","Book","Chair","Clock","Bread","Milk","Rose","Leaf","Snow","Cloud","Bell","Cake","Shoe","Coat","Ring","Star","Lamp","Door","Boat","Farm","Frog","Corn","Pear","Plum","Sock","Hand","Foot","Nose","Eyes","Smile","Heart","River","Lake","Hill","Road","Park","Barn","Gate"];
  const makeCards = () => {
    const shuffled = [...wordPairs].sort(() => Math.random() - 0.5).slice(0, 6);
    const pairs = [...shuffled, ...shuffled].map((word, i) => ({ id: i, word, flipped: false, matched: false }));
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
    return pairs;
  };

  const [cards, setCards] = useState(makeCards);
  const [selected, setSelected] = useState([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const handleFlip = (id) => {
    if (locked) return;
    const card = cards.find((c) => c.id === id);
    if (card.flipped || card.matched) return;
    const newSelected = [...selected, id];
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c));
    if (newSelected.length === 2) {
      setMoves((m) => m + 1); setLocked(true);
      const [a] = newSelected.map((sid) => cards.find((c) => c.id === sid));
      if (a.word === card.word && a.id !== card.id) {
        setCards((prev) => prev.map((c) => (c.id === a.id || c.id === id) ? { ...c, matched: true, flipped: true } : c));
        setSelected([]); setLocked(false);
        setTimeout(() => { setCards((prev) => { if (prev.every((c) => c.matched)) setWon(true); return prev; }); }, 100);
      } else {
        setTimeout(() => { setCards((prev) => prev.map((c) => newSelected.includes(c.id) && !c.matched ? { ...c, flipped: false } : c)); setSelected([]); setLocked(false); }, 1000);
      }
    } else { setSelected(newSelected); }
  };

  const reset = () => { setCards(makeCards()); setSelected([]); setLocked(false); setMoves(0); setWon(false); };

  return (
    <div style={{ padding: "24px 20px" }}>
      <p style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#555", textAlign: "center" }}>Flip cards to find matching pairs.</p>
      <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#aaa", textAlign: "center" }}>Moves: {moves}</p>
      {won && (
        <div style={{ backgroundColor: "#eef7ee", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "24px", border: "1px solid #c3e6cb" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#3a7d44", fontWeight: "600" }}>Well done!</p>
          <p style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#5a9a64" }}>You matched all pairs in {moves} moves.</p>
          <button onClick={reset} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", backgroundColor: "#4a90e2", color: "white", fontSize: "16px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>Play Again</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {cards.map((card) => (
          <div key={card.id} onClick={() => handleFlip(card.id)} style={{ height: "90px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", cursor: card.matched ? "default" : "pointer", backgroundColor: card.matched ? "#eef7ee" : card.flipped ? "#eef4ff" : "#f5f5f5", border: card.matched ? "2px solid #c3e6cb" : card.flipped ? "2px solid #c8d8f5" : "2px solid transparent", transition: "all 0.2s" }}>
            {(card.flipped || card.matched) ? <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: card.matched ? "#3a7d44" : "#4a90e2" }}>{card.word}</p> : <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ddd" }} />}
          </div>
        ))}
      </div>
      {!won && <button onClick={reset} style={{ marginTop: "24px", width: "100%", padding: "13px", borderRadius: "12px", border: "none", backgroundColor: "#f5f5f5", color: "#888", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>Start Over</button>}
    </div>
  );
}

function WordGuessGame() {
  const wordList = ["GARDEN","MUSIC","FLOWER","FAMILY","SUMMER","FRIEND","CANDLE","MORNING","BASKET","BRIDGE","BUTTER","CASTLE","CHERRY","COFFEE","COTTON","DINNER","FOREST","GENTLE","GINGER","GOLDEN","GRAPES","HARBOR","HEARTH","HEAVEN","KITTEN","LADDER","LEMON","MEADOW","MIRROR","MOTHER","MUFFIN","NATURE","ORANGE","PARROT","PEACH","PEPPER","PICKLE","PICNIC","PILLOW","PLANET","POCKET","POTATO","PRETTY","PUDDLE","PUMPKIN","PURPLE","RABBIT","RIBBON","SALMON","SEASON","SHADOW","SIMPLE","SISTER","SLEEPY","SMOOTH","SPRING","STABLE","STREAM","STRONG","SUNDAY","SUNSET","SUPPER","TENDER","TOMATO","TURKEY","TURNIP","TURTLE","VALLEY","VELVET","WALNUT","WILLOW","WINDOW","WINTER","WISDOM","WONDER","YELLOW"];
  const pickWord = () => wordList[Math.floor(Math.random() * wordList.length)];
  const [word, setWord] = useState(pickWord);
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const maxWrong = 6;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const won = word.split("").every((l) => guessed.includes(l));
  const lost = wrong >= maxWrong;
  const guess = (letter) => {
    if (guessed.includes(letter) || won || lost) return;
    setGuessed([...guessed, letter]);
    if (!word.includes(letter)) setWrong((w) => w + 1);
  };
  const reset = () => { setWord(pickWord()); setGuessed([]); setWrong(0); };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
        {word.split("").map((letter, i) => (
          <div key={i} style={{ width: "36px", textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "4px" }}>
            <p style={{ margin: 0, fontSize: "26px", fontWeight: "600", color: "#333", minHeight: "32px" }}>{guessed.includes(letter) ? letter : ""}</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: "14px", color: wrong >= 4 ? "#e25555" : "#aaa", marginBottom: "24px" }}>
        {lost ? "Out of guesses" : `${maxWrong - wrong} guess${maxWrong - wrong === 1 ? "" : "es"} remaining`}
      </p>
      {(won || lost) && (
        <div style={{ backgroundColor: won ? "#eef7ee" : "#fff0f0", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "24px", border: `1px solid ${won ? "#c3e6cb" : "#f5c6cb"}` }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "20px", color: won ? "#3a7d44" : "#c0392b", fontWeight: "600" }}>{won ? "Well done!" : "Nice try!"}</p>
          {lost && <p style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#888" }}>The word was {word}.</p>}
          <button onClick={reset} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", backgroundColor: "#4a90e2", color: "white", fontSize: "16px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>Play Again</button>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
        {letters.map((letter) => {
          const isGuessed = guessed.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);
          return (
            <button key={letter} onClick={() => guess(letter)} style={{ width: "42px", height: "42px", borderRadius: "10px", border: "none", fontSize: "16px", fontWeight: "600", fontFamily: "inherit", cursor: isGuessed ? "default" : "pointer", backgroundColor: isCorrect ? "#eef7ee" : isWrong ? "#f5f5f5" : "#f0f4ff", color: isCorrect ? "#3a7d44" : isWrong ? "#ccc" : "#4a90e2", transition: "all 0.15s" }}>
              {letter}
            </button>
          );
        })}
      </div>
      {!won && !lost && <button onClick={reset} style={{ marginTop: "24px", width: "100%", padding: "13px", borderRadius: "12px", border: "none", backgroundColor: "#f5f5f5", color: "#888", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>New Word</button>}
    </div>
  );
}

function WordScrambleGame() {
  const wordList = ["GARDEN","MUSIC","FLOWER","FAMILY","SUMMER","FRIEND","CANDLE","MORNING","BASKET","BRIDGE","BUTTER","CASTLE","CHERRY","COFFEE","COTTON","DINNER","FOREST","GENTLE","GINGER","GOLDEN","GRAPES","HARBOR","HEARTH","HEAVEN","KITTEN","LADDER","LEMON","MEADOW","MIRROR","MOTHER","MUFFIN","NATURE","ORANGE","PARROT","PEACH","PEPPER","PICKLE","PICNIC","PILLOW","PLANET","POCKET","POTATO","PRETTY","PUDDLE","PUMPKIN","PURPLE","RABBIT","RIBBON","SALMON","SEASON","SHADOW","SIMPLE","SISTER","SLEEPY","SMOOTH","SPRING","STABLE","STREAM","STRONG","SUNDAY","SUNSET","SUPPER","TENDER","TOMATO","TURKEY","TURNIP","TURTLE","VALLEY","VELVET","WALNUT","WILLOW","WINDOW","WINTER","WISDOM","WONDER","YELLOW"];
  const pickWord = () => wordList[Math.floor(Math.random() * wordList.length)];
  const scramble = (word) => {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.join("") === word ? scramble(word) : arr;
  };
  const initialWord = pickWord();
  const [word, setWord] = useState(initialWord);
  const [tiles, setTiles] = useState(() => scramble(initialWord));
  const [chosen, setChosen] = useState([]);
  const [result, setResult] = useState(null);

  const reset = () => { const w = pickWord(); setWord(w); setTiles(scramble(w)); setChosen([]); setResult(null); };
  const initTiles = tiles.map((letter, i) => ({ letter, index: i, used: chosen.some((c) => c.index === i) }));

  const handleTap = (tile) => {
    if (tile.used || result) return;
    const newChosen = [...chosen, tile];
    setChosen(newChosen);
    if (newChosen.length === word.length) {
      const attempt = newChosen.map((t) => t.letter).join("");
      if (attempt === word) { setResult("correct"); }
      else { setResult("wrong"); setTimeout(() => { setChosen([]); setResult(null); }, 900); }
    }
  };

  const handleBack = () => { if (result || chosen.length === 0) return; setChosen((prev) => prev.slice(0, -1)); };

  return (
    <div style={{ padding: "32px 20px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p style={{ margin: "0 0 32px 0", fontSize: "16px", color: "#aaa", textAlign: "center" }}>Tap the letters to spell the word.</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap", justifyContent: "center" }}>
        {Array.from({ length: word.length }).map((_, i) => (
          <div key={i} style={{ width: "38px", height: "46px", borderRadius: "10px", backgroundColor: chosen[i] ? (result === "correct" ? "#eef7ee" : result === "wrong" ? "#fff0f0" : "#eef4ff") : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${chosen[i] ? (result === "correct" ? "#c3e6cb" : result === "wrong" ? "#f5c6cb" : "#c8d8f5") : "#eee"}`, transition: "all 0.15s" }}>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: "600", color: result === "correct" ? "#3a7d44" : result === "wrong" ? "#c0392b" : "#4a90e2" }}>{chosen[i]?.letter || ""}</p>
          </div>
        ))}
      </div>
      {result === "correct" && (
        <div style={{ backgroundColor: "#eef7ee", borderRadius: "16px", padding: "16px 24px", textAlign: "center", marginBottom: "24px", border: "1px solid #c3e6cb", width: "100%", boxSizing: "border-box" }}>
          <p style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#3a7d44", fontWeight: "600" }}>Well done!</p>
          <p style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#5a9a64" }}>You unscrambled {word}.</p>
          <button onClick={reset} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", backgroundColor: "#4a90e2", color: "white", fontSize: "16px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>Next Word</button>
        </div>
      )}
      {!result && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "24px" }}>
          {initTiles.map((tile) => (
            <button key={tile.index} onClick={() => handleTap(tile)} style={{ width: "48px", height: "56px", borderRadius: "12px", border: "none", backgroundColor: tile.used ? "#f0f0f0" : "#f0f4ff", color: tile.used ? "#ccc" : "#4a90e2", fontSize: "22px", fontWeight: "600", cursor: tile.used ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {tile.letter}
            </button>
          ))}
        </div>
      )}
      {!result && (
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <button onClick={handleBack} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", backgroundColor: "#f5f5f5", color: "#888", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>← Undo</button>
          <button onClick={reset} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "none", backgroundColor: "#f5f5f5", color: "#888", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>New Word</button>
        </div>
      )}
    </div>
  );
}

function SimpleMathGame() {
  const generateQuestion = () => {
    const op = Math.random() > 0.5 ? "+" : "-";
    let a = Math.floor(Math.random() * 9) + 1;
    let b = op === "+" ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * a) + 1;
    const answer = op === "+" ? a + b : a - b;
    let wrong1 = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    let wrong2 = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    while (wrong2 === wrong1 || wrong2 === answer) wrong2 = answer + Math.floor(Math.random() * 4) + 1;
    return { a, b, op, answer, choices: [answer, wrong1, wrong2].sort(() => Math.random() - 0.5) };
  };
  const [question, setQuestion] = useState(generateQuestion);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak] = useState(0);

  const handleAnswer = (choice) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === question.answer) setStreak((s) => s + 1); else setStreak(0);
    setTimeout(() => { setQuestion(generateQuestion()); setSelected(null); }, 1200);
  };

  return (
    <div style={{ padding: "32px 20px 24px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        {streak > 0 ? <p style={{ margin: 0, fontSize: "14px", color: "#4a90e2", fontWeight: "500" }}>{streak} in a row</p> : <p style={{ margin: 0, fontSize: "14px", color: "#aaa" }}>What is the answer?</p>}
      </div>
      <div style={{ backgroundColor: "#f0f4ff", borderRadius: "20px", padding: "32px 40px", marginBottom: "40px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "48px", fontWeight: "700", color: "#333", letterSpacing: "4px" }}>{question.a} {question.op} {question.b} = ?</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
        {question.choices.map((choice) => {
          let bg = "#f5f5f5"; let color = "#333"; let border = "2px solid transparent";
          if (selected !== null) {
            if (choice === question.answer) { bg = "#eef7ee"; color = "#3a7d44"; border = "2px solid #c3e6cb"; }
            else if (choice === selected) { bg = "#fff0f0"; color = "#c0392b"; border = "2px solid #f5c6cb"; }
          }
          return (
            <button key={choice} onClick={() => handleAnswer(choice)} style={{ width: "100%", padding: "20px", borderRadius: "16px", border, backgroundColor: bg, color, fontSize: "32px", fontWeight: "700", cursor: selected !== null ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {choice}
            </button>
          );
        })}
      </div>
      {selected !== null && <p style={{ marginTop: "20px", fontSize: "16px", fontWeight: "500", color: selected === question.answer ? "#3a7d44" : "#c0392b" }}>{selected === question.answer ? "Correct!" : `The answer was ${question.answer}.`}</p>}
    </div>
  );
}

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setError(true); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`);
        const data = await res.json();
        const code = data.current_weather.weathercode;
        const temp = Math.round(data.current_weather.temperature);
        const getCondition = (c) => {
          if (c === 0) return { label: "Clear", color: "#f5a623", image: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&q=80" };
          if (c <= 2) return { label: "Mostly Clear", color: "#f5a623", image: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&q=80" };
          if (c === 3) return { label: "Overcast", color: "#ccc", image: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80" };
          if (c <= 48) return { label: "Foggy", color: "#ccc", image: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=800&q=80" };
          if (c <= 55) return { label: "Drizzle", color: "#a0c4e8", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80" };
          if (c <= 65) return { label: "Rain", color: "#a0c4e8", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80" };
          if (c <= 75) return { label: "Snow", color: "#e0f0ff", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" };
          if (c <= 82) return { label: "Showers", color: "#a0c4e8", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80" };
          return { label: "Thunderstorm", color: "#d0c0f0", image: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800&q=80" };
        };
        setWeather({ temp, condition: getCondition(code), code });
      } catch {
        setError(true);
      }
    }, () => setError(true));
  }, []);

  const WeatherIcon = ({ code, color }) => {
    const s = { color, flexShrink: 0, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" };
    if (code === 0) return <Sun size={52} style={s} />;
    if (code <= 2) return <CloudSun size={52} style={s} />;
    if (code === 3) return <Cloud size={52} style={s} />;
    if (code <= 48) return <Cloud size={52} style={{ ...s, color: "#ddd" }} />;
    if (code <= 65) return <CloudRain size={52} style={s} />;
    if (code <= 75) return <CloudSnow size={52} style={s} />;
    if (code <= 82) return <CloudRain size={52} style={s} />;
    return <CloudLightning size={52} style={s} />;
  };

  if (error) return null;

  return (
    <div style={{ margin: "0 20px 16px 20px", borderRadius: "20px", overflow: "hidden", position: "relative", height: "110px" }}>
      {weather && (
        <img
          src={weather.condition.image}
          alt={weather.condition.label}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", height: "100%", boxSizing: "border-box" }}>
        {weather ? (
          <>
            <div>
              <p style={{ margin: "0 0 2px 0", fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>Current Weather</p>
              <p style={{ margin: 0, fontSize: "36px", fontWeight: "700", color: "white" }}>{weather.temp}°F</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>{weather.condition.label}</p>
            </div>
            <WeatherIcon code={weather.code} color={weather.condition.color} />
          </>
        ) : (
          <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.7)" }}>Loading weather...</p>
        )}
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const h = time.getHours(); const m = time.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM"; const displayH = h % 12 || 12;
  return <p style={{ margin: 0, fontSize: "38px", fontWeight: "700", color: "#333" }}>{displayH}:{m} {ampm}</p>;
}

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [sharedReminders, setSharedReminders] = useState([]);
  const [sharedRoutine, setSharedRoutine] = useState(initialRoutineData);
  const [sharedMedications, setSharedMedications] = useState([]);
  const [sharedContacts, setSharedContacts] = useState([]);
  const [sharedPatientInfo, setSharedPatientInfo] = useState({
    name: "My Loved One", bio: "", birthday: "", age: 0,
    address: "", photo: "", pin: "1234", profileId: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const loadData = async () => {
      try {
        // Profile
        let { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
        if (!profile) await supabase.from('profiles').insert({ id: session.user.id, email: session.user.email });

        // Patient info — check if onboarded
        let { data: info } = await supabase.from('patient_info').select('*').eq('profile_id', session.user.id).single();
        if (!info) {
          setShowOnboarding(true);
        } else {
          if (!info.onboarded) {
            setShowOnboarding(true);
          }
          setSharedPatientInfo({ name: info.name, bio: info.bio, birthday: info.birthday, age: info.age, address: info.address, photo: info.photo, pin: info.pin, profileId: session.user.id });
        }

        // Reminders
        let { data: remindersData } = await supabase.from('reminders').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: true });
        if (remindersData && remindersData.length > 0) {
          const toArchive = remindersData.filter((r) => r.done && !r.archived);
          if (toArchive.length > 0) {
            await Promise.all(toArchive.map((r) => supabase.from('reminders').update({ archived: true }).eq('id', r.id)));
          }
          setSharedReminders(remindersData.map((r) => ({
            id: r.id, label: r.label, time: r.time, date: r.date,
            repeat: r.repeat, section: r.section, done: r.done,
            archived: r.archived || toArchive.some((x) => x.id === r.id),
          })));
        }

        // Medications
        let { data: medsData } = await supabase.from('medications').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: true });
        if (medsData && medsData.length > 0) {
          setSharedMedications(medsData.map((m) => ({ id: m.id, name: m.name, dosage: m.dosage, time: m.time, archived: m.archived || false })));
        }

        // Contacts
        let { data: contactsData } = await supabase.from('contacts').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: true });
        if (contactsData && contactsData.length > 0) {
          setSharedContacts(contactsData.map((c) => ({ id: c.id, name: c.name, relationship: c.relationship, phone: c.phone })));
        }

        // Routine
        let { data: routineData } = await supabase.from('routine_items').select('*').eq('profile_id', session.user.id).order('sort_order', { ascending: true });
        if (routineData && routineData.length > 0) {
          const sections = ["Morning", "Afternoon", "Evening"];
          setSharedRoutine(sections.map((section) => ({
            section,
            items: routineData.filter((r) => r.section === section).map((r) => ({ id: r.id, label: r.label, time: r.time, done: r.done })),
          })));
        }
        

        // Family members
        let { data: familyData } = await supabase.from('family_members').select('*').eq('profile_id', session.user.id).order('sort_order', { ascending: true });
        if (familyData && familyData.length > 0) {
          setFamilyMembers(familyData.map((m) => ({ id: m.id, name: m.name, relationship: m.relationship, image: m.image })));
        }
      } catch (err) {
        console.error('Load error:', err);
      }
    };
    loadData();
  }, [session]);

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : "Good Evening";
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const getCurrentSection = () => { if (hours < 12) return "Morning"; if (hours < 17) return "Afternoon"; return "Evening"; };
  const currentSection = getCurrentSection();
  const upcomingReminders = sharedReminders.filter((r) => !r.done && !r.archived).slice(0, 3);
  const currentRoutineGroup = sharedRoutine.find((g) => g.section === currentSection);
  const nextRoutineItem = currentRoutineGroup?.items.find((item) => parseTimeToMinutes(item.time) >= currentMinutes);
  const nextMedication = sharedMedications.filter((m) => !m.archived).find((m) => {
    const sectionMap = { Morning: [0, 720], Afternoon: [720, 1020], Evening: [1020, 1200], Night: [1200, 1440] };
    const [start, end] = sectionMap[m.time] || [0, 1440];
    return currentMinutes >= start && currentMinutes < end;
  });

  const handleMenuClick = (label) => {
    if (label === "Reminders") setShowReminders(true);
    if (label === "Routine") setShowRoutine(true);
    if (label === "Photos") setShowPhotos(true);
    if (label === "Games") setShowGames(true);
  };

  const handleOnboardingComplete = useCallback((info) => {
    setSharedPatientInfo({ ...info, profileId: session.user.id });
    setShowOnboarding(false);
    setShowWelcome(true);
  }, [session]);

  if (authLoading) {
    return (
      <div style={{ maxWidth: "390px", margin: "0 auto", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <p style={{ color: "#aaa", fontSize: "16px" }}>Loading...</p>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  if (showOnboarding) {
    return <OnboardingScreen session={session} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ maxWidth: "390px", margin: "0 auto", fontFamily: "'Inter', sans-serif", backgroundColor: "#fff", minHeight: "100vh" }}>
      {showWelcome && (
        <WelcomeScreen name={sharedPatientInfo.name} onDone={() => setShowWelcome(false)} />
      )}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} session={session} sharedReminders={sharedReminders} setSharedReminders={setSharedReminders} sharedRoutine={sharedRoutine} setSharedRoutine={setSharedRoutine} sharedMedications={sharedMedications} setSharedMedications={setSharedMedications} sharedContacts={sharedContacts} setSharedContacts={setSharedContacts} sharedPatientInfo={sharedPatientInfo} setSharedPatientInfo={setSharedPatientInfo} familyMembers={familyMembers} setFamilyMembers={setFamilyMembers} />}
      {showReminders && <RemindersOverlay onClose={() => setShowReminders(false)} reminders={sharedReminders} setReminders={setSharedReminders} session={session} />}
      {showRoutine && <RoutineOverlay onClose={() => setShowRoutine(false)} routineData={sharedRoutine} />}
      {showPhotos && <PhotosOverlay onClose={() => setShowPhotos(false)} familyMembers={familyMembers} />}
      {showGames && <GamesOverlay onClose={() => setShowGames(false)} />}

      {/* Header — reduced top padding for height fix */}
     <div style={{ padding: "44px 24px 16px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#aaa" }}>{greeting}</p>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#333", fontWeight: "600" }}>{sharedPatientInfo.name}</h1>
        </div>
        <Settings size={24} color="#aaa" style={{ cursor: "pointer", marginTop: "4px" }} onClick={() => setShowSettings(true)} />
      </div>

      {/* Date/time card — slightly reduced padding */}
      <div style={{ margin: "0 20px 16px 20px", backgroundColor: "#f0f4ff", borderRadius: "20px", padding: "16px 24px" }}>
        <p style={{ margin: "0 0 2px 0", fontSize: "14px", color: "#7a9fd4" }}>{dayName}</p>
        <p style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#333", fontWeight: "500" }}>{monthName} {dateNum}, {year}</p>
        <LiveClock />
      </div>

      <WeatherCard />

      {(upcomingReminders.length > 0 || nextRoutineItem || nextMedication) && (
        <div style={{ margin: "0 20px 16px 20px" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Up Next</p>
          {upcomingReminders.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", backgroundColor: "#f9f9f9", borderRadius: "14px", marginBottom: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#4a90e2", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#333" }}>{r.label}</p>
                {r.time && <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>{r.time}</p>}
              </div>
            </div>
          ))}
          {nextRoutineItem && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", backgroundColor: "#fff8ee", borderRadius: "14px", marginBottom: "8px", border: "1px solid #fde8c0" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#d4900a", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#333" }}>{nextRoutineItem.label}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#d4900a" }}>{nextRoutineItem.time} · Routine</p>
              </div>
            </div>
          )}
          {nextMedication && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", backgroundColor: "#f3f0ff", borderRadius: "14px", marginBottom: "8px", border: "1px solid #d8cff5" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#7c5cbf", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#333" }}>{nextMedication.name} {nextMedication.dosage}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#7c5cbf" }}>{nextMedication.time} · Medication</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "0 20px 24px 20px" }}>
        <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Menu</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} onClick={() => handleMenuClick(item.label)} style={{ backgroundColor: "#f5f5f5", borderRadius: "16px", padding: "18px", textAlign: "center", cursor: "pointer" }}>
                <Icon size={32} color="#555" />
                <p style={{ fontSize: "16px", margin: "8px 0 0 0", color: "#333" }}>{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "16px", borderTop: "1px solid #eee" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#bbb" }}>Remembrit</p>
        <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#ccc" }}>Version 0.1.0</p>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>
    </div>
  );
}

export default App; 
