import Planner from "@/app/planner";
import { demoScenarios } from "@/lib/demo-scenarios";

export default function Home() {
  return <Planner initialScenario={demoScenarios[0]} />;
}
