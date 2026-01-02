'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  position: number;
  dueDate: string | null;
  updatedAt: string;
};

type Project = { id: number; name: string };

const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const projectId = Number(params.projectId);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of tasks) map[t.status].push(t);
    for (const k of Object.keys(map) as TaskStatus[]) {
      map[k].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [tasks]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/tasks`, { headers: { "x-org-id": "1", "x-user-id": "1" } });
    const data = await res.json();
    if (!data.ok) setError(data.error || "Failed to load");
    else {
      setProject(data.project);
      setTasks(data.tasks);
    }
    setLoading(false);
  }

  async function createTask() {
    setError(null);
    const t = title.trim();
    if (!t) return;

    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-org-id": "1",
        "x-user-id": "1",
      },
      body: JSON.stringify({ title: t }),
    });

    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Failed to create task");
      return;
    }

    setTitle("");
    await load();
  }

  async function moveTask(taskId: number, status: TaskStatus) {
    setError(null);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-org-id": "1",
        "x-user-id": "1",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Failed to move task");
      return;
    }

    await load();
  }

  useEffect(() => {
    if (Number.isFinite(projectId) && projectId > 0) load();
  }, [projectId]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm opacity-80">
              <Link href="/dashboard" className="underline">Back</Link>
            </div>
            <h1 className="text-2xl font-semibold">{project ? project.name : "Project"}</h1>
          </div>
          <button className="text-sm underline" onClick={load} disabled={loading}>
            Refresh
          </button>
        </header>

        <section className="rounded-lg border p-4 space-y-3">
          <div className="text-sm font-medium">Create task</div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 bg-transparent"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="rounded-md border px-3 py-2" onClick={createTask}>
              Add
            </button>
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </section>

        {loading ? (
          <div className="text-sm opacity-70">Loading...</div>
        ) : (
          <section className="grid gap-4 md:grid-cols-3">
            {STATUSES.map((s) => (
              <div key={s.key} className="rounded-lg border p-3 space-y-3">
                <div className="text-sm font-medium">{s.label}</div>

                <div className="space-y-2">
                  {grouped[s.key].length === 0 ? (
                    <div className="text-sm opacity-70">Empty</div>
                  ) : (
                    grouped[s.key].map((t) => (
                      <div key={t.id} className="rounded-md border p-3 space-y-2">
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs opacity-70">#{t.id}</div>
                          <select
                            className="rounded-md border bg-transparent px-2 py-1 text-xs"
                            value={t.status}
                            onChange={(e) => moveTask(t.id, e.target.value as TaskStatus)}
                          >
                            {STATUSES.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
