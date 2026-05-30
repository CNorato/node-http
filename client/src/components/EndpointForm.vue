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
      <div class="body-label-row">
        <label>Response Body</label>
        <div class="body-toolbar">
          <label class="checkbox-label">
            <input v-model="jsonMode" type="checkbox" />
            JSON
          </label>
          <button v-if="jsonMode" type="button" class="btn btn-sm" @click="formatJson">Format</button>
        </div>
      </div>
      <textarea
        v-if="!jsonMode"
        v-model="form.responseBody"
        class="input body-input"
        rows="8"
        placeholder="Response body content..."
      ></textarea>
      <div v-else ref="editorContainer" class="cm-container"></div>
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
import { reactive, ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'

const props = defineProps({
  endpoint: { type: Object, default: null }
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.endpoint)

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'ANY']

const jsonMode = ref(false)
const editorContainer = ref(null)

const form = reactive({
  path: '',
  method: 'GET',
  statusCode: 200,
  responseBody: '',
  headerPairs: [],
  enabled: true,
})

let editorView = null

watch(() => props.endpoint, (ep) => {
  if (ep) {
    form.path = ep.path
    form.method = ep.method
    form.statusCode = ep.statusCode
    form.responseBody = ep.responseBody
    form.enabled = ep.enabled
    form.headerPairs = Object.entries(ep.responseHeaders || {}).map(([key, value]) => ({ key, value }))
    jsonMode.value = ep.bodyType === 'json'
  }
}, { immediate: true })

watch(jsonMode, async (on) => {
  if (on) {
    await nextTick()
    createEditor()
  } else {
    destroyEditor()
  }
})

function createEditor() {
  if (!editorContainer.value || editorView) return

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      form.responseBody = update.state.doc.toString()
    }
  })

  editorView = new EditorView({
    state: EditorState.create({
      doc: form.responseBody,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),
        json(),
        oneDark,
        updateListener,
      ],
    }),
    parent: editorContainer.value,
  })
}

function destroyEditor() {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
}

onUnmounted(() => {
  destroyEditor()
})

function formatJson() {
  if (editorView) {
    const doc = editorView.state.doc.toString()
    try {
      const parsed = JSON.parse(doc)
      const formatted = JSON.stringify(parsed, null, 2)
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: formatted }
      })
    } catch {
      // invalid JSON, leave as-is
    }
  } else {
    try {
      const parsed = JSON.parse(form.responseBody)
      form.responseBody = JSON.stringify(parsed, null, 2)
    } catch {
      // invalid JSON, leave as-is
    }
  }
}

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
    bodyType: jsonMode.value ? 'json' : 'text',
  })
}
</script>
