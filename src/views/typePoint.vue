<template>
  <div>
    <div class="container">
      <div class="left-column">
        <div class="left-column-detail">
          <div class="leaft-column-detail">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search" 
            v-model="searchText"
          />
        </div>
          <!-- <p>
            Point | details from back
          </p> -->
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
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

// edit icon picture
// const customIcon = L.divIcon({
//   className: 'leaflet-div-icon', 
//   html: '<i class="fa fa-map-marker" style="font-size: 24px; color: red;"></i>', 
//   iconSize: [30, 30],
//   iconAnchor: [15, 30],
//   popupAnchor: [0, -30],
//   });

export default {
  name: 'TypePoint',
  setup() {
    onMounted(() => {
      // สร้างแผนที่
      const map = L.map("map").setView([13.783278, 100.59288], 10)

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
            attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
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
            attribution: "© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors",
          }
        )
      }

      baseMaps["OpenStreetMap"].addTo(map)

      // Add layer control to map
      L.control.layers(baseMaps).addTo(map)

      // Geoman toolbar
      map.pm.addControls({
        position: "topleft",
        drawMarker: true,
        drawCircle: true,
        drawPolyline: true,
        drawRectangle: true,
        drawPolygon: true,
        editMode: true,
        dragMode: true,
        cutPolygon: true,
        removalMode: true,
        drawText: true,
        rotateMode: true,
        oneBlock: true,
        drawControls: true,
        editControls: true,
        customControls: true,
      })

      // Control Linear Measurement
      // differen version
      // var linearMeasure = map.addControl(new L.Control.LinearMeasurement({
      // unitSystem: 'metric',
      // color: '#FF0080',
      // type: 'line'
      // }));

      
    map.pm.addControls({
    position: 'topleft',
    drawPolyline: true,
    drawControls: true
     }
    );

    map.on('pm:create', (e) => {
     if (e.layer instanceof L.Polyline && !(e.layer instanceof L.Polygon)) {
      const latlngs = e.layer.getLatLngs();
      let distance = 0;

      for (let i = 0; i < latlngs.length - 1; i++) {
        distance += latlngs[i].distanceTo(latlngs[i + 1]);
      }

      distance = distance.toLocaleString(2); 

      e.layer.bindPopup(`ระยะทาง: ${distance} เมตร`).openPopup();
     }
    });




    })

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

.search-input {
  width: 100%;
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 15px;
}


</style>
