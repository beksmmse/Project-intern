<template>
  <div>
    <div class="container">
      <div class="left-column">
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
              <i class="fas fa-sync-alt" style="color: #007bff;"></i>
            </Button>
          </div>

          <DataTable 
            :value="filteredFeatures" 
            class="striped-table uniform-table"
            dataKey="properties.id"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginator
            scrollable
            @row-click="onRowClick"
            tableStyle="min-width:50rem;table-layout:fixed;"
          >
            <Column field="properties.id" header="รหัส" sortable style="width:4rem" />
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

        <div v-else class="info-box">
          <div class="button-container">
            <Button @click="exitFullscreenAndBack" class="btn-back">
             ย้อนกลับ
            </Button>
            <Button class="btn-exten" @click="toggleFullscreen">
              {{ isLeftFullscreen ? 'ย่อหน้า' : 'ขยาย' }}
            </Button>
          </div>
          
          <div class="info-header">
            <h3 class="info-title">
              รายละเอียดข้อมูล
            </h3>
          </div>
          
          <div class="info-content">
            <dl class="info-list">
              <div class="info-row">
                <dt>รหัส</dt>
                <dd>{{ selectedFeature.properties.id }}</dd>
              </div>
              
              <div class="info-row">
                <dt>ชื่อ</dt>
                <dd class="highlight">{{ selectedFeature.properties.name }}</dd>
              </div>
              
              <div class="info-row">
                <dt>คำอธิบาย</dt>
                <dd>{{ selectedFeature.properties.description }}</dd>
              </div>
              
              <div class="info-row">
                <dt>ที่ตั้ง</dt>
                <dd>{{ selectedFeature.properties.address }}</dd>
              </div>
              
              <div class="info-row">
                <dt>ประเภท</dt>
                <dd><span class="type-badge">{{ getTypeLabel(selectedFeature.properties.type) }}</span></dd>
              </div>
              
              <div class="info-row">
                <dt>พิกัด</dt>
                <dd class="coordinates">{{ formatCoordinates(selectedFeature.properties.coordinates) }}</dd>
              </div>
              
              <div class="info-row" v-if="selectedFeature.properties.remark">
                <dt>หมายเหตุ</dt>
                <dd class="remark">{{ selectedFeature.properties.remark }}</dd>
              </div>
              
              <div class="info-row" v-if="selectedFeature.properties.etc">
                <dt>อื่นๆ</dt>
                <dd>{{ selectedFeature.properties.etc }}</dd>
              </div>
              
              <div class="info-row">
                <dt>สร้างเมื่อ</dt>
                <dd class="date">{{ formatDate(selectedFeature.properties.created_at) }}</dd>
              </div>
              
              <div class="info-row">
                <dt>แก้ไขเมื่อ</dt>
                <dd class="date">{{ formatDate(selectedFeature.properties.updated_at || selectedFeature.properties.update_at) }}</dd>
              </div>

              <div class="info-row">
                <dt>อื่นๆ</dt>
                <dd class="date">{{ formatDate(selectedFeature.properties.etc) }}</dd>
              </div>

              <div class="info-row">
                <dt>หมายเหตุ</dt>
                <dd class="date">{{ formatDate(selectedFeature.properties.remark) }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div class="right-column" id="map" :class="{ 'map-expanded': isMapExpanded }">
        <!-- Expand/Collapse button overlay -->
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
        <h3>บันทึกข้อมูล</h3>
        <form @submit.prevent="saveDrawingData">
          <div class="form-group">
            <label>ชื่อ <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="formData.name" 
              required 
              placeholder="กรุณากรอกชื่อ"
            />
          </div>
          <div class="form-group">
            <label>ที่อยู่ <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="formData.address" 
              required
              placeholder="กรุณากรอกที่อยู่"
            />
          </div>
          <div class="form-group full-width">
            <label>คำอธิบาย <span class="required">*</span></label>
            <textarea 
              v-model="formData.description" 
              required
              placeholder="กรุณากรอกคำอธิบาย"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>ประเภท <span class="required">*</span></label>
            <select v-model="formData.type" required>
              <option value="" disabled>เลือกประเภท</option>
              <option value="school">โรงเรียน</option>
              <option value="hospital">โรงพยาบาล</option>
              <option value="districtOffice">ที่ว่าการอำเภอ</option>
            </select>
          </div>
          <div class="form-group">
            <label>อื่นๆ</label>
            <input 
              type="text" 
              v-model="formData.etc" 
              placeholder="กรุณากรอกข้อมูลอื่นๆ"
            />
          </div>
           <label>หมายเหตุ</label>
          <div class="form-group full-width">
            <textarea 
              v-model="formData.remark" 
              placeholder="กรุณากรอกหมายเหตุ"
              rows="2"
            ></textarea>
          </div>
          <div class="form-info full-width">
            <p><strong>ประเภทของข้อมูล:</strong> {{ formData.geometryType }}</p>
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
            <label>ชื่อ <span class="required">*</span></label>
            <input
              type="text"
              v-model="editFormData.name"
              required
              placeholder="กรุณากรอกชื่อ"
            />
          </div>
          <div class="form-group">
            <label>ที่อยู่ <span class="required">*</span></label>
            <input 
              type="text"
              v-model="editFormData.address"
              required
              placeholder="กรุณากรอกที่อยู่"
            />
          </div>
          <div class="form-group full-width">
            <label>คำอธิบาย <span class="required">*</span></label>
            <textarea 
              v-model="editFormData.description"
              required
              placeholder="กรุณากรอกคำอธิบาย"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>ประเภท <span class="required">*</span></label>
            <select v-model="editFormData.type" required>
              <option value="school">โรงเรียน</option>
              <option value="hospital">โรงพยาบาล</option>
              <option value="districtOffice">ที่ว่าการอำเภอ</option>
            </select>
          </div>
          <div class="form-group">
            <label>หมายเหตุ</label>
            <textarea 
              v-model="editFormData.remark" 
              placeholder="กรุณากรอกหมายเหตุ"
              rows="2"
            ></textarea>
          </div>
          <div class="form-group full-width">
            <label>อื่นๆ</label>
            <input 
              type="text" 
              v-model="editFormData.etc" 
              placeholder="กรุณากรอกข้อมูลอื่นๆ"
            />
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
import { ref, onMounted, computed, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import L from 'leaflet'
import axios from 'axios';
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import "leaflet/dist/leaflet.css";
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-groupedlayercontrol'
import 'leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css'


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import 'primeicons/primeicons.css';


const drawnItems = L.featureGroup();
const geojsonData = ref(null);
const selectedFeature = ref(null);
const allFeatures = ref([]);
const searchText = ref('');
const layerMap = new Map();
const isLoading = ref(false);
const isLeftFullscreen = ref(false);
const showConfirmDialog = ref(false);
const showDataForm = ref(false);
const currentDrawingLayer = ref(null);
const currentGeometryType = ref('');
const formData = ref({
  name: '',
  description: '',
  type: '',
  address: '',
  remark: '',
  etc: '',
  geometryType: ''
});


const showEditDialog = ref(false)
const editFeature = ref(null)
const editFormData = ref({
  name: '',
  description: '',
  address: '',
  type: '',
  remark: '',
  etc: ''
})

let layersControl; 
const typeLayerGroups = {}; 
const activeTypes = ref([]);
let wmsProvice, wmsLayer, wmsSubdis;
const baseMaps = ref({});
const markerClusterGroup = ref(null);
const isClusterEnabled = ref(true); 

const TYPE_COLORS = {
  school: '#e67e22',
  hospital: '#e74c3c',
  districtOffice: '#8e44ad'
};

const TYPE_ICON_URLS = {
  school: '/markers/school.png',
  hospital: '/markers/hospital.png',
  districtOffice: '/markers/landmark.png'
};


const TYPE_ALIASES = {
  school: 'school',
  'โรงเรียน': 'school',
  hospital: 'hospital',
  'โรงพยาบาล': 'hospital',
  districtOffice: 'districtOffice',
  'ที่ว่าการอำเภอ': 'districtOffice'
};
function normalizeType(type) {
  if (type === null || type === undefined) return 'other';
  const raw = String(type).trim();
  const rawLower = raw.toLowerCase();
  return TYPE_ALIASES[raw] || TYPE_ALIASES[rawLower] || 'other';
}

function displayTypeName(typeKey) {
  const key = normalizeType(typeKey);
  if (key === 'school') return 'โรงเรียน';
  if (key === 'hospital') return 'โรงพยาบาล';
  if (key === 'districtOffice') return 'ที่ว่าการอำเภอ';
  return 'อื่นๆ';
}

function getTypeLabel(type) {
  return displayTypeName(type);
}

function formatDate(dateString) {
  if (!dateString) return 'ไม่ระบุ';
  try {
    const date = new Date(dateString);
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const thaiTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    const hours = thaiTime.getUTCHours().toString().padStart(2, '0');
    const minutes = thaiTime.getUTCMinutes().toString().padStart(2, '0');
    const day = thaiTime.getUTCDate();
    const month = thaiMonths[thaiTime.getUTCMonth()];
    const year = thaiTime.getUTCFullYear() + 543;
    
    return `${hours}:${minutes} ${day} ${month} ${year}`;
  } catch (error) {
    return dateString;
  }
}

function formatCoordinates(coordinates) {
  if (!coordinates) return 'ไม่ระบุ';
  
  try {
    let coords = coordinates;
    if (typeof coordinates === 'string') {
      coords = JSON.parse(coordinates);
    }
    
    if (Array.isArray(coords) && coords.length >= 2) {
      const lng = parseFloat(coords[0]).toFixed(6);
      const lat = parseFloat(coords[1]).toFixed(6);
      return `${lat}, ${lng}`;
    }
    
    return coordinates.toString();
  } catch (error) {
    return coordinates.toString();
  }
}
function getIconByType(type) {
  const key = normalizeType(type);
  const url = TYPE_ICON_URLS[key];
  if (url) {
    return L.icon({
      iconUrl: url,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
      className: 'type-marker-icon'
    });
  }
  const color = TYPE_COLORS[key] || TYPE_COLORS.other;
  return L.divIcon({
    className: 'type-dot',
    html: `<span style="display:block;width:16px;height:16px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
}
function getStyleByType(type) {
  const key = normalizeType(type);
  const color = TYPE_COLORS[key] || TYPE_COLORS.other;
  return { color, weight: 3, fillColor: color, fillOpacity: 0.2 };
}


// ตรวจสอบสถานะการ login และ role ของผู้ใช้
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


//เก็บ layers ที่ยังไม่มีข้อมูล
const pendingLayers = new Map();

let map;

const filteredFeatures = computed(() => {
  let list = !searchText.value.trim() ? allFeatures.value : allFeatures.value.filter(f => {
    const q = searchText.value.toLowerCase();
    return (
      f.id?.toString().includes(q) ||
      f.properties?.name?.toLowerCase().includes(q) ||
      f.properties?.description?.toLowerCase().includes(q) ||
      f.properties?.address?.toLowerCase().includes(q) ||
      f.properties?.remark?.toLowerCase().includes(q) ||
      f.properties?.etc?.toLowerCase().includes(q)
    );
  });
  if (activeTypes.value.length > 0) {
    list = list.filter(f => activeTypes.value.includes(normalizeType(f.properties.type)));
  }
  return list;
});


function showConfirmation(layer, geometryType) {
  currentDrawingLayer.value = layer;
  currentGeometryType.value = geometryType;
  showConfirmDialog.value = true;
}


function openFormFromConfirm() {
  showConfirmDialog.value = false;
  openDataForm(currentDrawingLayer.value, currentGeometryType.value);
}

function skipAddData() {
  showConfirmDialog.value = false;
  
  const layerId = Date.now(); 
  pendingLayers.set(layerId, {
    layer: currentDrawingLayer.value,
    geometryType: currentGeometryType.value
  });
  
  // เพิ่ม popup พร้อมคำแนะนำ
  currentDrawingLayer.value.bindPopup(`
    <div style="text-align: center;">
      <p><strong>ยังไม่มีข้อมูล</strong></p>
      <p style="font-size: 12px; color: #666;">
        Double-click เพื่อเพิ่มข้อมูล
      </p>
      <button onclick="window.openPendingForm(${layerId})" 
              style="padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
        เพิ่มข้อมูล
      </button>
    </div>
  `);
  
  currentDrawingLayer.value.on('dblclick', () => {
    const pendingData = pendingLayers.get(layerId);
    if (pendingData) {
      openDataForm(pendingData.layer, pendingData.geometryType);
      pendingLayers.delete(layerId); 
    }
  });
  
  //  เพิ่ม global function 
  window.openPendingForm = (id) => {
    const pendingData = pendingLayers.get(id);
    if (pendingData) {
      openDataForm(pendingData.layer, pendingData.geometryType);
      pendingLayers.delete(id);
    }
  };
  
  // รีเซ็ตตัวแปร
  currentDrawingLayer.value = null;
  currentGeometryType.value = '';
}

//  ฟังก์ชันเปิดฟอร์ม
function openDataForm(layer, geometryType) {
  currentDrawingLayer.value = layer;
  showDataForm.value = true;
  
  // รีเซ็ตข้อมูลฟอร์ม
  formData.value = {
    name: '',
    description: '',
    type: '',
    address: '',
    remark: '',
    etc: '',
    geometryType: geometryType
  };
}

//  ฟังก์ชันปิดฟอร์ม
function closeDataForm() {
  showDataForm.value = false;
  currentDrawingLayer.value = null;
  
  // รีเซ็ตฟอร์ม
  formData.value = {
    name: '',
    description: '',
    type: '',
    address: '',
    remark: '',
    etc: '',
    geometryType: ''
  };
}


//บันทึกข้อมูล
async function saveDrawingData() {
  if (!currentDrawingLayer.value) return;
  
  try {
    const geoJsonData = currentDrawingLayer.value.toGeoJSON();
    const layerData = {
      organization_id: 1, 
      name: formData.value.name,
      description: formData.value.description,
      geometry_type: geoJsonData.geometry.type, 
      srid: 4326, 
      feature_type: formData.value.type,
      properties_schema: null,
      created_by_user_id: 1, 
      address: formData.value.address,
      remark: formData.value.remark,
      etc: formData.value.etc,
      geometry: geoJsonData.geometry 
    };
    
    // console.log('prepare DB', layerData);
    
    const response = await axios.post('http://localhost:3000/api/geometries', layerData);
    
    // console.log('Receive:', response.data);
    
    // เพิ่ม ID ที่ได้จากฐานข้อมูลเข้าไปใน properties
    const savedData = response.data;
  
    //  สร้าง feature object ใหม่สำหรับแสดงใน DataTable
    const newFeature = {
      type: 'Feature',
      geometry: geoJsonData.geometry,
      properties: {
        id: savedData.id,
        name: formData.value.name,
        description: formData.value.description,
        type: normalizeType(formData.value.type),
        address: formData.value.address,
        remark: formData.value.remark,
        etc: formData.value.etc,
        created_at: savedData.created_at,
        coordinates: JSON.stringify(geoJsonData.geometry.coordinates)
      }
    };
    
    allFeatures.value.unshift(newFeature);
    
    // console.log('เพิ่มข้อมูลใหม่แล้ว:', newFeature);
    // console.log('จำนวนข้อมูลทั้งหมด:', allFeatures.value.length);
    
    // เพิ่ม popup ให้กับ layer พร้อม ID ที่บันทึกแล้ว
    currentDrawingLayer.value.bindPopup(`
      <div>
        <h4>${formData.value.name}</h4>
        <p><strong>ID:</strong> ${savedData.id}</p>
        <p><strong>คำอธิบาย:</strong> ${formData.value.description}</p>
        <p><strong>ประเภท:</strong> ${formData.value.type}</p>
        <p><strong>ที่อยู่:</strong> ${formData.value.address}</p>
        <p><strong>วันที่สร้าง:</strong> ${new Date(savedData.created_at).toLocaleDateString('th-TH')}</p>
      </div>
    `);
    
    // เก็บ mapping ระหว่าง feature ID กับ layer สำหรับใช้ใน layerMap
    layerMap.set(savedData.id, currentDrawingLayer.value);
    
    currentDrawingLayer.value.on('click', () => {
      selectedFeature.value = newFeature;
    });
    
    //จัด type group  ไอคอนตามประเภทที่เลือก
    const typeKey = normalizeType(newFeature.properties.type);
    if (currentDrawingLayer.value instanceof L.Marker) {
      currentDrawingLayer.value.setIcon(getIconByType(typeKey));
      currentDrawingLayer.value.options.markerType = typeKey;
      currentDrawingLayer.value.options.featureId = savedData.id;
    } else if (currentDrawingLayer.value.setStyle) {
      currentDrawingLayer.value.setStyle(getStyleByType(typeKey));
    }
    if (drawnItems.hasLayer(currentDrawingLayer.value)) {
      drawnItems.removeLayer(currentDrawingLayer.value);
    }

    // เพิ่มเข้า cluster และ type group
    if (isClusterEnabled.value && markerClusterGroup.value) {
    } else {
      if (!typeLayerGroups[typeKey]) {
        typeLayerGroups[typeKey] = L.layerGroup();
        if (layersControl) {
          layersControl.addOverlay(typeLayerGroups[typeKey], `${displayTypeName(typeKey)}`);
          typeLayerGroups[typeKey].addTo(map);
        }
      }
      typeLayerGroups[typeKey].addLayer(currentDrawingLayer.value);
      if (!activeTypes.value.includes(typeKey)) activeTypes.value.push(typeKey);
    }
    if (!typeLayerGroups[typeKey]) {
      typeLayerGroups[typeKey] = L.layerGroup();
      if (layersControl) {
        layersControl.addOverlay(typeLayerGroups[typeKey], `${displayTypeName(typeKey)}`);
      }
      if (!activeTypes.value.includes(typeKey)) activeTypes.value.push(typeKey);
    }
    typeLayerGroups[typeKey].addLayer(currentDrawingLayer.value);
    if (isClusterEnabled.value) {
      updateClusterByActiveTypes();
    }

    alert('บันทึกข้อมูลสำเร็จ!');
    closeDataForm();
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    if (error.response) {
      errorMessage += `: ${error.response.data.message || error.response.statusText}`;
    } else if (error.request) {
      errorMessage += ': ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }
    
    alert(errorMessage);
  }
}

// โหลดข้อมูลจาก API และแสดงด้วยไอคอน/สไตล์ตามประเภท + จัดเข้ากลุ่มตามประเภท (normalize type)
async function loadExistingData() {
  try {
    const response = await axios.get('http://localhost:3000/api/polygon');
    const data = response.data;

    allFeatures.value = data.features.map(item => {
      return {
        type: 'Feature',
        geometry: item.geometry,
        properties: {
          id: item.properties.id,
          name: item.properties.name,
          description: item.properties.description,
          type: normalizeType(item.feature_type || item.properties.type),
          address: item.properties.address,
          remark: item.properties.remark || '',
          etc: item.properties.etc || '',
          created_at: item.properties.created_at,
          updated_at: item.properties.updated_at || item.properties.update_at,
          coordinates: JSON.stringify(item.geometry.coordinates),
          srid: item.properties.srid || 4326
        }
      };
    });

    Object.keys(typeLayerGroups).forEach(k => {
      try { if (layersControl) layersControl.removeLayer(typeLayerGroups[k]); } catch {}
      try { map.removeLayer(typeLayerGroups[k]); } catch {}
      delete typeLayerGroups[k];
    });
    activeTypes.value = []; 

    if (markerClusterGroup.value) {
      map.removeLayer(markerClusterGroup.value);
    }
    drawnItems.clearLayers();
    layerMap.clear();

    markerClusterGroup.value = L.markerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 16, 
      maxClusterRadius: 50, 
      
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let className = 'marker-cluster marker-cluster-';
       
        if (count < 10) {
          className += 'small';
        } else if (count < 100) {
          className += 'medium';
        } else {
          className += 'large';
        }
        
        
        const markers = cluster.getAllChildMarkers();
        const typeCounts = {};
        
        markers.forEach(marker => {
          let markerType = 'other';
    
          const feature = allFeatures.value.find(f => {
            const coords = f.geometry.coordinates;
            const markerLat = marker.getLatLng().lat;
            const markerLng = marker.getLatLng().lng;
            
            return Math.abs(coords[1] - markerLat) < 0.0001 && 
                   Math.abs(coords[0] - markerLng) < 0.0001;
          });
          
          if (feature) {
            markerType = normalizeType(feature.properties.type);
          } else {
            if (marker.options && marker.options.markerType) {
              markerType = normalizeType(marker.options.markerType);
            }
          }
          typeCounts[markerType] = (typeCounts[markerType] || 0) + 1;
        });

        let dominantType = 'other';
        let maxCount = 0;
        Object.entries(typeCounts).forEach(([type, typeCount]) => {
          if (typeCount > maxCount) {
            maxCount = typeCount;
            dominantType = type;
          }
        });
        
        
        const iconUrl = TYPE_ICON_URLS[dominantType];
        let clusterHtml;
        
        if (iconUrl) {
          clusterHtml = `
            <div class="cluster-icon-container">
              <img src="${iconUrl}" class="cluster-icon-image" alt="${displayTypeName(dominantType)}" title="${displayTypeName(dominantType)}: ${typeCounts[dominantType]} รายการ" />
              <span class="cluster-count">${count}</span>
            </div>
          `;
        } else {
          const color = TYPE_COLORS[dominantType] || TYPE_COLORS.other;
          const title = displayTypeName(dominantType);
          clusterHtml = `
            <div class="cluster-icon-container">
              <div class="cluster-color-dot" style="background-color: ${color}" title="${title}"></div>
              <span class="cluster-count">${count}</span>
            </div>
          `;
        }
        
        return new L.DivIcon({
          html: clusterHtml,
          className: `${className} cluster-with-type cluster-type-${dominantType}`,
          iconSize: new L.Point(50, 50)
        });
      }
    });

    if (isClusterEnabled.value) {
      map.addLayer(markerClusterGroup.value);
    }

    allFeatures.value.forEach(feature => {
      const t = normalizeType(feature.properties.type);
      let layer = null;
      if (feature.geometry.type === 'Polygon') {
        const latlngs = feature.geometry.coordinates.map(ring => ring.map(([lng, lat]) => [lat, lng]));
        layer = L.polygon(latlngs, {
          color: TYPE_COLORS[t] || '#3388ff',
          weight: 2,
          fillOpacity: 0.4
        });
      } else if (feature.geometry.type === 'MultiPolygon') {
        const latlngs = feature.geometry.coordinates.map(poly => poly.map(ring => ring.map(([lng, lat]) => [lat, lng])));
        layer = L.polygon(latlngs, {
          color: TYPE_COLORS[t] || '#3388ff',
          weight: 2,
          fillOpacity: 0.4
        });
      } else if (feature.geometry.type === 'Point') {
        layer = L.marker(
          [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          {
            icon: getIconByType(feature.properties.type),
            markerType: t,
            featureId: feature.properties.id
          }
        );
      }
      if (layer) {
        layer.bindPopup(`
          <div>
            <h4>${feature.properties.name}</h4>
            <p><strong>ID:</strong> ${feature.properties.id}</p>
            <p><strong>ประเภท:</strong> ${displayTypeName(feature.properties.type)}</p>
            ${feature.properties.remark ? `<p><strong>หมายเหตุ:</strong> ${feature.properties.remark}</p>` : ''}
            ${feature.properties.etc ? `<p><strong>อื่นๆ:</strong> ${feature.properties.etc}</p>` : ''}
            <p><strong>วันที่สร้าง:</strong> ${new Date(feature.properties.created_at).toLocaleDateString('th-TH')}</p>
          </div>
        `);
        layer.on('click', () => {
          selectedFeature.value = feature;
        });
        layerMap.set(feature.properties.id, layer);
        if (!typeLayerGroups[t]) {
          typeLayerGroups[t] = L.layerGroup();
          if (layersControl) {
            layersControl.addOverlay(typeLayerGroups[t], `${displayTypeName(t)}`);
          }
        }
        typeLayerGroups[t].addLayer(layer);
      }
    });

    if (isClusterEnabled.value) {
      updateClusterByActiveTypes();
    }

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
  }
}

function toggleCluster() {
  isClusterEnabled.value = !isClusterEnabled.value;
  
  if (isClusterEnabled.value) {
    Object.entries(typeLayerGroups).forEach(([type, group]) => {
      if (activeTypes.value.includes(type) && map.hasLayer(group)) {
        map.removeLayer(group);
      }
    });
    
    updateClusterByActiveTypes();
    
  } else {
    if (markerClusterGroup.value && map.hasLayer(markerClusterGroup.value)) {
      map.removeLayer(markerClusterGroup.value);
    }
    Object.entries(typeLayerGroups).forEach(([type, group]) => {
      if (activeTypes.value.includes(type)) {
        if (!map.hasLayer(group)) {
          map.addLayer(group);
        }
      }
    });
  }
}

function updateClusterByActiveTypes() {
  if (!markerClusterGroup.value || !isClusterEnabled.value) return;
  markerClusterGroup.value.clearLayers();
  if (activeTypes.value.length === 0) {
    if (map.hasLayer(markerClusterGroup.value)) {
      map.removeLayer(markerClusterGroup.value);
    }
    return;
  }
  if (!map.hasLayer(markerClusterGroup.value)) {
    map.addLayer(markerClusterGroup.value);
  }
  activeTypes.value.forEach(type => {
    if (typeLayerGroups[type]) {
      typeLayerGroups[type].eachLayer(layer => {
        markerClusterGroup.value.addLayer(layer);
      });
    }
  });
}

async function refreshData() {
  isLoading.value = true;
  try {
    Object.keys(typeLayerGroups).forEach(k => {
      try { if (layersControl) layersControl.removeLayer(typeLayerGroups[k]); } catch {}
      try { map.removeLayer(typeLayerGroups[k]); } catch {}
      delete typeLayerGroups[k];
    });
    activeTypes.value = []; 
    if (markerClusterGroup.value) {
      map.removeLayer(markerClusterGroup.value);
      markerClusterGroup.value.clearLayers();
    }

    drawnItems.clearLayers();
    layerMap.clear();

    await loadExistingData();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรีเฟรชข้อมูล:', error);
    alert('เกิดข้อผิดพลาดในการรีเฟรชข้อมูล');
  } finally {
    isLoading.value = false;
  }
}
// ลบข้อมูลตามที่เลือก
async function deleteFeature(featureId, featureName) {
  const confirmDelete = confirm(`คุณต้องการลบ "${featureName}" หรือไม่?`);
  
  if (!confirmDelete) return;
  
  try {
    // console.log('กำลังลบข้อมูล ID:', featureId);
    
    const response = await axios.delete(`http://localhost:3000/api/geometries/${featureId}`);
    
    // console.log('ลบสำเร็จ:', response.data);
    
    // ลบออกจาก allFeatures array
    const featureIndex = allFeatures.value.findIndex(f => f.properties.id === featureId);
    if (featureIndex > -1) {
      allFeatures.value.splice(featureIndex, 1);
    }
    
  
    const layer = layerMap.get(featureId);
    if (layer) {
      map.removeLayer(layer); 
      layerMap.delete(featureId);
    }
    
    // ปิด info box ถ้ากำลังแสดงข้อมูลที่ถูกลบ
    if (selectedFeature.value && selectedFeature.value.properties.id === featureId) {
      selectedFeature.value = null;
    }
    
    alert(`ลบ "${featureName}" สำเร็จ!`);
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบ:', error);
    alert('เกิดข้อผิดพลาดในการลบข้อมูล');
  }
}

// ลบข้อมูลหลายรายการ bulk delete 
async function deleteMultipleFeatures(featureIds) {
  const confirmDelete = confirm(`คุณต้องการลบข้อมูล ${featureIds.length} รายการหรือไม่?`);
  
  if (!confirmDelete) return;
  
  try {
    // console.log('กำลังลบข้อมูลหลายรายการ:', featureIds);
    
    const response = await axios.delete('http://localhost:3000/api/geometries', {
      data: { ids: featureIds }
    });
    
    // console.log('ลบหลายรายการสำเร็จ:', response.data);
    
    allFeatures.value = allFeatures.value.filter(f => !featureIds.includes(f.properties.id));
    
    featureIds.forEach(id => {
      const layer = layerMap.get(id);
      if (layer) {
        map.removeLayer(layer);
        layerMap.delete(id);
      }
    });
    
    // ปิด info box ถ้ากำลังแสดงข้อมูลที่ถูกลบ
    if (selectedFeature.value && featureIds.includes(selectedFeature.value.properties.id)) {
      selectedFeature.value = null;
    }
    
    alert(`ลบข้อมูลสำเร็จ ${featureIds.length} รายการ!`);
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการลบหลายรายการ:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการลบข้อมูล';
    if (error.response) {
      errorMessage += `: ${error.response.data.message || error.response.statusText}`;
    }
    
    alert(errorMessage);
  }
}

// ลบข้อมูลจาก info box
async function deleteCurrentFeature() {
  if (!selectedFeature.value) return;
  
  const feature = selectedFeature.value;
  await deleteFeature(feature.properties.id, feature.properties.name);
}

onMounted(async () => {  
  initMap();
  await loadExistingData(); 
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

// function addEditButton(layer) {
//   console.log("Edit button logic here for layer", layer);
// }

function showInfo(rowData) {
  selectedFeature.value = rowData

  if (map && rowData.geometry?.coordinates) {
    const [lng, lat] = rowData.geometry.coordinates
    map.setView([lat, lng]) 
  }
}

function showEdit(feature) {
  if (!feature) {
    console.error('showEdit: feature is null or undefined');
    alert('ไม่พบข้อมูลที่ต้องการแก้ไข - feature is null');
    return;
  }
  
  if (!feature.properties) {
    console.error('showEdit: feature.properties is null or undefined');
    alert('ไม่พบข้อมูลที่ต้องการแก้ไข - properties is null');
    return;
  }

  try {
    editFeature.value = feature;
    editFormData.value = {
      name: feature.properties.name || '',
      description: feature.properties.description || '',
      address: feature.properties.address || '',
      type: feature.properties.type || '',
      remark: feature.properties.remark || '',
      etc: feature.properties.etc || ''
    };
    
    showEditDialog.value = true;
  } catch (error) {
    console.error('Error in showEdit:', error);
    alert('เกิดข้อผิดพลาดในการเปิดฟอร์มแก้ไข: ' + error.message);
  }
}

async function submitEdit() {
  try {
    if (!editFeature.value) {
      console.error('editFeature.value is null or undefined');
      throw new Error('ไม่พบข้อมูลที่ต้องการแก้ไข - editFeature is null');
    }
    
    if (!editFeature.value.properties) {
      console.error('editFeature.value.properties is null or undefined');
      throw new Error('ไม่พบข้อมูลที่ต้องการแก้ไข - properties is null');
    }
    
    if (!editFeature.value.properties.id) {
      console.error('editFeature.value.properties.id is null or undefined');
      throw new Error('ไม่พบ ID ของข้อมูลที่ต้องการแก้ไข');
    }

    const id = editFeature.value.properties.id;
    const payload = { 
      name: editFormData.value.name,
      description: editFormData.value.description,
      address: editFormData.value.address,
      feature_type: editFormData.value.type,
      remark: editFormData.value.remark,
      etc: editFormData.value.etc
    };
    
    if (!payload.name || !payload.description || !payload.address || !payload.type) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }

    const response = await axios.put(`http://localhost:3000/api/geometries/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const currentTime = new Date().toISOString();
    const featureIndex = allFeatures.value.findIndex(f => f.properties.id === id);
    if (featureIndex !== -1) {
      Object.assign(allFeatures.value[featureIndex].properties, payload);
      allFeatures.value[featureIndex].properties.updated_at = currentTime;
    }
    if (selectedFeature.value && selectedFeature.value.properties.id === id) {
      Object.assign(selectedFeature.value.properties, payload);
      selectedFeature.value.properties.updated_at = currentTime;
    }
    if (layerMap.has(id)) {
      const layer = layerMap.get(id);
      if (layer && !layer.feature) {
        layer.feature = {
          type: 'Feature',
          properties: {},
          geometry: null
        };
      }
      
      if (layer && layer.feature) {
        Object.assign(layer.feature.properties, payload);
        layer.feature.properties.updated_at = currentTime;
        
        const props = layer.feature.properties;
        layer.bindPopup(`
          <div>
            <h4>${props.name}</h4>
            <p><strong>ID:</strong> ${props.id}</p>
            <p><strong>คำอธิบาย:</strong> ${props.description}</p>
            <p><strong>ประเภท:</strong> ${displayTypeName(props.type)}</p>
            <p><strong>ที่อยู่:</strong> ${props.address}</p>
            ${props.remark ? `<p><strong>หมายเหตุ:</strong> ${props.remark}</p>` : ''}
            ${props.etc ? `<p><strong>อื่นๆ:</strong> ${props.etc}</p>` : ''}
            <p><strong>แก้ไขเมื่อ:</strong> ${formatDate(props.updated_at)}</p>
          </div>
        `);
      }
    }

    showEditDialog.value = false;

    await nextTick();
    
    alert('แก้ไขข้อมูลสำเร็จ');
  } catch (error) {
    console.error('Error updating feature:', error);
    

    let errorMessage = 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล';
    
    if (error.response) {
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    `Server Error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
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
  const id = feature.properties.id;
  const layer = layerMap.get(id);
  if (!layer) return;
  if (layer.getBounds) {
    map.fitBounds(layer.getBounds());
  } else if (layer.getLatLng) {
    map.setView(layer.getLatLng(), 16);
  }
  if (layer.openPopup) {
    layer.openPopup();
  }
}

// Grouped Layer Control
function initGroupedLayerControl() {
  
  baseMaps.value = {
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
      maxZoom: 20, 
      attribution: "© OpenStreetMap" 
    }),
    "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { 
      maxZoom: 20, 
      attribution: "Esri" 
    }),
    "Topographic": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { 
      maxZoom: 20, 
      attribution: "© OpenTopoMap" 
    }),
    "Dark Mode": L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", { 
      maxZoom: 20, 
      attribution: "© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors" 
    })
  };

  wmsProvice = L.tileLayer.wms('https://www.deemap.com/special/gwc/service/wms', { 
    layers: 'Barge_Procession:Bankhai', 
    format: 'image/png8'
  });
  
  wmsLayer = L.tileLayer.wms('https://www.deemap.com/special/gwc/service/wms', { 
    layers: 'Barge_Procession:boundary_bankhai', 
    format: 'image/png8'
  });
  
  wmsSubdis = L.tileLayer.wms('https://www.deemap.com/special/gwc/service/wms', { 
    layers: 'Barge_Procession:boundary_community_bankhai', 
    format: 'image/png8'
  });

  
  const pointLayers = {};
  Object.keys(TYPE_COLORS).forEach(type => {
    const displayName = getTypeLabel(type);
    if (typeLayerGroups[type]) {
      pointLayers[displayName] = typeLayerGroups[type];
    }
  });

  
  const groupedOverlays = {
    "แผนที่ฐาน": baseMaps.value,
    "แผนที่ขอบเขต": {
      "ขอบเขตแผนที่บ้านค่าย": wmsProvice,
      "ขอบเขตบ้านค่าย": wmsLayer,
      "ขอบเขตชุทชน": wmsSubdis
    },
    "ชนิดของข้อมูล": pointLayers
  };

  if (layersControl) {
    map.removeControl(layersControl);
  }

  //grouped control 
  layersControl = L.control.groupedLayers({}, groupedOverlays, {
    collapsed: true,
    position: 'topright',
    groupCheckboxes: false,
    exclusiveGroups: ["แผนที่ฐาน"], 
    autoZIndex: true
  }).addTo(map);

  baseMaps.value.OpenStreetMap.addTo(map);

  setTimeout(() => {
    const layerContainer = layersControl.getContainer();
    layerContainer.addEventListener('mouseenter', () => {
      if (!layerContainer.classList.contains('leaflet-control-layers-expanded')) {
        layersControl.expand();
      }
    });
  }, 100);

  // Sync การเปิด/ปิด overlay กับ activeTypes
  map.on('overlayadd', (e) => {
    Object.entries(typeLayerGroups).forEach(([type, grp]) => {
      if (grp === e.layer) {
        if (!activeTypes.value.includes(type)) {
          activeTypes.value.push(type);
        }
        if (isClusterEnabled.value) {
          updateClusterByActiveTypes();
        }
      }
    });
  });
  
  map.on('overlayremove', (e) => {
    Object.entries(typeLayerGroups).forEach(([type, grp]) => {
      if (grp === e.layer) {
        activeTypes.value = activeTypes.value.filter(t => t !== type);
        if (isClusterEnabled.value) {
          updateClusterByActiveTypes();
        }
      }
    });
  });
}
function toggleLayerControl() {
  if (layersControl) {
    const container = layersControl.getContainer();
    if (container.classList.contains('leaflet-control-layers-expanded')) {
      layersControl.collapse();
    } else {
      layersControl.expand();
    }
  }
}

