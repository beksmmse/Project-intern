<template>
  <div class="register-page">
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="Username" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
      <button type="submit">Register</button>

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

const router = useRouter()

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value  //  plain password  backend hash
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    alert('Registration successful!')
    router.push('/')
  } catch (err) {
    alert(err.message)
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
</style>