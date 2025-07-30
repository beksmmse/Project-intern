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
            <select v-model="selectedGeometryType">
              <option value="">ทั้งหมด</option>
              <option value="Point">จุด</option>
              <option value="LineString">เส้น</option>
              <option value="Polygon">โพลีกอน</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>ชนิดของข้อมูล :</label>
            <select v-model="selectedFeatureType">
              <option value="">ทั้งหมด</option>
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
            <!-- <div v-if="filteredFeatures.length === 0" class="no-data">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>
            <div class="filter-result-count">
              แสดงผลลัพธ์ทั้งหมด {{ filteredFeatures.length }} รายการ
            </div> -->
          <div class="filter-buttons">
            <Button @click="applyFilters" severity="primary" size="small" class="btn-apply">
              <!-- <i class="pi pi-filter"></i>  --> ยืนยัน
            </Button>
            <Button @click="resetFilters" severity="secondary" size="small" class="btn-reset">
              <!-- <i class="pi pi-refresh"></i>  --> รีเช็ต
            </Button>
            <Button @click="exportData" severity="success" size="small" class="btn-export">
              <!-- <i class="pi pi-download"></i>  --> ดาวน์โหลด
            </Button>
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
            <h3>จุด</h3>
            <!-- <i class="pi pi-map-marker"></i> -->
          </div>
          <div class="card-value">{{ geometryStats.Point || 0 }}</div>
          <div class="card-percentage">{{ getPercentage('Point') }} %</div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>เส้น</h3>
            <!-- <i class="pi pi-minus"></i> -->
          </div>
          <div class="card-value">{{ geometryStats.LineString || 0 }}</div>
          <div class="card-percentage">{{ getPercentage('LineString') }} %</div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>โพลีกอน</h3>
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
            <Chart type="pie" :data="geometryChartData" :options="chartOptions" class="chart" />
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
            <Chart type="doughnut" :data="typeChartData" :options="chartOptions" class="chart" />
          </div>
          <div class="chart-legend">
            <!-- <div v-for="(value, key) in typeStats" :key="key" class="legend-item">
              <span class="legend-color" :style="{ backgroundColor: getTypeColor(key) }"></span>
              <span>{{ key }}: {{ value }}</span>
            </div> -->
          </div>
        </div>
        
        <!-- Quick Statistics -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>สรุปสถิติข้อมูลล่าสุด</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label"> จำนวนข้อมูลใหม่เฉลี่ยต่อเดือน</span>
              <span class="stat-value">{{ avgPerMonth }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">ประเภทข้อมูลที่พบบ่อยที่สุด</span>
              <span class="stat-value">{{ mostCommonType }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label"> ข้อมูลถูกสร้างล่าสุดเมื่อ</span>
              <span class="stat-value">{{ latestAddition }}</span>
            </div>
              <div class="stat-item">
                <span class="stat-label">แก้ไขล่าสุด</span>
                <span class="stat-value">{{ latestUpdate }}</span>
              </div>
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
  import { ref, onMounted, computed, watch } from "vue";
  import Chart from 'primevue/chart';
  import Button from 'primevue/button';
  import axios from 'axios';
  
  // Reactive data
  const allFeatures = ref([]);
  const geometryChartData = ref();
  const typeChartData = ref();
  const monthlyChartData = ref();
  const chartOptions = ref();
  const barChartOptions = ref();
  const isLoading = ref(false);
  
  // Filter states
  const dateFrom = ref('');
  const dateTo = ref('');
  const selectedGeometryType = ref('');
  const selectedFeatureType = ref('');
  
  // Chart controls
  const monthlyChartType = ref('bar');
  
  // Trend calculation
  const totalTrend = ref(0);
  
  // Computed properties
  const totalFeatures = computed(() => filteredFeatures.value.length);
  
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
    
    return filtered;
  });
  
  // Statistics
  const avgPerMonth = computed(() => {
    if (filteredFeatures.value.length === 0) return 0;
    const months = new Set();
    filteredFeatures.value.forEach(f => {
      const date = new Date(f.properties.created_at);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return Math.round(filteredFeatures.value.length / months.size);
  });
  
  const mostCommonType = computed(() => {
    const types = typeStats.value;
    const maxType = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b, '');
    return getTypeLabel(maxType);
  });
  
  const latestAddition = computed(() => {
    if (filteredFeatures.value.length === 0) return 'ไม่มีข้อมูล';
    const latest = filteredFeatures.value.reduce((a, b) => 
      new Date(a.properties.created_at) > new Date(b.properties.created_at) ? a : b
    );
    return formatTimeAgo(latest.properties.created_at);
  });
  
  const totalCoverage = computed(() => {
    return `${filteredFeatures.value.length * 1.2}km²`;
  });
  
  function getGeometryLabel(key) {
    const labelMap = {
      'Point': 'จุด',
      'LineString': 'เส้น',
      'Polygon': 'พื้นที่',
      'MultiPoint': 'หลายจุด',
      'MultiLineString': 'หลายเส้น',
      'MultiPolygon': 'หลายพื้นที่'
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
      'other': 'อื่นๆ'
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
      const response = await axios.get('http://localhost:3000/api/geometries');
      allFeatures.value = response.data.map(item => ({
        type: 'Feature',
        geometry: item.geometry,
        properties: {
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.properties_schema?.type || 'other',
          address: item.address,
          created_at: item.created_at
        }
      }));
      
      calculateTrend();
      updateCharts();
    } catch (error) {
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
  
  // Feature type distribution chart
  const setTypeChartData = () => {
    const stats = typeStats.value;
    
    return {
      labels: Object.keys(stats).map(key => getTypeLabel(key)),
      datasets: [
        {
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
  
  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'เพิ่งเพิ่ม';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
  }
  
  // Chart options
  const setChartOptions = () => {
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
  
  // Lifecycle
  onMounted(async () => {
    await loadData();
    chartOptions.value = setChartOptions();
    barChartOptions.value = setBarChartOptions();
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
    height: auto;
    min-height: 20px;
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

  .no-data,
  .filter-result-count{
    font-size: 0.8rem;
    color: var(--p-text-color-secondary);
    margin-top: 0.5rem;
  }
  
/* Responsive Desivgn */
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
    justify-content: space-between;
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