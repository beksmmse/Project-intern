<template>
  <div id="leaflet-map" style="height: 100%; width: 100%; position: relative;">
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'

// Props
const props = defineProps({
  geojsonData: {
    type: Array,
    default: () => []
  },
  selectedFeature: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['featureClick', 'confirmDrawing'])

// Refs
const map = ref(null)
const featureLayers = ref(new Map())
const drawnItems = ref(null)

// Map initialization
onMounted(() => {
  initializeMap()
  setupDrawingControls()
  loadFeatures()
})

// Watch for geojsonData changes
watch(() => props.geojsonData, () => {
  loadFeatures()
}, { deep: true })

// Watch for selectedFeature changes
watch(() => props.selectedFeature, (newSelected) => {
  if (newSelected) {
    focusOnFeature(newSelected.properties.id)
  }
})

function initializeMap() {
  // Initialize Leaflet map
  map.value = L.map('leaflet-map').setView([13.7563, 100.5018], 13)
  
  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)
  
  // Initialize feature group for drawn items
  drawnItems.value = new L.FeatureGroup()
  map.value.addLayer(drawnItems.value)
}

function setupDrawingControls() {
  // Drawing control options
  const drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems.value,
      remove: true
    },
    draw: {
      polygon: {
        allowIntersection: false,
        drawError: {
          color: '#e1e100',
          message: '<strong>Error:</strong> shape edges cannot cross!'
        },
        shapeOptions: {
          color: '#97009c'
        }
      },
      polyline: {
        shapeOptions: {
          color: '#f357a1',
          weight: 4
        }
      },
      rect: {
        shapeOptions: {
          clickable: false
        }
      },
      circle: {
        shapeOptions: {
          color: '#662d91'
        }
      },
      marker: true,
      circlemarker: false
    }
  })
  
  map.value.addControl(drawControl)
  
  // Drawing event handlers
  map.value.on('draw:created', (e) => {
    const layer = e.layer
    const type = e.layerType
    
    drawnItems.value.addLayer(layer)
    
    // Emit drawing confirmation
    emit('confirmDrawing', layer, type)
  })
}

function loadFeatures() {
  // Clear existing layers
  featureLayers.value.forEach(layer => {
    map.value.removeLayer(layer)
  })
  featureLayers.value.clear()
  
  // Add new features
  props.geojsonData.forEach(feature => {
    addFeatureToMap(feature)
  })
}

function addFeatureToMap(feature) {
  const layer = L.geoJSON(feature, {
    style: {
      color: '#3388ff',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.2
    },
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: '#3388ff',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
    }
  })
  
  // Add popup
  layer.bindPopup(`
    <div>
      <h4>${feature.properties.name || 'ไม่มีชื่อ'}</h4>
      <p><strong>ID:</strong> ${feature.properties.id}</p>
      <p><strong>ประเภท:</strong> ${feature.properties.type || 'ไม่ระบุ'}</p>
      <p><strong>คำอธิบาย:</strong> ${feature.properties.description || 'ไม่มีคำอธิบาย'}</p>
      <p><strong>ที่อยู่:</strong> ${feature.properties.address || 'ไม่มีที่อยู่'}</p>
    </div>
  `)
  
  // Add click handler
  layer.on('click', () => {
    emit('featureClick', feature)
  })
  
  // Add to map and store reference
  layer.addTo(map.value)
  featureLayers.value.set(feature.properties.id, layer)
}

function focusOnFeature(featureId) {
  const layer = featureLayers.value.get(featureId)
  if (layer) {
    const bounds = layer.getBounds()
    if (bounds && bounds.isValid()) {
      map.value.fitBounds(bounds, { padding: [20, 20] })
    } else {
      // For point features
      const latlng = layer.getLatLng()
      if (latlng) {
        map.value.setView(latlng, 16)
      }
    }
    
    // Highlight the feature
    layer.setStyle({
      color: '#ff0000',
      weight: 4
    })
    
    // Reset style after 3 seconds
    setTimeout(() => {
      layer.setStyle({
        color: '#3388ff',
        weight: 2
      })
    }, 3000)
  }
}

function addLayerToMap(layer, featureId) {
  if (layer && featureId) {
    featureLayers.value.set(featureId, layer)
  }
}

function removeLayerFromMap(featureId) {
  const layer = featureLayers.value.get(featureId)
  if (layer) {
    map.value.removeLayer(layer)
    featureLayers.value.delete(featureId)
  }
}

// Expose methods
defineExpose({
  focusOnFeature,
  addLayerToMap,
  removeLayerFromMap
})
</script>

<style scoped>
#leaflet-map {
  height: 100%;
  width: 100%;
}

/* Override Leaflet popup styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-content) {
  margin: 12px 16px;
  font-size: 14px;
}

:deep(.leaflet-popup-content h4) {
  margin: 0 0 8px 0;
  color: #333;
}

:deep(.leaflet-popup-content p) {
  margin: 4px 0;
  color: #666;
}
</style>