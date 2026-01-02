'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Project = {
  id: number;
  name: string;
  description: string | null;
  updatedAt: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/projects", { headers: { "x-org-id": "1", "x-user-id": "1" } });
    const data = await res.json();
    if (!data.ok) setError(data.error || "Failed to load projects");
    else setProjects(data.projects);
    setLoading(false);
  }

  async function createProject() {
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-org-id": "1",
        "x-user-id": "1",
      },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error || "Failed to create project");
      return;
    }
    setName("");
    setDescription("");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm opacity-80">Projects and quick actions</p>
        </header>

        <section className="rounded-lg border p-4 space-y-3">
          <div className="text-sm font-medium">Create project</div>

          <div className="grid gap-3">
            <input
              className="w-full rounded-md border px-3 py-2 bg-transparent"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full rounded-md border px-3 py-2 bg-transparent"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              className="rounded-md border px-3 py-2 disabled:opacity-50"
              onClick={createProject}
              disabled={!canCreate}
            >
              Create
            </button>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Your projects</div>
            <button className="text-sm underline" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-sm opacity-70">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-sm opacity-70">No projects yet</div>
          ) : (
            <div className="grid gap-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block rounded-lg border p-4 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="font-medium">{p.name}</div>
                  {p.description ? <div className="text-sm opacity-80">{p.description}</div> : null}
                  <div className="text-xs opacity-60 mt-2">Updated {new Date(p.updatedAt).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
