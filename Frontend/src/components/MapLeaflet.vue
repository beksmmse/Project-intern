<template>
  <div>
    <div id="map" ref="mapContainer" class="map-container">
      <div id="coordinate-display" class="coordinate-display"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import "leaflet/dist/leaflet.css"
import html2canvas from 'html2canvas'

// Props
const props = defineProps({
  userRole: {
    type: String,
    default: 'guest'
  },
  drawnItems: {
    type: Object,
    required: true
  },
  allFeatures: {
    type: Array,
    default: () => []
  },
  layerMap: {
    type: Map,
    required: true
  }
})

// Emits
const emit = defineEmits(['layer-created', 'layer-clicked', 'feature-selected'])

// Refs
const mapContainer = ref(null)
let map = null

// Initialize map
function initMap() {
  if (map) return

  map = L.map(mapContainer.value).setView([13.783278, 100.59288], 10)

  // Base maps
  const baseMaps = {
    OpenStreetMap: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "© OpenStreetMap",
    }),
    Satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 20,
      attribution: "Esri",
    }),
    Topo: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "© OpenTopoMap",
    }),
    "Dark Mode": L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      attribution: "© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors",
    })
  }

  // WMS Layers
  const wmsProvice = L.tileLayer.wms('http://localhost:8080/geoserver/ows?', {
    layers: 'ne:BKK_pro',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'GeoServer',
    opacity: 0.6
  })

  const wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/ows?', {
    layers: 'ne:bangkok_district',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'GeoServer',
    opacity: 0.6
  })

  const wmsSubdis = L.tileLayer.wms('http://localhost:8080/geoserver/ows?', {
    layers: 'ne:BKK_subdist',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: 'GeoServer',
    opacity: 0.5
  })

  const overlayMaps = {
    "ขอบเขตกรุงเทพฯ": wmsProvice,
    "ขอบเขตอำเภอ": wmsLayer,
    "ขอบเขตอำตำบล": wmsSubdis
  }

  baseMaps.OpenStreetMap.addTo(map)
  L.control.layers(baseMaps, overlayMaps).addTo(map)

  // Custom icon
  const customIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
  })

  L.Marker.prototype.options.icon = customIcon

  // Add drawn items to map
  props.drawnItems.addTo(map)

  // Setup drawing controls
  setupDrawingControls()

  // Setup coordinate display
  setupCoordinateDisplay()

  // Setup custom controls
  setupCustomControls(customIcon)
}

// Setup drawing controls
function setupDrawingControls() {
  const isEditAllowed = props.userRole === 'admin' || props.userRole === 'edit'
  
  map.pm.addControls({
    position: "topleft",
    drawMarker: isEditAllowed,
    drawCircle: isEditAllowed,
    drawPolyline: isEditAllowed,
    drawRectangle: isEditAllowed,
    drawPolygon: isEditAllowed,
    editMode: isEditAllowed,
    dragMode: isEditAllowed,
    cutPolygon: isEditAllowed,
    removalMode: isEditAllowed,
    drawText: false,
    rotateMode: isEditAllowed,
    oneBlock: isEditAllowed,
    drawControls: isEditAllowed,
    editControls: isEditAllowed,
    customControls: true,
    measurementMode: true,
  })

  // Handle drawing events
  map.on('pm:create', (e) => {
    const layer = e.layer
    const shape = e.shape
    
    let geometryType = ''
    switch(shape) {
      case 'Marker':
        geometryType = 'Point'
        break
      case 'Line':
        geometryType = 'LineString'
        break
      case 'Polygon':
        geometryType = 'Polygon'
        break
      case 'Rectangle':
        geometryType = 'Polygon'
        break
      case 'Circle':
        geometryType = 'Circle'
        break
      default:
        geometryType = 'Unknown'
    }

    // Handle different layer types
    if (e.layer instanceof L.Marker) {
      const latlng = e.layer.getLatLng()
      map.removeLayer(e.layer)
      const marker = L.marker(latlng, { icon: customIcon }).addTo(map)
      props.drawnItems.addLayer(marker)
      
      emit('layer-created', { layer: marker, geometryType })
    }
    else if (e.layer instanceof L.Polyline && !(e.layer instanceof L.Polygon)) {
      const latlngs = e.layer.getLatLngs()
      let distance = 0
      for (let i = 0; i < latlngs.length - 1; i++) {
        distance += latlngs[i].distanceTo(latlngs[i + 1])
      }
      
      e.layer.bindPopup(`ระยะทาง: ${distance.toLocaleString()} เมตร`)
      props.drawnItems.addLayer(e.layer)
      
      emit('layer-created', { layer: e.layer, geometryType })
    }
    else if (e.layer instanceof L.Polygon) {
      e.layer.pm.enable()
      props.drawnItems.addLayer(e.layer)
      
      emit('layer-created', { layer: e.layer, geometryType })
    }
    else {
      props.drawnItems.addLayer(e.layer)
      emit('layer-created', { layer: e.layer, geometryType })
    }
  })
}

// Setup coordinate display
function setupCoordinateDisplay() {
  const coord = document.getElementById("coordinate-display")
  if (coord) {
    map.on("mousemove", (e) => {
      const lat = e.latlng.lat.toFixed(6)
      const lng = e.latlng.lng.toFixed(6)
      coord.innerHTML = `Lat: ${lat}, Lng: ${lng}`
    })
  }
}

