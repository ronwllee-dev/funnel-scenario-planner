"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Bottleneck,
  CalculationResponse,
  ScenarioInputs,
  ScenarioResults,
  ScenarioTier,
} from "@/lib/engine";
import type { ScenarioRecord } from "@/lib/demo-scenarios";

const ctaOptions = [
  "Booked Call",
  "Demo Booked",
  "Appointment",
  "Quote Request",
  "Trial Started",
  "Checkout Started",
  "Registration",
  "Consultation",
  "Profiling Session",
];

const tierLabels: Record<ScenarioTier, string> = {
  conservative: "Conservative",
  expected: "Expected",
  optimistic: "Optimistic",
};

const moneyRows: Array<keyof ScenarioResults> = [
  "cpl",
  "cost_per_cta",
  "cost_per_next_step",
  "cpa",
  "revenue",
  "gross_profit",
  "net_profit",
];

const metricRows: Array<{
  key: keyof ScenarioResults;
  label: (cta: string) => string;
}> = [
  { key: "impressions", label: () => "Projected impressions" },
  { key: "clicks", label: () => "Projected clicks" },
  { key: "leads", label: () => "Projected leads" },
  { key: "cta_actions", label: (cta) => cta },
  { key: "next_step_offers", label: () => "Next-step offers" },
  { key: "closed_sales", label: () => "Closed sales" },
  { key: "cpl", label: () => "Cost per lead" },
  { key: "cost_per_cta", label: (cta) => `Cost per ${cta}` },
  { key: "cost_per_next_step", label: () => "Cost per next-step offer" },
  { key: "cpa", label: () => "Cost per closed sale" },
  { key: "roas", label: () => "ROAS" },
  { key: "gross_profit", label: () => "Gross profit" },
  { key: "net_profit", label: () => "Net profit" },
];

type PlannerState = "loading" | "empty" | "partial" | "error" | "ready";

