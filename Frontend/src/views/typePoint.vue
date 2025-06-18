<template>
  <div>
    <div class="container">
      <div class="left-column">
        <div v-if="!selectedFeature">
          <div style="margin-bottom: 1em;">
            <input
              type="text"
              class="search-input"
              placeholder="Search"
              v-model="searchText"
            />
          </div>

          <DataTable
            :value="filteredFeatures"
            dataKey="properties.id"
            :rows="10"
            scrollable
            @row-click="onRowClick"
            style="cursor: pointer;"
            tableStyle="min-width: 50rem"
        >
            <!-- <DataTable :value="filteredFeatures" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
              <Column field="properties.id" header="ID" style="width: 25%"></Column>
              <Column field="properties.name" header="Name" style="width: 25%"></Column>
              <Column ffield="properties.description" header="Description" style="width: 25%"></Column>
              <Column field="properties.address" header="Address" style="width: 25%"></Column>
              <Column header="Actions" style="min-width: 5rem"> 
                <template #body="slotProps">
                  <Button @click="showInfo(slotProps.data)" severity="info">Info</Button>
                </template>
              </Column> -->

            <Column field="properties.id" header="ID" sortable style="min-width: 5rem" />
            <Column field="properties.name" header="Name" sortable style="min-width: 10rem" />
            <Column field="properties.description" header="Description" sortable style="min-width: 10rem" />
            <Column field="properties.address" header="Address" sortable style="min-width: 12rem" />
            <Column header="Actions" style="min-width: 5rem"> 
                <template #body="slotProps">
                    <Button @click="showInfo(slotProps.data)" severity="info">Info</Button>
                    <!-- <Button label="Open in New Tab" @click="NewTabTest">Newtab</Button> -->
                </template>
            </Column>
        </DataTable>
        </div>


        <div v-else class="info-box" style="margin-top: 1rem; border: 1px solid #ccc; padding: 1rem; border-radius: 6px;">
          <div class="button-container">
            <Button @click="selectedFeature = null" class="btn-back">Back</Button>
            <Button class="btn-exten" @click="toggleFullscreen">Extend</Button>
          </div>

          <h3>รายละเอียด</h3>
          <p><strong>ID:</strong> {{ selectedFeature.properties.id }}</p>
          <p><strong>Name:</strong> {{ selectedFeature.properties.name }}</p>
          <p><strong>Description:</strong> {{ selectedFeature.properties.description }}</p>
          <p><strong>Address:</strong> {{ selectedFeature.properties.address }}</p>
          <p><strong>create_at:</strong> {{ selectedFeature.properties.created_at }}</p>
          <p><strong>type:</strong> {{ selectedFeature.properties.type }}</p>
          <p><strong>coordinates:</strong> {{ selectedFeature.properties.coordinates }}</p>
        </div>
      </div>

      <div class="right-column" id="map">
        <div id="coordinate-display" class="coordinate-display"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import html2canvas from 'html2canvas'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import axios from 'axios';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';


const drawnItems = L.featureGroup();
const geojsonData = ref(null);
const selectedFeature = ref(null);
const allFeatures = ref([]);
const searchText = ref('');
const layerMap = new Map();

let map;

const filteredFeatures = computed(() => {
  if (!searchText.value.trim()) return allFeatures.value;
  const q = searchText.value.toLowerCase();
  return allFeatures.value.filter(f =>
    f.properties.name?.toLowerCase().includes(q) ||
    f.properties.description?.toLowerCase().includes(q) ||
    f.properties.address?.toLowerCase().includes(q)
  );
});




function createPopup(content = "Name") {
  return `
    <div class="popup-edit">
      <span class="popup-text">${content}</span>
      <button class="edit-btn" style="margin-left: 10px;">เเก้ไข</button>
    </div>
  `;
}

function bindEditablePopup(marker, initialText = "Name") {
  marker.bindPopup(createPopup(initialText));

  marker.on("popupopen", () => {
    const container = marker.getPopup().getElement();
    const span = container.querySelector(".popup-text");
    const btn = container.querySelector(".edit-btn");

    btn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = span.textContent;
      input.style.width = "120px";

      span.replaceWith(input);
      input.focus();

      function save() {
        const newText = input.value || "Name";
        bindEditablePopup(marker, newText);
        marker.openPopup();
      }

      input.addEventListener("blur", save);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
      });
    });
  });
}

