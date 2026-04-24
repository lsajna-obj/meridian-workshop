# Technical Approach

**Proposal in response to RFP MC-2026-0417**

---

## Overview

The Meridian inventory dashboard is a Vue 3 / Python FastAPI application with flat JSON data files and no automated test coverage. Our approach treats the existing codebase as an asset to be stabilized and extended — not replaced. We will work in the actual source, not a parallel prototype, and every change we make will be covered by tests before it ships.

We sequence the work deliberately: testing infrastructure first, then remediation, then new capability, then documentation. This order is not arbitrary — it means that by the time we touch the Reports module or build the Restocking view, there is already a safety net in place.

---

## R3 — Automated Browser Testing (delivered first)

Before touching any existing code, we will establish end-to-end test coverage using Playwright against the running application. This is sequenced first because it is the prerequisite Meridian IT has set for approving any further changes.

Coverage will include all main application views: Dashboard, Inventory, Orders, Spending, and Reports. For each view we will cover:

- Page load and rendering
- Filter interactions (Time Period, Warehouse, Category, Order Status)
- Data display and key computed values
- Navigation between views

Tests will run against localhost in development and can be wired into any CI pipeline Meridian IT operates. We will deliver the test suite as part of the codebase alongside a short guide for running and extending it.

*Assumption: "Critical flows" means all main views, as confirmed. We will align on any additional edge cases in week one.*

---

## R1 — Reports Module Remediation

The previous vendor acknowledged the Reports module was "in progress" at handoff. Meridian has logged at least eight issues; no formal defect list exists. Our engagement begins with a full audit of the Reports page against the expected behavior documented in the RFP and the existing filter/API patterns used elsewhere in the application.

Known categories of issues from the handoff notes:

- **Filter wiring** — not all four filters (Time Period, Warehouse, Category, Order Status) are connected to the Reports API endpoint. We will audit each filter against the backend's `/api/orders` and related endpoints, identify which query parameters are missing or misapplied, and wire them correctly using the established pattern in `client/src/api.js`.

- **Internationalization gaps** — some labels, statuses, or data values in the Reports view are not passing through the i18n layer used elsewhere in the application. We will audit all display strings and bring them into compliance.

- **Data pattern inconsistencies** — the handoff notes flag that some views use the older Options API rather than the Composition API used in newer views. We will identify and remediate any such inconsistencies in the Reports module, bringing it in line with the rest of the codebase.

- **Console noise** — we will resolve any JavaScript errors or warnings surfaced in the browser console during normal Reports usage.

All defects found during the audit — including any beyond the eight referenced in the RFP — will be documented in a defect log delivered with the final handoff package.

---

## R2 — Restocking Recommendations

The Restocking view is the primary new capability. It will allow operations staff to input a budget ceiling and receive a prioritized list of recommended purchase orders based on current stock levels and demand forecasts.

**Data model.** The backend already exposes `/api/inventory` (stock levels by warehouse and category) and `/api/demand` (demand forecasts). The Restocking feature will introduce a new API endpoint — `/api/restocking` — that accepts a budget ceiling parameter and returns ranked purchase order recommendations. Recommendations will be calculated server-side in Python, using the existing in-memory data layer, with no database changes required.

**Recommendation logic.** The algorithm will prioritize SKUs where current stock falls below a threshold relative to forecasted demand, rank by urgency, and fit recommended order quantities within the supplied budget ceiling. The logic will be transparent: each recommendation will display the current stock level, forecasted demand, suggested order quantity, and estimated unit cost.

**Frontend.** A new Restocking view (`client/src/views/RestockingView.vue`) will be added to the navigation alongside existing views. It will follow the established Vue 3 Composition API patterns, use the shared filter system where applicable, and reuse existing chart and table components. The budget ceiling input will be a prominently placed control at the top of the view.

We will offer Plan Mode review before beginning the Restocking build, as it is the largest single deliverable. The `.claude/agents/vue-expert.md` subagent is available for focused frontend work if the scope warrants it.

*Note: The current data layer uses flat JSON files. The Restocking feature will be built against this layer. If Meridian plans a database migration, we recommend sequencing it after this engagement to avoid scope expansion.*

---

## R4 — Architecture Documentation

The previous vendor's handoff documentation is minimal — a stack summary, a file map, and a short list of known issues. This is a risk for Meridian IT. We will replace it with a current-state architecture overview suitable for ongoing ownership.

Deliverable: an HTML architecture document (`proposal/architecture.html`) that covers:

- System components and their responsibilities (frontend, backend, data layer)
- Data flow from user interaction through Vue filters → `api.js` → FastAPI → Pydantic models → response
- API endpoint inventory with parameters and response shapes
- Frontend view structure and component relationships
- Known constraints and extension points

This document will be produced during the engagement as we work through the codebase, not assembled at the end from memory. It will reflect the actual post-remediation state of the system.

---

## Desired Items (D1–D3)

**D1 — UI Modernization.** The current design uses a slate/gray palette with custom SVG charts and CSS Grid layouts. A visual refresh is achievable within the engagement window without rearchitecting the frontend. We will align on a target design direction (color palette, typography, component style) in week one. *Assumption: "current standards" means a clean, modern SaaS aesthetic — we will confirm this in the kickoff.*

**D2 — Internationalization.** The i18n layer exists in the codebase but is incomplete — the Tokyo team is working in English-only views. Extending full i18n coverage to remaining modules is well-defined work once the R1 audit establishes which strings are and are not localized. We will scope the full extent in week one.

**D3 — Dark Mode.** Operator-selectable theme for low-light warehouse environments. This is a CSS variable / design token change at the theme level, not a per-component change. We recommend prototyping it on an isolated branch to avoid touching main until it is ready — a clean demonstration of safe parallel development practices.

---

## Assumptions

1. The existing flat JSON data files are the authoritative data source for this engagement; no database migration is in scope.
2. The application runs on localhost:3000 (frontend) and localhost:8001 (backend) as documented.
3. D1 design direction will be confirmed at engagement kickoff; we will not begin UI work without alignment.
4. R1 defects beyond the eight referenced in the RFP are in scope for remediation at no additional cost, provided they are discovered during the Reports audit (not introduced by new work).
5. Meridian IT will provide CI/CD environment details if they want the Playwright tests wired into a pipeline; otherwise we deliver the suite configured for local execution.
