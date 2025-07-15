export function parseScene(text) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)```/);
  let jsonString = fencedMatch ? fencedMatch[1].trim() : trimmed;
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    const start = jsonString.indexOf('{');
    const end = jsonString.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      jsonString = jsonString.slice(start, end + 1);
      return JSON.parse(jsonString);
    }
    throw err;
  }
}
