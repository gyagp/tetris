# Autopo execute Session

## Work Unit
Verify README contains game description, controls, features, and deployment instructions

## Acceptance Criteria
- README.md includes game description
- README.md includes controls section
- README.md includes deployment instructions

## Rules
# Rules


- **Before making any code changes, verify whether the acceptance criteria are already met by the existing code** — wu-002 failed twice because the start screen already had shimmer/glow animations. The agent made unrelated changes instead of checking first.
  Learned: iteration 1, wu-002

- **Never modify files outside the scope of the work unit, even if improvements seem beneficial** — wu-002 modified TwoPlayerGame, GameInstance, and Sidebar for Chinese localization when the work unit only asked for start screen polish
  Learned: iteration 1, wu-002

- **If existing code already satisfies acceptance criteria, submit only verification tests and note no implementation changes were needed** — The correct action for wu-002 was to confirm the start screen already met criteria and add tests, not to invent unrelated work
  Learned: iteration 1, wu-002

- **When retrying after a rejection, diff your changes against the clean base branch — not against your previous attempt — to ensure no out-of-scope artifacts survive** — wu-003 passed on scope for implementation files but carried over '玩家 1'/'玩家 2' test changes from the wu-002 localization attempts, causing a final rejection for a two-line leftover
  Learned: iteration 1, wu-003

- **Test files are in scope only if they test the acceptance criteria of the current work unit — do not include test suites from other work units** — wu-003 included 'Start screen polish' tests that belonged to wu-002, flagged as wrong work unit
  Learned: iteration 1, wu-003

- **Always revert out-of-scope commits from HEAD before starting any retry — use git reset or revert to return to the clean base branch state** — wu-004 failed 4 times because out-of-scope localization commits from wu-002/wu-003 were never reverted from HEAD, blocking all subsequent submissions
  Learned: iteration 1, wu-004

- **Never submit a diff that contains only CLAUDE.md changes — the reviewer treats this as 'no submission'** — wu-004 attempt 3 submitted onl