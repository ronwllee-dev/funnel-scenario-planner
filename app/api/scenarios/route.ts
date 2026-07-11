import { NextResponse } from "next/server";
import { saveScenario, listScenarios } from "@/lib/scenario-store";
import { getCurrentUser } from "@/lib/auth";
import { validateInputs, type ScenarioInputs } from "@/lib/engine";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    return NextResponse.json({ scenarios: await listScenarios(user.id) });
  } catch {
    return NextResponse.json(
      { error: "Could not load scenarios." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const inputs = (await request.json()) as ScenarioInputs;
    const errors = validateInputs(inputs);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    return NextResponse.json({ scenario: await saveScenario(inputs, user.id) });
  } catch (error) {
    console.error("Save scenario failed:", error);

    return NextResponse.json(
      { error: "Could not save scenario." },
      { status: 500 },
    );
  }
}
