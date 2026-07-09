import { NextResponse } from "next/server";
import { saveScenario, listScenarios } from "@/lib/scenario-store";
import { validateInputs, type ScenarioInputs } from "@/lib/engine";

export async function GET() {
  try {
    return NextResponse.json({ scenarios: await listScenarios() });
  } catch {
    return NextResponse.json(
      { error: "Could not load scenarios." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const inputs = (await request.json()) as ScenarioInputs;
    const errors = validateInputs(inputs);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    return NextResponse.json({ scenario: await saveScenario(inputs) });
  } catch {
    return NextResponse.json(
      { error: "Could not save scenario." },
      { status: 500 },
    );
  }
}
