# Bundle A Progress Log (Backend & Ticket Workflow — Chance)

## 2026-08-25

### Task 1: Fix the backend (find why it is down) — done
Root cause: `requirements.txt` was saved as UTF-16 (Windows editor artifact), which broke
`pip install -r requirements.txt`. Nobody could install dependencies, so nothing ever ran.
No `.venv` existed either.

Fix: converted `requirements.txt` to plain UTF-8 (old version kept as
`requirements.txt.bak-utf16`, safe to delete once everyone's confirmed clean), created `.venv`,
installed deps. Backend boots clean and serves `/` and `/docs`.

### Task 2: Setup steps written — done
See `SETUP.md` in this folder.

### Task 3: Run the SQLite → PostgreSQL migration — done, moved twice
First migrated `app.db` → local Postgres (`asm_db`) to prove the path works, then again into a
shared Neon Postgres instance so the whole team hits the same database instead of everyone's own
local copy. Both runs verified by reading real rows back via `psql` and round-tripping the API
(register → login → list tickets → create ticket), not just trusting the script's own output.

Found and fixed two real bugs in `migrate_sqlite_to_postgres.py` along the way:
- It imported `Base` from `app.db.session` but never imported the model modules
  (`user.py`, `voucher.py`, etc.). SQLAlchemy only registers a table on `Base.metadata` when its
  model class has been imported — so `Base.metadata.create_all()` was creating **zero tables**
  on a truly empty target. Fixed by importing the same model modules `main.py` imports.
- It used `target_engine.connect()` with no `.commit()`. In SQLAlchemy 2.0 a plain `.connect()`
  requires an explicit commit; without one, every inserted row was silently rolled back when the
  connection closed. The script printed "Inserted 9/9 rows" while the target table stayed empty.
  Fixed by switching to `target_engine.begin()`, which commits on a clean exit.

Current data on the shared DB: 4 users, 9 vouchers (tickets), 9 documents, 7 disposals —
matches `app.db` exactly. `notifications` table doesn't exist in the source SQLite; the script
skips it gracefully, matching the documented behavior.

### Security: stopped tracking `.env` in git
`backend/.env` was tracked in git with a real GitHub remote (`origin`) already configured. It
only ever held placeholder values (dummy JWT secret, `sqlite:///./app.db`) and those placeholder
commits are already on GitHub — no real secret was ever exposed. But once `.env` needed to hold
a real shared Postgres/Neon connection string, that had to stop before anyone committed it.

Fix: added `.gitignore` (excludes `.env`, `.venv/`, `__pycache__/`), ran `git rm --cached` on
`.env` so it's no longer tracked (file stays on disk), and added `backend/.env.example` — tracked,
placeholder values only — so new teammates know which variables to set without ever seeing the
real ones. Get the real values from Chance directly (Slack/WhatsApp), not from git.

### Task 6: DB structure freeze — communicated
No further structural DB changes
without flagging the team first.

### Tasks 7–11: frontend wired to the working backend, real gaps found and fixed
Tasks 7 (create ticket), 8 (ticket list on dashboard), and 9 (status changes) turned out to
already be wired in the frontend code (`voucherAPI.create/list/update` in `Voucherpage.jsx` and
both dashboards) — they just never worked because the backend was down. Verified them live once
the backend was fixed, and found four real, separate bugs while doing so:

- **Task 7b (Voucher → Ticket rename):** "Voucher" was still visible in both dashboards' nav,
  `UnifiedSidebar.jsx`, the ticket page's `<h1>`, and several status/success/error messages.
  Renamed every user-facing instance; left routes (`/voucher`), internal variable names
  (`voucherAPI`, `canCreateVoucher`), and CSS classes as-is since those aren't user-visible.

- **User Dashboard showed identical numbers for every user:** `userdashboard.jsx`'s stats were
  hardcoded (`{ totalAssets: 12, myTickets: 4, resolved: 8, pending: 2 }`) — the same object
  regardless of who logged in, and "Recent Activity" was 5 fabricated entries. Rewired both to
  fetch real tickets and filter by `ticket.requester_id === user.id`. Found the same
  `totalAssets: 12` stub on the IT Dashboard (never updated by its real-data fetch) and fixed
  that too, for consistency. Both now show `0` for assets — there's no real asset/inventory
  backend yet (Bundle B, unbuilt), so `0` is honest and `12` wasn't.

- **Task 10 (5 real statuses):** `Voucherpage.jsx`'s `STATUS_LABELS` relabeled the backend's real
  statuses to an invented vocabulary (`open` → "Pending", `resolved` → "Completed", `closed` →
  "Archived", etc.) — didn't match the plan or its own Style Guide. Replaced with the real labels
  (Open/Assigned/In Progress/Resolved/Closed) and added color-coded badges using the Style
  Guide's exact colors. The IT Dashboard's workload queue cards had the identical problem
  ("Pending Queue" for `open`, "Working Queue" for `in_progress`) — fixed those labels too.

- **Task 9 polish — loading indicator:** `handleStatusChange` had no loading state. Added
  `updatingTicketIds` tracking; while a status update is saving, that ticket's action buttons are
  replaced with a spinner + "Updating status…" text.

- **Task 11 (clear failure messages):** checked the actual rendering, not just that a message
  existed. `Voucherpage.jsx`'s message box used the same teal styling for success ("Ticket
  submitted successfully.") and failure ("Failed to submit ticket") — visually indistinguishable.
  Added a `messageType` ('success' | 'error') alongside the message text; errors now render in
  red with `role="alert"`, successes in the original teal with `role="status"`, matching the red
  convention the IT Dashboard already used for its own error banner. Also found the User
  Dashboard's new ticket-fetch call silently swallowed failures (empty stats, no explanation) —
  added a visible red error message there too.

All changes verified with a full `react-scripts build` (not just started, actually built) —
compiled clean, zero warnings, after fixing one `exhaustive-deps` lint warning along the way.

### Current state
Backend runs against the shared Neon Postgres database. `DATABASE_URL` in `.env` points at Neon;
`.env.example` has the placeholder shape for teammates setting up their own local `.env`. Core
ticket journey (login → create → dashboard → status change) is wired end-to-end and verified.

## Not done yet
- **Nothing has been committed or pushed.** Everything above — backend fixes, migration script
  fixes, docs, and all the frontend changes — is still sitting as uncommitted changes directly on
  `main`, not on the agreed `bundle-a-backend` branch (see shared setup task 0e), and nothing is
  pushed to `origin`. Lesly and Christophe can't build on any of this until it's actually pushed
  somewhere they can pull from. Next thing to do.
- Task 5: only create/read/update were exercised through the real API; no delete endpoints exist
  anywhere in the backend (tickets/users use status/is_active toggles instead) — that looks
  intentional for an audit-trail system, not a gap, but worth confirming with the team rather
  than assuming.

### Fixed: `DATETIME` bug in `run_startup_migrations`
Three `ALTER TABLE` statements (`users.updated_at`, `documents.user_signed_at`,
`documents.approved_at`) used SQLite's `DATETIME` type name, which doesn't exist in Postgres —
`type "datetime" does not exist`. It was dormant (those columns already exist after `create_all`
on our current DB, so the `ALTER` never actually ran), but would have broken the app on startup
the moment it ever needed to add a genuinely missing column. Changed all three to `TIMESTAMP`
(valid Postgres syntax). Verified for real, not just by reading the diff: built a throwaway
Postgres schema with `users`/`documents` tables missing exactly those columns, ran
`run_startup_migrations` against it, confirmed the columns get added as
`timestamp without time zone` with no errors, then dropped the test schema.

