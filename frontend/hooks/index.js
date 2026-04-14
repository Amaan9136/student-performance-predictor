import { useState, useEffect, useCallback } from 'react'
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const refetch = useCallback(async (...args) => {
    setLoading(true)
    try {
      const res = await fn(...args)
      setData(res.data.data)
      setError(null)
      return res.data.data
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, deps)
  useEffect(() => { refetch() }, [refetch])
  return { data, loading, error, refetch }
}
export function useAction() {
  const [loading, setLoading] = useState(false)
  const run = useCallback((fn) => async (...args) => {
    setLoading(true)
    try { return await fn(...args) }
    finally { setLoading(false) }
  }, [])
  return [loading, run]
}
