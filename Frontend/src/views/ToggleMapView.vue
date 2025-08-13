<template>
  <div>
    <button @click="toggleMode" class="toggle-btn">
      {{ is3DMode ? 'Switch to 2D' : 'Switch to 3D' }}
    </button>
    <div v-if="is3DMode">
      <BackupCesiumViewer />
    </div>
    <div v-else>
      <MapLeaflet />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BackupCesiumViewer from '../components/BackupCesiumViewer.vue'
import MapLeaflet from '../views/typePoint.vue'

const is3DMode = ref(false)
function toggleMode() {
  is3DMode.value = !is3DMode.value
}
</script>

<style scoped>
.toggle-btn {
  margin: 16px;
  padding: 8px 20px;
  font-size: 16px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.toggle-btn:hover {
  background: #0056b3;
}
</style>
