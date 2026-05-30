<template>
  <div id="app-root">
    <AppHeader v-if="isAuthenticated" :wsConnected="wsConnected" />
    <main :class="{ 'has-header': isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { provide } from 'vue'
import { useAuth } from './composables/useAuth.js'
import { useWebSocket } from './composables/useWebSocket.js'
import AppHeader from './components/AppHeader.vue'

const auth = useAuth()
const ws = useWebSocket()

provide('auth', auth)
provide('ws', ws)

const { isAuthenticated } = auth
const { connected: wsConnected } = ws
</script>
