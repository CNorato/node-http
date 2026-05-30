import { ref } from 'vue'

const logEntries = ref([])
const connected = ref(false)
const maxEntries = 1000

let ws = null
let reconnectTimer = null
let reconnectDelay = 1000

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // In dev mode Vite proxies /ws, in production same host
  const url = `${protocol}//${window.location.host}/ws`
  ws = new WebSocket(url)

  ws.onopen = () => {
    connected.value = true
    reconnectDelay = 1000
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'request_log') {
        logEntries.value = [...logEntries.value, msg.data].slice(-maxEntries)
      }
    } catch {
      // ignore malformed messages
    }
  }

  ws.onclose = () => {
    connected.value = false
    ws = null
    scheduleReconnect()
  }

  ws.onerror = () => {
    ws?.close()
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    reconnectDelay = Math.min(reconnectDelay * 2, 30000)
    connect()
  }, reconnectDelay)
}

function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (ws) {
    ws.onclose = null
    ws.onerror = null
    ws.close()
    ws = null
  }
  connected.value = false
}

function clearLogs() {
  logEntries.value = []
}

export function useWebSocket() {
  return { logEntries, connected, connect, disconnect, clearLogs }
}
