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
import {
  currencyPrefix,
  isSupportedCurrency,
  supportedCurrencies,
} from "@/lib/currency";

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

const cleanStarterInputs: ScenarioInputs = {
  name: "",
  currency_label: "SGD",
  ad_budget: Number.NaN,
  management_fee: Number.NaN,
  cpc: Number.NaN,
  ctr: Number.NaN,
  core_cta_action: "Booked Call",
  conv_rate_click_to_lead: Number.NaN,
  conv_rate_lead_to_cta: Number.NaN,
  conv_rate_cta_to_next_step: Number.NaN,
  conv_rate_next_step_to_closed: Number.NaN,
  average_order_value: Number.NaN,
  gross_margin_pct: Number.NaN,
};

function comparableInputs(inputs: ScenarioInputs) {
  return JSON.stringify(normaliseInputs(inputs));
}

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
  const [scenarioId, setScenarioId] = useState<string | null>(
    initialScenario.is_demo ? null : initialScenario.id,
  );
  const [baseline, setBaseline] = useState(() => comparableInputs(initialScenario));
  const [isSample, setIsSample] = useState(initialScenario.is_demo);
  const [origin, setOrigin] = useState("");

  const requiredComplete = [
    inputs.ad_budget,
    inputs.cpc,
    inputs.ctr,
    inputs.average_order_value,
    inputs.conv_rate_click_to_lead,
    inputs.conv_rate_lead_to_cta,
    inputs.conv_rate_cta_to_next_step,
    inputs.conv_rate_next_step_to_closed,
    inputs.gross_margin_pct,
  ].every((value) => Number.isFinite(value) && value > 0);

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
  const hasUnsavedChanges = comparableInputs(inputs) !== baseline;

  function startNewScenario() {
    if (
      hasUnsavedChanges &&
      !window.confirm("Start a new scenario? Your unsaved changes will be cleared.")
    ) {
      return;
    }

    setInputs(cleanStarterInputs);
    setScenarioId(null);
    setIsSample(false);
    setBaseline(comparableInputs(cleanStarterInputs));
    setErrors({});
    setNotice("");
    setCalculation(null);
    setState("empty");
    window.history.replaceState(null, "", "/");
  }

  async function saveScenario() {
    setNotice("");
    try {
      const response = await fetch(
        scenarioId ? `/api/scenarios/${scenarioId}` : "/api/scenarios",
        {
        method: scenarioId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
        },
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Save failed");

      setScenarioId(data.scenario.id);
      setIsSample(false);
      setBaseline(comparableInputs(data.scenario));
      window.history.replaceState(null, "", `/scenario/${data.scenario.id}`);
      setNotice(scenarioId ? "Scenario changes saved." : "Scenario saved. This URL can be shared.");
    } catch {
      setNotice("Save failed. Please try again.");
    }
  }

  return (
    <div className="planner-page">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="planner-header">
          <div className="min-w-0">
            <p className="eyebrow">Funnel Scenario Planner</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal md:text-4xl">
              Stress-test funnel economics before spend goes live.
            </h1>
          </div>
          <div className="planner-actions">
            <button className="button secondary" onClick={startNewScenario} type="button">
              New Scenario
            </button>
            <button className="button primary" onClick={saveScenario}>
              {scenarioId ? "Save Changes" : "Save Scenario"}
            </button>
          </div>
        </header>

        {isSample ? (
          <div className="sample-note">
            <strong>Sample Scenario</strong>
            <span>Example values are provided to demonstrate how the planner works.</span>
          </div>
        ) : null}

        {notice ? <div className="notice">{notice}</div> : null}

        <section className="planner-grid">
          <AssumptionForm inputs={inputs} setInputs={setInputs} errors={errors} />
          <div className="min-w-0 space-y-5">
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
            <p className="disclaimer">
              Results are scenario planning assumptions based on your inputs, not
              guaranteed predictions. Currency is a display label only; no live
              conversion is applied.
            </p>
            {scenarioUrl ? (
              <p className="share-url text-xs text-[#879993]">Share URL: {scenarioUrl}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function CampaignSetupSummary({ inputs }: { inputs: ScenarioInputs }) {
  const totalCampaignCost =
    inputs.ad_budget +
    (Number.isFinite(inputs.management_fee) ? inputs.management_fee : 0);
  const summaryItems = [
    { label: "Scenario name", value: inputs.name },
    { label: "Currency", value: inputs.currency_label },
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
    return <div className="panel h-44 animate-pulse bg-[#15262c]" />;
  }

  if (!calculation) {
    return (
      <section className="panel text-sm text-[#adbbb5]">
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
      [key]: numericFields.has(key)
        ? value === ""
          ? Number.NaN
          : Number(value)
        : value,
    });
  }

  return (
    <form className="panel space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Business assumptions</h2>
        <p className="text-sm text-[#adbbb5]">
          Edit the funnel inputs and the comparison updates automatically.
        </p>
      </div>

      <TextInput
        label="Scenario name"
        value={inputs.name}
        error={errors.name}
        onChange={(value) => setValue("name", value)}
      />
      <div className="form-grid">
        <label className="field">
          <span>Currency</span>
          <select
            value={inputs.currency_label}
            onChange={(event) => setValue("currency_label", event.target.value)}
          >
            {isSupportedCurrency(inputs.currency_label) ? null : (
              <option value={inputs.currency_label}>
                Legacy: {inputs.currency_label}
              </option>
            )}
            {supportedCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency} ({currencyPrefix(currency)})
              </option>
            ))}
          </select>
          {errors.currency_label ? <small>{errors.currency_label}</small> : null}
        </label>
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

      <div className="form-grid">
        <NumberInput
          label="Ad budget"
          value={inputs.ad_budget}
          placeholder="e.g. 5000"
          error={errors.ad_budget}
          onChange={(value) => setValue("ad_budget", value)}
        />
        <NumberInput
          label="Management fee"
          value={inputs.management_fee}
          placeholder="e.g. 500"
          onChange={(value) => setValue("management_fee", value)}
        />
        <NumberInput
          label="CPC"
          value={inputs.cpc}
          placeholder="e.g. 2.50"
          error={errors.cpc}
          onChange={(value) => setValue("cpc", value)}
        />
        <NumberInput
          label="CTR %"
          value={asPercent(inputs.ctr)}
          placeholder="e.g. 2"
          error={errors.ctr}
          onChange={(value) => setValue("ctr", value)}
        />
        <NumberInput
          label="Average order value"
          value={inputs.average_order_value}
          placeholder="e.g. 3000"
          error={errors.average_order_value}
          onChange={(value) => setValue("average_order_value", value)}
        />
      </div>

      <div className="form-grid">
        <NumberInput
          label="Click to lead %"
          value={asPercent(inputs.conv_rate_click_to_lead)}
          placeholder="e.g. 30"
          onChange={(value) => setValue("conv_rate_click_to_lead", value)}
        />
        <NumberInput
          label={`Lead to ${inputs.core_cta_action} %`}
          value={asPercent(inputs.conv_rate_lead_to_cta)}
          placeholder="e.g. 25"
          onChange={(value) => setValue("conv_rate_lead_to_cta", value)}
        />
        <NumberInput
          label="CTA to next-step %"
          value={asPercent(inputs.conv_rate_cta_to_next_step)}
          placeholder="e.g. 60"
          onChange={(value) => setValue("conv_rate_cta_to_next_step", value)}
        />
        <NumberInput
          label="Next-step to closed %"
          value={asPercent(inputs.conv_rate_next_step_to_closed)}
          placeholder="e.g. 40"
          onChange={(value) =>
            setValue("conv_rate_next_step_to_closed", value)
          }
        />
        <NumberInput
          label="Gross margin %"
          value={asPercent(inputs.gross_margin_pct)}
          placeholder="e.g. 75"
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
    return <div className="panel h-96 animate-pulse bg-[#15262c]" />;
  }

  if (!calculation) {
    return (
      <div className="panel flex min-h-80 items-center justify-center text-center text-[#adbbb5]">
        Enter your funnel assumptions to see projections.
      </div>
    );
  }

  return (
    <section className="panel results-panel p-0">
      <div className="px-4 py-4">
        <SectionHeading title={title} description={description} />
      </div>
      <p className="table-swipe-note">Swipe horizontally to compare all scenarios.</p>
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
            <tr key={row.key} className="border-t border-[#263a41]">
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
    <div className="border-l-4 border-[#f09b63] bg-[#2a1b15] px-4 py-3">
      <p className="font-semibold text-[#ffd1b4]">Biggest funnel bottleneck</p>
      <p className="mt-1 text-sm text-[#e0b39b]">
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
      <p className="mt-1 text-sm text-[#adbbb5]">{description}</p>
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
  placeholder,
  onChange,
}: {
  label: string;
  value: number;
  error?: string;
  placeholder?: string;
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
        placeholder={placeholder}
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
  if (moneyRows.includes(key)) return `${currencyPrefix(currency)} ${number(value)}`;
  return number(value);
}

function money(value: number, currency: string) {
  if (!Number.isFinite(value)) return "—";
  return `${currencyPrefix(currency)} ${number(value)}`;
}

function number(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}