// Setup custom controls
function setupCustomControls(customIcon) {
  // Geolocation control
  map.pm.Toolbar.createCustomControl({
    name: "get-location",
    block: "custom",
    title: "Find My Location",
    className: "custom-geolocation-btn",
    onClick: () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude

            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
            marker.bindPopup("You are here").openPopup()

            map.setView([lat, lng], 13)
          },
          (error) => {
            alert("Unable to retrieve location: " + error.message)
          }
        )
      } else {
        alert("Geolocation is not supported by your browser.")
      }
    },
    toggle: false
  })

  // Screenshot control
  map.pm.Toolbar.createCustomControl({
    name: "screenshot",
    block: "custom",
    title: "Screenshot",
    className: "screenshot-btn",
    onClick: () => {
      const mapElement = mapContainer.value
      html2canvas(mapElement).then((canvas) => {
        const link = document.createElement("a")
        link.download = "map-screenshot.png"
        link.href = canvas.toDataURL()
        link.click()
      })
    },
    toggle: false
  })

  // Add text control
  map.pm.Toolbar.createCustomControl({
    name: "add-text",
    block: "custom",
    title: "Add Text",
    className: "add-text-btn",
    onClick: () => {
      map.once("click", (e) => {
        const { latlng } = e
        const container = map.getContainer()
        const point = map.latLngToContainerPoint(latlng)
        const input = document.createElement("input")
        input.type = "text"
        input.placeholder = "เพิ่มชื่อสถานที่"
        input.style.position = "absolute"
        input.style.left = `${point.x}px`
        input.style.top = `${point.y}px`
        input.style.zIndex = 1000
        input.style.fontSize = "14px"
        input.style.padding = "2px 6px"
        input.style.border = "1px solid #ccc"
        input.style.borderRadius = "4px"
        input.style.backgroundColor = "#fff"
        container.appendChild(input)
        input.focus()

        let committed = false

        function commitText() {
          if (committed) return
          committed = true

          const text = input.value
          if (text) {
            const textIcon = L.divIcon({
              html: `<div style="font-size: 14px; color: white; white-space: nowrap;">${text}</div>`,
              className: "custom-text-label",
            })

            const marker = L.marker(latlng, { icon: textIcon }).addTo(map)
            props.drawnItems.addLayer(marker)
          }

          if (input.parentNode) {
            input.parentNode.removeChild(input)
          }
        }

        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            commitText()
          }
        })

        input.addEventListener("blur", () => {
          commitText()
        })
      })
    },
    toggle: false
  })

  // Load data control
  map.pm.Toolbar.createCustomControl({
    name: "load-data",
    block: "custom",
    title: "Load map data",
    className: "load-data-btn",
    onClick: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'

      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()

          reader.onload = (event) => {
            try {
              props.drawnItems.clearLayers()
              const geoJson = JSON.parse(event.target.result)

              map.whenReady(() => {
                const layers = L.geoJSON(geoJson, {
                  pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, { icon: customIcon })
                  },
                  onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.popupContent) {
                      layer.bindPopup(feature.properties.popupContent)
                    }
                  }
                })

                layers.eachLayer(function (layer) {
                  props.drawnItems.addLayer(layer)
                })

                if (layers.getLayers().length > 0) {
                  map.fitBounds(layers.getBounds())
                }
              })

              alert('Data loaded successfully')
            } catch (error) {
              alert('Error loading file: ' + error.message)
            }
          }

          reader.readAsText(file)
        }
      }

      input.click()
    },
    toggle: false
  })
}

// Public methods
function fitBounds(bounds) {
  if (map && bounds) {
    map.fitBounds(bounds)
  }
}

function setView(latlng, zoom = 16) {
  if (map) {
    map.setView(latlng, zoom)
  }
}

function addFeatureToMap(feature) {
  const layer = L.geoJSON(feature, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`
        <div>
          <h4>${feature.properties.name}</h4>
          <p><strong>ID:</strong> ${feature.properties.id}</p>
          <p><strong>คำอธิบาย:</strong> ${feature.properties.description}</p>
          <p><strong>ประเภท:</strong> ${feature.properties.type}</p>
          <p><strong>ที่อยู่:</strong> ${feature.properties.address}</p>
          <p><strong>ระบบพิกัด:</strong> ${feature.properties.srid}</p>
          <p><strong>วันที่สร้าง:</strong> ${new Date(feature.properties.created_at).toLocaleDateString('th-TH')}</p>
        </div>
      `)
      
      layer.on('click', () => {
        emit('feature-selected', feature)
      })
    }
  })
  
  props.drawnItems.addLayer(layer)
  props.layerMap.set(feature.properties.id, layer)
}

// Watch for feature changes
watch(() => props.allFeatures, (newFeatures) => {
  if (map) {
    // Clear existing layers
    props.drawnItems.clearLayers()
    props.layerMap.clear()

    // Add new features
    newFeatures.forEach(feature => {
      addFeatureToMap(feature)
    })
  }
}, { deep: true })

// Expose methods to parent
defineExpose({
  fitBounds,
  setView,
  addFeatureToMap,
  getMap: () => map
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.coordinate-display {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255,255,255,0.95);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  z-index: 999;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(0,0,0,0.2); 
}

:deep(.custom-geolocation-btn) {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>');
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
}

:deep(.screenshot-btn) {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>');
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
}

:deep(.load-data-btn) {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>');
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
}

:deep(.add-text-btn) {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>');
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
}

:deep(.custom-text-label) {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
</style>