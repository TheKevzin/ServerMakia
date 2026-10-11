export class FetchError extends Error {
  info: any
  status: number

  constructor(message: string, status: number, info?: any) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.info = info
  }
}

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    const errorInfo = await res.json().catch(() => ({}))
    throw new FetchError(
      errorInfo.error || errorInfo.message || 'Failed to fetch resource',
      res.status,
      errorInfo
    )
  }
  return res.json()
}
