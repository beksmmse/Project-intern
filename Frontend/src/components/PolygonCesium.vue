<template>
  <div>
    <div class="container">
      <div class="left-column" :class="{ 'hide-when-map-expanded': isMapExpanded }">
        <!-- Synced with Leaflet left-column -->
        <div v-if="!selectedFeature">
          <div style="display: flex; gap: 10px; align-items: center;">
            <input
              type="text"
              class="search-input"
              placeholder="Search"
              v-model="searchText"
              style="flex: 1;"
            />
            <Button @click="refreshData" severity="info" :loading="isLoading" class="refresh-btn" >
              <i class="fas fa-sync-alt"></i> 
            </Button>
          </div>

          <DataTable 
            :value="filteredFeatures" 
            class="striped-table uniform-table"
            dataKey="properties.id"
            :rows="10"
            scrollable
            @row-click="onRowClick"
            tableStyle="min-width:50rem;table-layout:fixed;"
          >
            <Column field="properties.id" header="ลำดับ" sortable style="width:4rem" />
            <Column field="properties.name" header="ชื่อ" sortable style="width:12rem" />
            <Column field="properties.description" header="คำอธิบาย" sortable style="width:16rem" />
            <Column field="properties.address" header="ที่ตั้ง" sortable style="width:14rem" />
            <Column header="" style="width:12rem"> 
              <template #body="slotProps">
                <div class="action-buttons-row compact">
                  <Button @click="showInfo(slotProps.data)" severity="info" size="small">รายละเอียด</Button>
                  <Button v-if="userRole === 'editor' || userRole === 'admin'" @click="showEdit(slotProps.data)" severity="warning" size="small">
                    <i class="pi pi-pencil action-edit" style="margin-top:2px;"></i>
                  </Button>
                  <Button v-if="userRole === 'editor' || userRole === 'admin'" @click="deleteFeature(slotProps.data.properties.id, slotProps.data.properties.name)" severity="danger" size="small">
                    <i class="pi pi-trash action-delete" style="margin-top:2px;"></i>
                  </Button>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-else class="info-box" style="margin-top: 1rem; border: 1px solid #ccc; padding: 1rem; border-radius: 6px;">
          <div class="button-container">
            <Button @click="exitFullscreenAndBack" class="btn-back">Back</Button>
            <Button class="btn-exten" @click="toggleFullscreen">
              {{ isLeftFullscreen ? 'Exit Fullscreen' : 'Extend' }}
            </Button>
          </div>
          <h3>รายละเอียด</h3>
          <p><strong>ID:</strong> {{ selectedFeature.properties.id }}</p>
          <p><strong>ชื่อ:</strong> {{ selectedFeature.properties.name }}</p>
          <p><strong>คำอธิบาย:</strong> {{ selectedFeature.properties.description }}</p>
          <p><strong>ที่ตั้ง:</strong> {{ selectedFeature.properties.address }}</p>
          <p><strong>สร้างเมื่อ:</strong> {{ selectedFeature.properties.created_at }}</p>
          <p><strong>แก้ไขเมื่อ:</strong> {{ selectedFeature.properties.update_at }}</p>
          <p><strong>ประเภท:</strong> {{ selectedFeature.properties.type }}</p>
          <p><strong>lat lng:</strong> {{ selectedFeature.properties.coordinates }}</p>
        </div>
      </div>

      <div class="right-column" id="cesiumContainer" ref="cesiumContainer" :class="{ 'map-expanded': isMapExpanded }">
        <button class="map-expand-btn" @click="toggleMapExpand">
          {{ isMapExpanded ? 'ย่อแผนที่' : 'ขยายแผนที่' }}
        </button>
        <div id="coordinate-display" class="coordinate-display"></div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="form-overlay">
      <div class="confirm-container">
        <h3>ระบุตำแหน่งเรียบร้อย</h3>
        <p>ต้องการเพิ่มข้อมูลให้กับรูปทรงที่วาดหรือไม่?</p>
        <div class="confirm-info">
          <p><strong>ประเภท:</strong> {{ currentGeometryType }}</p>
        </div>
        <div class="confirm-buttons">
          <Button @click="openFormFromConfirm()" severity="success">
            <i class="pi pi-check"></i> เพิ่มข้อมูล
          </Button>
          <Button @click="skipAddData()" severity="secondary">
            <i class="pi pi-times"></i> ภายหลัง
          </Button>
        </div>
      </div>
    </div>

    <!--  ฟอร์มกรอกข้อมูล (For create new data) -->
    <div v-if="showDataForm" class="form-overlay">
      <div class="form-container">
        <h3>เพิ่มข้อมูลสำหรับการวาด</h3>
        <form @submit.prevent="saveDrawingData">
          <div class="form-group">
            <label>ชื่อ: <span class="required">*</span></label>
            <input
              type="text"
              v-model="formData.name"
              required
              placeholder="กรุณากรอกชื่อ"
            />
          </div>
          <div class="form-group">
            <label>คำอธิบาย: <span class="required">*</span></label>
            <textarea
              v-model="formData.description"
              required
              placeholder="กรุณากรอกคำอธิบาย"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>ประเภท: <span class="required">*</span></label>
            <select v-model="formData.type" required>
              <option value="" disabled>เลือกประเภท</option>
              <option value="landmark">สถานที่สำคัญ</option>
              <option value="route">เส้นทาง</option>
              <option value="area">พื้นที่</option>
              <option value="building">อาคาร</option>
              <option value="park">สวนสาธารณะ</option>
              <option value="school">โรงเรียน</option>
              <option value="hospital">โรงพยาบาล</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div class="form-group">
            <label>ที่อยู่: <span class="required">*</span></label>
            <input
              type="text"
              v-model="formData.address"
              required
              placeholder="กรุณากรอกที่อยู่"
            />
          </div>
          <div class="form-info">
            <p><strong> ประเภทของข้อมูล : <span class="required">*</span> </strong> {{ formData.geometryType }}</p>
          </div>
          <div class="form-buttons">
            <Button type="submit" severity="success">
              <i class="pi pi-save"></i> บันทึก
            </Button>
            <Button type="button" @click="closeDataForm()" severity="secondary">
              <i class="pi pi-times"></i> ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- ฟอร์มแก้ไขข้อมูล  -->
    <div v-if="showEditDialog" class="form-overlay">
      <div class="form-container">
        <h3>แก้ไขข้อมูล</h3>
        <form @submit.prevent="submitEdit">
          <div class="form-group">
            <label>ชื่อ: <span class="required">*</span></label>
            <input
              type="text"
              v-model="editFormData.name"
              required
              placeholder="กรุณากรอกชื่อ"
            />
          </div>
          <div class="form-group">
            <label>คำอธิบาย:</label>
            <textarea
              v-model="editFormData.description"
              required
              placeholder="กรุณากรอกคำอธิบาย"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>ที่อยู่:</label>
            <input
              type="text"
              v-model="editFormData.address"
              required
              placeholder="กรุณากรอกที่อยู่"
            />
          </div>
          <div class="form-group">
            <label>ประเภท:</label>
            <select v-model="editFormData.type" required>
              <option value="landmark">สถานที่สำคัญ</option>
              <option value="route">เส้นทาง</option>
              <option value="area">พื้นที่</option>
              <option value="building">อาคาร</option>
              <option value="park">สวนสาธารณะ</option>
              <option value="school">โรงเรียน</option>
              <option value="hospital">โรงพยาบาล</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div class="form-buttons">
            <Button type="submit" severity="success">
              <i class="pi pi-save"></i> บันทึก
            </Button>
            <Button type="button" @click="showEditDialog = false" severity="secondary">
              <i class="pi pi-times"></i> ยกเลิก
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>

