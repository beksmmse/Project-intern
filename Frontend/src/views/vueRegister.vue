<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h2>สร้างบัญชีผู้ใช้ใหม่</h2>
        <p class="subtitle">เฉพาะสำหรับผู้ดูแลระบบ</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">ชื่อผู้ใช้ <span class="required">*</span></label>
          <input 
            id="username"
            v-model="username" 
            type="text"
            placeholder="กรอกชื่อผู้ใช้" 
            required 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">อีเมล <span class="required">*</span></label>
          <input 
            id="email"
            type="email" 
            v-model="email" 
            placeholder="กรอกอีเมล" 
            required 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="role">บทบาท <span class="required">*</span></label>
          <select 
            id="role"
            v-model="role" 
            required 
            class="form-select"
          >
            <option value="" disabled>เลือกบทบาท</option>
            <option value="admin"> admin </option>
            <option value="editor"> edit </option>
          </select>
        </div>

        <div class="form-group">
          <label for="password">รหัสผ่าน <span class="required">*</span></label>
          <input 
            id="password"
            type="password" 
            v-model="password" 
            placeholder="กรอกรหัสผ่าน" 
            required 
            class="form-input"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">ยืนยันรหัสผ่าน <span class="required">*</span></label>
          <input 
            id="confirmPassword"
            type="password" 
            v-model="confirmPassword" 
            placeholder="กรอกรหัสผ่านอีกครั้ง" 
            required 
            class="form-input"
            minlength="6"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          <i class="error-icon"></i>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          <i class="success-icon"></i>
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'กำลังสร้าง' : 'สร้างบัญชี' }}
          </button>
          
          <button type="button" @click="goToHome" class="btn btn-secondary">
            <i class="btn-icon"></i>
            กลับหน้าแรก
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const router = useRouter()

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true
  
  // Validation
  // Username: 10-20 ตัวอักษร
  if (username.value.length < 10 || username.value.length > 20) {
    errorMessage.value = 'ชื่อผู้ใช้ต้องมีความยาว 10-20 ตัวอักษร'
    isLoading.value = false
    return
  }

  // Password ต้องมีอักขระพิเศษ  ตัวพิมพ์ใหญ่/เล็ก 
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,20}$/;
  if (!passwordRegex.test(password.value)) {
    errorMessage.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 10 แต่ไม่เกิน 20 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ'
    isLoading.value = false
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง'
    isLoading.value = false
    return
  }

  if (!role.value) {
    errorMessage.value = 'กรุณาเลือกบทบาทผู้ใช้'
    isLoading.value = false
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
        role: role.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'การลงทะเบียนล้มเหลว')
    }

    successMessage.value = 'สร้างบัญชีผู้ใช้สำเร็จ!'
    
    // Clear form
    username.value = ''
    email.value = ''
    role.value = ''
    password.value = ''
    confirmPassword.value = ''
    
    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.register-container {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  border: 2px solid #f1f3f4;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.register-header {
  text-align: center;
  margin-bottom: 1.2rem;
}

.register-header h2 {
  color: #5997d5;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin: 0;
  font-style: italic;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.required {
  color: #e74c3c;
  margin-left: 2px;
}

.form-input,
.form-select {
  padding: 0.6rem 0.8rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background-color: #fafbfc;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select {
  cursor: pointer;
}

.form-select option {
  padding: 0.5rem;
}

.error-message,
.success-message {
  padding: 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.error-message {
  background-color: #ffeaea;
  color: #c0392b;
  border: 1px solid #f1c0c0;
}

.success-message {
  background-color: #eafaf1;
  color: #27ae60;
  border: 1px solid #a8e6a3;
}

.error-icon,
.success-icon {
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.5rem;
  flex-direction: column;
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: #389af9;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #ecf0f1;
  color: #7f8c8d;
  border: 1px solid #bdc3c7;
}

.btn-secondary:hover {
  background: #d5dbdb;
  color: #2c3e50;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.1rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 576px) {
  .register-page {
    padding: 0.5rem;
    min-height: 100vh;
  }

  .register-container {
    padding: 1rem;
    max-height: 90vh;
    max-width: 100%;
  }

  .register-header {
    margin-bottom: 1rem;
  }

  .register-header h2 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .register-form {
    gap: 0.8rem;
  }

  .form-group {
    gap: 0.2rem;
  }

  .form-input,
  .form-select {
    padding: 0.5rem 0.7rem;
    font-size: 0.85rem;
  }

  .btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0.8rem;
    max-height: 88vh;
  }
  
  .register-header h2 {
    font-size: 1.2rem;
  }
}

/* Hover effects for inputs */
.form-input:hover,
.form-select:hover {
  border-color: #94a3b8;
}

/* Focus states for better accessibility */
.form-input:focus,
.form-select:focus,
.btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>