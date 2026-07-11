export const dynamic = "force-dynamic";

import Link from "next/link";
import Planner from "@/app/planner";
import AppShell from "@/app/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getScenario } from "@/lib/scenario-store";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const scenario = await getScenario(id);

  if (!scenario) {
    return (
      <AppShell userEmail={user.email ?? "Account"}>
        <section className="empty-state">
          <h1>Scenario not found</h1>
          <p>This saved scenario could not be loaded.</p>
          <Link className="button primary" href="/">
            Back to planner
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell userEmail={user.email ?? "Account"}>
      <Planner initialScenario={scenario} />
    </AppShell>
  );
}
