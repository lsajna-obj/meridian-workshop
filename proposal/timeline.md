# Timeline

**Proposal in response to RFP MC-2026-0417**
Target delivery: 6–8 weeks from contract award

---

## Phased Delivery Plan

The engagement is structured in three phases. Each phase ends with a working, demonstrable state — no work is held back until a big-bang delivery at the end.

---

### Phase 1 — Foundation (Weeks 1–2)

**Goal:** Codebase is understood, tests exist, defects are catalogued.

| Week | Activity |
|------|----------|
| 1 | Kickoff and environment setup. Architecture walkthrough of the existing codebase. Begin R4 documentation in parallel. Confirm D1 design direction. |
| 1 | R1 audit: systematic review of the Reports module against expected behavior. Document all defects found, not just the eight referenced in the RFP. |
| 2 | R3 delivery: Playwright end-to-end test suite covering all main views. Tests passing on a clean checkout. Delivered to Meridian IT for review. |

**Phase 1 exit criteria:** Test suite is green. Defect list for R1 is complete and agreed with Meridian.

---

### Phase 2 — Remediation and Build (Weeks 3–6)

**Goal:** Reports is fixed. Restocking is built and working.

| Week | Activity |
|------|----------|
| 3 | R1 remediation: resolve all catalogued Reports defects. Each fix is covered by a new or extended test before merging. |
| 4 | R2 design and backend: new `/api/restocking` endpoint, recommendation algorithm, unit-level validation against sample data. |
| 5 | R2 frontend: Restocking view built to established Vue 3 patterns. Budget ceiling input, ranked recommendations table, warehouse filter integration. |
| 6 | R2 integration and review: full end-to-end Restocking flow tested. Meridian ops team walkthrough. Revisions based on feedback. |

**Phase 2 exit criteria:** Reports defects resolved and tested. Restocking view is functional and accepted by Meridian operations team.

---

### Phase 3 — Documentation and Handoff (Weeks 7–8)

**Goal:** Meridian IT can own and extend the system independently.

| Week | Activity |
|------|----------|
| 7 | R4: Architecture documentation finalized and reviewed with Meridian IT. Reflects post-remediation system state. |
| 7–8 | Desired items (D1–D3) if in scope: UI refresh, i18n extension, dark mode prototype. Sequenced based on Meridian's priorities at this point. |
| 8 | Final handoff: complete codebase, test suite, architecture docs, defect log. Transition call with Meridian IT. |

**Phase 3 exit criteria:** All R1–R4 deliverables accepted. Handoff package complete.

---

## Milestones Summary

| Milestone | Target |
|-----------|--------|
| Test suite delivered (R3) | End of week 2 |
| Reports remediation complete (R1) | End of week 3 |
| Restocking view accepted (R2) | End of week 6 |
| Architecture documentation delivered (R4) | End of week 7 |
| Final handoff | End of week 8 |

---

## Notes

- Architecture documentation (R4) is produced throughout the engagement, not assembled at the end. The final document reflects the actual delivered state of the system.
- Desired items D1–D3 are scoped to fit within the 8-week window if Meridian confirms priorities at kickoff. If all three are in scope, we recommend sequencing: D2 (i18n, builds on R1 audit findings) → D1 (UI refresh) → D3 (dark mode, isolated branch).
- Timeline assumes timely access to the codebase and a designated Meridian point of contact for weekly reviews. Delays in feedback will shift the schedule proportionally.
