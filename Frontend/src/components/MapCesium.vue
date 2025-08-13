<template>
  <div>
    <div id="cesium-container" ref="cesiumContainer" class="cesium-container">
      <!-- Cesium toolbar -->
      <div class="cesium-toolbar">
        <button @click="toggle3DTerrain" class="cesium-btn" :class="{ active: terrain3D }">
          3D Terrain
        </button>
        <button @click="toggleBuildings" class="cesium-btn" :class="{ active: showBuildings }">
          Buildings
        </button>
        <button @click="drawPoint" class="cesium-btn">
          Point
        </button>
        <button @click="drawPolygon" class="cesium-btn">
          Polygon
        </button>
        <button @click="drawPolyline" class="cesium-btn">
          Line
        </button>
        <button @click="clearDrawing" class="cesium-btn danger">
          Clear
        </button>
        <button @click="homeView" class="cesium-btn">
          Home
        </button>
      </div>
      
      <!-- Info panel -->
      <div v-if="selectedEntity" class="cesium-info-panel">
        <h4>{{ selectedEntity.name || 'Selected Feature' }}</h4>
        <p v-if="selectedEntity.description">{{ selectedEntity.description.getValue() }}</p>
        <button @click="selectedEntity = null" class="close-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Cesium from 'cesium'

