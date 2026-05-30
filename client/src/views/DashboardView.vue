<template>
  <div class="dashboard" :class="{ dragging: dragging }">
    <!-- Desktop: left panel (collapsible with width) -->
    <div
      v-if="!isMobile && !collapsed"
      class="panel panel-left"
      :style="{ width: panelWidth + 'px' }"
    >
      <EndpointList
        :endpoints="endpoints"
        @toggle="handleToggle"
        @delete="handleDelete"
      />
    </div>

    <!-- Desktop: drag handle between panels -->
    <div
      v-if="!isMobile && !collapsed"
      class="drag-handle"
      @mousedown="onDragStart"
    ></div>

    <!-- Desktop: collapsed tab to reopen -->
    <div
      v-if="!isMobile && collapsed"
      class="panel-left-tab"
      @click="collapsed = false"
      title="Show endpoints"
    >▶</div>

    <!-- Main panel (always visible) -->
    <div class="panel panel-right">
      <div class="panel-right-header">
        <button
          class="btn btn-sm panel-toggle"
          @click="togglePanel"
          :title="collapsed ? 'Show endpoints' : 'Hide endpoints'"
        >
          <span v-if="isMobile">{{ showMobileList ? '✕' : '☰' }}</span>
          <span v-else>{{ collapsed ? '▶' : '◀' }}</span>
        </button>
        <span v-if="!isMobile && !collapsed" class="panel-hint">Drag the divider to resize</span>
      </div>
      <LogViewer
        :logEntries="logEntries"
        :endpoints="endpoints"
        :compact="isMobile"
        @clear="clearLogs"
      />
    </div>

    <!-- Mobile: full-screen endpoint list overlay -->
    <div v-if="isMobile && showMobileList" class="mobile-overlay" @click="showMobileList = false">
      <div class="mobile-panel" @click.stop>
        <div class="mobile-panel-header">
          <span class="mobile-panel-title">Endpoints</span>
          <button class="btn btn-sm" @click="showMobileList = false">✕ Close</button>
        </div>
        <EndpointList
          :endpoints="endpoints"
          :compact="true"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useApi } from '../composables/useApi.js'
import { useWebSocket } from '../composables/useWebSocket.js'
import EndpointList from '../components/EndpointList.vue'
import LogViewer from '../components/LogViewer.vue'

const api = useApi()
const { logEntries, connect, clearLogs } = useWebSocket()

const endpoints = ref([])

const collapsed = ref(false)
const showMobileList = ref(false)
const panelWidth = ref(loadPanelWidth())
const isMobile = ref(window.innerWidth < 768)

onMounted(async () => {
  await fetchEndpoints()
  connect()
  window.addEventListener('resize', onResize)
  onResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

function onResize() {
  const was = isMobile.value
  isMobile.value = window.innerWidth < 768
  if (!was && isMobile.value) {
    collapsed.value = true
    showMobileList.value = false
  }
}

function togglePanel() {
  if (isMobile.value) {
    showMobileList.value = !showMobileList.value
  } else {
    collapsed.value = !collapsed.value
  }
}

function loadPanelWidth() {
  const saved = localStorage.getItem('panel-width')
  return saved ? Math.max(280, Math.min(Number.parseInt(saved, 10), 800)) : 380
}

function savePanelWidth() {
  localStorage.setItem('panel-width', String(panelWidth.value))
}

function onDragStart(e) {
  const startX = e.touches ? e.touches[0].clientX : e.clientX
  const startWidth = panelWidth.value

  function onMove(ev) {
    ev.preventDefault()
    const x = ev.touches ? ev.touches[0].clientX : ev.clientX
    panelWidth.value = Math.max(280, Math.min(startWidth + x - startX, 800))
  }

  function onEnd() {
    savePanelWidth()
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

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
