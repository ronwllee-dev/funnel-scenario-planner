export const dynamic = "force-dynamic";

import Link from "next/link";
import AppShell from "@/app/components/app-shell";
import ScenariosList from "@/app/scenarios/scenarios-list";
import { requireUser } from "@/lib/auth";
import { listScenarios } from "@/lib/scenario-store";

export default async function ScenariosPage() {
  const user = await requireUser();
  const scenarios = await listScenarios(user.id);

  return (
    <AppShell userEmail={user.email ?? "Account"}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="library-header mb-6">
          <div className="min-w-0">
            <p className="eyebrow">Scenario library</p>
            <h1 className="text-3xl font-semibold">Saved and demo scenarios</h1>
          </div>
          <Link className="button secondary" href="/">
            New scenario
          </Link>
        </div>

        <ScenariosList scenarios={scenarios} />
      </div>
    </AppShell>
  );
}
