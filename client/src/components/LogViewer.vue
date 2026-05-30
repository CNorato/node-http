<template>
  <div class="log-viewer">
    <div class="viewer-header">
      <h2>Request Logs</h2>
      <div class="viewer-controls">
        <select v-model="filterEndpointId" class="input filter-select">
          <option value="">All Endpoints</option>
          <option value="_unmatched">Unmatched</option>
          <option v-for="ep in endpoints" :key="ep.id" :value="ep.id">
            {{ ep.method }} {{ ep.path }}
          </option>
        </select>
        <label class="checkbox-label">
          <input v-model="autoScroll" type="checkbox" />
          Auto-scroll
        </label>
        <button class="btn btn-sm" @click="$emit('clear')">Clear</button>
      </div>
    </div>
    <div ref="logContainer" class="log-container">
      <div v-if="filteredLogs.length === 0" class="empty-state">
        Waiting for requests... Send a request to one of your endpoints.
      </div>
      <LogEntry v-for="entry in filteredLogs" :key="entry.id" :entry="entry" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import LogEntry from './LogEntry.vue'

const props = defineProps({
  logEntries: { type: Array, required: true },
  endpoints: { type: Array, required: true }
})

defineEmits(['clear'])

const autoScroll = ref(true)
const filterEndpointId = ref('')
const logContainer = ref(null)

const filteredLogs = computed(() => {
  if (!filterEndpointId.value) return props.logEntries
  return props.logEntries.filter(e => e.endpointId === filterEndpointId.value ||
    (filterEndpointId.value === '_unmatched' && !e.endpointId))
})

watch(() => props.logEntries.length, () => {
  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    })
  }
})
</script>
