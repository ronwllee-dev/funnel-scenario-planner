import Planner from "@/app/planner";
import AppShell from "@/app/components/app-shell";
import { demoScenarios } from "@/lib/demo-scenarios";
import { requireUser } from "@/lib/auth";

export default async function Home() {
  const user = await requireUser();

  return (
    <AppShell userEmail={user.email ?? "Account"}>
      <Planner initialScenario={demoScenarios[0]} />
    </AppShell>
  );
}
