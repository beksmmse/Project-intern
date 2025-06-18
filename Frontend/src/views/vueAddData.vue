<template>
  <div class="add-location-form">
    <div class="card">
      <div class="card-header">
        <h3>เพิ่มข้อมูลตำแหน่งใหม่</h3>
      </div>
      
      <div class="card-body">
        <form @submit.prevent="submitForm">
          <!-- Organization ID -->
          <div class="form-group">
            <label for="organization_id">องค์กร <span class="required">*</span></label>
            <select 
              id="organization_id"
              v-model="form.organization_id"
              class="form-control"
              required
            >
              <option value="">เลือกองค์กร</option>
              <option 
                v-for="org in organizations" 
                :key="org.id" 
                :value="org.id"
              >
                {{ org.name }}
              </option>
            </select>
          </div>

          <!-- Name -->
          <div class="form-group">
            <label for="name">ชื่อ <span class="required">*</span></label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-control"
              placeholder="กรอกชื่อ"
              required
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description">คำอธิบาย</label>
            <textarea
              id="description"
              v-model="form.description"
              class="form-control"
              rows="3"
              placeholder="กรอกคำอธิบาย"
            ></textarea>
          </div>

          <!-- Geometry Type -->
          <div class="form-group">
            <label for="geometry_type">ประเภทเรขาคณิต <span class="required">*</span></label>
            <select 
              id="geometry_type"
              v-model="form.geometry_type"
              class="form-control"
              required
            >
              <option value="">เลือกประเภท</option>
              <option value="Point">จุด (Point)</option>
              <option value="LineString">เส้น (LineString)</option>
              <option value="Polygon">พื้นที่ (Polygon)</option>
              <option value="MultiPoint">หลายจุด (MultiPoint)</option>
              <option value="MultiLineString">หลายเส้น (MultiLineString)</option>
              <option value="MultiPolygon">หลายพื้นที่ (MultiPolygon)</option>
            </select>
          </div>

          <!-- SRID -->
          <div class="form-group">
            <label for="srid">SRID</label>
            <input
              id="srid"
              v-model.number="form.srid"
              type="number"
              class="form-control"
              placeholder="4326"
            />
          </div>

          <!-- Properties Schema -->
          <div class="form-group">
            <label for="properties_schema">Schema Properties (JSON)</label>
            <textarea
              id="properties_schema"
              v-model="propertiesSchemaText"
              class="form-control"
              rows="4"
              placeholder='{"property1": "value1", "property2": "value2"}'
            ></textarea>
            <small class="form-text text-muted">
              กรอกในรูปแบบ JSON หรือเว้นว่างไว้
            </small>
          </div>

          <!-- Address -->
          <div class="form-group">
            <label for="address">ที่อยู่</label>
            <textarea
              id="address"
              v-model="form.address"
              class="form-control"
              rows="2"
              placeholder="กรอกที่อยู่"
            ></textarea>
          </div>

          <!-- Geometry Coordinates -->
          <div class="form-group">
            <label>พิกัดตำแหน่ง</label>
            <div class="row">
              <div class="col-md-6">
                <label for="longitude">ลองจิจูด (Longitude)</label>
                <input
                  id="longitude"
                  v-model.number="coordinates.longitude"
                  type="number"
                  step="any"
                  class="form-control"
                  placeholder="100.5018"
                />
              </div>
              <div class="col-md-6">
                <label for="latitude">ละติจูด (Latitude)</label>
                <input
                  id="latitude"
                  v-model.number="coordinates.latitude"
                  type="number"
                  step="any"
                  class="form-control"
                  placeholder="13.7563"
                />
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">กำลังบันทึก...</span>
              <span v-else>บันทึกข้อมูล</span>
            </button>
            <button 
              type="button" 
              class="btn btn-secondary ml-2"
              @click="resetForm"
            >
              ล้างข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddLocationForm',
  data() {
    return {
      isSubmitting: false,
      organizations: [], // จะต้องโหลดจาก API หรือใส่ข้อมูลตัวอย่าง
      form: {
        organization_id: '',
        name: '',
        description: '',
        geometry_type: '',
        srid: 4326,
        address: '',
        created_by_user_id: 1 // ตั้งค่าเริ่มต้น หรือจะดึงจาก localStorage
      },
      coordinates: {
        longitude: null,
        latitude: null
      },
      propertiesSchemaText: ''
    }
  },
  computed: {
    propertiesSchema() {
      if (!this.propertiesSchemaText.trim()) {
        return null;
      }
      try {
        return JSON.parse(this.propertiesSchemaText);
      } catch (error) {
        return null;
      }
    }
  },
  mounted() {
    this.loadOrganizations();
    this.setCurrentUser();
  },
  methods: {
    async loadOrganizations() {
      try {
        // ตัวอย่างข้อมูลองค์กร - คุณสามารถแทนที่ด้วย API call จริง
        this.organizations = [
          { id: 1, name: 'องค์กรที่ 1' },
          { id: 2, name: 'องค์กรที่ 2' },
          { id: 3, name: 'องค์กรที่ 3' }
        ];
        
        // หรือเรียก API จริง (uncomment บรรทัดด้านล่างเมื่อพร้อม)
        // const response = await fetch('/api/organizations');
        // const data = await response.json();
        // this.organizations = data;
        
      } catch (error) {
        console.error('Error loading organizations:', error);
        this.showError('ไม่สามารถโหลดรายการองค์กรได้');
      }
    },
    
    setCurrentUser() {
      try {
        // ตัวอย่างการดึง user ID จาก localStorage
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (userId) {
          this.form.created_by_user_id = parseInt(userId);
        } else {
          // ตั้งค่าเริ่มต้น
          this.form.created_by_user_id = 1;
        }
        
        // หรือดึงจาก Vuex store (ถ้ามี)
        // if (this.$store && this.$store.state.user) {
        //   this.form.created_by_user_id = this.$store.state.user.id;
        // }
        
      } catch (error) {
        console.error('Error setting current user:', error);
        this.form.created_by_user_id = 1; // fallback value
      }
    },
    
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        const payload = {
          ...this.form,
          properties_schema: this.propertiesSchema,
          geometry: this.createGeometry()
        };
        
        console.log('Payload to submit:', payload);
        
        // ตัวอย่างการส่งข้อมูล - แทนที่ด้วย API call จริง
        // const response = await fetch('/api/locations', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(payload)
        // });
        // const result = await response.json();
        
        // จำลองการส่งข้อมูลสำเร็จ
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
        this.resetForm();
        
        // Emit event ไปยัง parent component
        this.$emit('location-added', payload);
        
      } catch (error) {
        console.error('Error saving location:', error);
        this.showError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    validateForm() {
      // Validate required fields
      if (!this.form.organization_id) {
        this.showError('กรุณาเลือกองค์กร');
        return false;
      }
      
      if (!this.form.name.trim()) {
        this.showError('กรุณากรอกชื่อ');
        return false;
      }
      
      if (!this.form.geometry_type) {
        this.showError('กรุณาเลือกประเภทเรขาคณิต');
        return false;
      }
      
      // Validate JSON schema if provided
      if (this.propertiesSchemaText.trim() && !this.propertiesSchema) {
        this.showError('รูปแบบ JSON ของ Properties Schema ไม่ถูกต้อง');
        return false;
      }
      
      return true;
    },
    
    createGeometry() {
      // สร้าง geometry object ตามประเภทที่เลือก
      if (this.coordinates.longitude && this.coordinates.latitude) {
        if (this.form.geometry_type === 'Point') {
          return {
            type: 'Point',
            coordinates: [this.coordinates.longitude, this.coordinates.latitude]
          };
        }
        // สามารถเพิ่ม logic สำหรับ geometry type อื่นๆ ได้
      }
      return null;
    },
    
    resetForm() {
      const currentUserId = this.form.created_by_user_id;
      this.form = {
        organization_id: '',
        name: '',
        description: '',
        geometry_type: '',
        srid: 4326,
        address: '',
        created_by_user_id: currentUserId
      };
      this.coordinates = {
        longitude: null,
        latitude: null
      };
      this.propertiesSchemaText = '';
    },
    
    // Helper methods สำหรับแสดง message
    showSuccess(message) {
      // ใช้ alert ชั่วคราว - คุณสามารถแทนที่ด้วย toast library
      alert(message);
      console.log('Success:', message);
    },
    
    showError(message) {
      // ใช้ alert ชั่วคราว - คุณสามารถแทนที่ด้วย toast library  
      alert(message);
      console.error('Error:', message);
    }
  }
}
</script>


<style scoped>
.add-location-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background: white;
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
  border-radius: 8px 8px 0 0;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.card-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,.25);
}

.required {
  color: #dc3545;
}

.form-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.ml-2 {
  margin-left: 10px;
}

.row {
  display: flex;
  margin: 0 -15px;
}

.col-md-6 {
  flex: 0 0 50%;
  padding: 0 15px;
}

.form-text {
  font-size: 12px;
  margin-top: 5px;
}

.text-muted {
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .add-location-form {
    padding: 10px;
  }
  
  .row {
    flex-direction: column;
  }
  
  .col-md-6 {
    flex: 1;
    margin-bottom: 15px;
    padding: 0;
  }
  
  .card-body {
    padding: 15px;
  }
}

/* สำหรับแก้ปัญหาในหน้าจอสูง */
html, body {
  height: auto;
  min-height: 100%;
}

/* แก้ไข scrollbar ให้สวยงาม */
.add-location-form::-webkit-scrollbar {
  width: 8px;
}

.add-location-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.add-location-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.add-location-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>