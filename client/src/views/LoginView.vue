<template>
  <div class="login-page">
    <div class="login-card">
      <h1>HTTP Request Receiver</h1>
      <p class="login-subtitle">Enter the admin password to continue</p>
      <form @submit.prevent="handleLogin">
        <input
          v-model="password"
          class="input"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
          :disabled="loading"
        />
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button class="btn btn-primary btn-block" :disabled="loading || !password">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { login } = useAuth()

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
