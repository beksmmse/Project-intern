<template>
    <div>
      <div class="container">
        <div class="left-column">
          <div class="left-column-detail">
            <p>
              Polygon Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui, perspiciatis.
            </p>
          </div>
        </div>
        <div class="right-column" id="map">
          <p>
            
          </p>
        </div>
      </div>
    </div>
  </template>


<script>
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'App',
  setup() {
    onMounted(() => {
      // Initialize Leaflet map
      const map = L.map("map").setView([13.783278, 100.59288], 10);

      const baseMaps = {
        OpenStreetMap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 20,
            attribution: "© OpenStreetMap contributors",
          }
        ),
        Satellite: L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 20,
            attribution:
              "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          }
        ),
        Topo: L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", 
          {
            maxZoom: 20,
            attribution: "© OpenTopoMap contributors",
          }
        ),
        "Dark Mode": L.tileLayer(
          "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 20,
            attribution:
              "© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors",
          }
        )
      };

      // Add the OpenStreetMap layer to the map by default
      baseMaps["OpenStreetMap"].addTo(map);
      
      // Create layer control and add to map
      L.control.layers(baseMaps).addTo(map);
    });
    
  }
}
</script>


<style scoped>

body {
  margin: 0;
  padding: 0;
  height: 100vh;
  font-family: sans-serif;
}
.container {
  display: flex;
  gap: 10px;
  padding: 10px;
  height: calc(100vh - 60px); 
  box-sizing: border-box;
}

.left-column {
  flex: 7; 
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  overflow: auto;
}

.right-column {
  flex: 3;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  overflow: auto;
}

  </style>
  