# Copilot Instructions
- **Project**: Next.js 16 App Router with TypeScript and React 19. Minimal template; no server components beyond the default layout.
- **Entry points**: Root shell and metadata live in [app/layout.tsx](app/layout.tsx#L3-L34); the landing content is in [app/page.tsx](app/page.tsx#L1-L57).
- **Styling**: Tailwind CSS v4 is imported once in [app/globals.css](app/globals.css#L1-L28) with inline theme tokens for background/foreground and font variables; prefer utility classes and CSS variables over ad-hoc styles.
- **Fonts**: Geist Sans/Mono are loaded via `next/font` and exposed as CSS variables in [app/layout.tsx](app/layout.tsx#L3-L26); retain these when adding components.
- **Theming**: Light/dark colors are driven by CSS variables in [app/globals.css](app/globals.css#L1-L23). Existing components use `dark:` Tailwind variants; keep new UI compatible with both themes.
- **Assets**: Use Next.js `<Image>` for images as shown in [app/page.tsx](app/page.tsx#L3-L53); store static assets under `public/` and reference with absolute paths.
- **HTML structure**: Current page centers content with flex utilities and uses two primary CTA links; follow the accessibility patterns (semantic tags, `rel="noopener noreferrer"` on external links).
- **Config**: Next config is default and empty in [next.config.ts](next.config.ts#L1-L7); add options there rather than inline hacks.
- **Linting**: Run `npm run lint` (ESLint 9 with `eslint-config-next`). Address warnings before shipping changes.
- **Dev/build**: Use npm run dev, npm run build, npm run start. Introducing env vars and API routes is expected. Document any new env vars in README.
- **Testing**: Add a minimal test setup when introducing backend logic. Prefer a small number of high value tests for auth, org isolation, and core CRUD flows.
- **TypeScript**: Keep type safety in new components; prefer typed props and React.FC is unnecessary.
- **Tailwind 4 notes**: Use class-based utilities; avoid editing generated CSS. Keep global theme tokens consistent with `--font-geist-*` variables.
- **Routing**: App Router file system routing; add new routes as folders under `app/` with `page.tsx` and optional `layout.tsx`.
- **State/data**: Introduce server actions or route handlers as needed. Document data shapes and add loading and error states for new flows.
- **Accessibility**: Maintain alt text on images and descriptive link text; keep color contrast in both light and dark modes.
- **Dependencies**: Only core Next/React and Tailwind. Do not add heavy libraries without justification.
- **Deployment assumption**: Standard Next hosting (e.g., Vercel); avoid Node-specific runtime hooks unless configured in [next.config.ts](next.config.ts#L1-L7).
- **File naming**: Use kebab-case for route folders, `page.tsx`/`layout.tsx` per Next conventions; keep CSS in [app/globals.css](app/globals.css) unless scoped styles are required.
- **Performance**: Use `priority` on above-the-fold images (see [app/page.tsx](app/page.tsx#L6-L19)) and avoid blocking synchronous work in components.
- **When unsure**: Align with the existing landing page patterns before introducing new layout systems.
Product direction
Goal: Build ProjectAI as a mini SaaS for solo PMs and consultants.
Phase 1 timeline: 16 weeks.
Value theses to validate:

Users pay for automatic status reports.

Status reports save 2 hours per week.

Multi client plus templates beats generic tools.

Scope for Weeks 1 to 4

Multi tenant with organizations and org_users.

Projects, tasks, Kanban.

Dashboard and deterministic status report.
No Gantt, no mobile app, no bidirectional sync, no complex frameworks.

Integrations rule
ClickUp starts as manual import first.
Scheduled sync comes later.
If OAuth or import blocks more than 3 business days, implement CSV import fallback.

Data isolation rule
Every query must enforce org scoping.
No cross org access, ever.

Quality bar
Prefer small changes.
Prefer deterministic logic early.
Avoid heavy libraries unless required.