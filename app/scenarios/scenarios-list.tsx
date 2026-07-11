"use client";

import Link from "next/link";
import { useState } from "react";
import type { ScenarioRecord } from "@/lib/demo-scenarios";

export default function ScenariosList({
  scenarios,
}: {
  scenarios: ScenarioRecord[];
}) {
  const [items, setItems] = useState(scenarios);
  const [message, setMessage] = useState("");

  async function renameScenario(id: string, name: string) {
    setMessage("");
    const response = await fetch(`/api/scenarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      setMessage("Rename failed.");
      return;
    }

    setItems((current) =>
      current.map((scenario) =>
        scenario.id === id ? { ...scenario, name } : scenario,
      ),
    );
  }

  async function deleteScenario(id: string) {
    setMessage("");
    const response = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });

    if (!response.ok) {
      setMessage("Delete failed.");
      return;
    }

    setItems((current) => current.filter((scenario) => scenario.id !== id));
  }

  if (items.length === 0) {
    return <div className="panel empty-panel">No saved scenarios yet.</div>;
  }

  return (
    <div className="scenario-list">
      {message ? <div className="error">{message}</div> : null}
      {items.map((scenario) => (
        <article className="scenario-row" key={scenario.id}>
          <div>
            <h2>{scenario.name}</h2>
            <p>
              {scenario.currency_label} {scenario.ad_budget} budget,
              {scenario.is_demo ? " demo" : " private"} scenario
            </p>
          </div>
          <div className="scenario-row-actions">
            <Link className="button secondary" href={`/scenario/${scenario.id}`}>
              Open
            </Link>
            {scenario.is_demo ? null : (
              <ScenarioActions
                currentName={scenario.name}
                onDelete={() => deleteScenario(scenario.id)}
                onRename={(name) => renameScenario(scenario.id, name)}
              />
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function ScenarioActions({
  currentName,
  onDelete,
  onRename,
}: {
  currentName: string;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);

  if (editing) {
    return (
      <form
        className="scenario-edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedName = name.trim();
          if (!trimmedName) return;
          onRename(trimmedName);
          setEditing(false);
        }}
      >
        <input
          aria-label="Scenario name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="button primary" type="submit">
          Save
        </button>
        <button
          className="button secondary"
          onClick={() => setEditing(false)}
          type="button"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <>
      <button className="button secondary" onClick={() => setEditing(true)} type="button">
        Rename
      </button>
      <button className="button danger" onClick={onDelete} type="button">
        Delete
      </button>
    </>
  );
}
