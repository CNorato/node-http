<template>
  <div class="log-entry" :class="{ matched: entry.matched, unmatched: !entry.matched }">
    <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
    <span class="log-method" :class="'method-' + entry.method.toLowerCase()">{{ entry.method }}</span>
    <span class="log-path">{{ entry.path }}</span>
    <span class="log-status" :class="statusClass">{{ entry.responseStatus }}</span>
    <span class="log-ip">{{ entry.remoteAddress }}</span>
    <button class="btn-expand" @click="expanded = !expanded">{{ expanded ? '-' : '+' }}</button>
    <div v-if="expanded" class="log-detail">
      <div class="detail-section">
        <strong>Headers:</strong>
        <pre>{{ JSON.stringify(entry.requestHeaders, null, 2) }}</pre>
      </div>
      <div class="detail-section" v-if="entry.requestBody">
        <strong>Body:</strong>
        <pre>{{ entry.requestBody }}</pre>
      </div>
      <div class="detail-section" v-if="Object.keys(entry.queryParams).length">
        <strong>Query Params:</strong>
        <pre>{{ JSON.stringify(entry.queryParams, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  entry: { type: Object, required: true }
})

const expanded = ref(false)

const statusClass = computed(() => {
  const code = props.entry.responseStatus
  if (code < 300) return 'status-2xx'
  if (code < 400) return 'status-3xx'
  if (code < 500) return 'status-4xx'
  return 'status-5xx'
})

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}
</script>
