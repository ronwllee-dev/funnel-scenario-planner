export function canAccessScenario({
  isDemo,
  scenarioUserId,
  currentUserId,
}: {
  isDemo: boolean;
  scenarioUserId: string | null | undefined;
  currentUserId: string | null | undefined;
}) {
  return Boolean(isDemo || (currentUserId && scenarioUserId === currentUserId));
}

export function ownedScenarioFilter(userId: string) {
  return `is_demo.eq.true,user_id.eq.${userId}`;
}
