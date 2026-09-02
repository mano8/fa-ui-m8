---
title: Getting started
description: Signing in, finding the Reparto menu, choosing a process, and reading the setup checklist that tells you what is still missing.
sidebar:
  label: Getting started
  order: 3
---

This page gets you from a blank browser to a working screen. It assumes somebody has
already installed and switched on the Reparto plugin for this site — see
[Is Reparto Docente switched on here?](/en/docs/reparto/#is-reparto-docente-switched-on-here)

**On this page:** [sign in](#1-sign-in) · [find the menu](#2-find-the-menu) ·
[choose a process](#3-choose-a-process) · [the checklist](#4-read-the-setup-checklist) ·
[what to do first](#5-what-to-do-first)

---

## 1. Sign in

Use the account link at the bottom of the left-hand menu, or go to the site's sign-in
page directly. Reparto Docente has no login of its own — it uses the same account you
use for the rest of this site.

What your account is allowed to do depends on its **role**. In short:

- **Administrator** or **Super administrator** — you are the *department head* here. You
  can do everything in this guide.
- **Writer** — you can act on your own records: your own teacher profile, your own
  position choices, your own turn.
- **Reader** — you can use the reader-floor pages and change nothing. Eight pages that
  contain other teachers' figures require Administrator even to view.
- **User** — this application is not available to you at all.

The full table is on [Who can do what](/en/docs/reparto/roles/).

## 2. Find the menu

When the plugin is switched on, a **Reparto Docente** entry appears in the left-hand
menu. Open it and you will find the three stages:

```text
Reparto Docente
├── Stage 1 · Configuration
│     Dashboard · Processes · Schools · Academic years · Departments
│     Classroom stages · Teacher roster · Leadership allocation
│     Process participants · Subjects · Teaching groups
│     Group-subject matrix · Process settings
├── Stage 2 · Planning
│     Planning · Requirements · Planning exports
└── Stage 3 · Assignment
      Assignments · Meeting · My view · Shared screen
      Versions · Exports · Audit
```

That menu **is** the running order. Working straight down it, top to bottom, is a valid
way to set up a department from scratch.

:::tip
Every Reparto page also has **Previous** and **Next** links at the bottom, following the
same order. You can walk the whole application with those alone.
:::

## 3. Choose a process

Almost everything in Reparto Docente belongs to an **assignment process**: one
department, in one school, for one academic year. A process is the container for a whole
year's work.

Most pages carry a **Current process** bar at the top. If no process is selected yet,
that bar becomes a picker: choose the academic year, then the school, then the
department. Your choice is remembered on this browser, so you only do it once.

![The processes list showing the assignment processes that exist](../../../../../assets/reparto/en/processes.png)

If no process exists yet, create one from the **Processes** page. You will need a school,
an academic year and a department to exist first — the picker offers a **Create new**
option for each of them, so you can do it all from the one screen.

:::note[The picker never asks for an identifier]
You choose a process by year, school and department — never by typing an internal code.
Validation findings that concern a participant use the participant's display name.
:::

## 4. Read the setup checklist

The **Dashboard** is the first entry in the menu, and the top of it is a checklist
called **Set up your reparto**. It has fifteen steps grouped by the three stages, and it
tells you, right now, what is done and what is missing.

![The setup checklist on the dashboard, showing progress through the fifteen steps](../../../../../assets/reparto/en/dashboard.png)

Each step reads **Done**, **Open**, or **Not checked here**. The last one is not a
failure: it means this particular screen does not read that piece of information — for
example, no process has been selected yet, so the process-level steps cannot be checked.

The fifteen steps are:

| # | Step | Stage |
| --- | --- | --- |
| 1 | Create a school | 1 |
| 2 | Create an academic year | 1 |
| 3 | Create a department | 1 |
| 4 | Create an assignment process | 1 |
| 5 | Record the leadership hour allocation | 1 |
| 6 | Add process participants and their target hours | 1 |
| 7 | Add the subjects taught | 1 |
| 8 | Add the teaching groups | 1 |
| 9 | Fill the group-subject matrix | 1 |
| 10 | Review the configuration and the selection settings | 1 |
| 11 | Create the teaching plan | 2 |
| 12 | Balance the group hours and the teacher load | 2 |
| 13 | Lock the teaching plan | 2 |
| 14 | Generate the requirement slots | 2 |
| 15 | Hand out the positions in the meeting | 3 |

Below the checklist, the dashboard shows the two balances, the three invariants, how
many positions are still free, and where each participant stands.

![The dashboard's assignment progress panel: 37 live slots, 10 assigned, 27 available](../../../../../assets/reparto/en/dashboard-progress.png)

## 5. What to do first

If you are starting from nothing, do this in order. Each link goes to the detailed
instructions.

1. **[Create the school, academic year and department](/en/docs/reparto/stage-1-configuration/#global-setup)** —
   these are shared across the whole site, so they may already exist.
2. **[Add the classroom stages](/en/docs/reparto/stage-1-configuration/#classroom-stages)** —
   *ESO*, *Bachillerato*, and so on. Also shared, also possibly already there.
3. **[Add the teachers to the roster](/en/docs/reparto/stage-1-configuration/#teacher-roster)**.
4. **[Create the assignment process](/en/docs/reparto/stage-1-configuration/#the-assignment-process)**.
5. **[Record the leadership allocation](/en/docs/reparto/stage-1-configuration/#leadership-allocation)**.
6. **[Add the participants and their hours](/en/docs/reparto/stage-1-configuration/#participants)**.
7. **[Add the subjects and the teaching groups](/en/docs/reparto/stage-1-configuration/#subjects)**.
8. **[Fill the group-subject matrix](/en/docs/reparto/stage-1-configuration/#the-group-subject-matrix)**.
9. **[Check the process settings](/en/docs/reparto/stage-1-configuration/#process-settings)**.
10. Move on to **[Stage 2 — Planning](/en/docs/reparto/stage-2-planning/)**.

:::tip[You cannot break anything by looking]
Nothing in Reparto Docente changes when you open a page. Every action that changes
something asks you to confirm it first, and the ones that matter also ask you for a
written reason.
:::

---

**Previous:** [← How the plugin works](/en/docs/reparto/how-it-works/) ·
**Next:** [Who can do what →](/en/docs/reparto/roles/)
