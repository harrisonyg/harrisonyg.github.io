import { todayKey } from './todayKey.js';

export const STORAGE_KEY = 'ums-v1';

export const DEFAULT_TASKS = [
  '1 hour deep learning',
  '20 min writing',
  'Solve 1 problem',
  '20 min taste building',
  'Move body',
  'Reduce scrolling',
  '5–10 min awareness',
];

export function emptyProblemLog() {
  return { problem: '', cause: '', solution: '', result: '' };
}

export function defaultState() {
  return {
    savedDate: todayKey(),
    checked: DEFAULT_TASKS.map(() => false),
    nextAction: '',
    energy: '',
    gentleList: false,
    fastDuration: 120,
    note: '',
    problemLog: emptyProblemLog(),
    music: { song: '', feeling: '' },
    streak: 0,
    history: [],
    goals: ['Become sharp thinker', 'Build taste', 'Earn from skills'],
    focusMode: false,
    fastMode: false,
    theme: 'dark',
  };
}

function normEnergy(v) {
  if (v === 'low' || v === 'ok' || v === 'high') return v;
  return '';
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    const key = todayKey();

    let checked = base.checked;
    if (saved.savedDate === key && Array.isArray(saved.checked) && saved.checked.length === DEFAULT_TASKS.length) {
      checked = saved.checked;
    }

    return {
      ...base,
      savedDate: key,
      checked,
      nextAction: saved.savedDate === key ? saved.nextAction ?? '' : '',
      energy: saved.savedDate === key ? normEnergy(saved.energy) : '',
      gentleList: !!saved.gentleList,
      fastDuration:
        typeof saved.fastDuration === 'number' && saved.fastDuration >= 30 && saved.fastDuration <= 3600
          ? saved.fastDuration
          : 120,
      note: saved.savedDate === key ? saved.note ?? '' : '',
      problemLog:
        saved.savedDate === key && saved.problemLog
          ? { ...emptyProblemLog(), ...saved.problemLog }
          : emptyProblemLog(),
      music:
        saved.savedDate === key && saved.music
          ? { song: saved.music.song ?? '', feeling: saved.music.feeling ?? '' }
          : { song: '', feeling: '' },
      streak: typeof saved.streak === 'number' ? saved.streak : 0,
      history: Array.isArray(saved.history) ? saved.history : [],
      goals: Array.isArray(saved.goals) && saved.goals.length ? saved.goals : base.goals,
      focusMode: !!saved.focusMode,
      fastMode: !!saved.fastMode,
      theme: saved.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return defaultState();
  }
}

export function persistState(partial) {
  try {
    const payload = {
      ...partial,
      savedDate: todayKey(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('ums: persist failed', e);
  }
}