window.CESIUM_BASE_URL = '/cesium/'
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import axios from 'axios';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import 'primeicons/primeicons.css';

import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const cesiumContainer = ref(null);
let viewer = null;

const allFeatures = ref([]);
const searchText = ref('');
const selectedFeature = ref(null);
const isLoading = ref(false);
const isLeftFullscreen = ref(false);
const isMapExpanded = ref(false);

const showConfirmDialog = ref(false);
const showDataForm = ref(false);
const currentGeometryType = ref('');
const currentDrawingLayer = ref(null);
const formData = ref({
  name: '',
  description: '',
  type: '',
  address: '',
  geometryType: ''
});

const showEditDialog = ref(false);
const editFeature = ref(null);
const editFormData = ref({
  name: '',
  description: '',
  address: '',
  type: ''
});

const entityMap = new Map();

const userRole = computed(() => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return 'guest'; 
  try {
    const user = JSON.parse(userStr);
    return user.role || 'guest';
  } catch (e) {
    return 'guest';
  }
});

const filteredFeatures = computed(() => {
  if (!searchText.value.trim()) return allFeatures.value;
  const q = searchText.value.toLowerCase();
  return allFeatures.value.filter(f =>
    (f.properties?.id?.toString() ?? '').includes(q) ||
    (f.properties?.name?.toLowerCase() ?? '').includes(q) ||
    (f.properties?.description?.toLowerCase() ?? '').includes(q) ||
    (f.properties?.address?.toLowerCase() ?? '').includes(q)
  );
});

