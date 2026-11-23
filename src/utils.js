export const KEY = 'streakline-v1'

export const pad = (n) => String(n).padStart(2, '0')

export const dk = (d) =>
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())

export const lastDays = (n) =>
    Array.from({ length: n }, (_, i) => {
        const d = new Date()
        d.setHours(12)
        d.setDate(d.getDate() - (n - 1 - i))
        return d
    })

export const load = () => {
    try {
        const v = JSON.parse(localStorage.getItem(KEY))
        if (Array.isArray(v)) return v
    } catch (e) {}
    return null
}

export const save = (habits) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(habits))
    } catch (e) {}
}

export const seed = [
    { id: 1, name: 'Read for 20 minutes', type: 'check', target: 0, log: {} },
    { id: 2, name: 'Study session', type: 'minutes', target: 45, log: {} },
]

export const isDone = (h, k) =>
    h.type === 'check' ? !!h.log[k] : (h.log[k] || 0) >= h.target

export function streak(h) {
    const d = new Date()
    d.setHours(12)
    if (!isDone(h, dk(d))) d.setDate(d.getDate() - 1)
    let n = 0
    while (isDone(h, dk(d))) {
        n++
        d.setDate(d.getDate() - 1)
    }
    return n
}