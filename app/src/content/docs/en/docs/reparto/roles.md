---
title: Who can do what
description: The five account roles in Reparto Docente, what each one may see and change, and why some buttons are missing rather than disabled.
sidebar:
  label: Who can do what
  order: 4
---

Reparto Docente adds **no roles of its own**. It reads the role your account already has
on this site and derives everything from that.

**On this page:** [the five roles](#the-five-roles) ·
[department head](#who-is-the-department-head) ·
[own records](#own-records-what-a-writer-may-do) ·
[why buttons disappear](#why-a-button-is-missing-rather-than-greyed-out) ·
[the three view tiers](#the-three-view-tiers)

---

## The five roles

Roles are a ladder: each one grants everything the roles below it grant.

```text
User  <  Reader  <  Writer  <  Administrator  <  Super administrator
```

| Role | View pages | Change own records | Run the department (plan, assign, configure) | Site-wide setup (schools, years, class levels) |
| --- | --- | --- | --- | --- |
| **User** | ✗ | ✗ | ✗ | ✗ |
| **Reader** | ✓ most* | ✗ | ✗ | ✗ |
| **Writer** | ✓ most* | ✓ own only | ✗ | ✗ |
| **Administrator** | ✓ | ✓ | ✓ | ✓ |
| **Super administrator** | ✓ | ✓ | ✓ | ✓ |

\* Eight pages — **Dashboard**, **Meeting**, **Participants**, **Assignments**, **Planning**,
**Audit**, **Versions** and **Exports** — need the Administrator role to *view*, because the
data behind them names other teachers and their hours. See
[the three view tiers](#the-three-view-tiers).

:::caution[A "User" account gets nothing here]
`User` is a perfectly valid account on this site, but it has **zero** capability inside
Reparto Docente — including reading. Every page will refuse it. If a colleague says the
Reparto pages are empty or refused for them, check their role first.
:::

## Who is the department head?

Everywhere this guide says *"the department head does X"*, the requirement is simply:
**your account is an Administrator or a Super administrator.** There is no separate
"department head" account type, and there never will be.

A department does have a **Department head** field, but it is *descriptive only*: it
records who is nominally in charge, for audit trails and for display. It grants no
permission whatsoever. Naming somebody in it does not let them do anything, and clearing
it does not take anything away.

:::note
Because of how the accounts service protects its user directory, *setting* the department
head field is in practice only possible for a Super administrator. An Administrator can
clear the field but usually cannot set it. This is a limit of the accounts service, not a
fault in Reparto Docente — and since the field authorizes nothing, it changes nothing
about who can run the department.
:::

## "Own records": what a Writer may do

A **Writer** may create, edit or delete only data that identifies them as its owner:

- **their own teacher profile** — its contact details and notes, never the link between
  the profile and an account;
- **their own position choice** during a meeting — binding themselves, and only
  themselves, to an available position;
- **their own turn** — starting, completing or skipping the turn that belongs to them.

Everything else — participants, subjects, groups, the matrix, the plan, other people's
assignments — is department-head work and needs Administrator or above.

Note that "Writer" is a *floor*, not a grant. It says the account tier may hold such a
control at all. Whether *this particular record* belongs to you is checked separately,
row by row.

## Why a button is missing rather than greyed out

Reparto Docente distinguishes three situations, and shows each one differently:

| Situation | What you see |
| --- | --- |
| **You may not do this at all** | The control is not rendered. Nothing to click, nothing greyed out. |
| **You may do this, but not right now** | The control is present and disabled, with the reason stated next to it. |
| **We do not know yet** | Neither the content nor a refusal — a brief waiting state. "Not yet" is not "not allowed". |

That last one matters: if the application has not finished working out who you are, it
will not guess. It waits, and then it either shows you the page or refuses it.

## The three view tiers

Stage 3 shows the same process to three different audiences, and the *server* decides
what each one is allowed to receive. This is not a display setting you can change.

| Tier | Who | What they get |
| --- | --- | --- |
| **Department head** | Administrator / Super administrator | Everything: per-teacher hours, reasons, diagnostics, the full audit trail. |
| **Teacher** | A participant, on **My view** | Their own five figures, the positions still free, whose turn it is, and an aggregate plan balance that names nobody. Never another teacher's hours, and never the written reason behind an extra-hours authorization. |
| **Shared screen** | The projector in the meeting room | Aggregates only. The data it is served contains no participant name and no per-teacher hours at all — so the projected screen physically cannot show one. |

A teacher asking for the department-head tier is refused. Asking *down* — a head looking
at the shared-screen tier — is allowed.

:::note[The tier holds on every path, not only on screen]
The tiers above are enforced where the data is served, not where it is displayed. The
process dashboard and the participant list carry the department-head tier — other
teachers' hours and the written extra-hours reason — so the server refuses them to
anyone below Administrator, and eight pages carry that floor with them: **Dashboard**,
**Meeting**, **Participants**, **Assignments**, **Planning**, **Audit**, **Versions** and
**Exports**. A Reader or Writer opening one is told the page needs the Administrator role.

Nothing a teacher needs moved: **My view** serves their own five figures and the free
positions, and the shared screen serves its nameless aggregates, both unchanged.
:::

---

**Previous:** [← Getting started](/en/docs/reparto/getting-started/) ·
**Next:** [Hours, balances and feasibility →](/en/docs/reparto/hours-and-balances/)
