import { useState, useEffect, useMemo } from 'react'
import Timer from './Timer.jsx'
import { dk, lastDays, load, save, seed, isDone, streak } from './utils.js'

export default function App() {
  const [habits, setHabits] = useState(() => load() || seed)
  const [name, setName] = useState('')
  const [type, setType] = useState('check')
  const [target, setTarget] = useState(30)

  useEffect(() => save(habits), [habits])

  const days = useMemo(() => lastDays(7), [])
  const today = dk(new Date())

  const update = (id, fn) =>
      setHabits((hs) => hs.map((h) => (h.id === id ? fn(h) : h)))

  const toggle = (h, k) =>
      update(h.id, (x) => {
        const log = { ...x.log }
        if (isDone(x, k)) delete log[k]
        else log[k] = x.type === 'check' ? true : x.target
        return { ...x, log }
      })

  const logMinutes = (id, m) =>
      update(id, (x) => ({ ...x, log: { ...x.log, [today]: (x.log[today] || 0) + m } }))

  const addHabit = (e) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    setHabits((hs) => [
      ...hs,
      {
        id: Date.now(),
        name: n,
        type,
        target: type === 'minutes' ? Math.max(1, +target || 30) : 0,
        log: {},
      },
    ])
    setName('')
  }

  const removeHabit = (h) => {
    if (confirm(`Delete “${h.name}” and its history?`)) {
      setHabits((hs) => hs.filter((x) => x.id !== h.id))
    }
  }

  const doneToday = habits.filter((h) => isDone(h, today)).length
  const todayPct = habits.length ? Math.round((doneToday / habits.length) * 100) : 0
  const weekPct = habits.length
      ? Math.round(
          (habits.reduce((a, h) => a + days.filter((d) => isDone(h, dk(d))).length, 0) /
              (habits.length * 7)) * 100
      )
      : 0
  const studyMin = habits.reduce(
      (a, h) => (h.type === 'minutes' ? a + days.reduce((s, d) => s + (h.log[dk(d)] || 0), 0) : a),
      0
  )

  return (
      <main className="wrap">
        <h1>Streakline</h1>
        <p className="sub">Check off habits, log study time, and keep your streaks alive.</p>

        <div className="top">
          <div className="stat">
            <b>{doneToday}/{habits.length}</b>
            <span>done today</span>
            <div className="bar"><i style={{ width: todayPct + '%' }} /></div>
          </div>
          <div className="stat">
            <b>{weekPct}%</b>
            <span>of the last 7 days · {Math.floor(studyMin / 60)}h {studyMin % 60}m studied</span>
            <div className="bar"><i style={{ width: weekPct + '%' }} /></div>
          </div>
        </div>

        <div className="panel">
          <h2>This week</h2>
          <div className="days" aria-hidden="true">
            <span>Habit</span>
            {days.map((d) => (
                <span key={dk(d)}>
              {d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}
            </span>
            ))}
            <span />
          </div>

          {habits.length === 0 && <p className="empty">No habits yet. Add your first one below.</p>}

          {habits.map((h) => (
              <div className="row" key={h.id}>
                <div className="name">
                  {h.name}
                  <span className="meta">
                {h.type === 'minutes' ? `${h.target} min/day` : 'Daily check-in'} · {streak(h)}-day streak
              </span>
                </div>

                {days.map((d) => {
                  const k = dk(d)
                  const on = isDone(h, k)
                  const m = h.log[k] || 0
                  const part = h.type === 'minutes' && m > 0 && !on
                  const cls = 'cell' + (on ? ' on' : '') + (part ? ' part' : '') + (k === today ? ' today' : '')
                  return (
                      <button
                          key={k}
                          className={cls}
                          onClick={() => toggle(h, k)}
                          aria-pressed={on}
                          aria-label={`${h.name}, ${d.toLocaleDateString(undefined, { weekday: 'long' })}${on ? ', done' : ''}`}
                      >
                        {h.type === 'minutes' && m > 0 ? m : on ? '✓' : ''}
                      </button>
                  )
                })}

                <button className="x" onClick={() => removeHabit(h)} aria-label={`Delete ${h.name}`}>×</button>
              </div>
          ))}
        </div>

        <Timer habits={habits} onLog={logMinutes} />

        <div className="panel">
          <h2>Add a habit</h2>
          <form onSubmit={addHabit}>
            <input
                type="text"
                placeholder="e.g. Practice Swahili vocabulary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Habit name"
                maxLength={60}
            />
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Habit type">
              <option value="check">Daily check-in</option>
              <option value="minutes">Minutes goal</option>
            </select>
            {type === 'minutes' && (
                <label>
                  Goal{' '}
                  <input
                      type="number"
                      min="1"
                      max="600"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                  />{' '}
                  min
                </label>
            )}
            <button className="btn" type="submit">Add habit</button>
          </form>
          <p className="note">
            Tap a day to mark it done. Minute goals show the minutes logged; tap a done day to clear it.
            Data stays in this browser.
          </p>
        </div>
      </main>
  )
}