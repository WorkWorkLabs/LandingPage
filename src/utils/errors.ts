export function withTimeout<T>(promise: PromiseLike<T>, ms: number, label = '请求超时'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms)
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

export function friendlyNetworkError(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error ?? '')
  if (/failed to fetch|networkerror|load failed|timeout|超时|name_not_resolved|err_name|dns/i.test(raw)) {
    return fallback
  }
  const cleaned = raw.replace(/^typeerror:\s*/i, '').trim()
  return cleaned || fallback
}