// Props
const props = defineProps({
  userRole: {
    type: String,
    default: 'guest'
  },
  allFeatures: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['entity-created', 'entity-selected', 'entity-clicked'])

// Refs
const cesiumContainer = ref(null)
let viewer = null
const terrain3D = ref(false)
const showBuildings = ref(true)
const selectedEntity = ref(null)
const drawingHandler = ref(null)

// Initialize Cesium
function initCesium() {
  if (!cesiumContainer.value) return

  // Create viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: 'https://a.tile.openstreetmap.org/'
    }),
    baseLayerPicker: true,
    fullscreenButton: true,
    geocoder: true,
    homeButton: true,
    infoBox: true,
    sceneModePicker: true,
    selectionIndicator: true,
    timeline: false,
    animation: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false
  })

  // Set initial view to Bangkok
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(100.5018, 13.7563, 15000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0.0
    }
  })

  // Add 3D buildings by default
  try {
    const osmBuildings = viewer.scene.primitives.add(
      Cesium.createOsmBuildings()
    )
  } catch (error) {
    console.warn('Could not load OSM buildings:', error)
  }

  // Handle entity selection
  viewer.selectedEntityChanged.addEventListener((selectedEntity) => {
    if (selectedEntity) {
      handleEntitySelection(selectedEntity)
    }
  })

  // Handle click events
  viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((event) => {
    const pickedEntity = viewer.scene.pick(event.position)
    if (pickedEntity && pickedEntity.id) {
      emit('entity-clicked', pickedEntity.id)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  console.log('Cesium initialized successfully')
}

// Handle entity selection
function handleEntitySelection(entity) {
  selectedEntity.value = entity
  emit('entity-selected', entity)
}

// Toggle 3D terrain
function toggle3DTerrain() {
  terrain3D.value = !terrain3D.value
  
  if (terrain3D.value) {
    viewer.terrainProvider = Cesium.createWorldTerrain({
      requestWaterMask: true,
      requestVertexNormals: true
    })
  } else {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
  }
}

// Toggle buildings
function toggleBuildings() {
  showBuildings.value = !showBuildings.value
  
  // Find OSM buildings primitive
  const primitives = viewer.scene.primitives
  for (let i = 0; i < primitives.length; i++) {
    const primitive = primitives.get(i)
    if (primitive.constructor.name === 'Cesium3DTileset') {
      primitive.show = showBuildings.value
      break
    }
  }
}

// Drawing functions
function drawPoint() {
  if (!viewer) return
  
  viewer.cesiumWidget.canvas.style.cursor = 'crosshair'
  
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  
  handler.setInputAction((event) => {
    const position = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid)
    if (position) {
      const cartographic = Cesium.Cartographic.fromCartesian(position)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      
      const entity = viewer.entities.add({
        position: position,
        point: {
          pixelSize: 10,
          color: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: 'New Point',
          font: '14pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      
      emit('entity-created', {
        entity,
        type: 'Point',
        coordinates: [longitude, latitude]
      })
    }
    
    handler.destroy()
    viewer.cesiumWidget.canvas.style.cursor = 'auto'
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function drawPolygon() {
  if (!viewer) return
  
  const activePoints = []
  viewer.cesiumWidget.canvas.style.cursor = 'crosshair'
  
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  
  handler.setInputAction((event) => {
    const position = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid)
    if (position) {
      activePoints.push(position)
      
      // Add point marker
      viewer.entities.add({
        position: position,
        point: {
          pixelSize: 8,
          color: Cesium.Color.RED,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
  handler.setInputAction(() => {
    if (activePoints.length >= 3) {
      const entity = viewer.entities.add({
        polygon: {
          hierarchy: activePoints,
          material: Cesium.Color.BLUE.withAlpha(0.5),
          outline: true,
          outlineColor: Cesium.Color.BLUE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      
      const coordinates = activePoints.map(point => {
        const cartographic = Cesium.Cartographic.fromCartesian(point)
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude)
        ]
      })
      
      emit('entity-created', {
        entity,
        type: 'Polygon',
        coordinates: [coordinates]
      })
    }
    
    handler.destroy()
    viewer.cesiumWidget.canvas.style.cursor = 'auto'
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}

function drawPolyline() {
  if (!viewer) return
  
  const activePoints = []
  viewer.cesiumWidget.canvas.style.cursor = 'crosshair'
  
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  
  handler.setInputAction((event) => {
    const position = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid)
    if (position) {
      activePoints.push(position)
      
      // Add point marker
      viewer.entities.add({
        position: position,
        point: {
          pixelSize: 8,
          color: Cesium.Color.GREEN,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
  handler.setInputAction(() => {
    if (activePoints.length >= 2) {
      const entity = viewer.entities.add({
        polyline: {
          positions: activePoints,
          width: 3,
          material: Cesium.Color.GREEN,
          clampToGround: true
        }
      })
      
      const coordinates = activePoints.map(point => {
        const cartographic = Cesium.Cartographic.fromCartesian(point)
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude)
        ]
      })
      
      emit('entity-created', {
        entity,
        type: 'LineString',
        coordinates
      })
    }
    
    handler.destroy()
    viewer.cesiumWidget.canvas.style.cursor = 'auto'
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
}

// Clear all drawings
function clearDrawing() {
  if (viewer) {
    viewer.entities.removeAll()
  }
}

// Home view
function homeView() {
  if (viewer) {
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(100.5018, 13.7563, 15000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    })
  }
}

// Add feature to map
function addFeatureToMap(feature) {
  if (!viewer || !feature.geometry) return
  
  const coordinates = feature.geometry.coordinates
  
  switch (feature.geometry.type) {
    case 'Point':
      viewer.entities.add({
        id: feature.properties.id,
        name: feature.properties.name,
        description: feature.properties.description,
        position: Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]),
        point: {
          pixelSize: 10,
          color: Cesium.Color.CYAN,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: feature.properties.name,
          font: '12pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      break
      
    case 'Polygon':
      const positions = coordinates[0].map(coord => 
        Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
      )
      
      viewer.entities.add({
        id: feature.properties.id,
        name: feature.properties.name,
        description: feature.properties.description,
        polygon: {
          hierarchy: positions,
          material: Cesium.Color.BLUE.withAlpha(0.3),
          outline: true,
          outlineColor: Cesium.Color.BLUE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      break
      
    case 'LineString':
      const linePositions = coordinates.map(coord => 
        Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
      )
      
      viewer.entities.add({
        id: feature.properties.id,
        name: feature.properties.name,
        description: feature.properties.description,
        polyline: {
          positions: linePositions,
          width: 3,
          material: Cesium.Color.RED,
          clampToGround: true
        }
      })
      break
  }
}

// Fly to entity
function flyToEntity(entityId) {
  if (viewer) {
    const entity = viewer.entities.getById(entityId)
    if (entity) {
      viewer.flyTo(entity)
    }
  }
}

// Watch for feature changes
watch(() => props.allFeatures, (newFeatures) => {
  if (viewer) {
    viewer.entities.removeAll()
    newFeatures.forEach(feature => {
      addFeatureToMap(feature)
    })
  }
}, { deep: true })

// Expose methods
defineExpose({
  flyToEntity,
  addFeatureToMap,
  getViewer: () => viewer
})

onMounted(() => {
  initCesium()
})

onUnmounted(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<style scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.cesium-toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cesium-btn {
  padding: 8px 12px;
  background: rgba(48, 51, 54, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
  min-width: 80px;
}

.cesium-btn:hover {
  background: rgba(48, 51, 54, 1);
}

.cesium-btn.active {
  background: rgba(0, 150, 255, 0.8);
}

.cesium-btn.danger {
  background: rgba(220, 53, 69, 0.8);
}

.cesium-btn.danger:hover {
  background: rgba(220, 53, 69, 1);
}

.cesium-info-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  z-index: 1000;
}

.cesium-info-panel h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

/* Hide Cesium's default credit */
:global(.cesium-credit-logoContainer) {
  display: none !important;
}

:global(.cesium-widget-credits) {
  display: none !important;
}
</style>