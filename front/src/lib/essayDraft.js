const DRAFT_KEYS = ['autoenem_topic', 'autoenem_essay', 'autoenem_feedback'];

export const clearEssayDraft = () => DRAFT_KEYS.forEach((k) => localStorage.removeItem(k));
