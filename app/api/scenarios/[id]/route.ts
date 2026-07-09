import { NextResponse } from "next/server";
import { deleteScenario, getScenario } from "@/lib/scenario-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const scenario = await getScenario(id);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
  }

  return NextResponse.json({ scenario });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteScenario(id);
  return NextResponse.json({ ok: true });
}
