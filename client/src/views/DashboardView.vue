<template>
  <div class="dashboard">
    <div class="panel panel-left">
      <EndpointList
        :endpoints="endpoints"
        @toggle="handleToggle"
        @delete="handleDelete"
      />
    </div>
    <div class="panel panel-right">
      <LogViewer
        :logEntries="logEntries"
        :endpoints="endpoints"
        @clear="clearLogs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useWebSocket } from '../composables/useWebSocket.js'
import EndpointList from '../components/EndpointList.vue'
import LogViewer from '../components/LogViewer.vue'

const api = useApi()
const { logEntries, connect, disconnect, clearLogs } = useWebSocket()

const endpoints = ref([])

onMounted(async () => {
  await fetchEndpoints()
  connect()
})

async function fetchEndpoints() {
  try {
    endpoints.value = await api.get('/api/endpoints')
  } catch (e) {
    console.error('Failed to fetch endpoints:', e)
  }
}

async function handleToggle(ep) {
  try {
    await api.put(`/api/endpoints/${ep.id}`, { enabled: !ep.enabled })
    await fetchEndpoints()
  } catch (e) {
    console.error('Failed to toggle endpoint:', e)
  }
}

async function handleDelete(ep) {
  try {
    await api.del(`/api/endpoints/${ep.id}`)
    await fetchEndpoints()
  } catch (e) {
    console.error('Failed to delete endpoint:', e)
  }
}
</script>