function toggleMapExpand(){
  isMapExpanded.value = !isMapExpanded.value;
  nextTick(() => {
    if (viewer && !viewer.isDestroyed()) {
      viewer.resize();
      viewer.scene.requestRender();
    }
  });
}

// --- Drawing and Form Functions ---
function showConfirmation(entity, geometryType) {
  currentDrawingLayer.value = entity;
  currentGeometryType.value = geometryType;
  showConfirmDialog.value = true;
}

function openFormFromConfirm() {
  showConfirmDialog.value = false;
  openDataForm(currentGeometryType.value);
}

function skipAddData() {
  showConfirmDialog.value = false;
  if (currentDrawingLayer.value && viewer) {
    viewer.entities.remove(currentDrawingLayer.value);
  }
  currentDrawingLayer.value = null;
  currentGeometryType.value = '';
}

function openDataForm(geometryType) {
  showDataForm.value = true;
  formData.value = {
    name: '',
    description: '',
    type: '',
    address: '',
    geometryType: geometryType
  };
}

function closeDataForm() {
  showDataForm.value = false;
  if (currentDrawingLayer.value && viewer) {
    viewer.entities.remove(currentDrawingLayer.value);
  }
  currentDrawingLayer.value = null;
  formData.value = {
    name: '',
    description: '',
    type: '',
    address: '',
    geometryType: ''
  };
}

// --- Save Drawing Data ---
async function saveDrawingData() {
  if (!currentDrawingLayer.value) return;

  try {
    isLoading.value = true;

    let coordinates;
    const entity = currentDrawingLayer.value;

    if (entity.position) {
      const position = entity.position.getValue(viewer.clock.currentTime);
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      coordinates = [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude)
      ];
    } else if (entity.polygon) {
      const hierarchy = entity.polygon.hierarchy.getValue(viewer.clock.currentTime);
      const positions = hierarchy.positions;
      coordinates = [positions.map(pos => {
        const cartographic = Cesium.Cartographic.fromCartesian(pos);
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude)
        ];
      })];
    } else if (entity.polyline) {
      const positions = entity.polyline.positions.getValue(viewer.clock.currentTime);
      coordinates = positions.map(pos => {
        const cartographic = Cesium.Cartographic.fromCartesian(pos);
        return [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude)
        ];
      });
    }

    const response = await axios.post('http://localhost:3000/api/Polygon', {
      name: formData.value.name,
      description: formData.value.description,
      type: formData.value.type,
      address: formData.value.address,
      geometry: {
        type: currentGeometryType.value,
        coordinates: coordinates,
        srid: 4326
      }
    });

    // console.log('Data saved successfully:', response.data);
    
    // Update entity with saved data
    entity.id = response.data.id;
    entity.name = formData.value.name;
    entity.description = formData.value.description;
    entity.properties = response.data;
    
    entityMap.set(response.data.id, entity);

    // Reset form
    showDataForm.value = false;
    currentDrawingLayer.value = null;
    formData.value = {
      name: '',
      description: '',
      type: '',
      address: '',
      geometryType: ''
    };

    await loadExistingData();

  } catch (error) {
    console.error('Error saving data:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
  } finally {
    isLoading.value = false;
  }
}

