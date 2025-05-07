<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin">
      <input placeholder="Username" />
      <input  type="password" placeholder="Password" />
      <button type="submit">Login</button>

      <div class="actions">
        <button type="button">Register</button>
        <a href="#" >Forgot Password?</a>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'vueSingin',
  data() {
    return {
      username: '',
      password: '',
    }
  },
}
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

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

input, button {
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
</style>
