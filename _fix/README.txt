ProjectAI Fix Pack v1 (Next.js 16.1.x + App Router routes)

What this pack fixes
1) A single, stable validation base in /lib/validation.ts
2) Correct Next.js 16 route handler signatures for dynamic params (params is Promise)

How to apply (WSL)
1) Put the zip in your repo root (same level as app/, lib/, prisma/)
2) Extract into a temp folder:
   unzip -o projectai_fix_pack_v1.zip -d _fix

3) Copy files over:
   cp -a _fix/lib/. ./lib/
   cp -a _fix/app/. ./app/

4) Clean build:
   rm -rf .next
   npm run build

Notes
- This pack includes only the files that normally cause the recurring build errors:
  - lib/validation.ts
  - app/api/dev/orgs/[orgId]/projects/route.ts
  - app/api/dev/orgs/[orgId]/tasks/route.ts
- If other dynamic routes fail with the same pattern, use NOTES.txt.
