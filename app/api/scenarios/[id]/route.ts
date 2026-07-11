import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteScenario,
  getScenario,
  updateScenarioName,
} from "@/lib/scenario-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const scenario = await getScenario(id);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
  }

  return NextResponse.json({ scenario });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Scenario name is required." }, { status: 400 });
  }

  try {
    return NextResponse.json({ scenario: await updateScenarioName(id, name) });
  } catch {
    return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  try {
    await deleteScenario(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
  }
}
