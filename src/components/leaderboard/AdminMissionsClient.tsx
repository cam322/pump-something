"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MISSION_CATEGORIES, MISSION_DIFFICULTIES, MISSION_STATUSES, DEFAULT_MISSION_POINTS } from "@/config/missions";
import type { MissionCategory, MissionDifficulty, MissionStatus } from "@/config/missions";
import type { Contribution, Mission } from "@/lib/leaderboard/types";

type MissionSubmission = { contribution: Contribution; mission: Mission | null };

const blankMission = {
  title: "",
  slug: "",
  description: "",
  category: "MEME" as MissionCategory,
  points: DEFAULT_MISSION_POINTS.MEME,
  difficulty: "EASY" as MissionDifficulty,
  status: "DRAFT" as MissionStatus,
  startAt: "",
  endAt: "",
  proofInstructions: "",
  isFeatured: false,
  repeatable: true,
  cooldownHours: 24,
};

export function AdminMissionsClient() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([]);
  const [form, setForm] = useState(blankMission);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pointsById, setPointsById] = useState<Record<string, number>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAdminMissions() {
    const response = await fetch("/api/admin/missions", { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || "Could not load missions.");
      return;
    }
    setAuthenticated(true);
    setMissions(result.missions || []);
    setSubmissions(result.submissions || []);
    const nextPoints: Record<string, number> = {};
    for (const item of result.submissions || []) nextPoints[item.contribution.id] = item.contribution.suggestedPoints;
    setPointsById(nextPoints);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadAdminMissions(); }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(result.error || "Admin login failed.");
      return;
    }
    setPassword("");
    setAuthenticated(true);
    await loadAdminMissions();
  }

  function editMission(mission: Mission) {
    setEditingId(mission.id);
    setForm({
      title: mission.title,
      slug: mission.slug,
      description: mission.description,
      category: mission.category,
      points: mission.points,
      difficulty: mission.difficulty,
      status: mission.status,
      startAt: mission.startAt.slice(0, 16),
      endAt: mission.endAt ? mission.endAt.slice(0, 16) : "",
      proofInstructions: mission.proofInstructions,
      isFeatured: mission.isFeatured,
      repeatable: mission.repeatable,
      cooldownHours: mission.cooldownHours || 24,
    });
  }

  async function saveMission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
      endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
    };
    const response = await fetch(editingId ? `/api/admin/missions/${editingId}` : "/api/admin/missions", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || "Could not save mission.");
      return;
    }
    setMessage(editingId ? "MISSION UPDATED" : "MISSION CREATED");
    setEditingId(null);
    setForm(blankMission);
    await loadAdminMissions();
  }

  async function quickUpdate(mission: Mission, updates: Partial<typeof blankMission>) {
    setMessage("");
    const response = await fetch(`/api/admin/missions/${mission.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || "Could not update mission.");
      return;
    }
    setMessage("MISSION UPDATED");
    await loadAdminMissions();
  }

  async function review(id: string, action: "approve" | "reject") {
    setMessage("");
    const response = await fetch(`/api/admin/contributions/${id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pointsAwarded: pointsById[id], notes: notesById[id] || "" }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || `Could not ${action} mission submission.`);
      return;
    }
    setMessage(action === "approve" ? "APPROVED + AWARDED POINTS" : "REJECTED");
    await loadAdminMissions();
  }

  if (!authenticated) {
    return <div className="mx-auto max-w-md rounded-3xl border border-green-500/30 bg-black/70 p-6"><h1 className="mb-3 text-3xl font-black text-green-400">MISSION ADMIN</h1><p className="mb-5 text-white/60">Uses the same secure admin login as contribution review.</p>{message && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">{message}</div>}<form onSubmit={login}><label className="mb-4 block font-bold text-white/80">ADMIN PASSWORD<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" autoComplete="current-password" /></label><button disabled={loading} className="w-full rounded-full bg-green-500 px-6 py-4 font-black text-black disabled:opacity-60">{loading ? "CHECKING..." : "OPEN MISSION ADMIN"}</button></form></div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-4xl font-black text-green-400">MISSION CONTROL</h1><p className="text-white/60">Create missions, feature one, review submissions, and award verified points.</p></div><Link href="/missions" className="rounded-full border border-green-500 px-5 py-3 text-center font-bold text-green-400">VIEW MISSIONS</Link></div>
      {message && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 font-bold text-green-300">{message}</div>}

      <form onSubmit={saveMission} className="mb-8 rounded-3xl border border-green-500/20 bg-black/70 p-5">
        <h2 className="mb-4 text-2xl font-black text-white">{editingId ? "EDIT MISSION" : "CREATE MISSION"}</h2>
        <div className="grid gap-4 md:grid-cols-2"><label className="font-bold text-white/80">TITLE<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label><label className="font-bold text-white/80">SLUG<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label><label className="font-bold text-white/80">CATEGORY<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MissionCategory, points: DEFAULT_MISSION_POINTS[e.target.value as MissionCategory] })} className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3 text-white">{MISSION_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="font-bold text-white/80">POINT REWARD<input type="number" min={0} max={10000} value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label><label className="font-bold text-white/80">DIFFICULTY<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as MissionDifficulty })} className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3 text-white">{MISSION_DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="font-bold text-white/80">STATUS<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MissionStatus })} className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3 text-white">{MISSION_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="font-bold text-white/80">START DATE<input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label><label className="font-bold text-white/80">END DATE<input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label></div>
        <label className="mt-4 block font-bold text-white/80">DESCRIPTION<textarea required minLength={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label>
        <label className="mt-4 block font-bold text-white/80">PROOF INSTRUCTIONS<textarea required minLength={10} value={form.proofInstructions} onChange={(e) => setForm({ ...form, proofInstructions: e.target.value })} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="flex items-center gap-2 font-bold text-white/80"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> FEATURED</label><label className="flex items-center gap-2 font-bold text-white/80"><input type="checkbox" checked={form.repeatable} onChange={(e) => setForm({ ...form, repeatable: e.target.checked })} /> REPEATABLE</label><label className="font-bold text-white/80">COOLDOWN HOURS<input type="number" min={1} value={form.cooldownHours} onChange={(e) => setForm({ ...form, cooldownHours: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label></div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button className="rounded-full bg-green-500 px-6 py-3 font-black text-black">{editingId ? "SAVE MISSION" : "CREATE MISSION"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankMission); }} className="rounded-full border border-white/20 px-6 py-3 font-black text-white">CANCEL EDIT</button>}</div>
      </form>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">{missions.map((mission) => <div key={mission.id} className="rounded-2xl border border-white/10 bg-black/60 p-4"><div className="mb-3 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-green-500/10 px-3 py-1 text-green-300">{mission.status}</span><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">{mission.category}</span>{mission.isFeatured && <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-300">FEATURED</span>}</div><h3 className="text-2xl font-black text-white">{mission.title}</h3><p className="text-white/60">+{mission.points} · {mission.difficulty} · {mission.repeatable ? `repeatable ${mission.cooldownHours || 24}h` : "one-time"}</p><p className="mt-2 text-sm text-white/70">{mission.description}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={() => editMission(mission)} className="rounded-full border border-white/20 px-4 py-2 font-bold text-white">EDIT</button><button onClick={() => quickUpdate(mission, { isFeatured: true })} className="rounded-full border border-yellow-500/40 px-4 py-2 font-bold text-yellow-300">MARK FEATURED</button><button onClick={() => quickUpdate(mission, { status: "ACTIVE" })} className="rounded-full border border-green-500/40 px-4 py-2 font-bold text-green-300">ACTIVATE</button><button onClick={() => quickUpdate(mission, { status: "EXPIRED" })} className="rounded-full border border-orange-500/40 px-4 py-2 font-bold text-orange-300">EXPIRE</button><button onClick={() => quickUpdate(mission, { status: "ARCHIVED" })} className="rounded-full border border-red-500/40 px-4 py-2 font-bold text-red-300 sm:col-span-2">ARCHIVE</button></div></div>)}</div>

      <section><h2 className="mb-4 text-3xl font-black text-green-400">MISSION SUBMISSIONS</h2>{submissions.length === 0 ? <div className="rounded-3xl border border-white/10 bg-black/60 p-8 text-center text-white/60">No mission submissions yet.</div> : <div className="space-y-4">{submissions.map(({ contribution, mission }) => <div key={contribution.id} className="rounded-2xl border border-green-500/20 bg-black/70 p-4"><p className="text-sm font-black text-green-400">{contribution.status} · {new Date(contribution.submittedAt).toLocaleString()}</p><h3 className="text-xl font-black text-white">{mission?.title || contribution.missionTitle || "Mission"}</h3><p className="mt-2 text-white/70 whitespace-pre-wrap">{contribution.description}</p>{contribution.proofUrl && <Link href={contribution.proofUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-cyan-300 underline">{contribution.proofUrl}</Link>}{contribution.status === "PENDING" && <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto_auto]"><input type="number" min={0} max={10000} value={pointsById[contribution.id] ?? contribution.suggestedPoints} onChange={(e) => setPointsById({ ...pointsById, [contribution.id]: Number(e.target.value) })} className="rounded-xl border border-white/10 bg-white/10 p-3 text-white" /><input placeholder="Admin notes" value={notesById[contribution.id] || ""} onChange={(e) => setNotesById({ ...notesById, [contribution.id]: e.target.value })} className="rounded-xl border border-white/10 bg-white/10 p-3 text-white" /><button onClick={() => review(contribution.id, "approve")} className="rounded-full bg-green-500 px-4 py-3 font-black text-black">APPROVE</button><button onClick={() => review(contribution.id, "reject")} className="rounded-full border border-red-500 px-4 py-3 font-black text-red-300">REJECT</button></div>}</div>)}</div>}</section>
    </div>
  );
}
