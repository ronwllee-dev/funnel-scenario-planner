import { NextResponse } from "next/server";
import { calculateAll, validateInputs, type ScenarioInputs } from "@/lib/engine";

export async function POST(request: Request) {
  try {
    const inputs = (await request.json()) as ScenarioInputs;
    const errors = validateInputs(inputs);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    return NextResponse.json(calculateAll(inputs));
  } catch {
    return NextResponse.json(
      { error: "Calculation failed. Please check your inputs." },
      { status: 500 },
    );
  }
}
