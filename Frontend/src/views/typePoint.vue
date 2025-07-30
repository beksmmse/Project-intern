<template>
  <div>
    <div class="container">
      <div class="left-column">
        <div v-if="!selectedFeature">
          <div style="margin-bottom: 1em; display: flex; gap: 10px; align-items: center;">
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
            class="striped-table"
            dataKey="properties.id"
            :rows="10"
            scrollable
            @row-click="onRowClick"
            style="cursor: pointer;"
            tableStyle="min-width: 50rem"
          >
            <Column field="properties.id" header="ID" sortable style="min-width: 2rem" />
            <Column field="properties.name" header="Name" sortable style="min-width: 10rem" />
            <Column field="properties.description" header="Description" sortable style="min-width: 10rem" />
            <Column field="properties.address" header="Address" sortable style="min-width: 12rem" />
            <Column header="" style="min-width: 10rem"> 
                <template #body="slotProps">
                <div style="display: flex; gap: 5px; align-items: center; justify-content: center;" class="action-buttons">
                    <Button
                    @click="showInfo(slotProps.data)"
                    severity="info"
                    size="small"
                    >
                    ลายละเอียด
                    </Button>

                    <Button
                    @click="showEdit(slotProps.data)"
                    severity="warning"
                    size="small"
                    >
                    <i class="pi pi-pencil action-edit" style="margin-top: 3px;"></i>
                    </Button>

                    <Button
                    @click="deleteFeature(slotProps.data.properties.id, slotProps.data.properties.name)"
                    severity="danger"
                    size="small"
                    >
                    <i class="pi pi-trash action-delete" style="color: red; margin-top: 3px;"></i>
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
            <!-- <Button @click="deleteCurrentFeature" severity="danger">
              <i class="pi pi-trash"></i> Delete
            </Button>
            <Button @click="showEdit(selectedFeature)" class="btn-edit">Edit</Button> -->
          </div>

          <h3>รายละเอียด</h3>
          <p><strong>ID:</strong> {{ selectedFeature.properties.id }}</p>
          <p><strong>Name:</strong> {{ selectedFeature.properties.name }}</p>
          <p><strong>Description:</strong> {{ selectedFeature.properties.description }}</p>
          <p><strong>Address:</strong> {{ selectedFeature.properties.address }}</p>
          <p><strong>create_at:</strong> {{ selectedFeature.properties.created_at }}</p>
          <p><strong>update_at:</strong> {{ selectedFeature.properties.update_at }}</p>
          <p><strong>type:</strong> {{ selectedFeature.properties.type }}</p>
          <p><strong>coordinates:</strong> {{ selectedFeature.properties.coordinates }}</p>
          <p><strong>SRID:</strong> {{ selectedFeature.properties.srid }}</p>
        </div>
      </div>

      <div class="right-column" id="map">
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
              placeholder="กรุณากรอกคำอธิบาย"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>ที่อยู่:</label>
            <input 
              type="text"
              v-model="editFormData.address"
              placeholder="กรุณากรอกที่อยู่"
            />
          </div>
          <div class="form-group">
            <label>ประเภท:</label>
            <select v-model="editFormData.type">
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
import { ref, onMounted, computed} from 'vue'
import html2canvas from 'html2canvas'
import L from 'leaflet'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import "leaflet/dist/leaflet.css";
import axios from 'axios';


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
  geometryType: ''
});


const showEditDialog = ref(false)
const editFeature = ref(null)
const editFormData = ref({
  name: '',
  description: '',
  address: '',
  type: ''
})


//เก็บ layers ที่ยังไม่มีข้อมูล (สำหรับ double click)
const pendingLayers = new Map();

let map;

const filteredFeatures = computed(() => {
  if (!searchText.value.trim()) return allFeatures.value;
  const q = searchText.value.toLowerCase();
  return allFeatures.value.filter(f =>
    f.id?.toString().includes(q) ||
    f.properties.name?.toLowerCase().includes(q) ||
    f.properties.description?.toLowerCase().includes(q) ||
    f.properties.address?.toLowerCase().includes(q)
  );
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
  
  // เก็บ layer ไว้ใน pending เพื่อให้ double click ได้ทีหลัง
  const layerId = Date.now(); // สร้าง ID unique
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
  
  //double-click event listener
  currentDrawingLayer.value.on('dblclick', () => {
    const pendingData = pendingLayers.get(layerId);
    if (pendingData) {
      openDataForm(pendingData.layer, pendingData.geometryType);
      pendingLayers.delete(layerId); // ลบออกจาก pending
    }
  });
  
  //  เพิ่ม global function สำหรับปุ่มใน popup
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
    geometryType: ''
  };
}


