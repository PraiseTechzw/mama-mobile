export type ChatAction = 'facilities_nearby' | 'show_reminders' | 'create_reminder';

const facilityTerms =
  /\b(?:clinic|clinics|hospital|hospitals|health\s+facilit(?:y|ies)|health\s+(?:centre|center)|kiriniki|chipatara|nzvimbo yezveutano|ikilinika|isibhedlela)\b/i;
const nearbyTerms =
  /\b(?:near(?:by)?|nearest|closest|close to me|around me|by me|iri pedyo|pedyo neni|eseduze|eduze kwami)\b/i;
const reminderTerms =
  /\b(?:reminder|reminders|appointment|appointments|next visit|chiyeuchidzo|zviyeuchidzo|ndiyeuchidze|isikhumbuzo|izikhumbuzo|ngikhumbuze)\b/i;
const createReminderTerms =
  /\b(?:set|create|add|make|save)\b.*\b(?:reminder|appointment)\b|\bremind me\b|(?:isa|gadzira|ronga)\s+(?:chiyeuchidzo|zviyeuchidzo)|ndiyeuchidze|(?:faka|hlela)\s+(?:isikhumbuzo|izikhumbuzo)|ngikhumbuze/i;

export function detectChatAction(message: string): ChatAction | null {
  const normalized = message.trim().toLocaleLowerCase();
  if (facilityTerms.test(normalized) && nearbyTerms.test(normalized)) {
    return 'facilities_nearby';
  }
  if (createReminderTerms.test(normalized)) {
    return 'create_reminder';
  }
  if (reminderTerms.test(normalized)) {
    return 'show_reminders';
  }
  return null;
}

export function reminderTitleFromRequest(message: string) {
  const match = message.trim().match(
    /^(?:please\s+)?(?:remind me(?: to| about)?|(?:set|create|add|make|save)\s+(?:me\s+)?(?:a\s+)?reminder(?:\s+(?:to|for|about))?)\s*(.*)$/i,
  );
  return match?.[1]?.trim().slice(0, 100) ?? '';
}
