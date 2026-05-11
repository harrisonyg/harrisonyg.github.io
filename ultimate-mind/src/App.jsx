import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMindState } from './hooks/useMindState.js';

const TABS = ['Today', 'Log', 'Review', 'Goals'];
const GENTLE_VISIBLE = 3;
const TIMER_PRESETS = [
  { label: '2m', sec: 120 },
  { label: '5m', sec: 300 },
  { label: '10m', sec: 600 },
  { label: '25m', sec: 1500 },
];

/**
 * Ultimate Mind System — execution + reflection, ADHD-friendly.
 * Keyboard: 1–4 tabs · F focus · G fast mode · D theme · ? hint
 */
export default function App() {
  const mind = useMindState();
  const [tab, setTab] = useState('Today');
  const [showKeys, setShowKeys] = useState(false);
  /** When Gentle list is on, user can expand to see every task without turning Gentle off. */
  const [gentleExpanded, setGentleExpanded] = useState(false);

  const {
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
  } = mind;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /** Fast mode countdown */
  useEffect(() => {
    if (!fastMode) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [fastMode, setTimer]);

  const onFastToggle = useCallback(() => {
    setFastMode((v) => {
      const next = !v;
      if (next) setTimer(fastDuration);
      return next;
    });
  }, [setFastMode, setTimer, fastDuration]);

  const applyPresetSeconds = useCallback(
    (sec) => {
      setFastDuration(sec);
      if (fastMode) setTimer(sec);
    },
    [setFastDuration, fastMode, setTimer]
  );

  const onThemeToggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  /** Global shortcuts (ignore when typing) */
  useEffect(() => {
    function onKey(e) {
      if (e.target.matches('input, textarea')) return;
      const k = e.key.toLowerCase();
      if (k === 'f') {
        e.preventDefault();
        setFocusMode((v) => !v);
      }
      if (k === 'g') {
        e.preventDefault();
        onFastToggle();
      }
      if (k === 'd') {
        e.preventDefault();
        onThemeToggle();
      }
      if (e.key === '?') {
        e.preventDefault();
        setShowKeys((v) => !v);
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= TABS.length) {
        e.preventDefault();
        setTab(TABS[n - 1]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFastToggle, onThemeToggle, setFocusMode]);

  const last7 = useMemo(() => history.slice(0, 7).length, [history]);

  const taskIndices = useMemo(() => {
    if (!gentleList || gentleExpanded) return tasks.map((_, i) => i);
    return tasks.map((_, i) => i).slice(0, GENTLE_VISIBLE);
  }, [gentleList, gentleExpanded, tasks]);

  return (
    <div className="um-app">
      <header className="um-header">
        <div>
          <h1 className="um-title">Ultimate Mind System</h1>
          <p className="um-sub">
            Built for ADHD brains: one next move, gentle pacing, no shame when the list feels huge.
          </p>
        </div>
        <div className="um-header-actions">
          <button
            type="button"
            className="um-icon-btn"
            onClick={onThemeToggle}
            title="Toggle theme (D)"
            aria-label="Toggle dark or light theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <nav className="um-tabs" role="tablist" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            className="um-tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {showKeys && (
        <div className="um-card" style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text)' }}>Shortcuts</strong>
          <p style={{ marginTop: '0.35rem' }}>
            1–4 tabs · F focus · G timer · D theme · ? this · Gentle list shrinks the checklist visually; progress still uses all tasks.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'Today' && (
            <section aria-label="Today execution">
              <div className="um-card um-card--next">
                <label className="um-label" htmlFor="um-next-action">
                  One thing right now
                </label>
                <p className="um-micro">Externalize the next physical step so your brain isn’t holding it.</p>
                <input
                  id="um-next-action"
                  className="um-field um-field-next"
                  placeholder="e.g. Open Notion · Fill one field · Set timer"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="um-card um-card--energy">
                <span className="um-label">Energy check-in (optional)</span>
                <div className="um-energy-row" role="group" aria-label="Energy level">
                  {[
                    { k: 'low', label: 'Low' },
                    { k: 'ok', label: 'OK' },
                    { k: 'high', label: 'High' },
                  ].map(({ k, label }) => (
                    <button
                      key={k}
                      type="button"
                      className="um-energy-btn"
                      data-on={energy === k}
                      onClick={() => setEnergy(energy === k ? '' : k)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="um-row-btns">
                <button
                  type="button"
                  className="um-pill"
                  data-on={focusMode}
                  onClick={() => setFocusMode((v) => !v)}
                >
                  {focusMode ? 'Focus on' : 'Focus'}
                </button>
                <button type="button" className="um-pill" data-on={fastMode} onClick={onFastToggle}>
                  {fastMode ? 'Timer on' : 'Timer'}
                </button>
                <button
                  type="button"
                  className="um-pill"
                  data-on={gentleList}
                  onClick={() => {
                    setGentleList((v) => !v);
                    setGentleExpanded(false);
                  }}
                >
                  {gentleList ? 'Gentle on' : 'Gentle list'}
                </button>
              </div>

              <div className="um-card">
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Streak <strong>{streak}</strong> 🔥
                </p>
                {fastMode && (
                  <div className="um-fast">
                    <div className="t">⏱ {timer}s</div>
                    <div className="um-preset-row">
                      {TIMER_PRESETS.map(({ label, sec }) => (
                        <button
                          key={sec}
                          type="button"
                          className="um-preset"
                          data-on={fastDuration === sec}
                          onClick={() => applyPresetSeconds(sec)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="um-pill"
                      style={{ marginTop: '0.35rem' }}
                      onClick={resetFastTimer}
                    >
                      Reset
                    </button>
                  </div>
                )}
                {gentleList && !gentleExpanded && (
                  <p className="um-gentle-hint">
                    Showing {GENTLE_VISIBLE} of {tasks.length} tasks — progress still uses your full list.
                  </p>
                )}
                {taskIndices.map((i) => {
                  const label = tasks[i];
                  return (
                    <label key={label} className="um-check-row">
                      <input type="checkbox" checked={checked[i]} onChange={() => toggleTask(i)} />
                      <span className={checked[i] ? 'done' : ''}>{label}</span>
                    </label>
                  );
                })}
                {gentleList && !gentleExpanded && tasks.length > GENTLE_VISIBLE && (
                  <button
                    type="button"
                    className="um-linkish"
                    onClick={() => setGentleExpanded(true)}
                  >
                    Show all {tasks.length} tasks
                  </button>
                )}
                {gentleList && gentleExpanded && (
                  <button type="button" className="um-linkish" onClick={() => setGentleExpanded(false)}>
                    Collapse to first {GENTLE_VISIBLE}
                  </button>
                )}
                <div className="um-progress-track">
                  <motion.div
                    className="um-progress-fill"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
                <p className="um-meta">{progress}% today</p>
                <p className="um-suggestion">{suggestion}</p>
              </div>

              {!focusMode && (
                <>
                  <div className="um-card">
                    <h2 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Problem log
                    </h2>
                    <p className="um-micro" style={{ marginBottom: '0.5rem' }}>
                      Short beats perfect. One field is enough.
                    </p>
                    <input
                      className="um-field"
                      placeholder="Problem"
                      value={problemLog.problem}
                      onChange={(e) => setProblemField('problem', e.target.value)}
                    />
                    <input
                      className="um-field"
                      placeholder="Cause"
                      value={problemLog.cause}
                      onChange={(e) => setProblemField('cause', e.target.value)}
                    />
                    <input
                      className="um-field"
                      placeholder="Solution"
                      value={problemLog.solution}
                      onChange={(e) => setProblemField('solution', e.target.value)}
                    />
                    <input
                      className="um-field"
                      placeholder="Result"
                      value={problemLog.result}
                      onChange={(e) => setProblemField('result', e.target.value)}
                    />
                  </div>

                  <div className="um-card">
                    <h2 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Notes
                    </h2>
                    <textarea
                      className="um-field um-textarea"
                      placeholder="Daily thoughts…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="um-card">
                    <h2 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Taste tracker
                    </h2>
                    <input
                      className="um-field"
                      placeholder="Song / album"
                      value={music.song}
                      onChange={(e) => setMusicField('song', e.target.value)}
                    />
                    <input
                      className="um-field"
                      placeholder="Feeling / why it matters"
                      value={music.feeling}
                      onChange={(e) => setMusicField('feeling', e.target.value)}
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </>
              )}
            </section>
          )}

          {tab === 'Log' && (
            <section className="um-card" aria-label="History">
              {!history.length ? (
                <p className="um-suggestion" style={{ marginTop: 0 }}>
                  When you finish every task for a day, it lands here — no rush, no penalty for quiet days.
                </p>
              ) : (
                <div className="um-log">
                  {history.map((h) => (
                    <div key={h.date} className="um-log-item">
                      <div className="date">{h.date}</div>
                      <div className="problem">{h.problemLog?.problem || '—'}</div>
                      <div className="song">{h.music?.song ? `♪ ${h.music.song}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'Review' && (
            <section className="um-card" aria-label="Review">
              <p style={{ fontSize: '0.95rem' }}>
                Perfect days in last 7 entries: <strong>{last7}</strong>
              </p>
              <p className="um-suggestion" style={{ marginTop: '0.65rem' }}>
                What felt heavy this week? What one habit would make mornings easier?
              </p>
              <p className="um-suggestion" style={{ marginTop: '0.5rem' }}>
                Name one thing you&apos;re building taste in — not talent, taste.
              </p>
              <p className="um-suggestion" style={{ marginTop: '0.5rem' }}>
                Skipped days don&apos;t erase you — they&apos;re data, not a verdict.
              </p>
            </section>
          )}

          {tab === 'Goals' && (
            <section className="um-card" aria-label="Goals">
              {goals.map((g, i) => (
                <input
                  key={i}
                  className="um-field"
                  value={g}
                  onChange={(e) => updateGoal(i, e.target.value)}
                />
              ))}
              <button type="button" className="um-add-btn" onClick={addGoal}>
                + Add goal
              </button>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="um-shortcuts-hint">
        Press <kbd>?</kbd> for shortcuts · Data stays in this browser (localStorage)
      </p>
    </div>
  );
}
