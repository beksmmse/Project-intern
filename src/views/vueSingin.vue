<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>

      <!-- Google Login -->
      <!-- <GoogleLogin :callback="handleGoogleSuccess" class="google-login-button" /> -->

      <!-- Show Logout Button If Logged In -->
      <button
        v-if="isLoggedIn"
        type="button"
        class="logout-btn"
        @click="handleLogout"
      >
        Logout Google
      </button>

      <div class="actions">
        <button type="button">Register</button>
        <a href="#">Forgot Password?</a>
      </div>
    </form>
  </div>
</template>

<script>
// import { GoogleLogin } from 'vue3-google-login'
// import { jwtDecode } from 'jwt-decode'

export default {
  name: 'vueSingin',
  components: {
    // GoogleLogin,
  },
  data() {
    return {
      username: '',
      password: '',
      isLoggedIn: false,
    }
  },
  // mounted() {
    
  //   this.isLoggedIn = !!localStorage.getItem('google_token')
  // },
  // methods: {
  //   handleLogin() {
  //     console.log('Username:', this.username)
  //     console.log('Password:', this.password)
  //   },
  //   handleGoogleSuccess(response) {
  //     const token = response.credential
  //     const decoded = jwtDecode(token)

  //     console.log('Google User:', decoded)

  //     // เก็บลง localStorage
  //     localStorage.setItem('google_token', token)
  //     localStorage.setItem('google_user', JSON.stringify(decoded))
  //     this.isLoggedIn = true
  //   },
  //   handleLogout() {
  //     localStorage.removeItem('google_token')
  //     localStorage.removeItem('google_user')
  //     this.isLoggedIn = false

  //   }
  // }
}
</script>

<style scoped>

.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

form {
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 10px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

input,
button {
  padding: 10px;
  font-size: 16px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.actions button {
  background: none;
  border: none;
  color: #007BFF;
  cursor: pointer;
  font-size: 14px;
}

.actions a {
  color: #007BFF;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.google-login-button {
  width: 100%;
  margin-top: 10px;
}

.logout-btn {
  background: #ff4d4d;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
}
</style>
