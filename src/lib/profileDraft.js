const DRAFT_KEY = "gems24_profile_draft";

/** Profile details captured before the Trader row exists (signup / onboarding). */
export function readProfileDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

export const writeProfileDraft = (data) => localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
export const clearProfileDraft = () => localStorage.removeItem(DRAFT_KEY);