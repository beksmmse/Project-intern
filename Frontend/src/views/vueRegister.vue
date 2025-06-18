<template>
  <div class="register-page">
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="Username" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
      <button type="submit">Register</button>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

      <div class="actions">
        <button type="button" @click="goToLogin">Back to Login</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const router = useRouter()

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    alert('Registration successful!')
    router.push('/')
  } catch (err) {
    errorMessage.value = err.message
  }
}

const goToLogin = () => {
  router.push('/')
}
</script>

<style scoped>
.register-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

input {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
}

button {
  padding: 8px 16px;
  margin-right: 8px;
}

.actions {
  margin-top: 16px;
}

.error {
  color: red;
  margin: 10px 0;
  padding: 8px;
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  border-radius: 4px;
}
</style>