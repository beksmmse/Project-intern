<template>
  <div>
    <div class="container">
      <div class="left-column">
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
            >
             <Column field="properties.id" header="ID"  sortable  style="min-width: 6rem"  />
              <Column field="properties.name" header="Name"  sortable  style="min-width: 10rem"  />
              <Column field="properties.description" header="Description"  sortable  style="min-width: 12rem" />
              <Column field="properties.address" header="Address"  sortable  style="min-width: 12rem" />
              <Column field="properties.category" header="Category"   />
            </DataTable>
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
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


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

  baseMaps.OpenStreetMap.addTo(map);
  L.control.layers(baseMaps).addTo(map);

  const customIcon = L.icon({
    iconUrl: require('@/assets/my-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  drawnItems.addTo(map);
  function loadGeoJSONFromServer() {
  fetch('/point_bkk.geojson')
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
                drawnItems.value.addLayer(marker);
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
            drawnItems.value.clearLayers();
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
                drawnItems.value.addLayer(layer);
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



    // Add a custom "Save Data" button to the Leaflet-Geoman toolbar 
    // map.pm.Toolbar.createCustomControl({
    //   name: "save-map-as-png",
    //   block: "custom",
    //   title: "Save map as PNG",
    //   className: "save-map-btn",
    //   onClick: () => {
    //     const mapContainer = document.querySelector('.leaflet-container');
    //     if (!mapContainer) {
    //       alert('Map container not found');
    //       return;
    //     }

    //     html2canvas(mapContainer).then(canvas => {
    //       const imgData = canvas.toDataURL('image/png');
    //       const link = document.createElement('a');
    //       link.href = imgData;
    //       link.download = 'leaflet-map.png';
    //       link.click();
    //     }).catch(err => {
    //       console.error('Error generating PNG:', err);
    //       alert('Failed to save PNG');
    //     });
    //   },
    //   toggle: false
    // });



    // const searchQuery = ref('')
    // const features = ref([])              
    // const matchedFeatures = computed(() => {
    //   if (!searchQuery.value.trim()) return features.value
    //   const q = searchQuery.value.toLowerCase()
    //   return features.value.filter(f =>
    //     f.properties.name?.toLowerCase().includes(q)
    //   )
    // })
    // function addFeatureToList(geojsonFeature) {
    //   features.value.push(geojsonFeature)
    // }
    // function zoomToFeature(feature) {
    //   const layer = getLayerByFeature(feature)
    //   if (layer) map.fitBounds(layer.getBounds())
    // }
    // function getLayerByFeature(feature) {
    //   let found = null
    //   drawnItems.eachLayer(l => {
    //     if (l.feature?.properties?.id === feature.properties.id) {
    //       found = l
    //     }
    //   })
    //   return found
    // }


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


</style>

