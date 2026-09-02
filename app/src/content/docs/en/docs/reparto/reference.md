---
title: Reference
description: Every Reparto Docente page with the role it needs, the statuses a process and a plan can hold, and a glossary of every term the application uses.
sidebar:
  label: Reference
  order: 13
---

Look-up material. Nothing here is a tutorial — for that, start at the
[guide overview](/en/docs/reparto/).

**On this page:** [pages and permissions](#pages-and-permissions) ·
[process statuses](#process-statuses) · [plan states](#teaching-plan-states) ·
[position statuses](#position-statuses) · [feasibility answers](#feasibility-answers) ·
[glossary](#glossary)

---

## Pages and permissions

Every page carries **two** floors. **See** is the minimum role that may open it. **Change**
is the minimum role at which its editing controls may appear at all.

| Page | Address | See | Change |
| --- | --- | --- | --- |
| Dashboard | `/reparto` | **Administrator** | Administrator |
| Processes | `/reparto/processes` | Reader | Administrator |
| Schools | `/reparto/setup/schools` | Reader | Administrator |
| Academic years | `/reparto/setup/academic-years` | Reader | Administrator |
| Departments | `/reparto/setup/departments` | Reader | Administrator |
| Classroom stages | `/reparto/setup/classroom-stages` | Reader | Administrator |
| Teacher roster | `/reparto/setup/teacher-roster` | Reader | **Writer** |
| Leadership allocation | `/reparto/processes/{id}/allocation` | Reader | Administrator |
| Process participants | `/reparto/processes/{id}/participants` | **Administrator** | Administrator |
| Subjects | `/reparto/processes/{id}/subjects` | Reader | Administrator |
| Teaching groups | `/reparto/processes/{id}/teaching-groups` | Reader | Administrator |
| Group-subject matrix | `/reparto/processes/{id}/group-subjects` | Reader | Administrator |
| Process settings | `/reparto/processes/{id}/settings` | Reader | Administrator |
| Planning | `/reparto/processes/{id}/planning` | **Administrator** | Administrator |
| Requirements | `/reparto/processes/{id}/requirements` | Reader | Administrator |
| Assignments | `/reparto/processes/{id}/assignments` | **Administrator** | Administrator |
| Meeting | `/reparto/meeting/{id}` | **Administrator** | Administrator |
| My view | `/reparto/processes/{id}/my-view` | Reader | **Writer** |
| Shared screen | `/reparto/processes/{id}/shared` | Reader | Administrator |
| Versions | `/reparto/processes/{id}/versions` | **Administrator** | Administrator |
| Exports | `/reparto/processes/{id}/exports` | **Administrator** | Administrator |
| Audit | `/reparto/processes/{id}/audit` | **Administrator** | Administrator |

Notes:

- `{id}` is normally the word **`current`**, which resolves to the process you picked.
  Choosing a process is done by year, school and department — never by typing a code.
- Every address is prefixed by the site language, for example `/en/reparto/…`.
- The two **Writer** floors are floors, not grants. The teacher roster applies a further
  per-row ownership check — a Writer edits **their own** profile and nobody else's, while
  creating, linking and deleting profiles stay Administrator. *My view* covers the
  caller's own selection and their own turn.
- Eight pages have an Administrator **See** floor because their live or historical
  payloads contain other participants' hours, named validation findings, written reasons,
  snapshots or artefact inventories: Dashboard, Meeting, Participants, Assignments,
  Planning, Audit, Versions and Exports.
- Whoever runs the site can rename any address or drop a page entirely, so your deployment
  may differ.
- Every one of these checks is about **what to show you**. The server checks again on each
  request and is the one that decides.

## Process statuses

| Status | Meaning |
| --- | --- |
| **Draft** | Being configured. |
| **Ready for meeting** | Configuration and planning complete. |
| **Meeting open** | A selection meeting is in progress. |
| **Assigning** | Positions are being handed out. |
| **Department proposal** | The department's proposed reparto. |
| **Sent to school leadership** | Submitted upstairs. |
| **Returned by school leadership** | Sent back for changes. |
| **Internal revision** | Being revised by the department. |
| **Final** | Closed. Every change is refused until it is reopened. |
| **Reopened** | Reopened after being final, with a recorded reason. |
| **Archived** | Terminal. Cannot be reopened. |

You never set these by hand — there is no status control anywhere in the application.

## Teaching plan states

| State | Meaning |
| --- | --- |
| **Draft** | Being built. |
| **Unbalanced** | One or both totals do not match their target. |
| **Balanced** | Both totals match exactly. |
| **Locked** | Frozen, ready for generation. |
| **Requirements generated** | Positions exist. |
| **Stale** | Something changed underneath — usually the allocation. |
| **Reconciliation required** | An allocation change affects assigned positions and must be resolved by hand. |

Plan state and feasibility are **separate**. A plan can be *Balanced* and *Infeasible* at
the same time; the two answer different questions.

## Position statuses

| Status | Meaning |
| --- | --- |
| **Available** | Free; can be assigned. |
| **Assigned** | Held by a participant in full. |
| **Stale** | The plan moved underneath it. |
| **Reconciliation required** | Explicitly affected by an allocation change. |

## Feasibility answers

| Answer | Blocks locking and assignment? |
| --- | --- |
| **Feasible** | No. |
| **Infeasible** | Yes. |
| **Unknown** | Yes — treated as *not proven*. |
| **Not evaluated** | Yes — run the evaluation. |

## Glossary

**Academic year** — a labelled school year, belonging to a school, with a start and end
date.

**Allocation revision** — one immutable record of the weekly group hours school leadership
gave the department, with a mandatory reason. Exactly one is current; the rest are history.

**Allocation category** — whether a subject is **Main** (a mandatory planning input) or
**Secondary** (optional). Not a yes/no flag, and never called "is main".

**Assignment** — one participant holding one complete position. Cancelled by **undo**,
moved by **reassign**, never deleted.

**Assignment process** — one department, in one school, for one academic year. The
container for everything.

**Activity type** — a descriptive label on an activity: *Ordinary*, *Tutoring*,
*Co-teaching*, *Support*, *Department level*, *Other*. **It never changes behaviour.**

**Authorized extra hours** — an explicit, reasoned, audited addition to a participant's
target. Not a tolerance applied afterwards, and not editable on the participant form.

**Authorized overload** — the flag on a participant carrying authorized extra hours.

**Classroom stage** — a level of schooling (*Secundaria*/`ESO`, *Bachillerato*/`BAC`) with
its grade range. Shared site-wide.

**Department head** — in this application, simply an account with the **Administrator** or
**Super administrator** role. The `Department head` field on a department is descriptive
and grants nothing.

**Feasibility** — whether the indivisible positions *can* be handed out so every
participant lands exactly on their target. The third invariant.

**Generation** — the numbered act of producing positions from a locked plan. Each
regeneration gets a new number.

**Group hours** — the hours a **class** receives. Measured against the leadership
allocation.

**Group-subject matrix** — one cell per (class, subject) pair, holding the **actual**
planning values.

**Inherited** — an hour field left empty, meaning "use the subject's default". Not the same
as a typed `0`.

**Main activity** — an activity created for you from an active main-subject matrix cell.

**Materialisation** — creating the missing main activities from the matrix. Idempotent:
running it twice creates nothing new.

**Participant** — a teacher taking part in a specific process, with base hours, authorized
extra hours and a target.

**Position** (also *requirement slot*) — one indivisible teacher requirement generated from
a locked plan. Taken whole or not at all.

**Reconciliation** — the explicit workflow for resolving an allocation change that affects
assigned positions. Never automatic, never destructive.

**Retire** — how activities and matrix cells leave the plan. They stop counting but stay
visible, with a retirement date. There is no delete.

**Secondary activity** — tutoring, co-teaching, support or department duties, added by hand.

**Stale** — a plan whose inputs moved after it was locked or generated. Blocks new
assignments until reconciled.

**Target hours** — a participant's `base + authorized extra`. Must be reached exactly.

**Teacher hours** — the hours a **teacher** works. Measured against the sum of participant
targets. Never added to group hours.

**Teacher positions** — how many teachers an activity needs at the same time. Two positions
of one activity must go to two different teachers.

**Teaching activity** — one concrete piece of teaching, with its group hours, teacher hours
per position, position count and linked classes.

**Teaching group** — a class, such as *1° ESO A*.

**Teaching plan** — the single plan a process owns. Created explicitly; there is at most
one.

**Teacher roster** — the site-wide list of teaching staff, separate from user accounts. A
roster entry may be linked to an account.

**Claim code** — a single-use, expiring code issued by an Administrator for one unlinked
teacher profile. Redeeming it binds that profile to the account currently signed in; the
plain code is shown only when it is issued.

**Version** — an immutable snapshot of the whole process, captured on request.

**Witness** — the worked-out arrangement the application keeps as proof that the remaining
positions can still be handed out exactly. Never shown to teachers or on the projector.

---

**Previous:** [← Troubleshooting](/en/docs/reparto/troubleshooting/) ·
**Back to:** [Guide overview](/en/docs/reparto/)
