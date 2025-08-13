<template>
  <div class="map-center-container">
    <div id="map"></div>
  </div>
</template>
  

<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function convertToGeoJSON(dataArray) {
  return {
    type: "FeatureCollection",
    features: dataArray.map(item => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
      },
      properties: { ...item }
    }))
  };
}

const map = ref(null)

onMounted(async () => {
  map.value = L.map('map').setView([13.7563, 100.5018], 10)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 16
    }).addTo(map.value)
  try {
    const res = await fetch('https://service.deemap.com/service/trafficincidents/key=popeye')
    const data = await res.json()
    console.log(data)
    const geojson = convertToGeoJSON(Array.isArray(data) ? data : [])
    L.geoJSON(geojson).addTo(map.value)
    if (Array.isArray(data)) {
      data.forEach(item => {
        let lat = parseFloat(item.latitude || item.lat)
        let lng = parseFloat(item.longitude || item.lng)
        console.log('API Marker:', lat, lng, item.title)
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(map.value)
          marker.bindPopup(`<b>${item.title || ''}</b><br>${item.description || ''}`)
        }
      })
    }
  } catch (err) {
    console.error('Error fetching geojson:', err)
  }
})
</script>

<style scoped>
 .map-center-container {
   display: flex;
   justify-content: center;
   align-items: center;
   height: 100vh;
   width: 100vw;
   background: #f8f9fa;
 }
 #map {
   width: 800px;
   height: 500px;
   background: #fff;
 }
</style>
  