---
title: Troubleshooting
description: The messages Reparto Docente shows you, what each one actually means, and what to do about it.
sidebar:
  label: Troubleshooting
  order: 12
---

Most refusals in Reparto Docente are the application protecting a rule, not a fault. This
page translates the ones you are most likely to meet.

**On this page:** [nothing appears](#nothing-appears-at-all) ·
[empty pages](#a-page-is-empty) · [cannot lock](#i-cannot-lock-the-plan) ·
[cannot assign](#i-cannot-assign-a-position) ·
[allocation changes](#i-changed-the-allocation-and-everything-stopped) ·
[hours look wrong](#the-hours-look-wrong) · [meeting](#the-meeting-controls-are-disabled)

---

## Nothing appears at all

### There is no "Reparto Docente" entry in the menu

The plugin is not enabled for this deployment. It is optional, and it appears only when it
has been both installed **and** pointed at a running Reparto service. Nothing you do in
the interface will change that — ask whoever runs the site.

### "You do not have access to this page"

Your account's role is too low. Reparto Docente needs at least **Reader** to see anything;
a **User** account has no capability here at all. See
[Who can do what](/en/docs/reparto/roles/).

### The page sits on "Checking your access…"

The application has not yet worked out who you are. It deliberately shows neither the
content nor a refusal while it does not know — "not yet" is not "not allowed". If it never
resolves, reload the page.

### I was signed out in the middle of working

Sign in again, then check the connection state. Authentication bootstrap and API retries
now share one coordinated refresh; repeated sign-outs are no longer an expected planning
page race. If it repeats, inspect the auth service health and browser network error.

## A page is empty

### "Select a process first"

No process is chosen. Use the **Current process** bar at the top of the page, or the
Processes page. Your choice is remembered on this browser.

### The allocation page shows no current allocation

Normal for a new process — no allocation has been recorded yet. This is an empty state,
not an error.
[Record the first revision](/en/docs/reparto/stage-1-configuration/#leadership-allocation).

### Every Stage 2 screen is empty

The teaching plan has not been created yet. A process owns at most one plan and it is not
created automatically.
[Create it from the Planning page](/en/docs/reparto/stage-2-planning/#0-create-the-teaching-plan).

### The materialisation panel lists nothing

There are no active main-subject cells in the matrix. Stage 2 has no input until at least
one cell exists.
[Fill the matrix](/en/docs/reparto/stage-1-configuration/#the-group-subject-matrix).

### The checklist says "Not checked here"

That step cannot be evaluated from this screen — usually because no process is selected
yet. It is not a failure, and it is never counted as missing: the dashboard reports those
steps separately, beside the progress count.

### I cannot find the setup checklist

It is the **Setup checklist** button at the top of every page, beside the **?** button.
The **Dashboard** shows the same checklist laid out in full, with a progress bar and the
next step to do.

### A page says "No process selected"

It has nothing to report on until you pick one. Use the dropdown on that screen, or follow
its **Create an assignment process** link if none exists yet. Processes are created on the
**Processes** page, never on the dashboard.

## I cannot lock the plan

Locking needs **four** things at once. Check them in this order:

1. **Group hours difference is `0.00`.** If not, adjust the activities or check the
   allocation.
2. **Teacher hours difference is `0.00`.** If not, adjust the secondary activities, the
   teacher-position counts, or the participants' targets.
3. **Feasibility says Feasible.** If it says *Not evaluated*, run the evaluation. If it
   says *Infeasible*, read the diagnostics panel. If it says *Unknown*, the check ran out
   of effort — simplify the plan or try again.
4. **No blocking findings that count against the lock.**

:::note[`plan.requirements_not_generated` is not a problem]
This finding is present on every plan that has not generated its positions yet — which is
every plan you are about to lock. It does not block locking.
:::

### "The service unlocks a locked pre-generation plan only"

You are trying to unlock a plan that has already generated its positions. Unlock exists
only for a plan that is locked but not yet generated. Use **regeneration** or the
**reconciliation** workflow instead — the panel says which.

## I cannot assign a position

### A participant is listed with a reason instead of being selectable

That is the point — the application tells you *why* rather than hiding the option:

| Reason | What to do |
| --- | --- |
| The participant is inactive | Reactivate them, or choose somebody else. |
| They already hold another position of the same activity | Two positions of one activity must go to different teachers. Choose somebody else. |
| It would take them past their remaining target | The position is bigger than their remaining hours. Positions cannot be split — either choose a different participant, or authorize extra hours for this one first. |

### "Selection is blocked because the deterministic witness could not be repaired"

The full message reads something like:

> *Selection is blocked because the deterministic witness could not be repaired
> (local_repair_not_found); administrative feasibility evaluation is required.*

**What it means:** the application keeps a worked-out arrangement proving the remaining
positions can still be handed out exactly. Your last few assignments moved things far
enough that it could not adjust that arrangement on the spot, and it will not continue on
an arrangement it can no longer prove.

**What to do:** go to the Planning page, run the feasibility evaluation again, and return
to the board. Nothing is broken and nothing is lost.

### "A slot cannot be split, so authorize extra hours first"

The full message names the numbers:

> *Requirement … needs 8.00 hours but the participant has only 5.00 remaining before the
> target of 21.00; a slot cannot be split, so authorize extra hours first.*

Positions are indivisible. Either give this position to somebody with exactly enough hours
left, or raise this participant's target by authorizing extra hours — a separate action
that requires a written reason.

### The whole board refuses new assignments

The plan is **stale** or needs **reconciliation**, usually because the leadership
allocation changed. See the next section.

## I changed the allocation and everything stopped

That is the designed behaviour. Recording a new allocation revision marks the plan stale
and blocks new assignment operations until you explicitly reconcile.

Nothing was deleted: every activity, position and assignment is still there. Go to
**Planning → Allocation changes and reconciliation**, preview the reconciliation, resolve
each affected assigned position by hand, and apply with a reason and the preview's exact
conflict count.

Full instructions:
[Stage 2 — when the allocation changes](/en/docs/reparto/stage-2-planning/#when-the-allocation-changes).

### The apply was refused and my preview disappeared

Something changed between preview and apply, so the preview is stale and was discarded
rather than committed. **Preview again.** Do not press apply a second time — the same is
true of the matrix bulk editor and of requirement generation.

## The hours look wrong

### The two totals do not match each other

They are not supposed to. **Group hours** are what classes receive; **teacher hours** are
what teachers work. 120 and 124 are both correct at once. Read
[Hours, balances and feasibility](/en/docs/reparto/hours-and-balances/).

### A cell says "Inherited" instead of a number

The cell is using its subject's default. That is what an empty hour field means. If you
want an explicit value, type it; if you want a real zero, type `0` — which is **not** the
same as leaving it empty.

### I typed three decimals and it was refused

Hours accept at most two decimal places. The application refuses a third rather than
rounding it, because silently changing a number you typed would be worse.

### Feasibility says "Not evaluated" again

Something solver-relevant changed — a participant field, activity or matrix cell.
Feasibility resets rather than showing a stale answer. Re-run the evaluation. Selection
order and other meeting-only metadata no longer reset it.

## The meeting controls are disabled

Read the reason beside them. The usual cause is **No meeting session is open**: use the
**Meeting session** panel to open one. Plan readiness, lifecycle and turn ownership can
also close a control. All five actions are live; a server refusal is displayed beside the
controls instead of becoming a silent no-op.

## Still stuck?

- Check the **Audit** page: it records what actually happened, in order, with who did it.
- Check the connection state on the page — *Live updates disconnected* means what you are
  looking at may be out of date. Reload.
- Re-read [How the plugin works](/en/docs/reparto/how-it-works/). Most surprises come from
  one of those ten rules.

---

**Previous:** [← Limits and operational notes](/en/docs/reparto/limitations/) ·
**Next:** [Reference →](/en/docs/reparto/reference/)
