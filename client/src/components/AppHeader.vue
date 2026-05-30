<template>
  <header class="app-header">
    <h1 class="app-title" @click="$router.push('/')">HTTP Request Receiver</h1>
    <div class="header-right">
      <span v-if="wsConnected" class="status-dot live" title="WebSocket connected"></span>
      <span v-else class="status-dot dead" title="WebSocket disconnected"></span>
      <button v-if="isAuthenticated" class="btn btn-sm" @click="handleLogout">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  wsConnected: { type: Boolean, default: false }
})

const { isAuthenticated, logout } = useAuth()
const router = useRouter()

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
