<template>
  <form class="endpoint-form" @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="form-group method-group">
        <label>Method</label>
        <select v-model="form.method" class="input">
          <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div class="form-group path-group">
        <label>Path</label>
        <input v-model="form.path" class="input" placeholder="/api/example" required />
      </div>
      <div class="form-group status-group">
        <label>Status</label>
        <input v-model.number="form.statusCode" class="input" type="number" min="100" max="599" />
      </div>
    </div>

    <div class="form-group">
      <label>Response Headers</label>
      <div class="headers-editor">
        <div v-for="(h, i) in form.headerPairs" :key="i" class="header-row">
          <input v-model="h.key" class="input" placeholder="Header name" />
          <input v-model="h.value" class="input" placeholder="Value" />
          <button type="button" class="btn btn-sm btn-danger" @click="removeHeader(i)">X</button>
        </div>
        <button type="button" class="btn btn-sm" @click="addHeader">+ Add Header</button>
      </div>
    </div>

    <div class="form-group">
      <label>Response Body</label>
      <textarea v-model="form.responseBody" class="input body-input" rows="6" placeholder="Response body content..."></textarea>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input v-model="form.enabled" type="checkbox" />
        Enabled
      </label>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">{{ isEdit ? 'Update' : 'Create' }} Endpoint</button>
      <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  endpoint: { type: Object, default: null }
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.endpoint)

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'ANY']

const form = reactive({
  path: '',
  method: 'GET',
  statusCode: 200,
  responseBody: '',
  headerPairs: [],
  enabled: true,
})

watch(() => props.endpoint, (ep) => {
  if (ep) {
    form.path = ep.path
    form.method = ep.method
    form.statusCode = ep.statusCode
    form.responseBody = ep.responseBody
    form.enabled = ep.enabled
    form.headerPairs = Object.entries(ep.responseHeaders || {}).map(([key, value]) => ({ key, value }))
  }
}, { immediate: true })

function addHeader() {
  form.headerPairs.push({ key: '', value: '' })
}

function removeHeader(i) {
  form.headerPairs.splice(i, 1)
}

function handleSubmit() {
  const responseHeaders = {}
  for (const h of form.headerPairs) {
    if (h.key.trim()) {
      responseHeaders[h.key.trim()] = h.value
    }
  }
  emit('submit', {
    path: form.path,
    method: form.method,
    statusCode: form.statusCode,
    responseBody: form.responseBody,
    responseHeaders,
    enabled: form.enabled,
  })
}
</script>
