<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit" class="login-btn">Login</button>
      <p v-if="errorMessage" style="color:red">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'vueSignin',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.errorMessage = 'กรุณากรอกยูสเซอร์เนมและรหัสผ่าน'
        return;
      }
      try {
        const res = await axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password,
        })
        if (res.data && res.data.success) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', this.username);
          this.errorMessage = '';
          this.$router.push('/dashboard').then(() => window.location.reload());
        } else {
          this.errorMessage = res.data.message || 'Login Failed';
        }
      } catch (err) {
        this.errorMessage = err.response?.data?.message || 'Server Error';
      }
    }
  }
}
</script>
<style scoped>


.login-page {
  font-family: sans-serif;
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

input,button {
  padding: 10px;
  font-size: 16px
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
  font-family: sans-serif;
  
}


</style>
