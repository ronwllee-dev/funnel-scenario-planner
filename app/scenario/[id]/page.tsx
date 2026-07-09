export const dynamic = "force-dynamic";

import Link from "next/link";
import Planner from "@/app/planner";
import { getScenario } from "@/lib/scenario-store";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenario = await getScenario(id);

  if (!scenario) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-4 text-[#20231f]">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">Scenario not found</h1>
          <p className="mt-3 text-[#62685e]">
            This saved scenario could not be loaded.
          </p>
          <Link className="button primary mt-5 inline-flex" href="/">
            Back to planner
          </Link>
        </div>
      </main>
    );
  }

  return <Planner initialScenario={scenario} />;
}
