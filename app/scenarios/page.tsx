export const dynamic = "force-dynamic";

import Link from "next/link";
import { listScenarios } from "@/lib/scenario-store";

export default async function ScenariosPage() {
  const scenarios = await listScenarios();

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-4 py-8 text-[#20231f]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#476350]">
              Scenario library
            </p>
            <h1 className="text-3xl font-semibold">Saved and demo scenarios</h1>
          </div>
          <Link className="button secondary" href="/">
            New scenario
          </Link>
        </div>

        {scenarios.length === 0 ? (
          <div className="panel text-center text-[#62685e]">
            No saved scenarios yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {scenarios.map((scenario) => (
              <Link
                className="panel flex items-center justify-between gap-4 transition hover:border-[#87a170]"
                href={`/scenario/${scenario.id}`}
                key={scenario.id}
              >
                <div>
                  <h2 className="font-semibold">{scenario.name}</h2>
                  <p className="text-sm text-[#62685e]">
                    {scenario.currency_label} {scenario.ad_budget} budget,
                    {scenario.is_demo ? " demo" : " saved"} scenario
                  </p>
                </div>
                <span className="text-sm text-[#476350]">Open</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
