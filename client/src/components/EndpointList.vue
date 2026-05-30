<template>
  <div class="endpoint-list">
    <div class="list-header">
      <h2>Endpoints</h2>
      <button class="btn btn-primary" @click="$router.push('/endpoints/new')">+ New Endpoint</button>
    </div>
    <div v-if="endpoints.length === 0" class="empty-state">
      No endpoints created yet. Click "New Endpoint" to get started.
    </div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Method</th>
          <th>Path</th>
          <th>Status</th>
          <th>Enabled</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ep in endpoints" :key="ep.id">
          <td><span class="badge" :class="'method-' + ep.method.toLowerCase()">{{ ep.method }}</span></td>
          <td class="path-cell">{{ ep.path }}</td>
          <td><span class="badge" :class="statusBadgeClass(ep.statusCode)">{{ ep.statusCode }}</span></td>
          <td>
            <label class="toggle">
              <input type="checkbox" :checked="ep.enabled" @change="$emit('toggle', ep)" />
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td class="actions-cell">
            <button class="btn btn-sm" @click="$router.push('/endpoints/' + ep.id)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="handleDelete(ep)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  endpoints: { type: Array, required: true }
})

const emit = defineEmits(['toggle', 'delete'])

function statusBadgeClass(code) {
  if (code < 300) return 'status-2xx'
  if (code < 400) return 'status-3xx'
  if (code < 500) return 'status-4xx'
  return 'status-5xx'
}

function handleDelete(ep) {
  if (confirm(`Delete endpoint ${ep.method} ${ep.path}? This cannot be undone.`)) {
    emit('delete', ep)
  }
}
</script>
