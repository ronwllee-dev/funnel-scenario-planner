"use client";

import { useEffect, useState } from "react";
import type {
  Bottleneck,
  CalculationResponse,
  ScenarioInputs,
  ScenarioResults,
  ScenarioTier,
} from "@/lib/engine";
import { calculateAll, normaliseInputs } from "@/lib/engine";
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
  "media_cpl",
  "all_in_cpl",
  "media_cost_per_cta",
  "all_in_cost_per_cta",
  "media_cost_per_next_step",
  "all_in_cost_per_next_step",
  "media_cpa",
  "all_in_cpa",
  "revenue",
  "gross_profit",
  "net_profit",
];

const snapshotMetrics: Array<{
  key: keyof ScenarioResults;
  label: (cta: string) => string;
}> = [
  { key: "leads", label: () => "Projected leads" },
  { key: "cta_actions", label: (cta) => cta },
  { key: "closed_sales", label: () => "Closed sales" },
  { key: "revenue", label: () => "Projected revenue" },
  { key: "net_profit", label: () => "Net profit" },
  { key: "media_roas", label: () => "Media ROAS" },
];

const funnelVolumeRows: Array<{
  key: keyof ScenarioResults;
  label: (cta: string) => string;
}> = [
  { key: "impressions", label: () => "Projected impressions" },
  { key: "clicks", label: () => "Projected clicks" },
  { key: "leads", label: () => "Projected leads" },
  { key: "cta_actions", label: (cta) => `Projected ${cta}` },
  { key: "next_step_offers", label: () => "Projected next-step offers" },
  { key: "closed_sales", label: () => "Projected closed sales" },
];

const commercialOutcomeRows: Array<{
  key: keyof ScenarioResults;
  label: (cta: string) => string;
}> = [
  { key: "revenue", label: () => "Projected revenue" },
  { key: "media_roas", label: () => "Media ROAS" },
  { key: "gross_profit", label: () => "Gross profit" },
  { key: "net_profit", label: () => "Net profit" },
];

const costEfficiencyRows: Array<{
  key: keyof ScenarioResults;
  label: (cta: string) => string;
}> = [
  { key: "media_cpl", label: () => "Media cost per lead" },
  { key: "all_in_cpl", label: () => "All-in cost per lead" },
  { key: "media_cost_per_cta", label: (cta) => `Media cost per ${cta}` },
  { key: "all_in_cost_per_cta", label: (cta) => `All-in cost per ${cta}` },
  { key: "media_cost_per_next_step", label: () => "Media cost per next-step offer" },
  { key: "all_in_cost_per_next_step", label: () => "All-in cost per next-step offer" },
  { key: "media_cpa", label: () => "Media CPA" },
  { key: "all_in_cpa", label: () => "All-in CPA" },
];

type PlannerState = "loading" | "empty" | "partial" | "error" | "ready";

