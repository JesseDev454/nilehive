# 10 — Google AI Studio usage order

Do not paste the whole package into one chat.

## Order

1. New chat → `01` design-system prompt → generate the component gallery.
2. Same or new chat → `07` shared system screens.
3. New chat per Admin workspace in `02` (header once per chat, then one workspace).
4. Repeat for Student `03`, President `04`, Executive `05`, Advisor `06`.
5. `08` cross-role audit.
6. `09` export prompts, one role at a time.

Recommended Admin order: Home → Approvals → Clubs → People → More → Events → Announcements → Notifications → Feedback → Analytics → Profile.

Recommended Student order: Home → Discover → Events → QR → My clubs → Dues → More → Announcements → Notifications → Feedback → Profile → Onboarding.

Recommended President order: Home → Proposals → Events → Members → More → Announcements → Reports → Club details → Club work → Notifications → Profile.

## Later implementation (not this task)

- Branch later: `codex/oneclub-ui-rebuild`
- Recover old frontend: `backup/pre-oneclub-frontend-rebuild`
- Do not push to main until explicitly approved

## Copy rule

Each workspace prompt is the fenced block only. Always precede it with `01` in that chat.
