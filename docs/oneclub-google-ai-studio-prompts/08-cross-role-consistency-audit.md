# 08 — Cross-role consistency audit

Run after all roles exist, in a new Studio chat with the design-system prompt.

```
Audit the generated OneClub UI across Student, President, Executive, Advisor, and Admin.

Confirm:
- OneClub name only; no Clubly, NileHive, Feedback Manager
- Same tokens, type, radius, motion, Moon/Sun theme behavior
- Exact five-item nav per role
- Official 14 club names
- Campus One fields read-only
- Payment-proof wording only
- Event QR: organizer displays, student scans
- Events are approved proposals
- President Members is read-only; no join-request or dues tools
- Admin-only: final proposal decision, join decisions, proof verification, feedback reading, people assignment
- Executive has My work, not approvals
- Advisor cannot make the final Admin decision
- No Tasks/Settings/Exports/Activity log Admin apps
- No My Feedback history, leave-club, personal QR, or fake progress
- Breakpoints 1440/1024/768/390/360 and 44px targets
- Ethical UX: no coercion, no fake urgency, numbers have context

Return a punch list of inconsistencies. Do not add features.
```