// --- Cesium Entity Helpers ---
function flyToEntity(entity) {
  if (!viewer || !entity) {
    console.warn('Cannot fly to entity: viewer or entity not available');
    return;
  }

  try {
    viewer.flyTo(entity, {
      duration: 2.0,
      offset: new Cesium.HeadingPitchRange(0, -Math.PI / 4, 1000)
    });
  } catch (error) {
    console.error('Error flying to entity:', error);
    try {
      if (entity.position) {
        const position = entity.position.getValue(viewer.clock.currentTime);
        if (position) {
          const cartographic = Cesium.Cartographic.fromCartesian(position);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000)
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback flyTo also failed:', fallbackError);
    }
  }
}

function clearEntities() {
  if (!viewer) return;
  
  try {
    viewer.entities.removeAll();
    entityMap.clear();
    // console.log('Cleared all entities');
  } catch (error) {
    console.error('Error clearing entities:', error);
  }
}

function featureToEntity(feature) {
  if (!viewer || !feature || !feature.geometry) {
    console.warn('Invalid feature or viewer not ready:', feature);
    return null;
  }

  try {
    let entity;
    const geom = feature.geometry;
    const props = feature.properties || {};

    if (geom.type === "Point") {
      const [lon, lat] = geom.coordinates;
      
      if (isNaN(lon) || isNaN(lat) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        console.warn('Invalid coordinates:', geom.coordinates);
        return null;
      }

      entity = viewer.entities.add({
        id: props.id || Cesium.createGuid(),
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
          pixelSize: 12,
          color: Cesium.Color.CYAN,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: props.name || 'Point',
          font: '12pt sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        properties: props,
        description: props.description || '',
        name: props.name || 'Unnamed Point'
      });

    } else if (geom.type === "Polygon") {
      const coordinates = geom.coordinates[0];
      if (!coordinates || coordinates.length < 3) {
        console.warn('Invalid polygon coordinates:', geom.coordinates);
        return null;
      }


      const positions = [];
      for (const coord of coordinates) {
        const [lon, lat] = coord;
        if (!isNaN(lon) && !isNaN(lat) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
          positions.push(lon, lat);
        }
      }

      if (positions.length < 6) { 
        console.warn('Not enough valid coordinates for polygon');
        return null;
      }

      entity = viewer.entities.add({
        id: props.id || Cesium.createGuid(),
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
          material: Cesium.Color.BLUE.withAlpha(0.3),
          outline: true,
          outlineColor: Cesium.Color.BLUE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        properties: props,
        description: props.description || '',
        name: props.name || 'Unnamed Polygon'
      });

    } else if (geom.type === "LineString") {
      const coordinates = geom.coordinates;
      if (!coordinates || coordinates.length < 2) {
        console.warn('Invalid linestring coordinates:', geom.coordinates);
        return null;
      }

      const positions = [];
      for (const coord of coordinates) {
        const [lon, lat] = coord;
        if (!isNaN(lon) && !isNaN(lat) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
          positions.push(lon, lat);
        }
      }

      if (positions.length < 4) { 
        console.warn('Not enough valid coordinates for linestring');
        return null;
      }

      entity = viewer.entities.add({
        id: props.id || Cesium.createGuid(),
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(positions),
          width: 3,
          material: Cesium.Color.RED,
          clampToGround: true
        },
        properties: props,
        description: props.description || '',
        name: props.name || 'Unnamed Line'
      });
    }

    if (entity && props.id) {
      entityMap.set(props.id, entity);
    }

    return entity;

  } catch (error) {
    console.error('Error creating entity from feature:', error, feature);
    return null;
  }
}

