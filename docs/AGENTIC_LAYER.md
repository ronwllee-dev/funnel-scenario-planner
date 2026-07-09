# Agentic Layer — Funnel Scenario Planner

## v1 — No Agentic Actions
All v1 actions are direct user-initiated CRUD. No autonomous agents in v1.

## Action Risk Table (for future sprints)

| Action | Risk | Approval needed |
|---|---|---|
| Calculate scenario KPIs | Low | Auto — runs on input change |
| Save scenario to DB | Low | Auto — user clicks Save |
| Generate AI bottleneck narrative | Low | Auto — queued on save, shown as draft |
| Send scenario summary by email | Medium | User confirms before send |
| Delete scenario | High | Confirm dialog + audit log entry |
| Export client-branded PDF | Low | Auto — user clicks Export |

## Named Tools (later sprints)
- `calculate_funnel_kpis(inputs)` — pure formula, no side effects
- `save_scenario(scenario_obj)` — writes to Supabase
- `generate_bottleneck_narrative(scenario_id)` — calls OpenAI, stores draft
- `send_scenario_email(scenario_id, recipient_email)` — medium risk, requires approval

## Audit Log Fields (on every meaningful write)
- `scenario_id`, `action`, `actor` (user_id or 'anonymous'), `before_state` jsonb, `after_state` jsonb, `timestamp`

## Security Rule
No tool may call `run_any`, `send_any`, or raw SQL. Every agent action inherits the session user's RLS permissions.
