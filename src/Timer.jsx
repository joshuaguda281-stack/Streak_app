import { useState, useEffect, useRef } from 'react'
import { pad } from './utils.js'

export default function Timer({ habits, onLog }) {
    const mins = habits.filter((h) => h.type === 'minutes')
    const [sel, setSel] = useState(mins[0]?.id ?? '')
    const [len, setLen] = useState(25)
    const [left, setLeft] = useState(25 * 60)
    const [run, setRun] = useState(false)
    const [started, setStarted] = useState(false)
    const end = useRef(0)

    // Keep the clock in sync with the chosen length until a session starts
    useEffect(() => {
        if (!started) setLeft(len * 60)
    }, [len, started])

    // If the selected habit was deleted, fall back to the first minutes habit
    useEffect(() => {
        if (!mins.some((h) => String(h.id) === String(sel))) {
            setSel(mins[0]?.id ?? '')
        }
    }, [habits])

    // Countdown based on a fixed end time, so it stays accurate in background tabs
    useEffect(() => {
        if (!run) return
        const t = setInterval(() => {
            const r = Math.max(0, Math.round((end.current - Date.now()) / 1000))
            setLeft(r)
            if (r === 0) {
                setRun(false)
                setStarted(false)
                if (sel) onLog(Number(sel), len)
            }
        }, 250)
        return () => clearInterval(t)
    }, [run, len, sel])

    const start = () => {
        end.current = Date.now() + left * 1000
        setStarted(true)
        setRun(true)
    }

    const stopAndLog = () => {
        const elapsed = Math.floor((len * 60 - left) / 60)
        setRun(false)
        setStarted(false)
        if (elapsed > 0 && sel) onLog(Number(sel), elapsed)
    }

    if (!mins.length) {
        return (
            <div className="panel">
                <h2>Focus timer</h2>
                <p className="empty">Add a habit with a daily minutes goal to log focus time.</p>
            </div>
        )
    }

    return (
        <div className="panel">
            <h2>Focus timer</h2>
            <div className="line">
                <select value={sel} onChange={(e) => setSel(e.target.value)} aria-label="Habit to log to">
                    {mins.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
                <label>
                    Minutes{' '}
                    <input
                        type="number"
                        min="1"
                        max="180"
                        value={len}
                        disabled={started}
                        onChange={(e) => setLen(Math.max(1, Math.min(180, +e.target.value || 25)))}
                    />
                </label>
            </div>

            <div className="clock" role="timer">
                {pad(Math.floor(left / 60))}:{pad(left % 60)}
            </div>

            <div className="line">
                {run ? (
                    <button className="btn" onClick={() => setRun(false)}>Pause</button>
                ) : (
                    <button className="btn" onClick={start}>{started ? 'Resume' : 'Start'}</button>
                )}
                <button className="btn ghost" onClick={stopAndLog}>Stop and log time</button>
            </div>
            <p className="note">Finished sessions add their minutes to today’s entry automatically.</p>
        </div>
    )
}