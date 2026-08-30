---
title: Limits and operational notes
description: The deliberate product boundaries and operating limits that remain after the live meeting, authentication refresh and production-build remediations.
sidebar:
  label: Limits and operations
  order: 11
---

The current codebase has no known Reparto workflow blocker documented here. The previous
live-meeting, account-linking, duplicate-refresh, root-route and inline-script gaps were
remediated before the `2.0.0` service/client release pair. This page now records the
boundaries that are intentional and the operational behavior an administrator must plan
for.

**On this page:** [closed gaps](#closed-gaps) · [expected intervention](#expected-intervention) ·
[deliberate limits](#deliberate-limits) · [operational limits](#operational-limits) ·
[first start](#first-start-up-and-schema-revisions)

---

## Closed gaps

These statements are no longer limitations:

- An Administrator can open and close a meeting session and run all five turn actions.
- Teachers can link their own profile with a single-use claim code, choose a position and
  pass their own turn.
- Turn controls stay closed until a meeting session is open and show their disabled reason.
- Meeting-only edits do not reset feasibility.
- The shared screen shows balanced, pending and overloaded participant counts.
- Authentication bootstrap and API retries share one refresh flight; a page does not race
  two rotations of the same refresh token.
- Static output contains the root redirect and every executable inline script is admitted
  by its CSP hash without `unsafe-inline`.
- Server-composed validation and recovery messages name the affected participant.

## Expected intervention

### Assignment may pause for a feasibility re-evaluation

During assignment, the stored deterministic witness may be impossible to repair cheaply.
The service then blocks the next choice and names the recovery:

> *Selection is blocked because the deterministic witness could not be repaired
> (local_repair_not_found); run the administrative feasibility evaluation, then retry.*

This is not data loss or a failed meeting. Open **Planning**, run feasibility again, and
continue. The service deliberately refuses to guess when it can no longer prove that the
remaining indivisible positions still fit.

## Deliberate limits

### No teacher qualifications or eligibility rules

Any active participant may take any position if the hours, uniqueness, lifecycle and turn
rules allow it. The application does not model subject qualifications, grade restrictions,
bilingual credentials or preferred classes. Deciding who *should* teach what remains a
human decision.

### No automatic optimiser

The application validates and proves feasibility; it does not construct the department's
preferred plan automatically. Secondary activities and final choices are made by the
department.

### Generated positions are indivisible and not edited by hand

A generated requirement goes to one teacher in full. There is no partial assignment,
shared assignment, manual position editor or over-assignment override. Position changes
come through generation or explicit reconciliation. Authorized extra hours are a separate,
reasoned and audited change to the participant's target.

### Lifecycle and history are server-owned

There is no arbitrary status selector. Opening and closing sessions and the documented
transition actions move the process. A **final** process may be reopened with a reason;
**archived** is terminal. Activities and matrix cells are retired, assignments are undone
or reassigned, and allocation revisions are superseded rather than erased.

### Naming a department head uses the protected accounts directory

The department's **Department head** field is descriptive and grants no permission.
Looking up a different account in the identity-service directory is restricted to Super
administrators, so an Administrator can normally clear this field but not name a colleague.
Reparto cannot widen another service's directory policy.

### The projector uses an existing participant or administrator session

There is no head-issued projector grant. An Administrator can see every process; a Reader
or Writer sees processes through their participation. A plain non-participant projector
account therefore has no process to open. The shared-screen payload is still aggregate-only
and contains no names or per-teacher hours.

### Development databases reset across the old two-stage contract

There is no compatibility layer that migrates an old two-stage development database into
the three-stage domain. Development data from that obsolete contract is reset.

## Operational limits

The feasibility solver is bounded because the underlying indivisible-allocation problem is
hard:

- **Unknown** means the effort limit was reached without a proof. It blocks just like
  **Infeasible** until a feasible result exists.
- The validated operating target is about **30 participants and 100 active positions**.
  Larger processes are accepted, but an Unknown result becomes more likely.
- The full solver runs only on administrative paths. Teacher choices use cheap checks plus
  the stored witness and may ask for an administrative re-evaluation.

## First start-up and schema revisions

The service does not ship a hand-authored Alembic revision disconnected from its model
metadata. On first Compose start, it checks for model drift, generates the revision when
needed, then upgrades the database. A deployment must complete that first start successfully
before the application is ready.

This is why a clean installation may take longer on its first run and why no pre-written
revision file appears in the repository. Operators should back up persistent data, inspect
the generated migration output and wait for the Reparto health check before opening the UI.

---

**Previous:** [← Versions, exports and audit](/en/docs/reparto/versions-exports-audit/) ·
**Next:** [Troubleshooting →](/en/docs/reparto/troubleshooting/)
