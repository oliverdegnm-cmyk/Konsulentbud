// Valgfrie kriterier, en opgavestiller kan tilføje til en opgave for at
// beskrive, hvilken slags konsulent de leder efter - ud over selve
// fagområdet (kategorien). Bruges på "Opret opgave"-siden, på selve
// opgavesiden, og kan senere bruges til at gøre matchingen mod konsulenters
// profiler mere præcis.

export const EXPERIENCE_LEVELS = [
  { value: "any", label: "Ligegyldigt, bare dygtig" },
  { value: "specialist", label: "Erfaren specialist" },
  { value: "senior", label: "Senior / med ledelseserfaring" },
];

export const ENGAGEMENT_TYPES = [
  { value: "single", label: "Enkeltstående opgave" },
  { value: "short", label: "Kortere forløb (uger)" },
  { value: "interim", label: "Interim / længere forløb (måneder)" },
  { value: "ongoing", label: "Løbende rådgivning" },
];

export function experienceLabel(value) {
  return EXPERIENCE_LEVELS.find((e) => e.value === value)?.label || null;
}

export function engagementLabel(value) {
  return ENGAGEMENT_TYPES.find((e) => e.value === value)?.label || null;
}