//บันทึกข้อมูล
async function saveDrawingData() {
  if (!currentDrawingLayer.value) return;
  
  try {
    // สร้าง GeoJSON จาก layer ที่วาด
    const geoJsonData = currentDrawingLayer.value.toGeoJSON();
    
    // เตรียมข้อมูลสำหรับส่งไป API ตามโครงสร้าง table layers
    const layerData = {
      organization_id: 1, 
      name: formData.value.name,
      description: formData.value.description,
      geometry_type: geoJsonData.geometry.type, // Point, LineString, Polygon, etc.
      srid: 4326, // EPSG:4326 (WGS84)
      properties_schema: {
        type: formData.value.type,
        address: formData.value.address,
        created_at: new Date().toISOString()
      },
      created_by_user_id: 1, // ปรับตาม user ที่ login
      address: formData.value.address,
      geometry: geoJsonData.geometry // GeoJSON geometry object
    };
    
    console.log('prepare DB', layerData);
    
    // ส่งข้อมูลไป API
    const response = await axios.post('http://localhost:3000/api/geometries', layerData);
    
    console.log('Receive:', response.data);
    
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
        type: formData.value.type,
        address: formData.value.address,
        created_at: savedData.created_at,
        coordinates: JSON.stringify(geoJsonData.geometry.coordinates)
      }
    };
    
    // เพิ่มข้อมูลใหม่เข้าไปใน allFeatures array (ไว้ด้านบนสุด)
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
    
    //  เพิ่ม click event สำหรับ layer ที่เพิ่งบันทึก
    currentDrawingLayer.value.on('click', () => {
      selectedFeature.value = newFeature;
      console.log('คลิกที่ layer:', newFeature);
    });
    
    alert('บันทึกข้อมูลสำเร็จ!');
    closeDataForm();
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
    
    let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    if (error.response) {
      // Server ตอบกลับมาพร้อม error status
      errorMessage += `: ${error.response.data.message || error.response.statusText}`;
    } else if (error.request) {
      // ไม่สามารถเชื่อมต่อกับ server ได้
      errorMessage += ': ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }
    
    alert(errorMessage);
  }
}

//โหลดข้อมูลจาก API 
async function loadExistingData() {
  try {
    // console.log('กำลังโหลดข้อมูลจาก API');
    
    const response = await axios.get('http://localhost:3000/api/point');
    const data = response.data;
    console.log('ข้อมูลจาก API:', data);
    
    // แปลงข้อมูลจาก API เป็น GeoJSON features
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
        srid: item.properties.srid || 4326 // ใช้ค่า default ถ้าไม่มี
    }
    }));
    
    // console.log(' API to geojson', allFeatures.value);
    
    // เพิ่ม layers ลงในแผนที่
    allFeatures.value.forEach(feature => {
      const layer = L.geoJSON(feature, {
        onEachFeature: function(feature, layer) {
          // เพิ่ม popup
          layer.bindPopup(`
            <div>
              <h4>${feature.properties.name}</h4>
              <p><strong>ID:</strong> ${feature.properties.id}</p>
              <p><strong>คำอธิบาย:</strong> ${feature.properties.description}</p>
              <p><strong>ประเภท:</strong> ${feature.properties.type}</p>
              <p><strong>ที่อยู่:</strong> ${feature.properties.address}</p>
              <p><strong>วันที่สร้าง:</strong> ${new Date(feature.properties.created_at).toLocaleDateString('th-TH')}</p>
            </div>
          `);
          
          // เพิ่ม click event สำหรับแสดงข้อมูลใน info box
          layer.on('click', () => {
            selectedFeature.value = feature;
            console.log('คลิกที่ layer เก่า:', feature);
          });
        }
      });
      
      // เพิ่มเข้าไปใน drawnItems และ layerMap
      drawnItems.addLayer(layer);
      layerMap.set(feature.properties.id, layer);
    });
    
    // console.log(`โหลดข้อมูลสำเร็จ: ${allFeatures.value.length} รายการ`);
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
    // ไม่แสดง alert เพราะอาจจะยังไม่มีข้อมูล
  }

}

