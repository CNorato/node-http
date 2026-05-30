import { useAuth } from './useAuth.js'

export function useApi() {
  const { getAuthHeader, logout } = useAuth()

  async function request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    }

    const res = await fetch(path, { ...options, headers })

    if (res.status === 401) {
      logout()
      throw new Error('Session expired')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || body.errors?.join(', ') || `Request failed: ${res.status}`)
    }

    return res.json()
  }

  function get(path) {
    return request(path, { method: 'GET' })
  }

  function post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) })
  }

  function put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) })
  }

  function del(path) {
    return request(path, { method: 'DELETE' })
  }

  return { get, post, put, del }
}
