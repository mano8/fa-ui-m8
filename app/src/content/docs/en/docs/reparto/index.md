---
title: Reparto Docente guide
description: A complete, plain-language guide to the Reparto Docente plugin — how it shares a department's weekly teaching hours between its teachers in three stages.
sidebar:
  label: Guide overview
  order: 1
---

**Reparto Docente** shares out a school department's weekly teaching hours among the
teachers of that department. It replaces the spreadsheet that a department head
usually keeps by hand, and it checks the arithmetic for you at every step.

This guide is written for people who have never used the application before. You do
not need to know anything about programming, databases or the words the developers
use. Every screen shown here is a real screenshot of the running application.

![The Reparto Docente dashboard, showing the setup checklist and the three invariants](../../../../../assets/reparto/en/dashboard.png)

## What problem it solves

A school's leadership tells a department: *"you have 120 teaching hours a week."*
The department has a set of classes, a set of subjects and a set of teachers. Somebody
has to turn those 120 hours into a concrete list of "who teaches what", where:

- every class gets the hours it is entitled to;
- every teacher ends up with **exactly** their contracted workload — not one hour more,
  not one hour less;
- nothing is quietly lost or double-counted along the way.

Reparto Docente walks you through that in **three stages**, and it refuses to let you
skip ahead.

## The three stages at a glance

| Stage | What you do | Where |
| --- | --- | --- |
| **1 · Configuration** | Record the school, the year, the department, the teachers, the classes, the subjects, and how many hours leadership gave you. | [Stage 1 — Configuration](/en/docs/reparto/stage-1-configuration/) |
| **2 · Planning** | Turn that configuration into a *teaching plan*: what is actually taught, by how many teachers, for how many hours. Then lock it and generate the teacher positions. | [Stage 2 — Planning](/en/docs/reparto/stage-2-planning/) |
| **3 · Assignment** | Hand each generated position to one teacher, in a meeting or one by one. | [Stage 3 — Assignment](/en/docs/reparto/stage-3-assignment/) |

The order is not a suggestion. The server refuses stage-3 work against a plan that has
not finished stage 2, and stage 2 has nothing to work with until stage 1 is filled in.

## How to read this guide

If you are setting up the application for the first time, read the pages in order.
If you are looking for one specific thing, jump straight to it.

### Start here

1. **[How the plugin works](/en/docs/reparto/how-it-works/)** — the ten ideas behind
   the whole application, in plain words. Read this once and the rest will make sense.
2. **[Getting started](/en/docs/reparto/getting-started/)** — signing in, finding the
   menu, choosing a process, and the **Setup checklist** button that tells you what is
   still missing, from any page.
3. **[Who can do what](/en/docs/reparto/roles/)** — the five account roles, and why a
   button is sometimes simply absent instead of greyed out.

### The three stages, step by step

1. **[Stage 1 — Configuration](/en/docs/reparto/stage-1-configuration/)** — schools,
   years, departments, class levels, the teacher roster, the leadership allocation,
   participants, subjects, teaching groups, the group-subject matrix, and the process
   settings.
2. **[Stage 2 — Planning](/en/docs/reparto/stage-2-planning/)** — creating the plan,
   materialising the main activities, adding tutoring and co-teaching, reading the
   validations, locking, and generating the positions.
3. **[Stage 3 — Assignment](/en/docs/reparto/stage-3-assignment/)** — the assignment
   board, giving a position to a teacher, undoing, and moving a position.

### Concepts and reference

1. **[Hours, balances and feasibility](/en/docs/reparto/hours-and-balances/)** — why
   there are **two** hour totals that are both correct and must never be added
   together, and what "feasible" means.
2. **[The meeting, teacher view and shared screen](/en/docs/reparto/meeting-and-lan/)** —
   running the live selection meeting, and what teachers and the projector see.
3. **[Versions, exports and audit](/en/docs/reparto/versions-exports-audit/)** — saving
   snapshots, comparing years, producing documents, and the trail of who did what.
4. **[Reference](/en/docs/reparto/reference/)** — every page address, the permission
   each one needs, and a glossary of every term this application uses.

### When something goes wrong

1. **[Limits and operational notes](/en/docs/reparto/limitations/)** — the deliberate
   product boundaries, first-start deployment rule and solver limits that remain after
   the live-meeting remediation.
2. **[Troubleshooting](/en/docs/reparto/troubleshooting/)** — the messages you may see
   and what each one actually means.

:::note[The live meeting is available]
An Administrator can open and close a meeting session, initialise and drive the turn
order, and give each teacher a single-use claim code for *My view*. Teachers can choose a
free position or pass their own turn when the process settings allow it. See
[The meeting, teacher view and shared screen](/en/docs/reparto/meeting-and-lan/).
:::

## Is Reparto Docente switched on here?

Reparto Docente is an **optional** part of this site. It is present only when the
administrator has both installed it and pointed it at a running Reparto service. If it
is switched on, a **Reparto Docente** entry appears in the left-hand menu, with three
groups inside it — *Stage 1 · Configuration*, *Stage 2 · Planning* and
*Stage 3 · Assignment*.

If you do not see that entry, the plugin is not enabled for this deployment; nothing
you do in this guide will apply. Ask whoever runs the site.

## About the screenshots in this guide

Every screenshot is taken from the live application against a demonstration department
called **Matemáticas · DEMO**: 17 teaching groups, 14 subjects, 6 teachers, a leadership
allocation of 120 hours a week, and a completed plan of 37 teacher positions. The
numbers you see — 120 group hours against 124 teacher hours — are the worked example
this guide keeps coming back to, and they are explained in
[Hours, balances and feasibility](/en/docs/reparto/hours-and-balances/).

---

**Next:** [How the plugin works →](/en/docs/reparto/how-it-works/)
