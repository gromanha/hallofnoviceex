const ONBOARDING_KEY = 'hon-calendario-onboarding';

interface OnboardingState {
  welcomeDismissed: boolean;
  filterHintDismissed: boolean;
  adminHintDismissed: boolean;
  firstVisit: boolean;
}

function loadState(): OnboardingState {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { welcomeDismissed: false, filterHintDismissed: false, adminHintDismissed: false, firstVisit: true };
}

function saveState(state: OnboardingState) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
}

export function isFirstVisit(): boolean {
  return loadState().firstVisit;
}

export function dismissWelcome() {
  const s = loadState();
  s.welcomeDismissed = true;
  s.firstVisit = false;
  saveState(s);
}

export function dismissFilterHint() {
  const s = loadState();
  s.filterHintDismissed = true;
  saveState(s);
}

export function dismissAdminHint() {
  const s = loadState();
  s.adminHintDismissed = true;
  saveState(s);
}

export function isWelcomeDismissed(): boolean {
  return loadState().welcomeDismissed;
}

export function isFilterHintDismissed(): boolean {
  return loadState().filterHintDismissed;
}

export function isAdminHintDismissed(): boolean {
  return loadState().adminHintDismissed;
}