export default function Planner({
  initialScenario,
}: {
  initialScenario: ScenarioRecord;
}) {
  const [inputs, setInputs] = useState<ScenarioInputs>(() =>
    normaliseInputs(initialScenario),
  );
  const [calculation, setCalculation] = useState<CalculationResponse | null>(
    () => calculateAll(initialScenario),
  );
  const [state, setState] = useState<PlannerState>("ready");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [scenarioId, setScenarioId] = useState(initialScenario.id);
  const [origin, setOrigin] = useState("");

  const requiredComplete =
    inputs.ad_budget > 0 &&
    inputs.cpc > 0 &&
    inputs.ctr > 0 &&
    inputs.average_order_value > 0;

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

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const scenarioUrl = origin && scenarioId ? `${origin}/scenario/${scenarioId}` : "";

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
            <CampaignSetupSummary inputs={inputs} />
            <ScenarioSnapshotCards
              calculation={calculation}
              currency={inputs.currency_label}
              cta={inputs.core_cta_action}
              state={state}
            />
            <ResultsSection
              title="Funnel Volume"
              description="How the audience moves from impressions through closed sales."
              rows={funnelVolumeRows}
              calculation={calculation}
              currency={inputs.currency_label}
              cta={inputs.core_cta_action}
              state={state}
            />
            <ResultsSection
              title="Commercial Outcome"
              description="Revenue, profitability and media return from the scenario assumptions."
              rows={commercialOutcomeRows}
              calculation={calculation}
              currency={inputs.currency_label}
              cta={inputs.core_cta_action}
              state={state}
            />
            <ResultsSection
              title="Cost Efficiency"
              description="Media-buying and all-in acquisition efficiency by funnel stage."
              rows={costEfficiencyRows}
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

function CampaignSetupSummary({ inputs }: { inputs: ScenarioInputs }) {
  const totalCampaignCost = inputs.ad_budget + inputs.management_fee;
  const summaryItems = [
    { label: "Scenario name", value: inputs.name },
    { label: "Currency label", value: inputs.currency_label },
    { label: "Media spend / ad budget", value: money(inputs.ad_budget, inputs.currency_label) },
    { label: "Management fee", value: money(inputs.management_fee, inputs.currency_label) },
    { label: "Total campaign cost", value: money(totalCampaignCost, inputs.currency_label) },
    { label: "Average order value", value: money(inputs.average_order_value, inputs.currency_label) },
    { label: "Gross margin", value: `${asPercent(inputs.gross_margin_pct)}%` },
    { label: "Core CTA Action", value: inputs.core_cta_action },
  ];

  return (
    <section className="panel">
      <SectionHeading
        title="Campaign Setup Summary"
        description="The assumptions a client and media buyer should align on before reading the scenarios."
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div className="summary-cell" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenarioSnapshotCards({
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
    return <div className="panel h-44 animate-pulse bg-[#e8ebe3]" />;
  }

  if (!calculation) {
    return (
      <section className="panel text-sm text-[#62685e]">
        Complete the required assumptions to see scenario snapshots.
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        title="Scenario Snapshot"
        description="The top-line story for conservative, expected and optimistic outcomes."
      />
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {(["conservative", "expected", "optimistic"] as ScenarioTier[]).map(
          (tier) => (
            <div className="panel snapshot-card" key={tier}>
              <h3>{tierLabels[tier]}</h3>
              <dl>
                {snapshotMetrics.map((metric) => (
                  <div key={metric.key}>
                    <dt>{metric.label(cta)}</dt>
                    <dd>
                      {formatMetric(
                        metric.key,
                        calculation.results[tier][metric.key],
                        currency,
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ),
        )}
      </div>
    </section>
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
      "ctr",
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
          label="CTR %"
          value={asPercent(inputs.ctr)}
          error={errors.ctr}
          onChange={(value) => setValue("ctr", value)}
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

function ResultsSection({
  title,
  description,
  rows,
  calculation,
  currency,
  cta,
  state,
}: {
  title: string;
  description: string;
  rows: Array<{
    key: keyof ScenarioResults;
    label: (cta: string) => string;
  }>;
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
    <section className="panel overflow-hidden p-0">
      <div className="px-4 py-4">
        <SectionHeading title={title} description={description} />
      </div>
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
          {rows.map((row) => (
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
    </section>
  );
}

function BottleneckCallout({
  bottleneck,
  cta,
}: {
  bottleneck?: Bottleneck;
  cta: string;
}) {
  if (!bottleneck) return null;

  return (
    <div className="border-l-4 border-[#cf5f31] bg-[#fff4ec] px-4 py-3">
      <p className="font-semibold text-[#7c3218]">Biggest funnel bottleneck</p>
      <p className="mt-1 text-sm text-[#5d463a]">
        Biggest drop: {bottleneck.stage}. {bottleneck.drop_pct}% of{" "}
        {bottleneckSource(bottleneck.stage, cta)} do not reach this step.
      </p>
    </div>
  );
}

function bottleneckSource(stage: string, cta: string) {
  if (stage.startsWith("Click")) return "clicks";
  if (stage.startsWith("Lead")) return "leads";
  if (stage.startsWith(cta)) return cta.toLowerCase();
  return "next-step offers";
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[#62685e]">{description}</p>
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
  if (key === "media_roas") return `${value.toFixed(2)}x`;
  if (moneyRows.includes(key)) return `${currency} ${number(value)}`;
  return number(value);
}

function money(value: number, currency: string) {
  return `${currency} ${number(value)}`;
}

function number(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}
