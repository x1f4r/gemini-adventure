export function parseScene(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)```/);
  const jsonString = fencedMatch ? fencedMatch[1].trim() : trimmed;
  return JSON.parse(jsonString);
}
