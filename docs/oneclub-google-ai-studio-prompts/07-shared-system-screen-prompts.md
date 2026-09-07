# 07 — Shared system-screen prompts

Paste the shared design-system prompt first.

### Shared system screens

```
Generate only OneClub shared system screens used by every role. Visual cue: ADMIN/Shared Screens pass 6, OneClub naming, no QA chrome.

Screens:
1. Continue with Campus One (no email/password form).
2. Returning from Campus One (short loading, not a spinner-only dead end).
3. Session expired → continue with Campus One.
4. Account unavailable / suspended if shown by profile.account_status.
5. No access to this workspace (wrong OneClub role).
6. Page not found.
7. Offline with retry; keep prior content when possible.
8. Recoverable error with safe-work copy.
9. Use your Nile University email (unsupported domain).
10. File too large / invalid type for a receipt.
11. Sign-out confirmation (Cancel / Sign out — never “I’ll risk it”).
12. Shared skeletons and a small empty-state pattern.

Light and dark, desktop and mobile. No role selector. No Feedback Manager. No System theme.

Cover the six passes: core screens, the Campus One return flow, details/copy, interactions, relevant system states, final audit including the 12 psychology questions.
```
