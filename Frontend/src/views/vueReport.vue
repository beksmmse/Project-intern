<template>
  <div class="report-page">
    <form @submit.prevent="handleSubmit">
      <h2>รายงานปัญหา</h2>

      <div class="form-group">
        <label for="problemType">ประเภทปัญหา</label>
        <select id="problemType" v-model="form.problemType" required>
          <option value="">เลือกประเภทปัญหา</option>
          <option value="bug">ข้อผิดพลาด (Bug)</option>
          <option value="feature">ขอเพิ่มฟีเจอร์</option>
          <option value="performance">ปัญหาด้านประสิทธิภาพ</option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">รายละเอียด</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          required
          placeholder="อธิบายปัญหาโดยละเอียด">
        </textarea>
      </div>

      <div class="form-group">
        <label for="attachments">แนบไฟล์ (ถ้ามี)</label>
        <input type="file" id="attachments" multiple @change="onFiles" />
      </div>

      <div class="form-actions">
        <button type="submit" class="primary-btn" :disabled="submitting">
          {{ submitting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ReportPage',
  data() {
    return {
      form: {
        problemType: '',
        description: '',
        files: []
      },
      submitting: false
    }
  },
  methods: {
    onFiles(e) {
      this.form.files = Array.from(e.target.files || [])
    },
    async handleSubmit() {
      if (!this.form.problemType || !this.form.description) return
      this.submitting = true
      try {
        
        const filesMeta = (this.form.files || []).map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        }))
        const payload = {
          problem_type: this.form.problemType,
          description: this.form.description,
          files: filesMeta
        }
        const res = await fetch('http://localhost:3000/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (data.success) {
          alert('ส่งรายงานแล้ว!')
          this.resetForm()
        } else {
          alert('เกิดข้อผิดพลาด: ' + (data.message || 'ไม่สามารถส่งรายงานได้'))
        }
      } catch (e) {
        alert('เกิดข้อผิดพลาด: ' + e.message)
      } finally {
        this.submitting = false
      }
    },
    resetForm() {
      this.form.problemType = ''
      this.form.description = ''
      this.form.files = []
      const input = document.getElementById('attachments')
      if (input) input.value = ''
    }
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.report-page {
  font-family: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f4f7fa;
  height: 100vh;
  padding: 20px;
}

form {
  width: 100%;
  max-width: 700px;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 24px;
  font-size: 24px;
}

.form-group { margin-bottom: 20px; }

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 6px;
}

select,
textarea,
input[type="file"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color .3s;
  background: #fff;
}

select:focus,
textarea:focus,
input[type="file"]:focus {
  outline: none;
  border-color: #3498db;
}

textarea {
  resize: vertical;
  min-height: 110px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color .3s ease, transform .1s ease;
}

.primary-btn {
  background-color: #3498db;
  color: #fff;
}

.primary-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: scale(1.02);
}

.primary-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

</style>