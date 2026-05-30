<template>
  <div class="edit-page">
    <h2>{{ isEdit ? 'Edit Endpoint' : 'New Endpoint' }}</h2>
    <EndpointForm
      :endpoint="endpoint"
      @submit="handleSubmit"
      @cancel="$router.push('/')"
    />
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '../composables/useApi.js'
import EndpointForm from '../components/EndpointForm.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()

const endpoint = ref(null)
const error = ref('')
const isEdit = computed(() => !!route.params.id)

onMounted(async () => {
  if (isEdit.value) {
    try {
      endpoint.value = await api.get(`/api/endpoints/${route.params.id}`)
    } catch (e) {
      error.value = 'Failed to load endpoint: ' + e.message
    }
  }
})

async function handleSubmit(data) {
  error.value = ''
  try {
    if (isEdit.value) {
      await api.put(`/api/endpoints/${route.params.id}`, data)
    } else {
      await api.post('/api/endpoints', data)
    }
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>