function addEditButton(layer) {
  console.log("Edit button logic here for layer", layer);
}

function showInfo(rowData) {
  selectedFeature.value = rowData

if (map && rowData.geometry?.coordinates) {
    const [lng, lat] = rowData.geometry.coordinates
    map.setView([lat, lng]) 
  }
  }


// function toggleFullscreen() {
// const infoBox = document.querySelector('.info-box');

//     if (infoBox.classList.contains('fullscreen-overlay')) {
//       // ปิด overlay
//       infoBox.classList.remove('fullscreen-overlay');
//     } else {
//       // เปิด overlay
//       infoBox.classList.add('fullscreen-overlay');
//     }
//   }

//กลับมาเเก้ต่อ 
// function AddGeometry () {
//   router.push({
//     name: 'AddGeometry',             
//     query: { name: rowData.properties.name}
//   })
// }

// function handleZoomToFeature(id) {
//   const layer = layerMap.get(id);
//   if (!layer) return;
//   if (layer.getBounds) {
//     map.fitBounds(layer.getBounds());
//   } else if (layer.getLatLng) {
//     map.setView(layer.getLatLng());
//   }
//   if (layer.openPopup) {
//     layer.openPopup();
//   }
// }

function onRowClick(event) {
  const feature = event.data;
  const id = feature.properties.id;
  const layer = layerMap.get(id);
  if (!layer) return;

  if (layer.getBounds) {
    map.fitBounds(layer.getBounds());
  } else if (layer.getLatLng) {
    map.setView(layer.getLatLng(), 16); // Zoom 16 พอเห็นชัด
  }

  if (layer.openPopup) {
    layer.openPopup();
  }
}

