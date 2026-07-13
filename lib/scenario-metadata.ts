export const campaignChannels = [
  "Google Search",
  "Google Display",
  "Meta Ads",
  "LinkedIn Ads",
  "TikTok Ads",
  "YouTube Ads",
  "Email or database campaign",
  "Organic or referral traffic",
  "Mixed channels",
  "Other",
] as const;

export const assumptionBases = [
  "Client historical data",
  "Current campaign data",
  "Media buyer estimate",
  "Industry benchmark",
  "Consultant assumption",
  "Mixed sources",
] as const;

export type ModelStatus =
  | "Exploratory"
  | "Indicative"
  | "Evidence-based"
  | "Calibrated";

export const modelStatusCopy: Record<ModelStatus, string> = {
  Exploratory:
    "This scenario relies mainly on planning assumptions and should be validated with live campaign and CRM data.",
  Indicative:
    "This scenario combines estimates or benchmarks and should be updated as actual campaign and sales data becomes available.",
  "Evidence-based":
    "This scenario is informed by the client’s historical data, but actual future performance may still vary.",
  Calibrated:
    "This scenario uses current campaign data and is the strongest available planning basis, but it is still not a guarantee of future results.",
};

export function getModelStatus(assumptionBasis: string): ModelStatus {
  if (assumptionBasis === "Current campaign data") return "Calibrated";
  if (assumptionBasis === "Client historical data") return "Evidence-based";
  if (assumptionBasis === "Consultant assumption") return "Exploratory";
  return "Indicative";
}

export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function assumptionDateForDatabase(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export function normaliseScenarioContext(record: {
  campaign_channel?: string | null;
  target_market?: string | null;
  assumption_basis?: string | null;
  assumption_date?: string | null;
  assumption_notes?: string | null;
  created_at?: string | null;
}) {
  return {
    campaign_channel: record.campaign_channel ?? "Mixed channels",
    target_market: record.target_market ?? "",
    assumption_basis: record.assumption_basis ?? "Consultant assumption",
    assumption_date: record.assumption_date ?? "",
    assumption_notes: record.assumption_notes ?? "",
  };
}
