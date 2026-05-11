import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { todayKey } from '../utils/todayKey.js';
import {
  DEFAULT_TASKS,
  emptyProblemLog,
  loadState,
  persistState,
} from '../utils/storage.js';

/**
 * Central state + persistence + streak/history rules.
 * - Task checkboxes reset when savedDate !== today (handled in loadState).
 * - Streak + history row only when 100% done, once per calendar day.
 */
export function useMindState() {
  const initial = useRef(loadState());
  const [checked, setChecked] = useState(initial.current.checked);
  const [note, setNote] = useState(initial.current.note);
  const [problemLog, setProblemLog] = useState(initial.current.problemLog);
  const [music, setMusic] = useState(initial.current.music);
  const [streak, setStreak] = useState(initial.current.streak);
  const [history, setHistory] = useState(initial.current.history);
  const [goals, setGoals] = useState(initial.current.goals);
  const [nextAction, setNextAction] = useState(initial.current.nextAction);
  const [energy, setEnergy] = useState(initial.current.energy);
  const [gentleList, setGentleList] = useState(initial.current.gentleList);
  const [fastDuration, setFastDuration] = useState(initial.current.fastDuration);
  const [focusMode, setFocusMode] = useState(initial.current.focusMode);
  const [fastMode, setFastMode] = useState(initial.current.fastMode);
  const [theme, setTheme] = useState(initial.current.theme);
  const [timer, setTimer] = useState(initial.current.fastDuration);
  /** Streak bump only when we actually append a new perfect-day row (not on reload / StrictMode duplicate). */
  const pendingStreakBump = useRef(false);

  const tasks = DEFAULT_TASKS;

  const progress = useMemo(() => {
    const done = checked.filter(Boolean).length;
    return Math.round((done / tasks.length) * 100);
  }, [checked, tasks.length]);

  const suggestion = useMemo(() => {
    if (!nextAction?.trim()) {
      return 'Stuck? Write the next tiny move in “One thing right now” — even “open the tab” or “stand up”.';
    }
    if (history.length < 3) {
      return 'Building the habit matters more than perfect days. One checkbox is a real win.';
    }
    const skipped = checked.filter((c) => !c).length;
    if (skipped > 3) {
      if (energy === 'low') {
        return 'Low-energy days count. Try Gentle list, a 2-minute timer, or just one box — no guilt.';
      }
      return 'Lots open? That’s normal. Try Gentle list (3 tasks) or shrink what “done” means today.';
    }
    if (gentleList && skipped > 0) {
      return 'Nice — you’re pacing yourself. Expand the list when your brain has bandwidth.';
    }
    if (!problemLog.problem?.trim()) {
      return 'Optional but powerful: one sentence in Problem — what actually felt off?';
    }
    return "You’re showing up. Consistency beats intensity — keep the streak honest, not harsh.";
  }, [checked, energy, gentleList, history.length, nextAction, problemLog.problem]);

  // Persist all user state (except timer — ephemeral while Fast Mode runs)
  useEffect(() => {
    persistState({
      checked,
      nextAction,
      energy,
      gentleList,
      fastDuration,
      note,
      problemLog,
      music,
      streak,
      history,
      goals,
      focusMode,
      fastMode,
      theme,
    });
  }, [
    checked,
    nextAction,
    energy,
    gentleList,
    fastDuration,
    note,
    problemLog,
    music,
    streak,
    history,
    goals,
    focusMode,
    fastMode,
    theme,
  ]);

  // 100% → one log row per calendar day; streak +1 only when appending that row (not if it already existed).
  useEffect(() => {
    if (progress !== 100) return;
    const key = todayKey();
    setHistory((prev) => {
      if (prev.some((h) => h.date === key)) return prev;
      pendingStreakBump.current = true;
      return [
        {
          date: key,
          note,
          problemLog: { ...problemLog },
          music: { ...music },
        },
        ...prev,
      ];
    });
  }, [progress, note, problemLog, music]);

  useEffect(() => {
    if (!pendingStreakBump.current) return;
    pendingStreakBump.current = false;
    const key = todayKey();
    const gate = 'ums-streaked-' + key;
    try {
      if (sessionStorage.getItem(gate)) return;
      sessionStorage.setItem(gate, '1');
    } catch {
      /* ignore */
    }
    setStreak((s) => s + 1);
  }, [history]);

  const toggleTask = useCallback((index) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const setProblemField = useCallback((key, value) => {
    setProblemLog((p) => ({ ...p, [key]: value }));
  }, []);

  const setMusicField = useCallback((key, value) => {
    setMusic((m) => ({ ...m, [key]: value }));
  }, []);

  const addGoal = useCallback(() => {
    setGoals((g) => [...g, 'New goal']);
  }, []);

  const updateGoal = useCallback((index, value) => {
    setGoals((g) => {
      const next = [...g];
      next[index] = value;
      return next;
    });
  }, []);

  const resetFastTimer = useCallback(() => {
    setTimer(fastDuration);
  }, [fastDuration]);

  return {
    tasks,
    checked,
    toggleTask,
    nextAction,
    setNextAction,
    energy,
    setEnergy,
    gentleList,
    setGentleList,
    fastDuration,
    setFastDuration,
    note,
    setNote,
    problemLog,
    setProblemField,
    music,
    setMusicField,
    streak,
    history,
    goals,
    addGoal,
    updateGoal,
    focusMode,
    setFocusMode,
    fastMode,
    setFastMode,
    timer,
    setTimer,
    resetFastTimer,
    progress,
    suggestion,
    theme,
    setTheme,
  };
}

export { emptyProblemLog };
