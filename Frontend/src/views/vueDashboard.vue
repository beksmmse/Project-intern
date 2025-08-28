<template>
    <div class="dashboard-container">
      <!-- <h1 class="dashboard-title"></h1> -->
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-controls">
          <div class="filter-group">
            <label>ค้นหาข้อมูล</label>
            <div class="date-range">
              <input type="date" v-model="dateFrom" />
              <span>ถึง</span>
              <input type="date" v-model="dateTo" />
            </div>
          </div>
          
          <div class="filter-group">
            <label>ประเภทของข้อมูล :</label>
            <select v-model="selectedGeometryType" @change="onGeometryTypeChange">
              <option value="">ทั้งหมด</option>
              <option value="Point">ตำแหน่ง</option>
              <option value="LineString">เส้นทาง</option>
              <option value="Polygon">ขอบเขต</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>ชนิดของข้อมูล :</label>
            <select v-model="selectedFeatureType" :disabled="!availableFeatureTypes.length">
              <option value="">{{ availableFeatureTypes.length ? 'ทั้งหมด' : 'ไม่มีข้อมูล' }}</option>
              <option 
                v-for="type in availableFeatureTypes" 
                :key="type.value" 
                :value="type.value"
                :disabled="type.count === 0"
                :class="{ 'disabled-option': type.count === 0 }"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
            <!-- <div v-if="filteredFeatures.length === 0" class="no-data">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>
            <div class="filter-result-count">
              แสดงผลลัพธ์ทั้งหมด {{ filteredFeatures.length }} รายการ
            </div> -->
          <div class="filter-buttons">
            <!-- <Button @click="applyFilters" severity="primary" size="small" class="btn-apply">
               <i class="pi pi-filter"></i> ยืนยัน
            </Button> -->
            <Button @click="resetFilters" severity="secondary" size="small" class="btn-reset">
              <!-- <i class="pi pi-refresh"></i>  --> รีเช็ต
            </Button>
            <template v-if="userRole === 'admin'">
              <Button @click="exportData" severity="success" size="small" class="btn-export">
                <!-- <i class="pi pi-download"></i>  --> ส่งออก CSV 
              </Button>
            </template>
          </div>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card">
          <div class="card-header">
            <h3>ข้อมูลทั้งหมด</h3>
            <!-- <i class="pi pi-map"></i> -->
          </div>
          <div class="card-value">{{ totalFeatures }}</div>
            <div class="card-percentage">
              {{ totalGeometryPercentage }} %
            </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>ตำแหน่ง</h3>
            <!-- <i class="pi pi-map-marker"></i> -->
          </div>
          <div class="card-value">{{ geometryStats.Point || 0 }}</div>
          <div class="card-percentage">{{ getPercentage('Point') }} %</div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>เส้นทาง</h3>
            <!-- <i class="pi pi-minus"></i> -->
          </div>
          <div class="card-value">{{ geometryStats.LineString || 0 }}</div>
          <div class="card-percentage">{{ getPercentage('LineString') }} %</div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>ขอบเขต</h3>
            <!-- <i class="pi pi-stop"></i> -->
          </div>
          <div class="card-value">{{ geometryStats.Polygon || 0 }}</div>
          <div class="card-percentage">{{ getPercentage('Polygon') }} %</div>
        </div>
      </div>
  
      <!-- Charts Section -->
      <div class="charts-section">
        <!-- First Row: Geometry Type Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>ประเภทของข้อมูล</h3>
            <Button @click="refreshChart('geometry')" severity="info" size="small">
              <i class="fas fa-sync-alt"></i>
            </Button>
          </div>
          <div class="chart-container">
            <Chart type="pie" :data="geometryChartData" :options="geometryChartOptions" class="chart" />
          </div>
          <div class="chart-legend">
            <!-- <div v-for="(value, key) in geometryStats" :key="key" class="legend-item">
              <span class="legend-color" :style="{ backgroundColor: getGeometryColor(key) }"></span>
              <span>{{ key }}: {{ value }}</span>
            </div> -->
          </div>
        </div>
        
        <!-- Feature Type Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>ชนิดของข้อมูล</h3>
            <Button @click="refreshChart('type')" severity="info" size="small">
              <i class="fas fa-sync-alt"></i>
            </Button>
          </div>
          <div class="chart-container">
            <Chart type="bar" :data="typeChartData" :options="typeChartOptions" class="chart" />
          </div>
          <div class="chart-legend">
            <!-- <div v-for="(value, key) in typeStats" :key="key" class="legend-item">
              <span class="legend-color" :style="{ backgroundColor: getTypeColor(key) }"></span>
              <span>{{ key }}: {{ value }}</span>
            </div> -->
          </div>
        </div>
        
        <!-- Map showing filtered features -->
        <div class="chart-card">
          <div class="chart-header">
          </div>
          <div style="height:300px; width:100%;">
            <div id="dashboard-map" style="height:100%; width:100%; border-radius:8px;"></div>
          </div>
        </div>
      </div>
      <!-- Monthly Creation Chart - Full Width -->
      <div class="chart-card chart-full-width">
        <div class="chart-header">
          <h3>สถิติการสร้างข้อมูลประจำเดือน</h3>
          <div class="chart-controls">
            <select v-model="monthlyChartType">
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
            <Button @click="refreshChart('monthly')" severity="info" size="small">
              <i class="fas fa-sync-alt"></i>
            </Button>
          </div>
        </div>
        <div class="chart-container">
          <Chart :type="monthlyChartType" :data="monthlyChartData" :options="barChartOptions" class="chart" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch, nextTick } from "vue";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Fix Leaflet marker icon path (for Vite/Vue)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Set default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
  let dashboardMap = null;
  let dashboardMarkers = [];
  import Chart from 'primevue/chart';
  import Button from 'primevue/button';
  import axios from 'axios';
  
  // Reactive data
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
  const allFeatures = ref([]);
  const geometryChartData = ref();
  const typeChartData = ref();
  const monthlyChartData = ref();
  const geometryChartOptions = ref();
  const typeChartOptions = ref();
  const barChartOptions = ref();
  const isLoading = ref(false);
  const dateFrom = ref('');
  const dateTo = ref('');
  const selectedGeometryType = ref('');
  const selectedFeatureType = ref('');
  const searchText = ref('');
  
  // Chart controls
  const monthlyChartType = ref('bar');
  
  // Trend calculation
  const totalTrend = ref(0);
  
  // Computed properties
  const totalFeatures = computed(() => filteredFeatures.value.length);
  
  // Define the relationship between geometry types and feature types
  // ปรับ Point ให้รวม type ทุกชนิดที่มีจริงในข้อมูล
  const geometryFeatureMapping = computed(() => {
    // ดึง type ทั้งหมดที่มีในข้อมูล point จริงๆ
    const allTypes = new Set();
    allFeatures.value.forEach(f => {
      if (f.geometry.type === 'Point') {
        allTypes.add(f.properties.type || 'other');
      }
    });
    return {
      'Point': Array.from(allTypes),
      'LineString': ['route', 'other'],
      'Polygon': ['area', 'park', 'building', 'other']
    };
  });

  // Computed property for available feature types based on selected geometry type
  const availableFeatureTypes = computed(() => {
    let baseFiltered = allFeatures.value;
    // Apply date filters
    if (dateFrom.value) {
      baseFiltered = baseFiltered.filter(f => new Date(f.properties.created_at) >= new Date(dateFrom.value));
    }
    if (dateTo.value) {
      baseFiltered = baseFiltered.filter(f => new Date(f.properties.created_at) <= new Date(dateTo.value));
    }
    // Apply search filter
    if (searchText.value) {
      baseFiltered = baseFiltered.filter(f => 
        f.properties.name?.toLowerCase().includes(searchText.value.toLowerCase()) ||
        f.properties.description?.toLowerCase().includes(searchText.value.toLowerCase())
      );
    }
    // Filter by geometry type if selected
    if (selectedGeometryType.value) {
      baseFiltered = baseFiltered.filter(f => f.geometry.type === selectedGeometryType.value);
    }
    // allowedTypes: ถ้าเลือก Point ให้ใช้ type จริงทั้งหมด, อื่นๆ ใช้ mapping เดิม
    let allowedTypes = [];
    if (selectedGeometryType.value === 'Point') {
      allowedTypes = Array.from(new Set(allFeatures.value.filter(f => f.geometry.type === 'Point').map(f => f.properties.type || 'other')));
    } else if (selectedGeometryType.value) {
      allowedTypes = geometryFeatureMapping.value[selectedGeometryType.value] || [];
    } else {
      // รวม type ทุก geometry
      const allTypes = new Set();
      allFeatures.value.forEach(f => allTypes.add(f.properties.type || 'other'));
      allowedTypes = Array.from(allTypes);
    }
    // Count occurrences of each feature type
    const typeCounts = {};
    baseFiltered.forEach(feature => {
      const type = feature.properties.type || 'other';
      if (allowedTypes.includes(type)) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });
    // Convert to array with labels and counts
    return allowedTypes
      .map(type => ({
        value: type,
        label: getTypeLabel(type),
        count: typeCounts[type] || 0
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  });

  // Updated geometry type counts
  const geometryTypeCounts = computed(() => {
    let baseFiltered = allFeatures.value;
    
    if (dateFrom.value) {
      baseFiltered = baseFiltered.filter(f => new Date(f.properties.created_at) >= new Date(dateFrom.value));
    }
    
    if (dateTo.value) {
      baseFiltered = baseFiltered.filter(f => new Date(f.properties.created_at) <= new Date(dateTo.value));
    }

    if (searchText.value) {
      baseFiltered = baseFiltered.filter(f => 
        f.properties.name?.toLowerCase().includes(searchText.value.toLowerCase()) ||
        f.properties.description?.toLowerCase().includes(searchText.value.toLowerCase())
      );
    }
    
    const types = {};
    baseFiltered.forEach(feature => {
      const type = feature.geometry.type;
      types[type] = (types[type] || 0) + 1;
    });
    
    return {
      total: baseFiltered.length,
      types
    };
  });

  // Updated feature type counts
  const featureTypeCounts = computed(() => {
    let baseFiltered = allFeatures.value;
    
    if (dateFrom.value) {
      baseFiltered = baseFiltered.filter(f => new Date(f.properties.created_at) >= new Date(dateFrom.value));
    }
    
    if (dateTo.value) {
      baseFiltered = baseFiltered.filter(f => new Date(f.properties.created_at) <= new Date(dateTo.value));
    }
    
    if (selectedGeometryType.value) {
      baseFiltered = baseFiltered.filter(f => f.geometry.type === selectedGeometryType.value);
    }

    if (searchText.value) {
      baseFiltered = baseFiltered.filter(f => 
        f.properties.name?.toLowerCase().includes(searchText.value.toLowerCase()) ||
        f.properties.description?.toLowerCase().includes(searchText.value.toLowerCase())
      );
    }
    
    return {
      total: baseFiltered.length,
      types: {}
    };
  });

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return !!(dateFrom.value || dateTo.value || selectedGeometryType.value || selectedFeatureType.value || searchText.value);
  });
  
  const geometryStats = computed(() => {
    const stats = {};
    filteredFeatures.value.forEach(feature => {
      const type = feature.geometry.type;
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  });

  const totalGeometryPercentage = computed(() => {
  const total = totalFeatures.value;
  const sum = (geometryStats.value.Point || 0)
            + (geometryStats.value.LineString || 0)
            + (geometryStats.value.Polygon || 0);
  return total > 0 ? Math.round((sum / total) * 100) : 0;
});
  
  const typeStats = computed(() => {
    const stats = {};
    filteredFeatures.value.forEach(feature => {
      const type = feature.properties.type || 'other';
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  });
  
  const filteredFeatures = computed(() => {
    let filtered = allFeatures.value;
    
    if (dateFrom.value) {
      filtered = filtered.filter(f => new Date(f.properties.created_at) >= new Date(dateFrom.value));
    }
    
    if (dateTo.value) {
      filtered = filtered.filter(f => new Date(f.properties.created_at) <= new Date(dateTo.value));
    }
    
    if (selectedGeometryType.value) {
      filtered = filtered.filter(f => f.geometry.type === selectedGeometryType.value);
    }
    
    if (selectedFeatureType.value) {
      filtered = filtered.filter(f => f.properties.type === selectedFeatureType.value);
    }

    if (searchText.value) {
      filtered = filtered.filter(f => 
        f.properties.name?.toLowerCase().includes(searchText.value.toLowerCase()) ||
        f.properties.description?.toLowerCase().includes(searchText.value.toLowerCase())
      );
    }
    
    return filtered;
  });
  
  // Handler for geometry type change
  function onGeometryTypeChange() {
    // Reset feature type when geometry type changes
    selectedFeatureType.value = '';
    
    // Show notification about available options
    if (selectedGeometryType.value) {
      const availableCount = availableFeatureTypes.value.length;
      console.log(`มีชนิดข้อมูลที่เข้ากันได้ ${availableCount} ประเภท`);
    }
  }

  function getGeometryLabel(key) {
    const labelMap = {
      'Point': 'ตำแหน่ง',
      'LineString': 'เส้นทาง',
      'Polygon': 'ขอบเขต'
    };
    return labelMap[key] || key;
  }
  
  function getTypeLabel(key) {
    const labelMap = {
      'landmark': 'สถานที่สำคัญ',
      'route': 'เส้นทาง',
      'area': 'พื้นที่',
      'building': 'อาคาร',
      'park': 'สวนสาธารณะ',
      'school': 'โรงเรียน',
      'hospital': 'โรงพยาบาล',
      'spotlight': 'สปอตไลท์',
      'fire_hydrant': 'หัวดับเพลิง',
      'signal_light': 'ไฟสัญญาณ',
      'swan_light': 'เสาหงษ์',
      'water_level': 'เครื่องตรวจสอบระดับน้ำ',
      'aed': 'เครื่องกระตุ้นหัวใจ',
      'pole22.5m': 'เสาไฟฟ้า 22.5 ม.',
      'pole12m': 'เสาไฟฟ้า 12 ม.',
      'pole8m': 'เสาไฟฟ้า 8 ม.',
      'road_light': 'เสาไฟฟ้าแสงสว่างขาเดียว',
      'road_sign': 'ป้ายซอย',
      'shrine': 'ศาลเจ้า',
      'temple': 'วัด',
      'store': 'ร้านค้า',
      'bin' : 'ถังขยะ',
      'other': 'อื่นๆ',
      'bridge':'สะพาน',
      'gas_station': 'ปั๊มน้ำมัน',
      'road': 'ถนน',
      'pipe': 'ท่อประปา',
      'electricity': 'สายไฟฟ้า',
      'districtOffice': 'สำนักงานเขต'

    };
    return labelMap[key] || key;
  }
  
  function getMonthLabel(monthString) {
    const [year, monthNum] = monthString.split('-');
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  }
  
  // Load data from API
  async function loadData() {
    isLoading.value = true;
    try {
      // Fetch all geometry types in parallel
      const [lineRes, pointRes, polygonRes] = await Promise.all([
        axios.get('http://localhost:3000/api/linestring'),
        axios.get('http://localhost:3000/api/point'),
        axios.get('http://localhost:3000/api/polygon')
      ]);

      // Normalize and merge all features
      const features = [];


      // Point (ตำแหน่ง)
      if (pointRes.data && Array.isArray(pointRes.data.features)) {
        features.push(...pointRes.data.features.map(item => ({
          type: 'Feature',
          geometry: { ...item.geometry, type: 'Point' },
          properties: {
            id: item.properties?.id || item.id,
            name: item.properties?.name || item.name || '',
            description: item.properties?.description || item.description || '',
            type: item.feature_type || item.properties?.type || 'landmark',
            address: item.properties?.address || item.address || '',
            created_at: item.properties?.created_at || item.created_at || '',
            updated_at: item.properties?.updated_at || item.updated_at || ''
          }
        })));
      }

      if (lineRes.data && Array.isArray(lineRes.data.features)) {
        features.push(...lineRes.data.features.map(item => ({
          type: 'Feature',
          geometry: { ...item.geometry, type: 'LineString' },
          properties: {
            id: item.properties?.id || item.id,
            name: item.properties?.name || item.name || '',
            description: item.properties?.description || item.description || '',
            type: item.feature_type || item.properties?.type || 'route',
            address: item.properties?.address || item.address || '',
            created_at: item.properties?.created_at || item.created_at || '',
            updated_at: item.properties?.updated_at || item.updated_at || ''
          }
        })));
      }

      if (polygonRes.data && Array.isArray(polygonRes.data.features)) {
        features.push(...polygonRes.data.features.map(item => ({
          type: 'Feature',
          geometry: { ...item.geometry, type: 'Polygon' },
          properties: {
            id: item.properties?.id || item.id,
            name: item.properties?.name || item.name || '',
            description: item.properties?.description || item.description || '',
            type: item.feature_type || item.properties?.type || 'area',
            address: item.properties?.address || item.address || '',
            created_at: item.properties?.created_at || item.created_at || '',
            updated_at: item.properties?.updated_at || item.updated_at || ''
          }
        })));
      }

      allFeatures.value = features;
      calculateTrend();
      updateCharts();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading data:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Calculate trend
  function calculateTrend() {
    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth - 1;
    
    const thisMonthCount = allFeatures.value.filter(f => 
      new Date(f.properties.created_at).getMonth() === thisMonth
    ).length;
    
    const lastMonthCount = allFeatures.value.filter(f => 
      new Date(f.properties.created_at).getMonth() === lastMonth
    ).length;
    
    if (lastMonthCount === 0) {
      totalTrend.value = 0;
    } else {
      totalTrend.value = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
    }
  }
  
  // Update all charts
  function updateCharts() {
    geometryChartData.value = setGeometryChartData();
    typeChartData.value = setTypeChartData();
    monthlyChartData.value = setMonthlyChartData();
  }
  
  // Geometry distribution chart
  const setGeometryChartData = () => {
    const stats = geometryStats.value;
    
    return {
      labels: Object.keys(stats).map(key => getGeometryLabel(key)),
      datasets: [
        {
          data: Object.values(stats),
          backgroundColor: Object.keys(stats).map(key => getGeometryColor(key)),
          hoverBackgroundColor: Object.keys(stats).map(key => getGeometryColor(key, true))
        }
      ]
    };
  };
  
  // Feature type distribution chart (no label, only type, unique color per type)
  const setTypeChartData = () => {
    const stats = typeStats.value;
    // Use Thai label for chart labels
    return {
      labels: Object.keys(stats).map(key => getTypeLabel(key)),
      datasets: [
        {
          label: 'จำนวนข้อมูล',
          data: Object.values(stats),
          backgroundColor: Object.keys(stats).map(key => getTypeColor(key)),
          hoverBackgroundColor: Object.keys(stats).map(key => getTypeColor(key, true))
        }
      ]
    };
  };
  
  // Monthly creation chart
  const setMonthlyChartData = () => {
    const documentStyle = getComputedStyle(document.body);
    const monthlyStats = {};
    
    filteredFeatures.value.forEach(feature => {
      const date = new Date(feature.properties.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthlyStats).sort().slice(-12);
    
    return {
      labels: sortedMonths.map(month => getMonthLabel(month)),
      datasets: [
        {
          label: 'จำนวนข้อมูลที่สร้าง',
          data: sortedMonths.map(month => monthlyStats[month] || 0),
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
          borderColor: documentStyle.getPropertyValue('--p-primary-700'),
          borderWidth: 2,
          tension: 0.4
        }
      ]
    };
  };
  
  function getGeometryColor(type, hover = false) {
    const colors = {
      'Point': hover ? '#06b6d4' : '#0891b2',
      'LineString': hover ? '#f97316' : '#ea580c',
      'Polygon': hover ? '#10b981' : '#059669',
      'MultiPoint': hover ? '#3b82f6' : '#2563eb',
      'MultiLineString': hover ? '#f59e0b' : '#d97706',
      'MultiPolygon': hover ? '#10b981' : '#059669'
    };
    return colors[type] || '#6b7280';
  }
  
  function getTypeColor(type, hover = false) {
    const colors = {
  'landmark': hover ? '#3b82f6' : '#2563eb',
  'route': hover ? '#eab308' : '#ca8a04',
  'area': hover ? '#8b5cf6' : '#7c3aed',
  'building': hover ? '#ec4899' : '#db2777',
  'park': hover ? '#10b981' : '#059669',
  'school': hover ? '#f97316' : '#ea580c',
  'hospital': hover ? '#ef4444' : '#dc2626',
  'spotlight': hover ? '#fbbf24' : '#f59e0b',
  'fire_hydrant': hover ? '#f87171' : '#ef4444',
  'signal_light': hover ? '#34d399' : '#10b981',
  'swan_light': hover ? '#a78bfa' : '#8b5cf6',
  'water_level': hover ? '#60a5fa' : '#3b82f6',
  'aed': hover ? '#fb7185' : '#f43f5e',
  'pole22_5m': hover ? '#facc15' : '#eab308',
  'pole12m': hover ? '#fde047' : '#facc15',
  'pole8m': hover ? '#fef08a' : '#fde047',
  'road_light': hover ? '#d1d5db' : '#9ca3af',
  'road_sign': hover ? '#fcd34d' : '#f59e0b',
  'shrine': hover ? '#fdba74' : '#fb923c',
  'temple': hover ? '#fbbf24' : '#f59e0b',
  'store': hover ? '#c084fc' : '#a855f7',
  'bin': hover ? '#4ade80' : '#22c55e',
  'bridge': hover ? '#94a3b8' : '#64748b',
  'gas_station': hover ? '#fb7185' : '#f43f5e',
  'parking': hover ? '#6366f1' : '#4f46e5',
  'atm': hover ? '#06b6d4' : '#0891b2',
  'cctv': hover ? '#374151' : '#1f2937',
  'road': hover ? '#52525b' : '#3f3f46',
  'pipe': hover ? '#0ea5e9' : '#0284c7',
  'electricity': hover ? '#fde047' : '#facc15',
  'districtOffice': hover ? '#7c2d12' : '#92400e',
  'other': hover ? '#6b7280' : '#4b5563'
};
    return colors[type] || '#6b7280';
  }
  
  // Utility functions
  function getPercentage(type) {
    const total = totalFeatures.value;
    const count = geometryStats.value[type] || 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  
  // Chart options สำหรับแต่ละ chart
  const setGeometryChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    return {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
            padding: 15,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          titleFont: {
            family: 'Sarabun, sans-serif'
          },
          bodyFont: {
            family: 'Sarabun, sans-serif'
          },
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed} รายการ`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  };

  const setTypeChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-surface-border');
    return {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: textColor,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          titleFont: { family: 'Sarabun, sans-serif' },
          bodyFont: { family: 'Sarabun, sans-serif' },
          callbacks: {
            label: function(context) {
              return `${context.dataset.label || ''}: ${context.parsed.y ?? context.parsed} รายการ`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          ticks: {
            color: textColor,
            font: {
              size: 11,
              family: 'Sarabun, sans-serif'
            }
          },
          grid: {
            color: surfaceBorder
          },
          title: {
            display: true,
            text: 'ชนิดของข้อมูล',
            color: textColor,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        },
        y: {
          display: true,
          ticks: {
            color: textColor,
            font: {
              size: 11,
              family: 'Sarabun, sans-serif'
            }
          },
          grid: {
            color: surfaceBorder
          },
          title: {
            display: true,
            text: 'จำนวน',
            color: textColor,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  };
  
  const setBarChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-surface-border');
    
    return {
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          titleFont: {
            family: 'Sarabun, sans-serif'
          },
          bodyFont: {
            family: 'Sarabun, sans-serif'
          },
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} รายการ`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 11,
              family: 'Sarabun, sans-serif'
            }
          },
          grid: {
            color: surfaceBorder
          },
          title: {
            display: true,
            text: 'เดือน',
            color: textColor,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 11,
              family: 'Sarabun, sans-serif'
            }
          },
          grid: {
            color: surfaceBorder
          },
          title: {
            display: true,
            text: 'จำนวน',
            color: textColor,
            font: {
              size: 12,
              family: 'Sarabun, sans-serif'
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  };
  
  // Filter functions
  function applyFilters() {
    updateCharts();
  }
  
  function resetFilters() {
    dateFrom.value = '';
    dateTo.value = '';
    selectedGeometryType.value = '';
    selectedFeatureType.value = '';
    searchText.value = '';
    updateCharts();
  }

  const latestUpdate = computed(() => {
    if (filteredFeatures.value.length === 0) return 'ไม่มีข้อมูล';
    const latest = filteredFeatures.value.reduce((a, b) =>
      new Date(a.properties.updated_at || a.properties.created_at) > new Date(b.properties.updated_at || b.properties.created_at) ? a : b
    );
    const date = latest.properties.updated_at || latest.properties.created_at;
    return formatTimeAgo(date);
  });
  
  function refreshChart(type) {
    updateCharts();
  }
  
  // Export functions
  function exportData() {
    const csvContent = [
      ['ชื่อ', 'ประเภท', 'รูปทรงเรขาคณิต', 'ที่อยู่', 'วันที่สร้าง'].join(','),
      ...filteredFeatures.value.map(f => [
        f.properties.name,
        getTypeLabel(f.properties.type),
        getGeometryLabel(f.geometry.type),
        f.properties.address,
        new Date(f.properties.created_at).toLocaleDateString('th-TH')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  // Watchers
  watch(filteredFeatures, () => {
    updateCharts();
  }, { deep: true });
  
  watch(monthlyChartType, () => {
    updateCharts();
  });

  // Watch for changes in geometry type to show helpful messages
  watch(selectedGeometryType, (newValue, oldValue) => {
    if (newValue !== oldValue && selectedFeatureType.value) {
      // Check if current feature type is still valid
      const isValidType = availableFeatureTypes.value.some(type => type.value === selectedFeatureType.value);
      if (!isValidType) {
        selectedFeatureType.value = '';
      }
    }
  });
  
  // Lifecycle
  function getColorById(id) {
    // Generate a color from id (hash to HSL)
    if (!id) return '#888';
    let hash = 0;
    for (let i = 0; i < String(id).length; i++) {
      hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h},70%,50%)`;
  }

  function renderDashboardMap() {
    nextTick(() => {
      if (!dashboardMap) {
        dashboardMap = L.map('dashboard-map').setView([13.75, 100.5], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(dashboardMap);
      }
      if (dashboardMap._layers) {
        Object.values(dashboardMap._layers).forEach(layer => {
          if (layer instanceof L.LayerGroup || layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
            try { dashboardMap.removeLayer(layer); } catch {}
          }
        });
      }
      dashboardMarkers = [];

      const pointLayer = L.layerGroup();
      const lineLayer = L.layerGroup();
      const polygonLayer = L.layerGroup();
      const layers = [];

      allFeatures.value.forEach(f => {
        const typeColor = getTypeColor(f.properties.type || 'other');
        if (f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length === 2) {
          const [lng, lat] = f.geometry.coordinates;
          const marker = L.marker([lat, lng]);
          marker.bindPopup(`<b>${f.properties.name || ''}</b><br>${getTypeLabel(f.properties.type)}`);
          pointLayer.addLayer(marker);
          dashboardMarkers.push(marker);
          layers.push(marker);
        }
        if (f.geometry.type === 'LineString' && Array.isArray(f.geometry.coordinates)) {
          let coords = f.geometry.coordinates;
          if (coords.length === 1 && Array.isArray(coords[0][0])) {
            coords = coords[0];
          }
          const latlngs = coords.map(coord => Array.isArray(coord) && coord.length === 2 ? [coord[1], coord[0]] : null).filter(Boolean);
          if (latlngs.length > 1) {
            const color = getColorById(f.properties.id);
            const polyline = L.polyline(latlngs, {color, weight: 4});
            polyline.bindPopup(`<b>${f.properties.name || ''}</b><br>${getTypeLabel(f.properties.type)}<br>ID: ${f.properties.id}`);
            lineLayer.addLayer(polyline);
            layers.push(polyline);
          }
        }
        if (f.geometry.type === 'Polygon' && Array.isArray(f.geometry.coordinates)) {
          let rings = f.geometry.coordinates;
          if (rings.length === 1 && Array.isArray(rings[0][0][0])) {
            rings = rings[0];
          }
          const leafletRings = rings.map(ring => ring.map(coord => Array.isArray(coord) && coord.length === 2 ? [coord[1], coord[0]] : null).filter(Boolean));
          if (leafletRings.length > 0 && leafletRings[0].length > 2) {
            const color = getColorById(f.properties.id);
            const polygon = L.polygon(leafletRings, {color, fillOpacity: 0.3});
            polygon.bindPopup(`<b>${f.properties.name || ''}</b><br>${getTypeLabel(f.properties.type)}<br>ID: ${f.properties.id}`);
            polygonLayer.addLayer(polygon);
            layers.push(polygon);
          }
        }
      });

      // Add overlays
      const overlays = {
        'ตำแหน่ง': pointLayer,
        'เส้นทาง': lineLayer,
        'ขอบเขต': polygonLayer
      };
      pointLayer.addTo(dashboardMap);
      lineLayer.addTo(dashboardMap);
      polygonLayer.addTo(dashboardMap);
      if (!dashboardMap._controlLayers) {
        dashboardMap._controlLayers = L.control.layers(null, overlays, {collapsed: false, position: 'topright'}).addTo(dashboardMap);
      } else {
        dashboardMap._controlLayers.remove();
        dashboardMap._controlLayers = L.control.layers(null, overlays, {collapsed: false, position: 'topright'}).addTo(dashboardMap);
      }

      if (layers.length > 0) {
        const group = L.featureGroup(layers);
        dashboardMap.fitBounds(group.getBounds(), {padding: [20,20]});
      }
    });
  }

  watch(filteredFeatures, () => {
    renderDashboardMap();
  });

  onMounted(async () => {
    await loadData();
    geometryChartOptions.value = setGeometryChartOptions();
    typeChartOptions.value = setTypeChartOptions();
    barChartOptions.value = setBarChartOptions();
    renderDashboardMap();
  });
  </script>
  
<style scoped>
.dashboard-container {
  padding: 0.5rem;
  width: 100%;
  max-width: 100%;
  margin: 0;
  background-color: var(--p-surface-ground);
  height: calc(100vh - 60px);
  box-sizing: border-box;
}
  
  .dashboard-title {
    text-align: center;
    margin-bottom: 1rem;
    color: var(--p-primary-color);
    font-size: 2rem;
    font-weight: 300;
  }
  
 .filters-section {
  width: 100%;
  margin: 0;
  padding: 0.5rem ;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
  
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .filter-group label {
    font-weight: 500;
    color: var(--p-text-color);
    font-size: 0.85rem;
    white-space: nowrap;
  }
  
  .date-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .date-range span {
    color: var(--p-text-color-secondary);
    font-size: 0.8rem;
  }
  
  .filter-group input,
  .filter-group select {
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 4px;
    font-size: 0.85rem;
    min-width: 120px;
  }
  
  .filter-group input[type="date"] {
    min-width: 130px;
  }
  
  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
   
  }

.btn-apply,
.btn-reset,
.btn-export {
  border: none;
  outline: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  background-color: #389af9;
  color: white;
}

.btn-apply:hover,
.btn-reset:hover,
.btn-export:hover {
  background-color: #5ebafc; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
  cursor: pointer;
}

  
  
  /* Summary Cards - Compact */
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 5px;
    padding: 0.5rem;
  }
  
  .card {
    background: var(--p-surface-card);
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }
  
  .card:hover {
    transform: translateY(-1px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .card-header h3 {
    margin: 0;
    font-size: 0.8rem;
    color: var(--p-text-color-secondary);
    font-weight: 500;
  }
  
  .card-header i {
    font-size: 1.2rem;
    color: var(--p-primary-color);
  }
  
  .card-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--p-primary-color);
    margin-bottom: 0.25rem;
  }
  
  .card-trend {
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
  
  .card-trend.positive {
    color: #10b981;
  }
  
  .card-trend.negative {
    color: #ef4444;
  }
  
  .card-percentage {
    font-size: 0.75rem;
    color: var(--p-text-color-secondary);
    font-family: sans-serif;
  }
  
  /* Charts Section - 3 Columns */
  .charts-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.3rem;
    border-radius: 5px;
  }

  
  .chart-card {
    background: var(--p-surface-card);
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-full-width {
    background: var(--p-surface-card);
    border: 1px solid var(--p-surface-border);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .chart-header h3 {
    margin: 0;
    color: var(--p-text-color);
    font-size: 0.95rem;
    font-weight: 600;
  }
  
  .chart-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .chart-controls select {
    padding: 0.2rem 0.4rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 4px;
    font-size: 0.75rem;
  }
  
  .chart-container {
    height: 250px; 
    min-height: 200px; 
    position: relative;
  }
  
  .chart-full-width .chart-container {
    height: auto;
    min-height: 200px;
  }
  
  .chart {
    width: 100% !important;
    height: 100% !important;
  }
  
  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--p-surface-border);
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: var(--p-text-color);
  }
  
  .legend-color {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  /* Statistics Grid - Compact */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    height: 100%;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid var(--p-surface-border);
    border-radius: 6px;
    text-align: center;
  }
  
  .stat-label {
    font-size: 0.7rem;
    color: var(--p-text-color-secondary);
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--p-primary-color);
  }

/* New styles for facet filtering */
.search-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--p-surface-border);
  border-radius: 4px;
  font-size: 0.85rem;
  min-width: 150px;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.active-filters-label {
  font-size: 0.8rem;
  color: var(--p-text-color-secondary);
  font-weight: 500;
}

.filter-tags {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: var(--p-primary-100);
  color: var(--p-primary-700);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  background-color: var(--p-primary-200);
  transform: translateY(-1px);
}

.filter-tag i {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 2px;
  border-radius: 50%;
}

.filter-tag i:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.3);
}

.filter-result-summary {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.5rem;
}

.result-count {
  font-size: 0.8rem;
  color: var(--p-text-color);
  font-weight: 500;
}

.no-results {
  font-size: 0.75rem;
  color: var(--p-red-500);
  font-style: italic;
}

.disabled-option {
  color: var(--p-text-color-secondary) !important;
  opacity: 0.6;
  font-style: italic;
}

/* Enhanced styles for cascading filters */
.filter-group select:disabled {
  background-color: var(--p-surface-100);
  color: var(--p-text-color-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Cascading filter animation */
.filter-group select {
  transition: all 0.3s ease;
}

.filter-group select:disabled {
  animation: fadeOut 0.3s ease;
}

.filter-group select:not(:disabled) {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0.6; }
}

@keyframes fadeIn {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

  .no-data,
  .filter-result-count{
    font-size: 0.8rem;
    color: var(--p-text-color-secondary);
    margin-top: 0.5rem;
  }
  
/* Responsive enhancements */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0.5rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .filter-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-group label {
    font-weight: 600;
  }
  
  .filter-group select,
  .filter-group input {
    width: 100%;
    min-width: unset;
  }

  .filter-buttons {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-tags {
    justify-content: flex-start;
  }
  
  .active-filters {
    margin-top: 0.75rem;
  }
  
  .search-input {
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
    gap: 0.25rem;
  }

  .filter-group input,
  .filter-group select {
    min-width: 100px;
  }
}

</style> 