export default function Planner({
  initialScenario,
}: {
  initialScenario: ScenarioRecord;
}) {
  const [inputs, setInputs] = useState<ScenarioInputs>(initialScenario);
  const [calculation, setCalculation] = useState<CalculationResponse | null>(
    null,
  );
  const [state, setState] = useState<PlannerState>("loading");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [scenarioId, setScenarioId] = useState(initialScenario.id);

  const requiredComplete =
    inputs.ad_budget > 0 && inputs.cpc > 0 && inputs.average_order_value > 0;

  useEffect(() => {
    if (!inputs.ad_budget && !inputs.cpc && !inputs.average_order_value) {
      setState("empty");
      setCalculation(null);
      return;
    }

    if (!requiredComplete) {
      setState("partial");
      setCalculation(null);
      return;
    }

    setState("loading");
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });
        const data = await response.json();

        if (!response.ok) {
          setErrors(data.errors ?? {});
          setState("error");
          return;
        }

        setErrors({});
        setCalculation(data);
        setState("ready");
      } catch {
        setState("error");
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [inputs, requiredComplete]);

  const scenarioUrl = useMemo(() => {
    if (typeof window === "undefined" || !scenarioId) return "";
    return `${window.location.origin}/scenario/${scenarioId}`;
  }, [scenarioId]);

  async function saveScenario() {
    setNotice("");
    try {
      const response = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Save failed");

      setScenarioId(data.scenario.id);
      window.history.replaceState(null, "", `/scenario/${data.scenario.id}`);
      setNotice("Scenario saved. This URL can be shared.");
    } catch {
      setNotice("Save failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#20231f]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#d8ddd2] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#476350]">
              Funnel Scenario Planner
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal md:text-4xl">
              Stress-test funnel economics before spend goes live.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a className="button secondary" href="/scenarios">
              Saved scenarios
            </a>
            <button className="button primary" onClick={saveScenario}>
              Save scenario
            </button>
          </div>
        </header>

        {notice ? <div className="notice">{notice}</div> : null}

        <section className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <AssumptionForm inputs={inputs} setInputs={setInputs} errors={errors} />
          <div className="space-y-5">
            <StateBanner state={state} />
            <ResultsTable
              calculation={calculation}
              currency={inputs.currency_label}
              cta={inputs.core_cta_action}
              state={state}
            />
            <BottleneckCallout
              bottleneck={calculation?.bottleneck}
              cta={inputs.core_cta_action}
            />
            <p className="text-sm leading-6 text-[#62685e]">
              Results are scenario planning assumptions based on your inputs, not
              guaranteed predictions. Currency is a display label only; no live
              conversion is applied.
            </p>
            {scenarioUrl ? (
              <p className="text-xs text-[#747970]">Share URL: {scenarioUrl}</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function AssumptionForm({
  inputs,
  setInputs,
  errors,
}: {
  inputs: ScenarioInputs;
  setInputs: (inputs: ScenarioInputs) => void;
  errors: Record<string, string>;
}) {
  function setValue(key: keyof ScenarioInputs, value: string) {
    const numericFields = new Set<keyof ScenarioInputs>([
      "ad_budget",
      "management_fee",
      "cpc",
      "conv_rate_click_to_lead",
      "conv_rate_lead_to_cta",
      "conv_rate_cta_to_next_step",
      "conv_rate_next_step_to_closed",
      "average_order_value",
      "gross_margin_pct",
    ]);

    setInputs({
      ...inputs,
      [key]: numericFields.has(key) ? Number(value) : value,
    });
  }

  return (
    <form className="panel space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Business assumptions</h2>
        <p className="text-sm text-[#62685e]">
          Edit the funnel inputs and the comparison updates automatically.
        </p>
      </div>

      <TextInput
        label="Scenario name"
        value={inputs.name}
        error={errors.name}
        onChange={(value) => setValue("name", value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Currency label"
          value={inputs.currency_label}
          error={errors.currency_label}
          onChange={(value) => setValue("currency_label", value)}
        />
        <label className="field">
          <span>Core CTA Action</span>
          <select
            value={inputs.core_cta_action}
            onChange={(event) => setValue("core_cta_action", event.target.value)}
          >
            {ctaOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Ad budget"
          value={inputs.ad_budget}
          error={errors.ad_budget}
          onChange={(value) => setValue("ad_budget", value)}
        />
        <NumberInput
          label="Management fee"
          value={inputs.management_fee}
          onChange={(value) => setValue("management_fee", value)}
        />
        <NumberInput
          label="CPC"
          value={inputs.cpc}
          error={errors.cpc}
          onChange={(value) => setValue("cpc", value)}
        />
        <NumberInput
          label="Average order value"
          value={inputs.average_order_value}
          error={errors.average_order_value}
          onChange={(value) => setValue("average_order_value", value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Click to lead %"
          value={asPercent(inputs.conv_rate_click_to_lead)}
          onChange={(value) => setValue("conv_rate_click_to_lead", value)}
        />
        <NumberInput
          label={`Lead to ${inputs.core_cta_action} %`}
          value={asPercent(inputs.conv_rate_lead_to_cta)}
          onChange={(value) => setValue("conv_rate_lead_to_cta", value)}
        />
        <NumberInput
          label="CTA to next-step %"
          value={asPercent(inputs.conv_rate_cta_to_next_step)}
          onChange={(value) => setValue("conv_rate_cta_to_next_step", value)}
        />
        <NumberInput
          label="Next-step to closed %"
          value={asPercent(inputs.conv_rate_next_step_to_closed)}
          onChange={(value) =>
            setValue("conv_rate_next_step_to_closed", value)
          }
        />
        <NumberInput
          label="Gross margin %"
          value={asPercent(inputs.gross_margin_pct)}
          onChange={(value) => setValue("gross_margin_pct", value)}
        />
      </div>
    </form>
  );
}

function ResultsTable({
  calculation,
  currency,
  cta,
  state,
}: {
  calculation: CalculationResponse | null;
  currency: string;
  cta: string;
  state: PlannerState;
}) {
  if (state === "loading") {
    return <div className="panel h-96 animate-pulse bg-[#e8ebe3]" />;
  }

  if (!calculation) {
    return (
      <div className="panel flex min-h-80 items-center justify-center text-center text-[#62685e]">
        Enter your funnel assumptions to see projections.
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden p-0">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="table-head text-left">KPI</th>
            {(["conservative", "expected", "optimistic"] as ScenarioTier[]).map(
              (tier) => (
                <th className="table-head text-right" key={tier}>
                  {tierLabels[tier]}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {metricRows.map((row) => (
            <tr key={row.key} className="border-t border-[#e0e5da]">
              <td className="px-4 py-3 font-medium">{row.label(cta)}</td>
              {(["conservative", "expected", "optimistic"] as ScenarioTier[]).map(
                (tier) => (
                  <td className="px-4 py-3 text-right" key={tier}>
                    {formatMetric(row.key, calculation.results[tier][row.key], currency)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BottleneckCallout({
  bottleneck,
}: {
  bottleneck?: Bottleneck;
  cta: string;
}) {
  if (!bottleneck) return null;

  return (
    <div className="border-l-4 border-[#cf5f31] bg-[#fff4ec] px-4 py-3">
      <p className="font-semibold text-[#7c3218]">Bottleneck insight</p>
      <p className="mt-1 text-sm text-[#5d463a]">{bottleneck.message}</p>
    </div>
  );
}

function StateBanner({ state }: { state: PlannerState }) {
  if (state === "partial") {
    return <div className="warning">Fill all required fields to calculate.</div>;
  }
  if (state === "error") {
    return (
      <div className="error">Calculation failed. Please check your inputs.</div>
    );
  }
  if (state === "empty") {
    return <div className="notice">Start with the required assumptions.</div>;
  }
  return null;
}

function TextInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function NumberInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: number;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        min="0"
        step="0.01"
        type="number"
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function asPercent(value: number) {
  return value <= 1 ? Math.round(value * 10000) / 100 : value;
}

function formatMetric(
  key: keyof ScenarioResults,
  value: number,
  currency: string,
) {
  if (key === "roas") return `${value.toFixed(2)}x`;
  if (moneyRows.includes(key)) return `${currency} ${number(value)}`;
  return number(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}