// --- Data CRUD ---
async function loadExistingData() {
  try {
    // console.log('Loading existing data...');
    const response = await axios.get('http://localhost:3000/api/Polygon');
    const data = response.data;
    
    if (!data.features || !Array.isArray(data.features)) {
      console.warn('Invalid data format received:', data);
      return;
    }

    allFeatures.value = data.features.map(item => ({
      type: 'Feature',
      geometry: item.geometry,
      properties: {
        id: item.properties.id,
        name: item.properties.name,
        description: item.properties.description,
        type: item.properties.type || '',
        address: item.properties.address,
        created_at: item.properties.created_at,
        update_at: item.properties.update_at,
        coordinates: JSON.stringify(item.geometry.coordinates),
        srid: item.properties.srid || 4326
      }
    }));

    // console.log(`Loaded ${allFeatures.value.length} features`);

    clearEntities();

    let successCount = 0;
    for (const feature of allFeatures.value) {
      try {
        const entity = featureToEntity(feature);
        if (entity) {
          successCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.warn('Failed to add feature:', feature.properties?.id, error);
      }
    }

    // console.log(`Successfully added ${successCount}/${allFeatures.value.length} entities to map`);

  } catch (error) {
    console.error('Error loading existing data:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
  }
}

async function refreshData() {
  isLoading.value = true;
  try {
    clearEntities();
    await loadExistingData();
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการรีเฟรชข้อมูล');
  } finally {
    isLoading.value = false;
  }
}

async function deleteFeature(featureId, featureName) {
  const confirmDelete = confirm(`คุณต้องการลบ "${featureName}" หรือไม่?`);
  if (!confirmDelete) return;
  
  try {
    await axios.delete(`http://localhost:3000/api/geometries/${featureId}`);
    
    // Remove from allFeatures array
    const featureIndex = allFeatures.value.findIndex(f => f.properties.id === featureId);
    if (featureIndex > -1) {
      allFeatures.value.splice(featureIndex, 1);
    }
    
    const entity = entityMap.get(featureId);
    if (entity && viewer) {
      viewer.entities.remove(entity);
      entityMap.delete(featureId);
    }
    
    if (selectedFeature.value && selectedFeature.value.properties.id === featureId) {
      selectedFeature.value = null;
    }
    
    alert(`ลบ "${featureName}" สำเร็จ!`);
  } catch (error) {
    console.error('Error deleting feature:', error);
    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
  }
}

// --- UI Actions ---
function showInfo(rowData) {
  selectedFeature.value = rowData;
  const entity = entityMap.get(rowData.properties.id);
  flyToEntity(entity);
}

function showEdit(feature) {
  editFeature.value = feature;
  editFormData.value = {
    name: feature.properties.name || '',
    description: feature.properties.description || '',
    address: feature.properties.address || '',
    type: feature.properties.type || ''
  };
  showEditDialog.value = true;
}

async function submitEdit() {
  try {
    const id = editFeature.value.properties.id;
    const payload = { ...editFormData.value };
    
    await axios.put(`http://localhost:3000/api/geometries/${id}`, payload);
    
    // Update local data
    Object.assign(editFeature.value.properties, payload);
    
    if (selectedFeature.value && selectedFeature.value.properties.id === id) {
      Object.assign(selectedFeature.value.properties, payload);
    }
    
    // Update Cesium entity
    const entity = entityMap.get(id);
    if (entity) {
      entity.name = payload.name;
      entity.description = payload.description;
      if (entity.label) {
        entity.label.text = payload.name;
      }
      Object.assign(entity.properties, payload);
    }
    
    showEditDialog.value = false;
    alert('แก้ไขข้อมูลสำเร็จ');
  } catch (error) {
    console.error('Error updating feature:', error);
    alert(error?.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
  }
}

function toggleFullscreen() {
  const leftCol = document.querySelector(".left-column");
  const rightCol = document.querySelector(".right-column");
  const container = document.querySelector(".container");

  if (!isLeftFullscreen.value) {
    leftCol.classList.add("fullscreen-left");
    container.classList.add("fullscreen-mode");
    rightCol.classList.add("hide-map");
  } else {
    leftCol.classList.remove("fullscreen-left");
    container.classList.remove("fullscreen-mode");
    rightCol.classList.remove("hide-map");
  }

  isLeftFullscreen.value = !isLeftFullscreen.value;
}

function exitFullscreenAndBack() {
  const leftCol = document.querySelector(".left-column");
  const rightCol = document.querySelector(".right-column");
  const container = document.querySelector(".container");

  leftCol?.classList.remove("fullscreen-left");
  container?.classList.remove("fullscreen-mode");
  rightCol?.classList.remove("hide-map");

  isLeftFullscreen.value = false;
  selectedFeature.value = null;
}

function onRowClick(event) {
  const feature = event.data;
  const entity = entityMap.get(feature.properties.id);
  flyToEntity(entity);
}

// --- Setup coordinate display with error handling ---
function setupCoordinateDisplay() {
  try {
    const coordDiv = document.getElementById("coordinate-display");
    if (coordDiv && viewer) {
      viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        try {
          const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
            const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
            coordDiv.innerHTML = `Lat: ${lat}, Lng: ${lon}`;
          }
        } catch (error) {
          console.warn('Error updating coordinates:', error);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  } catch (error) {
    console.error('Error setting up coordinate display:', error);
  }
}

function setupErrorHandler() {
  if (!viewer) {
    console.warn('ไม่สามารถตั้งค่า error handler: viewer ไม่พร้อม');
    return;
  }

  try {
    viewer.scene.renderError.addEventListener(function(scene, error) {
      console.error('Cesium render error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      try {
        if (viewer.scene.globe.enableLighting) {
          viewer.scene.globe.enableLighting = false;
          // console.log('ปิด lighting เนื่องจาก render error');
        }
        
        viewer.scene.requestRender();
        // console.log('พยายาม render ใหม่');
        
      } catch (recoveryError) {
        console.error('การแก้ไข render error ล้มเหลว:', recoveryError);
      }
    });

    // จัดการ WebGL context errors
    if (viewer.scene.context) {
      viewer.scene.context.webglContextLost.addEventListener(function() {
        console.error('WebGL context หายไป');
        alert('WebGL context หายไป กรุณา refresh หน้า');
      });

      viewer.scene.context.webglContextRestored.addEventListener(function() {
      });
    }

    // จัดการ camera errors
    viewer.camera.changed.addEventListener(function() {
      try {
        if (!viewer.isDestroyed()) {
          viewer.scene.requestRender();
        }
      } catch (error) {
        console.warn('Camera change render error:', error);
      }
    });
    
  } catch (error) {
    console.error('Error setting up error handler:', error);
  }
}

// --- Setup drawing tools ---
function setupDrawingTools() {
  if (!viewer) return;

  viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(function(event) {
    if (viewer.cesiumWidget.canvas.style.cursor === 'crosshair') {
      const position = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
      if (position) {
        const entity = viewer.entities.add({
          position: position,
          point: {
            pixelSize: 12,
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
        });
        
        showConfirmation(entity, 'Point');
        viewer.cesiumWidget.canvas.style.cursor = 'auto';
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// --- Cesium Initialization ---
onMounted(async () => {
  // console.log('Cesium initialization');
  
  try {
    if (!cesiumContainer.value) {
      console.error('ไม่พบ Cesium container');
      return;
    }
    
    // console.log('ขนาด Container:', {
    //   width: cesiumContainer.value.clientWidth,
    //   height: cesiumContainer.value.clientHeight
    // });

    if (typeof Cesium === 'undefined') {
      console.error('Cesium library ไม่ได้โหลด');
      alert('ไม่สามารถโหลด Cesium library กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      return;
    }

    // console.log('Cesium version:', Cesium.VERSION);
    
    if (!viewer) {
      // Set Cesium Ion token
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMzVjNmZjNi1mMWJiLTQ5YjYtYTczMS0zY2FlNTVmMDdkZjIiLCJpZCI6MzIxOTE4LCJpYXQiOjE3NTI2NDgzMzd9.1soJyjBQ2bYa_-tFvHdXQG5amC6QTpjBa0XFJfHy8MY';
    
      
      viewer = new Cesium.Viewer(cesiumContainer.value, {
        timeline: false,
        animation: false,
        geocoder: true,
        homeButton: true,
        sceneModePicker: true, 
        navigationHelpButton: true,
        infoBox: true,
        selectionIndicator: true,
        baseLayerPicker: true,
        fullscreenButton: false,
        vrButton: false,

        

        scene3DOnly: false, 
        orderIndependentTranslucency: true,
        requestRenderMode: false,
        maximumRenderTimeChange: undefined
      });

      // console.log('Cesium viewer สร้างสำเร็จ');
      // console.log('Scene mode:', viewer.scene.mode);
      // console.log('WebGL context:', !!viewer.scene.context._gl);
      // console.log('Available imagery providers:', viewer.baseLayerPicker ? 'BaseLayerPicker enabled' : 'BaseLayerPicker disabled');
      // console.log('Terrain provider:', viewer.terrainProvider.constructor.name);
      // console.log('Imagery layers:', viewer.imageryLayers.length);

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(100.5018, 13.7563, 15000),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_FOUR,
          roll: 0.0
        }
      });

      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereHueShift = 0;
      viewer.scene.globe.atmosphereSaturationShift = 0;
      viewer.scene.globe.atmosphereBrightnessShift = 0;
      
      if (viewer.scene.postProcessStages) {
        viewer.scene.postProcessStages.fxaa.enabled = true;
        if (viewer.scene.postProcessStages.bloom) {
          viewer.scene.postProcessStages.bloom.enabled = false; 
        }
      }
      

      viewer.scene.screenSpaceCameraController.enableTilt = true;

      await new Promise(resolve => {
        if (viewer.scene.globe.tilesLoaded) {
          resolve();
        } else {
          const removeListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener((queuedTileCount) => {
            if (queuedTileCount === 0) {
              removeListener();
              resolve();
            }
          });
        }
        setTimeout(() => {
          resolve();
        }, 5000);
      });

      // console.log('Globe tiles');

      viewer.scene.globe.show = true;
      viewer.scene.skyBox.show = true;
      viewer.scene.sun.show = true;
      viewer.scene.moon.show = true;
      viewer.scene.skyAtmosphere.show = true;

      setupCoordinateDisplay();

      setupErrorHandler();

      setupDrawingTools();

      viewer.scene.requestRender();

      // ตรวจสอบว่า viewer ทำงานได้ถูกต้อง
      // console.log('Cesium viewer ตรวจสอบ:');
      // console.log('- Canvas size:', viewer.canvas.width, 'x', viewer.canvas.height);
      // console.log('- Imagery layers ready:', viewer.imageryLayers.length > 0);
      // console.log('- Globe visible:', viewer.scene.globe.show);
      // console.log('- Camera position:', viewer.camera.position);

      // console.log('Cesium viewer initialized สำเร็จ');
      
      setTimeout(async () => {
        try {
          // console.log('เริ่มโหลดข้อมูล');
          await loadExistingData();
        } catch (error) {
          console.error('Error loading initial data:', error);
        }
      }, 1000);

      const resizeObserver = new ResizeObserver(() => {
        if (viewer && !viewer.isDestroyed()) {
          viewer.resize();
          // console.log('Cesium viewer resized');
        }
      });
      resizeObserver.observe(cesiumContainer.value);

      cesiumContainer.value._resizeObserver = resizeObserver;
    }
  } catch (error) {
    console.error('Failed to initialize Cesium viewer:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการโหลด 3D Map: ';
    if (error.message.includes('WebGL')) {
      errorMessage += 'เบราว์เซอร์ไม่รองรับ WebGL หรือ WebGL ถูกปิดใช้งาน';
    } else if (error.message.includes('Ion')) {
      errorMessage += 'ปัญหาการเชื่อมต่อ Cesium Ion';
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage + '\nกรุณาลองใหม่อีกครั้งหรือใช้เบราว์เซอร์อื่น');
  }
});

// Cleanup on unmount
onUnmounted(() => {
  try {
    // ลบ ResizeObserver
    if (cesiumContainer.value && cesiumContainer.value._resizeObserver) {
      cesiumContainer.value._resizeObserver.disconnect();
    }
    
    // ทำลาย viewer
    if (viewer) {
      viewer.destroy();
      viewer = null;
      // console.log('Cesium viewer destroyed');
    }
  } catch (error) {
    console.error('Error destroying viewer:', error);
  }
});
</script>


<style scoped>
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
padding: 2px;
border-radius: 8px;
overflow: auto;
}
.right-column {
flex: 3;
background-color: #f9f9f9;
border-radius: 8px;
overflow: hidden; 
position: relative; 
}


#cesiumContainer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
  background-color: #000; 
}

:deep(.cesium-viewer) {
  width: 100% !important;
  height: 100% !important;
  font-family: sans-serif;
}

:deep(.cesium-viewer-cesiumWidgetContainer) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.cesium-widget-canvas) {
  width: 100% !important;
  height: 100% !important;
}


.search-input {
  width: 100%;
  padding: 10px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 5px;
}

.refresh-btn {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 5px;
  background-color: #fff;
}

.refresh-btn:hover {
  background-color: #e0dfdf;
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

.info-box {
  position: relative;
  box-sizing: border-box;
}


.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

:deep(.striped-table .p-datatable-tbody tr:nth-child(even)) {
    background-color: #f1f3f4;
}

.custom-text-label {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.popup-edit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-text {
  font-weight: bold;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn:hover {
  background: #007bff;
}

.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.confirm-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.3s ease-out;
}

.confirm-container h3 {
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.confirm-container p {
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 16px;
}

.confirm-info {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #007bff;
}

.confirm-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.confirm-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-buttons .p-button {
  min-width: 120px;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.form-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.required {
  color: red;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-info {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #007bff;
}

.form-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-buttons .p-button {
  min-width: 100px;
}

.btn-back, .btn-exten {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-exten {
  background: #007bff;
  color: white;
}

.fullscreen-mode {
  display: block !important;
}


.fullscreen-left {
  position: fixed !important;
  top: 70px; 
  left: 0;
  width: 100vw;
  height: calc(100vh - 60px); 
  z-index: 9999;
  background: white;
  overflow: auto;
padding: 1rem 2rem;
}

.hide-map {
  display: none !important;
}

.container.fullscreen-mode {
  display: block !important;
}

:deep(.uniform-table.p-datatable) { font-size: 13px; }
:deep(.uniform-table .p-datatable-scrollable-header-box table),
:deep(.uniform-table .p-datatable-scrollable-body table) { table-layout: fixed; width:100%; }
:deep(.uniform-table .p-datatable-thead > tr > th),
:deep(.uniform-table .p-datatable-tbody > tr > td) {
  padding: 6px 10px !important;
  line-height: 1.3;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.uniform-table.p-datatable-scrollable .p-datatable-scrollable-header) { margin-right: 0 !important; }
:deep(.uniform-table .p-datatable-scrollable-body) { scrollbar-gutter: stable both-edges; }
.action-buttons-row { display:flex; gap:4px; align-items:center; justify-content:center; flex-wrap:wrap; }
.action-buttons-row.compact { gap:2px; }
:deep(.action-buttons-row.compact .p-button.p-button-sm){ padding:2px 6px !important; font-size:11px; }
:deep(.action-buttons-row.compact .p-button .p-button-label){ font-weight:400; }
:deep(.uniform-table .p-datatable-tbody > tr:hover) { background:#e8f0fe; }
:deep(.uniform-table .p-datatable-thead > tr > th) { white-space: nowrap; }
:deep(.uniform-table .p-datatable-thead th[style*='min-width']) { min-width: auto !important; }
:deep(.uniform-table .p-datatable-tbody > tr) { height: auto; }

#cesiumContainer.map-expanded {
  width: 100vw !important;
  height: calc(100vh - 60px) !important;
}

.map-expanded {
  position: fixed !important;
  top: 60px; 
  left: 0;
  z-index: 3000;
  background: #000;
  border-radius: 0 !important;
}

.map-expand-btn {
  position: absolute;
  bottom: 48px; 
  right: 12px;
  z-index: 10000; 
  background: rgba(255,255,255,0.95);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  pointer-events: auto;
}


.map-expand-btn:hover { background: #f1f3f4; }

.coordinate-display { z-index: 3500; }

.hide-when-map-expanded { display: none !important; }
</style>
