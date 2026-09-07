# Step 9 Group 4: Admin Final Proposal Review

- Removed the obsolete bearer-token gate from the Admin final-review query.
- The shared API client remains responsible for Campus One cookie authentication.
- Reads the paginated response from `items`.
- Uses the backend's `event_date` and `submitted_at` fields.
- Requests the first 100 proposals at the `admin_review` stage.
- Preserves existing decision validation, mutation, cache invalidation, CSRF handling, and role protection.

The regression test proves the queue loads without a bearer token. The focused test, TypeScript, and production build passed before this checkpoint was committed.
