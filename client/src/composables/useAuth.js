import { ref, computed } from 'vue'

const token = ref(localStorage.getItem('token') || null)
const isAuthenticated = computed(() => !!token.value)

export function useAuth() {
  function login(password) {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid password')
        return res.json()
      })
      .then(data => {
        token.value = data.token
        localStorage.setItem('token', data.token)
      })
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  function getAuthHeader() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, isAuthenticated, login, logout, getAuthHeader }
}
