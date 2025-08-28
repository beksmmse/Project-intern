<template>
  <div>
    <MapCesium v-if="is3DMode" />
    <MapLeaflet v-else />
    <teleport v-if="!is3DMode && mapElExists" to="#map">
      <button @click="toggleMode" class="toggle-btn inside">
        {{ is3DMode ? 'Switch to 2D' : 'Switch to 3D' }}
      </button>
    </teleport>
    <teleport v-if="is3DMode && cesiumElExists" to="#cesiumContainer">
      <button @click="toggleMode" class="toggle-btn inside">
        {{ is3DMode ? 'Switch to 2D' : 'Switch to 3D' }}
      </button>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import MapCesium from '../components/LineCesium.vue'
import MapLeaflet from '../components/LineLeaflet.vue'

const is3DMode = ref(false)
const mapElExists = ref(false)
const cesiumElExists = ref(false)

function toggleMode() {
  is3DMode.value = !is3DMode.value
}

function checkTargets(){
  mapElExists.value = !!document.getElementById('map')
  cesiumElExists.value = !!document.getElementById('cesiumContainer')
}

onMounted(async () => {
  await nextTick()
  let attempts = 0
  const timer = setInterval(()=>{
    checkTargets()
    attempts++
    if ((mapElExists.value || cesiumElExists.value) && attempts>2) clearInterval(timer)
    if (attempts>30) clearInterval(timer) 
  },300)
})

watch(is3DMode, async () => {
  await nextTick()
  setTimeout(checkTargets, 400) 
})
</script>

<style scoped>
.toggle-btn{  
  margin:16px;
  padding:8px 20px; 
  font-size:16px; 
  background:#007bff; 
  color:#fff; 
  border:none; 
  border-radius:6px; 
  cursor:pointer; 
  transition:background .2s; 
}

.toggle-btn:hover{ 
  background:#0056b3; 
}

.toggle-btn.inside{ 
  position:absolute; 
  bottom:12px; 
  right:12px; 
  top:auto; 
  margin:0; 
  z-index:1000; 
  box-shadow:0 2px 6px rgba(0,0,0,.25); 
  backdrop-filter:blur(4px); 
}

:deep(#map), 
:deep(#cesiumContainer){ 
  position:relative; 
}

@media (max-width:640px){
  .toggle-btn.inside { 
    bottom:8px; 
    right:8px; 
    padding:6px 14px; 
    font-size:13px; 
  }
}
</style>