// รีเฟรชข้อมูล
async function refreshData() {
  isLoading.value = true;
  try {
    // console.log('กำลังรีเฟรชข้อมูล');
    
    // เคลียร์ layers เก่าออกจากแผนที่
    allFeatures.value.forEach(feature => {
      const layer = layerMap.get(feature.properties.id);
      if (layer) {
        drawnItems.removeLayer(layer);
      }
    });
    
    layerMap.clear();
    await loadExistingData();
    // เอาไว้เช็คว่าโหลดเสร๋จมั้ย
    // console.log('รีเฟรชข้อมูลสำเร็จ');
    
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
    console.log('กำลังลบข้อมูล ID:', featureId);
    
    const response = await axios.delete(`http://localhost:3000/api/geometries/${featureId}`);
    
    console.log('ลบสำเร็จ:', response.data);
    
    // ลบออกจาก allFeatures array
    const featureIndex = allFeatures.value.findIndex(f => f.properties.id === featureId);
    if (featureIndex > -1) {
      allFeatures.value.splice(featureIndex, 1);
    }
    
    // ลบ layer ออกจากแผนที่
    const layer = layerMap.get(featureId);
    if (layer) {
      drawnItems.removeLayer(layer);
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
    console.log('กำลังลบข้อมูลหลายรายการ:', featureIds);
    
    const response = await axios.delete('http://localhost:3000/api/geometries', {
      data: { ids: featureIds }
    });
    
    console.log('ลบหลายรายการสำเร็จ:', response.data);
    
    // ลบออกจาก allFeatures array
    allFeatures.value = allFeatures.value.filter(f => !featureIds.includes(f.properties.id));
    
    // ลบ layers ออกจากแผนที่
    featureIds.forEach(id => {
      const layer = layerMap.get(id);
      if (layer) {
        drawnItems.removeLayer(layer);
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
  await loadExistingData(); // โหลดข้อมูลที่มีอยู่แล้ว
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

    // อัปเดตข้อมูลบนจอ ไม่ต้อง reload ทั้งหมด
    Object.assign(editFeature.value.properties, payload);

    //  selectedFeature ใน info box ด้วย
    if (selectedFeature.value && selectedFeature.value.properties.id === id) {
      Object.assign(selectedFeature.value.properties, payload);
    }

    showEditDialog.value = false;
    alert('แก้ไขข้อมูลสำเร็จ');
  } catch (error) {
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

//Load Basemap 
function initMap() {
  if (map) return;
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

  L.Marker.prototype.options.icon = customIcon


  axios.get('http://localhost:3000/api/Point')

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
            selectedFeature.value = feature;
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

      //  แก้ไข pm:create event ใหม่
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
        
        console.log('Somebody drew :', {
          shape: shape,
          geometryType: geometryType,
          layer: layer
        });

        // จัดการแต่ละประเภท layer
        if (e.layer instanceof L.Marker) {
          const latlng = e.layer.getLatLng();
          map.removeLayer(e.layer);
          const marker = L.marker(latlng, { icon: customIcon }).addTo(map);
          drawnItems.addLayer(marker);
          
          //  แสดง Confirmation Dialog แทนการเปิดฟอร์มทันที
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
          
          //  แสดง Confirmation Dialog
          showConfirmation(e.layer, geometryType);
        }

        else if (e.layer instanceof L.Polygon) {
          e.layer.pm.enable();
          drawnItems.addLayer(e.layer);
          
          //  แสดง Confirmation Dialog
          showConfirmation(e.layer, geometryType);
        }

        // สำหรับประเภทอื่นๆ
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
    
          onMounted(async () => {
  initMap();
  await loadExistingData();
  

})};


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

/* Custom text label styling */
.custom-text-label {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Popup edit styling */
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

/* ⭐ Confirmation Dialog Styles */
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

/* Form Container Styles */
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
  height: calc(100vh - 70px); 
  z-index: 9999;
  background: white;
  overflow: auto;
padding: 1rem 2rem;
}

.hide-map {
  display: none !important;
}

.container.fullscreen-mode {
  display: block !important; /* ปิด flex */
}






</style>


