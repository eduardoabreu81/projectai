ProjectAI Dev API Pack v3

What you get
1) Prisma singleton with SQLite foreign keys enabled
2) Dev APIs (Next.js App Router) for Organizations, Projects, Tasks
3) Strict org scoping on every query and write
4) Curl examples to validate behavior fast

Assumptions
- Next.js App Router project structure (app/ directory)
- Prisma schema contains: Organization, User, OrgUser, Project, Task, TaskStatus
- Your dev DB is SQLite and DATABASE_URL points to prisma/dev.db

How to install
1) Unzip at your repo root so paths like app/api/... and lib/... merge into your project
2) If any of these routes already exist, replace them intentionally
3) Restart dev server after copy

Quick validate
1) Health
curl -i http://localhost:3000/api/dev/health

2) List orgs
curl -i http://localhost:3000/api/dev/orgs

3) List projects per org
curl -i "http://localhost:3000/api/dev/projects?orgId=1"
curl -i "http://localhost:3000/api/dev/projects?orgId=2"

4) Create a project
curl -i -X POST http://localhost:3000/api/dev/projects \
  -H "content-type: application/json" \
  -d '{"orgId":1,"name":"Project X","description":"test"}'

5) Create a task
curl -i -X POST http://localhost:3000/api/dev/tasks \
  -H "content-type: application/json" \
  -d '{"orgId":1,"projectId":1,"title":"Task A","description":"demo","status":"TODO","position":0}'

6) Try cross-org task create (should fail 409 or 404)
curl -i -X POST http://localhost:3000/api/dev/tasks \
  -H "content-type: application/json" \
  -d '{"orgId":2,"projectId":1,"title":"Should fail","status":"TODO","position":0}'

Notes
- Every endpoint requires orgId, either as query param (?orgId=1) or in JSON body for POST/PATCH
- We return 400 for invalid input, 404 for not found under that org scope, 409 for constraint failures
