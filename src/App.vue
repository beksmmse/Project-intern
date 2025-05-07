<template>
  <div id="app">
    <header>
      <div class="container">
          <img src="@/assets/TDM_LOGO-01.jpg" alt="TDM Logo" class="logo" />
        <nav>
          <ul>
            <li><router-link to="/">Home</router-link></li>
              <li class="dropdown">
                <router-link to="" class="dropdown-toggle" @click.prevent>Type <i class="arrow-down"></i></router-link>
                <ul class="dropdown-menu">
                  <li><router-link to="/type/point">Point</router-link></li>
                  <li><router-link to="/type/line">Line</router-link></li>
                  <li><router-link to="/type/polygon">Polygon</router-link></li>
                </ul>
              </li>
            <li><router-link to="/dashboard">Dashboard</router-link></li>
            <li><router-link to="/request">Request</router-link></li>
            <li><router-link to="/report">Report</router-link></li>
            <li><router-link to="/contact">Contact</router-link></li>
          </ul>
        </nav>
        <div class="buttons">
          <router-link to="/login" class="auth-link">Login</router-link>
          <span class="separator">|</span>
          <router-link to="/register" class="auth-link">Register</router-link>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
body {
  font-family: sans-serif;
  height: 100vh;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  background-color: #f4f6f8;
  color: #333;
  height: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background-color: #fff;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  height: 70px;
  width: auto;
}


nav {
  flex-grow: 1;
  display: flex;
  justify-content: row; 
}


nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

nav ul li {
  margin-left: 20px;
  pad: 0px;
}

nav ul li a {
  text-decoration: none;
  color: #555;
  transition: color 0.3s ease;
}

nav ul li a:hover {
  color: #3498db;
}

.dropdown {
  position: relative;
  z-index: 1;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  background-color: white;
  padding: 10px 0;
  margin: 0;
  list-style: none;
  border: 1px solid #ccc;
  display: none;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 150px;
}

.dropdown-menu li {
  padding: 5px 15px;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu li:hover {
  background-color: #f2f2f2;
}


.arrow-down {
  display: inline-block;
  margin-left: 5px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #555;
  vertical-align: middle;
}

.buttons a {
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
  margin-left: 10px;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-link {
  text-decoration: none;
  color: #3498db;
  font-weight: bold;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: #2980b9;
}

.separator {
  color: #999;
  font-weight: normal;
}

.register:hover {
  background-color: #2980b9;
}

.hero {
  padding: 80px 0;
  background-color: #fff;
}

.hero .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-left {
  flex: 1;
  padding-right: 40px;
}

.hero-left h1 {
  font-size: 48px;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #2c3e50; /* สีเทาเข้ม */
}

.hero-left p {
  font-size: 16px;
  color: #777;
  margin-bottom: 30px;
}

.hero-left a {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.hero-left a:hover {
  text-decoration: underline;
}

.hero-right {
  flex: 1;
  text-align: center;
}

.hero-right img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  header .container {
    flex-direction: column;
    align-items: flex-start;
  }

  .logo {
    margin-bottom: 15px;
  }

  nav ul {
    flex-direction: row;
    padding: 5px;
  }

  nav ul li {
    margin-left: 0;
    margin-bottom: 10px;
  }

  .buttons {
    margin-top: 15px;
  }

  .hero .container {
    flex-direction: column;
    text-align: center;
  }

  .hero-left {
    padding-right: 0;
    margin-bottom: 30px;
  }

  .hero-left h1 {
    font-size: 36px;
  }
}
</style>

<script>
export default {
  name: 'vueHome'
}
</script>
