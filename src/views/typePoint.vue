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
        <div id="coordinate-display" class="coordinate-display"></div>
      </div>
    </div>
  </div>
</template>


<script>
import { onMounted } from 'vue'
import html2canvas from 'html2canvas'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'


export default {
  name: 'TypePoint',
  setup() {
    onMounted(() => {

      const map = L.map("map").setView([13.783278, 100.59288], 10)

      const baseMaps = {
        OpenStreetMap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 20,
            attribution: "© OpenStreetMap",
          }
        ),
        Satellite: L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 20,
            attribution: "Esri",
          }
        ),
        Topo: L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 20,
            attribution: "© OpenTopoMap",
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

      // Custom Icon using L.icon
      const customIcon = L.icon({
        iconUrl: require('@/assets/my-icon.png'),
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

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
        measurementMode: true,
      });

      map.on('pm:create', (e) => {
        if (e.layer instanceof L.Marker) {
          const latlng = e.layer.getLatLng();
          map.removeLayer(e.layer);

          const marker = L.marker(latlng, { icon: customIcon }).addTo(map);
          marker.bindPopup("*ID*").openPopup();
        }

        if (e.layer instanceof L.Polyline && !(e.layer instanceof L.Polygon)) {
          const latlngs = e.layer.getLatLngs();
          let distance = 0;

          for (let i = 0; i < latlngs.length - 1; i++) {
            distance += latlngs[i].distanceTo(latlngs[i + 1]);
          }

          distance = distance.toLocaleString(2);

          e.layer.bindPopup(`ระยะทาง: ${distance} เมตร`).openPopup();
        }

      if (e.layer instanceof L.Polygon) {
          e.layer.pm.enable(); 
  }
      });

      const coord = document.getElementById("coordinate-display");

      map.on("mousemove", function (e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        coord.innerHTML = `Lat: ${lat}, Lng: ${lng}`;
      });

      // Add a custom geolocation button to the toolbar //fix
      map.pm.Toolbar.createCustomControl({
      name: "get-location",
      block: "custom",
      title: "Find My Location", 
      className: "custom-geolocation-btn", 
      onClick: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
              marker.bindPopup("You are here").openPopup();

              map.setView([lat, lng], 13);
            },
            (error) => {
              alert("Unable to retrieve location: " + error.message);
            }
          );
        } else {
          alert("Geolocation is not supported by your browser.");
        }
      },
      toggle: false 
    }); 
    
    map.pm.Toolbar.createCustomControl({
    name: "screenshot",
    block: "custom",
    title: "#",
    className: "screenshot-btn",
    onClick: () => {
      const mapElement = document.getElementById("map");
      html2canvas(mapElement).then((canvas) => {
        const link = document.createElement("a");
        link.download = "map-screenshot.png";
        link.href = canvas.toDataURL();
        link.click();
        });
      },
      toggle: false
    });


    // map.on('pm:edit', (e) => {
    //   if (e.layer instanceof L.Polygon) {
    //     const updatedCoords = e.layer.getLatLngs();
    //     console.log('Edited polygon coordinates:', updatedCoords);
    //   }
    // });

    // map.on('pm:create', (e) => {
    //   if (e.layer instanceof L.Polygon) {
    //     const polygonLayer = e.layer;
    //     polygonLayer.bindPopup("Polygon Created").openPopup();
    //     polygonLayer.pm.enable({ allowSelfIntersection: false });
    //     polygonLayer.on('pm:edit', (editEvent) => {
    //       const updatedCoords = editEvent.layer.getLatLngs();
    //       console.log(" Updated polygon coordinates:", updatedCoords);
          
    //       // stringify Object => geoJson
    //       // const geoJson = editEvent.layer.toGeoJSON();
    //       });
    //     }
    //  });



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

.search-input {
  width: 100%;
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 15px;
}

.coordinate-display {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255,255,255,0.95);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  z-index: 999;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(0,0,0,0.2); 
}


</style>
