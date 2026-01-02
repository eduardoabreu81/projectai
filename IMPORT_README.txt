ProjectAI Import Pack v1

This pack adds:
- Prisma models for multi-tenant org scoping
- API routes for projects and tasks (Kanban)
- Minimal UI routes: /dashboard and /projects/[projectId]
- Dev bootstrap endpoint: POST /api/dev/bootstrap

Import:
1) Unzip into your repo root
2) Copy files into place (see instructions in chat)

Notes:
- All queries are org scoped.
- Auth is stubbed via headers: x-org-id and x-user-id.
- In development, if headers are missing, it defaults to orgId=1 and userId=1.
- In production, routes reject missing org/user headers (401).
