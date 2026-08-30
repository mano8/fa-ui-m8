---
title: How the plugin works
description: The ten ideas behind Reparto Docente — indivisible positions, exact targets, two independent balances, immutable revisions and nothing ever deleted.
sidebar:
  label: How it works
  order: 2
---

Reparto Docente only has about ten ideas in it. Once you know them, every screen and
every refusal message makes sense. Nothing on this page is optional reading — these
rules are enforced by the server, not merely suggested by the interface.

**On this page:** [three stages](#1-three-stages-in-a-fixed-order) ·
[allocation](#2-leadership-gives-you-a-number-and-may-change-it) ·
[the matrix](#3-the-group-subject-matrix-is-where-the-real-numbers-live) ·
[activities](#4-a-teaching-activity-is-the-unit-of-planning) ·
[two balances](#5-there-are-two-hour-totals-and-both-are-correct) ·
[indivisible positions](#6-positions-are-indivisible) ·
[exact targets](#7-every-teacher-must-land-exactly-on-their-target) ·
[feasibility](#8-feasibility-is-a-third-check) ·
[nothing is deleted](#9-nothing-is-ever-deleted) ·
[the server decides](#10-the-server-decides-not-the-screen)

---

## 1. Three stages, in a fixed order

**Configuration → Planning → Assignment.**

You cannot generate teacher positions before the plan is balanced and locked, and you
cannot assign a position before it has been generated. If a screen tells you a step is
not available yet, it is because the previous stage is not finished — not because
something is broken.

The left-hand menu is grouped by these three stages, so the menu itself is the running
order.

## 2. Leadership gives you a number, and may change it

School leadership tells the department how many **weekly group hours** it has been
allocated — 120 in the example used throughout this guide. You record that number on
the **Leadership allocation** page.

That figure is never overwritten. Every time it changes you record a **new revision**,
with a written reason, and the old one is kept forever as history. Exactly one revision
is "current" at a time.

![The leadership allocation page with its current revision and history](../../../../../assets/reparto/en/allocation.png)

If leadership changes the number *after* you have planned, the plan is marked **stale**
and new assignments are blocked until you explicitly reconcile — see
[Stage 2](/en/docs/reparto/stage-2-planning/#when-the-allocation-changes).

## 3. The group-subject matrix is where the real numbers live

You record three lists in Stage 1:

- **Teaching groups** — the classes: *1° ESO A*, *2° BAC B*, and so on.
- **Subjects** — what is taught: *Matemáticas*, *Tutoría*, *Docencia compartida*…
  Each subject carries *suggested* default hours.
- **The group-subject matrix** — one cell per (class, subject) pair that actually
  exists. This is where the **actual** planning values live.

The subject defaults only *seed* a new cell. Editing a subject default later never
rewrites a cell you have already created. That is deliberate: your per-class decisions
are not silently overwritten by a change to a template.

:::note[Empty is not zero]
In an hour field, leaving the box **empty** means *"use the subject's default"*.
Typing **0** means *"really zero hours"*. These are two different things and the
application never confuses them. If you want a cell to follow its subject, clear the
box rather than typing 0.
:::

## 4. A teaching activity is the unit of planning

A **teaching activity** is one concrete piece of teaching. It carries:

| Field | Meaning |
| --- | --- |
| **Group hours per group** | How many weekly hours *the class* receives. |
| **Teacher hours per position** | How many weekly hours *one teacher* spends on it. |
| **Teacher positions** | How many teachers are needed at the same time. |
| **Linked groups** | Which classes it applies to (one, several, or none). |

Activities come from two places:

- **Main activities** are generated for you, one per active main-subject matrix cell.
  This is called *materialisation*, and it only ever creates the ones that are missing.
- **Secondary activities** — tutoring, co-teaching, department duties — you add by hand,
  because they are the discretionary part of the plan.

## 5. There are two hour totals, and both are correct

This is the single idea people find surprising, so it gets its own page:
[Hours, balances and feasibility](/en/docs/reparto/hours-and-balances/).

The short version:

```text
Group hours   = what the classes receive     → must equal the leadership allocation
Teacher hours = what the teachers work       → must equal the sum of teacher targets
```

They are **not** the same number and they must **never** be added together. In the
worked example the plan is 120 group hours and 124 teacher hours, and both figures are
right at the same time.

![The planning balance header showing 120.00 group hours and 124.00 teacher hours, both with a difference of 0.00](../../../../../assets/reparto/en/planning-balance.png)

## 6. Positions are indivisible

When the plan is locked, the application generates one **requirement slot** — this guide
calls it a *position* — for every teacher an activity needs.

A position of 4 hours goes to **one** teacher, in full. It cannot be split as 3 + 1. It
cannot be shared. A teacher with only 3 hours left cannot take it. There is no hour box
on the assignment board precisely because there is nothing to type: the hours come from
the position.

An activity needing two teachers for 2 hours each produces **two** positions of 2 hours,
and they must go to **different** teachers.

## 7. Every teacher must land exactly on their target

Each participating teacher has:

```text
target = base weekly hours + authorized extra weekly hours
```

Before the process can be closed, every active participant must reach that target
**exactly**. Not below, not above. There is no override anywhere in the application.

If a teacher genuinely needs to work more, the department head first **authorizes extra
hours** for them — a separate, reason-required, audited action that raises the target.
Withdrawing an authorization is the same action with a value of 0.

Teachers carrying authorized extra hours are flagged as **authorized overload** wherever
they appear.

## 8. Feasibility is a third check

Two totals matching is necessary but not sufficient. It is entirely possible for the
group hours and the teacher hours to both balance and for there still to be *no way* to
hand out the indivisible positions so that everyone lands exactly on their target.

So the application runs a third check, called **assignment feasibility**, and shows it
next to the two balances. All three must be green before the plan can be locked:

![The three invariants: group hours balanced, teacher load balanced, reparto feasibility feasible](../../../../../assets/reparto/en/dashboard-invariants.png)

Feasibility is *not* a status of the plan; it is its own separate answer, and it resets
to **Not evaluated** whenever something relevant changes. That is normal — re-run the
evaluation from the Planning page.

## 9. Nothing is ever deleted

Reparto Docente is a record of decisions, so it removes almost nothing:

| Instead of deleting… | …the application does this |
| --- | --- |
| A teaching activity | **Retires** it — it stops counting, but stays visible with its retirement date. |
| A group-subject cell | **Retires** it, the same way. |
| An assignment | **Undo** — releases the position and re-opens the teacher's turn. Requires a written reason. |
| Moving a position to someone else | **Reassign** — one atomic action, not a delete plus a create. Requires a written reason. |
| An allocation figure | A **new revision** supersedes it; the old one is kept. |

Cancelled assignments stay on the board as history, without action buttons.

## 10. The server decides, not the screen

Every permission check in the interface is a statement about **what to show you**. The
Reparto service checks the same thing again on every request, and it is the one that
decides. This has two visible consequences:

- **Things fail closed.** When the application does not yet know your role, or cannot
  reach the server, it refuses rather than assuming you are allowed.
- **Buttons are absent, not greyed out.** If your account may not do something at all,
  the control is usually not rendered. If a control *is* there but disabled, the reason
  is shown next to it.

---

**Previous:** [← Guide overview](/en/docs/reparto/) ·
**Next:** [Getting started →](/en/docs/reparto/getting-started/)