//Load Basemap 
onMounted(() => {
  map = L.map("map").setView([13.783278, 100.59288], 10);

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
  };

  //Load Bounder from geoserver
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
  };

  baseMaps.OpenStreetMap.addTo(map);
  L.control.layers(baseMaps, overlayMaps).addTo(map);


  const customIcon = L.icon({
    iconUrl: require('@/assets/my-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  axios.get('http://localhost:3000/api/Point')
  // .then(function (response) {
  //   console.log(response.data);
  // })
  // .catch(function (error) {
  //   console.error(error);
  // });


  drawnItems.addTo(map);
  function loadGeoJSONFromServer() {
  fetch('http://localhost:3000/api/Point')
    .then(res => res.json())
    .then(data => {
      geojsonData.value = data
      allFeatures.value = data.features

      const geoLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) =>
          L.marker(latlng, { icon: customIcon }),
        onEachFeature: (feature, layer) => {
          const id = feature.properties?.id
          if (id) layerMap.set(id, layer)

          layer.bindPopup(feature.properties.name || 'ไม่มีชื่อ')
          layer.on('click', () => {
            selectedFeature.value = {
              name: feature.properties.name || 'ไม่มีชื่อ',
              description: feature.properties.description || '-',
              address: feature.properties.address || '-'
            }
          })
        }
      })

      geoLayer.addTo(map)
      drawnItems.addLayer(geoLayer)
      map.fitBounds(geoLayer.getBounds())
    })
}

  loadGeoJSONFromServer();

  //showinfo  detail 
  // function showInfo(row) {
  //   router.push({ name: 'info', params: { id: row.properties.id } })
  // } 
  
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
        drawText: false,
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
          bindEditablePopup(marker);
          marker.openPopup();
          drawnItems.addLayer(marker);
        }

        if (e.layer instanceof L.Polyline && !(e.layer instanceof L.Polygon)) {
          const latlngs = e.layer.getLatLngs();
          let distance = 0;
          for (let i = 0; i < latlngs.length - 1; i++) {
            distance += latlngs[i].distanceTo(latlngs[i + 1]);
          }
          e.layer.bindPopup(`ระยะทาง: ${distance.toLocaleString()} เมตร`).openPopup();
          drawnItems.addLayer(e.layer);
        }

        if (e.layer instanceof L.Polygon) {
          e.layer.pm.enable();
          drawnItems.addLayer(e.layer);
        }
      });

      const coord = document.getElementById("coordinate-display");
      map.on("mousemove", (e) => {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        coord.innerHTML = `Lat: ${lat}, Lng: ${lng}`;
      });

      // find locatiom
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

      // add Screenshot
      map.pm.Toolbar.createCustomControl({
        name: "screenshot",
        block: "custom",
        title: "Screenshot",
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

      // edit text 
      map.pm.Toolbar.createCustomControl({
        name: "add-text",
        block: "custom",
        title: "Add Text",
        className: "add-text-btn",
        onClick: () => {
          map.once("click", (e) => {
            const { latlng } = e;
            const container = map.getContainer();
            const point = map.latLngToContainerPoint(latlng);
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "เพิ่มชื่อสถานที่";
            input.style.position = "absolute";
            input.style.left = `${point.x}px`;
            input.style.top = `${point.y}px`;
            input.style.zIndex = 1000;
            // input.style.width = "160px"; // 
            // input.style.boxSizing = "border-box"; //
            input.style.fontSize = "14px";
            input.style.padding = "2px 6px";
            input.style.border = "1px solid #ccc";
            input.style.borderRadius = "4px";
            input.style.backgroundColor = "#fff";
            container.appendChild(input);
            input.focus();

            let committed = false;

            function commitText() {
              if (committed) return;
              committed = true;

              const text = input.value;
              if (text) {
                const textIcon = L.divIcon({
                  html: `<div style="font-size: 14px; color: white; white-space: nowrap;">${text}</div>`,
                  className: "custom-text-label",
                });

                const marker = L.marker(latlng, { icon: textIcon }).addTo(map);
                drawnItems.addLayer(marker);
              }

              if (input.parentNode) {
                input.parentNode.removeChild(input);
              }
            }

            input.addEventListener("keydown", (event) => {
              if (event.key === "Enter") {
                commitText();
              }
            });

            input.addEventListener("blur", () => {
              commitText();
            });
          });
        },
        toggle: false
      });


       // upload GeoJSON
      map.pm.Toolbar.createCustomControl({
      name: "load-data",
      block: "custom",
      title: "Load map data",
      className: "load-data-btn",
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
              try {
                drawnItems.clearLayers();
                const geoJson = JSON.parse(event.target.result);

                map.whenReady(() => {
                  const layers = L.geoJSON(geoJson, {
                    pointToLayer: function (feature, latlng) {
                      return L.marker(latlng, { icon: customIcon });
                    },
                    onEachFeature: function (feature, layer) {
                      if (feature.properties && feature.properties.popupContent) {
                        layer.bindPopup(feature.properties.popupContent);
                        addEditButton(layer);
                      }
                    }
                  });

                  layers.eachLayer(function (layer) {
                    drawnItems.addLayer(layer);
                  });

                  if (layers.getLayers().length > 0) {
                    map.fitBounds(layers.getBounds());
                  }
                });

                alert('Data loaded successfully');
              } catch (error) {
                alert('Error loading file: ' + error.message);
              }
            };

            reader.readAsText(file);
          }
        };

        input.click();
      },
      toggle: false
          });


});
   

 


</script>




<style scoped>
/* body {
margin: 0;
padding: 0;
height: 100vh;
font-family: sans-serif;
} */

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
}

.container {
display: flex;
gap: 10px;
padding: 10px;
height: calc(100vh - 60px); 
box-sizing: border-box;
position: relative; 

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
  padding: 10px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 5px;
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

::v-deep(.custom-geolocation-btn) {
  background-image: url('/src/assets/icons8-my-location-100.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

::v-deep(.screenshot-btn) {
  background-image: url('/src/assets/icons8-screenshot-100.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

::v-deep(.load-data-btn) {
  background-image: url('/src/assets/icons8-upload-100.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

::v-deep(.add-text-btn) {
  background-image: url('/src/assets/text.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

/* ::v-deep(.save-data-btn) {
  background-image: url('/src/assets/icons8-save-100.png');
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
} */

.custom-datatable :deep(.p-datatable-thead > tr > th) {
    padding: 1rem 0.75rem;
}

.custom-datatable :deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem;
}

/* .info-box.fullscreen-overlay {
  position: absolute; 
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 999;
  padding: 2rem;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
} */

.info-box {
  position: relative;
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}





</style>

