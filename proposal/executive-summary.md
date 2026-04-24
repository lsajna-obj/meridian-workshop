# Executive Summary

**Proposal in response to RFP MC-2026-0417**
Submitted by: [Your Firm Name]
Date: April 25, 2026

---

Meridian Components has a working system built on a solid foundation — Vue 3 frontend, Python FastAPI backend, three-warehouse data model — that was left in an unfinished state by the previous vendor. The Reports module has known defects that have not been resolved. There is no automated test coverage, which has led Meridian IT to block further changes. Meanwhile, operations staff in Tokyo are working in English-only views, and the Restocking capability your team has been asking for has not been built. The gap between what the system should do and what it does today is costing your team time every day.

We have reviewed the RFP, the previous vendor's handoff notes, and the source code. This engagement is not a greenfield build — it is a focused rescue and extension of an existing investment. Our approach addresses that directly.

**What we will deliver:**

We will begin by establishing automated end-to-end test coverage across all main views (R3). This is the prerequisite that makes everything else safe: no subsequent change ships without a passing test suite, which gives Meridian IT the confidence to approve ongoing work. From that foundation, we will audit and resolve all defects in the Reports module (R1) — including issues not yet formally documented — and deliver a complete Restocking recommendations view (R2) that allows operators to generate purchase order recommendations against live stock levels, demand forecasts, and a budget ceiling. Architecture documentation (R4) will be produced throughout the engagement and delivered at close, so Meridian IT has a reliable reference for future work.

The desired items — UI modernization (D1), extended i18n (D2), and dark mode (D3) — are scoped and can be phased in within the same engagement window if priorities allow.

**Timeline and investment:** We will deliver the required scope in 6–8 weeks from contract award. Our fixed fee for R1–R4 falls within the $40,000–$60,000 range; detail is in the Pricing section.

**Why this engagement succeeds:** We scoped against the actual codebase, not assumptions. The estimate reflects what the work is, not what we wish it were.

---

*Assumptions: Budget band ~$40–60K confirmed. R1 defect list does not exist formally — our engagement begins with an audit. R3 covers all main application views. Delivery target is 6–8 weeks post-award. D1 design direction to be aligned in week one.*