function initMap() {
  if (map) return;
  map = L.map("map").setView([12.781805321366827, 101.29280425205154], 16);


  const defaultBaseMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
    maxZoom: 20, 
    attribution: "© OpenStreetMap" 
  }).addTo(map);

  const customIcon = L.icon({
    iconUrl: require('@/assets/my-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  L.Marker.prototype.options.icon = customIcon



  drawnItems.addTo(map);
  
  const isEditAllowed = userRole.value === 'admin' || userRole.value === 'editor';
  
  map.pm.addControls({
    position: "topleft",
    drawMarker: isEditAllowed,
    drawCircle: isEditAllowed,
    drawPolyline: isEditAllowed,
    drawRectangle: isEditAllowed,
    drawPolyogr2ogrn: isEditAllowed,
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
  });

  map.pm.setLang('th', {
    tooltips: {
      placeMarker: 'คลิกเพื่อวางจุด',
      firstVertex: 'คลิกเพื่อเริ่มวาด',
      continueLine: 'คลิกเพิ่มจุดต่อไป',
      finishLine: 'ดับเบิลคลิกหรือคลิกจุดแรกเพื่อจบเส้น',
      finishPoly: 'คลิกจุดแรกหรือดับเบิลคลิกเพื่อปิดรูป',
      finishRect: 'คลิกเพื่อเสร็จสิ้นรูปสี่เหลี่ยม',
      finishCircle: 'ปล่อยเมาส์เพื่อสิ้นสุดวงกลม',
      placeCircleMarker: 'คลิกเพื่อวางวงกลม',
      placeText: 'คลิกเพื่อวางข้อความ'
    },
    actions: {
      finish: 'เสร็จสิ้น',
      cancel: 'ยกเลิก',
      removeLastVertex: 'ลบจุดล่าสุด'
    },
    buttons: {
      drawMarker: 'เพิ่มจุด',
      drawPolygon: 'วาดพื้นที่',
      drawPolyline: 'วาดเส้น',
      drawCircle: 'วาดวงกลม',
      drawRectangle: 'วาดสี่เหลี่ยม',
      editMode: 'แก้ไขรูป',
      dragMode: 'ย้ายรูป',
      cutPolygon: 'ตัดพื้นที่',
      removalMode: 'ลบรูป',
      rotateMode: 'หมุนรูป',
      oneBlock: 'โหมดบล็อกเดียว',
      measurementMode: 'วัดระยะ'
    }
  }, 'th');

  setTimeout(() => {
    const root = map.getContainer();
    const setTitle = (sel, txt) => {
      const el = root.querySelector(sel);
      if (el && el.parentElement) el.parentElement.title = txt;
    };
    setTitle('.leaflet-pm-icon-marker', 'เพิ่มจุด');
    setTitle('.leaflet-pm-icon-polyline', 'วาดเส้น');
    setTitle('.leaflet-pm-icon-polygon', 'วาดพื้นที่');
    setTitle('.leaflet-pm-icon-rectangle', 'วาดสี่เหลี่ยม');
    setTitle('.leaflet-pm-icon-circle', 'วาดวงกลม');
    setTitle('.leaflet-pm-icon-edit', 'แก้ไขรูป');
    setTitle('.leaflet-pm-icon-drag', 'ย้ายรูป');
    setTitle('.leaflet-pm-icon-cut', 'ตัดพื้นที่');
    setTitle('.leaflet-pm-icon-delete', 'ลบรูป');
    setTitle('.leaflet-pm-icon-rotate', 'หมุนรูป');
    setTitle('.leaflet-pm-icon-measurement', 'วัดระยะ');
  }, 0);


  // pm:create ดัก event เพื่อจัดการ layer เพื่อบันทึกข้อมูล
  map.on('pm:create', (e) => {
        const layer = e.layer;
        const shape = e.shape;
        
        //  กำหนดประเภท geometry
        let geometryType = '';
        switch(shape) {
          case 'Marker':
            geometryType = 'Point';
            break;
          case 'Line':
            geometryType = 'LineString';
            break;
          case 'Polygon':
            geometryType = 'Polygon';
            break;
          case 'Rectangle':
            geometryType = 'Polygon';
            break;
          case 'Circle':
            geometryType = 'Circle';
            break;
          default:
            geometryType = 'Unknown';
        }
        
        // console.log('Somebody drew :', {
        //   shape: shape,
        //   geometryType: geometryType,
        //   layer: layer
        // });

        // จัดการแต่ละประเภท layer
        if (e.layer instanceof L.Marker) {
          const latlng = e.layer.getLatLng();
          map.removeLayer(e.layer);
          const marker = L.marker(latlng, { icon: customIcon }).addTo(map);
          drawnItems.addLayer(marker);
          
          //   Confirmation Dialog 
          showConfirmation(marker, geometryType);
        }

        else if (e.layer instanceof L.Polyline && !(e.layer instanceof L.Polygon)) {
          const latlngs = e.layer.getLatLngs();
          let distance = 0;
          for (let i = 0; i < latlngs.length - 1; i++) {
            distance += latlngs[i].distanceTo(latlngs[i + 1]);
          }
          
          // เพิ่ม popup ชั่วคราว
          e.layer.bindPopup(`ระยะทาง: ${distance.toLocaleString()} เมตร`);
          drawnItems.addLayer(e.layer);
          
          showConfirmation(e.layer, geometryType);
        }

        else if (e.layer instanceof L.Polygon) {
          e.layer.pm.enable();
          drawnItems.addLayer(e.layer);
          
          //  แสดง Confirmation Dialog
          showConfirmation(e.layer, geometryType);
        }

        
        else {
          drawnItems.addLayer(e.layer);
          showConfirmation(e.layer, geometryType);
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
    title: "ตำแหน่งปัจจุบัน",
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
    title: "ถ่ายภาพหน้าจอแผนที่",
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
    title: "เพิ่มข้อความ",
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
  title: "นำเข้าข้อมูล GeoJSON",
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
}

function initMapWithGroupedControl() {
  Object.keys(TYPE_COLORS).forEach(type => {
    if (!typeLayerGroups[type]) {
      typeLayerGroups[type] = L.layerGroup();
    }
  });

  initGroupedLayerControl();
}

onMounted(async () => {
  initMap();
  await loadExistingData();
  setTimeout(() => {
    initMapWithGroupedControl();
  }, 1000);
});

const isMapExpanded = ref(false);

async function toggleMapExpand(){
  isMapExpanded.value = !isMapExpanded.value;
  await nextTick();
  if (map) {
    map.invalidateSize(true);
  }
}
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
height: calc(100vh - 105px); 
box-sizing: border-box;
position: relative; 

}

.left-column {
flex: 7; 
background-color: #f9f9f9;
border-radius: 8px;
padding: 20px;
overflow: auto;
}

.right-column {
flex: 3;
background-color: #f9f9f9;
padding: 20px;
border-radius: 8px;
overflow: auto;
position: relative; /* allow absolute children like expand button & coord box */
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
  background-color: hsl(0, 0%, 100%);
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
  margin-top: 1rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-header {
  /* background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); */
  background: #007bff;
  color: white;
  padding: 1.2rem 1.5rem;
  margin: 0;
}

.info-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-content {
  padding: 0;
}

.info-list {
  margin: 0;
  padding: 0;
}

.info-row {
  display: flex;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.info-row:hover {
  background-color: #f8f9fa;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row dt {
  flex: 0 0 120px;
  font-weight: 600;
  color: #495057;
  margin: 0;
  padding-right: 1rem;
  font-size: 0.9rem;
}

.info-row dd {
  flex: 1;
  margin: 0;
  color: #212529;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* .info-row dd.highlight {
  font-weight: 600;
  color: #007bff;
  font-size: 1.05rem;
} */

.info-row dd.coordinates {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #6c757d;
}

.info-row dd.date {
  color: #6c757d;
  font-size: 0.85rem;
}

.info-row dd.remark {
  font-style: italic;
  color: #6c757d;
}

.type-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border-radius: 2px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-back, .btn-exten {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-exten {
  background: #007bff;
  color: white;
}

.btn-exten:hover {
  background: #0056b3;
  transform: translateY(-1px);
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
  padding: 1.5rem;
  border-radius: 12px;
  width: 95vw;
  height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: fadeInScale 0.3s ease-out;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
}

.form-container form {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem 1.5rem;
  align-content: start;
  overflow: hidden;
  min-height: 0;
}

.form-group {
  margin-bottom: 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-buttons {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.form-info {
  grid-column: 1 / -1;
  margin-bottom: 0.5rem;
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
  padding: 0.6rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  min-height: 42px;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
  max-height: 80px;
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

@media (max-width: 768px) {
  .form-container {
    width: 98vw;
    height: 95vh;
    padding: 1rem;
  }
  
  .form-container form {
    grid-template-columns: 1fr;
    grid-gap: 1rem;
  }
  
  .form-group.full-width {
    grid-column: 1;
  }
  
  .form-buttons {
    grid-column: 1;
    flex-direction: column;
  }
  
  .form-info {
    grid-column: 1;
  }
}

.form-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.form-buttons .p-button {
  min-width: 100px;
  padding: 0.6rem 1.2rem;
  font-size: 14px;
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

:deep(.refresh-btn.p-button:hover) {
  background-color: #e0e0e0 !important;
  border-color: #ffffff !important;
}

.map-expanded {
  position: fixed !important;
  top: 103px; 
  left: 0;
  width: 100vw !important;
  height: calc(100vh - 120px) !important;
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

::v-deep(.marker-cluster-small) {
  background-color: rgba(94, 186, 252, 0.6);
  border: 2px solid #5ebafc;
}

::v-deep(.marker-cluster-small div) {
  background-color: #5ebafc;
  border-radius: 20px;
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  font-size: 12px;
  line-height: 30px;
  color: white;
  font-weight: bold;
}

::v-deep(.marker-cluster-medium) {
  background-color: rgba(35, 125, 238, 0.6);
  border: 2px solid #237dee;
}

::v-deep(.marker-cluster-medium div) {
  background-color: #237dee;
  border-radius: 25px;
  width: 40px;
  height: 40px;
  margin-left: 0px;
  margin-top: 0px;
  text-align: center;
  font-size: 13px;
  line-height: 40px;
  color: white;
  font-weight: bold;
}

::v-deep(.marker-cluster-large) {
  background-color: rgba(28, 82, 177, 0.6);
  border: 2px solid #1c52b1;
}

::v-deep(.marker-cluster-large div) {
  background-color: #1c52b1;
  border-radius: 35px;
  width: 50px;
  height: 50px;
  margin-left: -5px;
  margin-top: -5px;
  text-align: center;
  font-size: 14px;
  line-height: 50px;
  color: white;
  font-weight: bold;
}

::v-deep(.toggle-cluster-btn) {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0iIzMzNyIvPgo8Y2lyY2xlIGN4PSI2IiBjeT0iNiIgcj0iMiIgZmlsbD0iIzMzNyIvPgo8Y2lyY2xlIGN4PSIxOCIgY3k9IjYiIHI9IjIiIGZpbGw9IiMzMzciLz4KPGNpcmNsZSBjeD0iNiIgY3k9IjE4IiByPSIyIiBmaWxsPSIjMzM3Ii8+CjxjaXJjbGUgY3g9IjE4IiBjeT0iMTgiIHI9IjIiIGZpbGw9IiMzMzciLz4KPC9zdmc+');
  background-size: 70%;
  background-repeat: no-repeat;
  background-position: center;
}

::v-deep(.marker-cluster) {
  transition: all 0.3s ease;
}

::v-deep(.marker-cluster:hover) {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

::v-deep(.cluster-with-type) {
  background: none !important;
  border: none !important;
}

::v-deep(.cluster-icon-container) {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

::v-deep(.cluster-icon-image) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

::v-deep(.cluster-color-dot) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

::v-deep(.cluster-count) {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  min-width: 20px;
  padding: 0 2px;
}

</style>



