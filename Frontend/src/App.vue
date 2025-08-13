<template>
  <div id="app">
    <header>
      <div class="container">
        <img src="@/assets/TDM-LOGO-03.png" alt="TDM Logo" class="logo" />
        <nav>
          <ul>
            <li><router-link to="/" ><i class="fa-solid fa-house"></i> หน้าหลัก</router-link></li>
            <li><router-link to="/dashboard"><i class="fa-solid fa-chart-simple"></i> แดชบอร์ด</router-link></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" @click.prevent>
                <i class="fa-solid fa-map"></i>
                {{ currentType }}
                <i class="arrow-down"></i>
              </a> 
              <ul class="dropdown-menu">
                <li><router-link to="/type/point" @click="setType('ตำแหน่ง')">ตำแหน่ง</router-link></li>
                <li><router-link to="/type/line" @click="setType('เส้นทาง')">เส้นทาง</router-link></li>
                <li><router-link to="/type/polygon" @click="setType('ขอบเขต')">ขอบเขต</router-link></li>
              </ul>
            </li>
            <!-- <li><router-link to="/request">Request</router-link></li> -->
            <li><router-link to="/report"><i class="fa-solid fa-flag"></i> รายงาน</router-link></li>
            <li><router-link to="/contact"><i class="fa-solid fa-address-book"></i> ติดต่อ</router-link></li>
            <li><router-link to="/help"><i class="fa-solid fa-circle-question"></i> คู่มือ</router-link></li>
            <!-- <li><router-link to="/about">Test</router-link></li>   -->
            <li v-if="userRole === 'admin'"><router-link to="/register"><i class="fa-solid fa-user-gear"></i> สร้างบัญชีผู้ใช้</router-link></li>
          </ul>
        </nav>
        <div class="buttons">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="auth-link">เข้าสู่ระบบ</router-link>
          </template>
          <template v-else>
            <div class="user-section">
              <div class="user-info">
                <span class="username">{{ username }}</span>
                <span class="user-role" :class="userRole.toLowerCase()">{{ userRole }}</span>
              </div>
              <button @click="logout" class="logout-btn"> ออกจากระบบ</button>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'vueHome',
  data() {
    return {
      currentType: 'โครงสร้างพื้นฐาน',
    };
  },
  computed: {
    isLoggedIn() {
      return localStorage.getItem('user') !== null;
    },
    username() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).username : '';
    },
    userRole() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).role : '';
    }
  },
  methods: {
    logout() {
      // ล้างข้อมูล user และ token
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Reset currentType
      this.currentType = 'Type';
      
      // Redirect to login
      this.$router.push('/login');
      
      // Reload เพื่อให้แน่ใจว่า state ถูกรีเซ็ต
      window.location.reload();
    },
    setType(type) {
      this.currentType = type;
    },
    
    // เพิ่มฟังก์ชันตรวจสอบสิทธิ์
    checkAdminAccess() {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      
      try {
        const user = JSON.parse(userStr);
        return user.role === 'admin';
      } catch (e) {
        return false;
      }
    }
  }
}
</script>

<style scoped>
html, #app {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

body {
  font-family: 'Sarabun', sans-serif;
  height: 100vh;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  color: #000000;
  position: fixed;
}

.container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

header {
  background-color: #237dee;
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
  background-color: transparent;
  display: block;
  margin-left: 20px;   
  padding: 4px;        
  box-sizing: border-box;
}

nav {
  display: flex;
  font-family: "Tahoma", "Segoe UI", Verdana, "Helvetica Neue", Arial, sans-serif;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

nav ul li {
  margin-left: 20px;
}

nav ul li a {
  text-decoration: none;
  color: #ffffff;
  transition: color 0.3s ease;
}

nav ul li a:hover {
  color: #273fa6;
}

.dropdown {
  position: relative;
  z-index: 1;
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
  color:#273fa6;
}

.dropdown-menu li {
  padding: 5px 15px;
  color: #389af9;
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
  border-top: 5px solid #ffffff;
  vertical-align: middle;
}

.dropdown-menu li a {
  color: #389af9 !important; 
  font-weight: 500;
}

.dropdown-menu li a:hover {
  color: #90cdff!important; 
  background-color: #e8f5e9;   
}



.buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  padding-right: 20px;
}

.auth-link, .logout-btn {
  text-decoration: none;
  color: #389af9;
  font-weight: bold;
  background: #ffffff;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 10px 20px;
  border-radius: 5px;
}

.auth-link:hover, .logout-btn:hover {
  color: #2980b9;
  background: #f2f2f2;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info{
  color: #ffffff;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.user-role {
  font-size: 0.8em;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: normal;
}

/* .user-role.admin {
  background-color: #ff4757;
  color: white;
}

.user-role.editor {
  background-color: #ffa502;
  color: white;
}

.user-role.viewer {
  background-color: #3742fa;
  color: white;
}

.user-role.guest {
  background-color: #747d8c;
  color: white;
} */

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
    flex-direction: column;
    padding: 5px;
  }

  nav ul li {
    margin-left: 0;
    margin-bottom: 10px;
  }

  .buttons {
    margin-top: 15px;
    padding-right: 15px;
  }
}


</style>
