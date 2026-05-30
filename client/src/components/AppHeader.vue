<template>
  <header class="app-header">
    <h1 class="app-title" @click="$router.push('/')">
      <span class="title-full">HTTP Request Receiver</span>
      <span class="title-short">HTTP RCVR</span>
    </h1>
    <div class="header-right">
      <span v-if="wsConnected" class="status-dot live" title="WebSocket connected"></span>
      <span v-else class="status-dot dead" title="WebSocket disconnected"></span>
      <button v-if="isAuthenticated" class="btn btn-sm logout-btn" @click="handleLogout">
        <span class="logout-full">Logout</span>
        <span class="logout-short">✕</span>
      </button>
    </div>
  </header>
</template>
