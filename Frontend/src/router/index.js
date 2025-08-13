import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '../views/vueSingin.vue'
import RegisterPage from '../views/vueRegister.vue'
import ReportPage from '../views/vueReport.vue'
import HomePage from '../views/vueHome.vue'
import ContactPage from '../views/vueContact.vue'
import RequestPage from '../views/vueRequst.vue'
import DashbordPage from '../views/vueDashboard.vue' 
import TypePointPage from '../views/typePoint.vue'
import TypeLinePage from '../views/typeLine.vue'
import TypePolygonPage from '../views/typePolygon.vue'
import infoPage from '../views/vueinfoGeomerty.vue'
import Hybrid from '../views/HybridMap.vue'
import About from '../views/vueAbout.vue' 
import Help from '../views/Help.vue'


// Auth Guard Functions
function requireAuth(to, from, next) {
  const user = localStorage.getItem('user');
  if (!user) {
    next('/login');
  } else {
    next();
  }
}

function requireAdmin(to, from, next) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    next('/login');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
      next();
    } else {
      // Redirect to home with error message
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะแอดมิน)');
      next('/');
    }
  } catch (e) {
    next('/login');
  }
}

function guestOnly(to, from, next) {
  const user = localStorage.getItem('user');
  if (user) {
    next('/');
  } else {
    next();
  }
}  




const routes = [
  { 
    path: '/',
    name: 'Home',
    component: HomePage 
  },
  
  { 
    path: '/login',
    name: 'Login',
    component: LoginPage,
    beforeEnter: guestOnly
  },

  { 
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    beforeEnter: requireAdmin
  },

  { 
    path: '/report',
    name: 'Report',
    component: ReportPage
  },

  { 
    path: '/contact',
    name: 'Contact',
    component: ContactPage 
  },

  { 
    path: '/request',
    name: 'Request',
    component: RequestPage
  },

  { 
    path: '/dashboard',
    name: 'dashboard',
    component: DashbordPage
  },

  { 
    path: '/info',
    name: 'info',
    component: infoPage
  },

  { 
    path: '/type/point',
    name: 'TypePoint',
    component: TypePointPage
  },

  { 
    path: '/type/line',
    name: 'TypeLine',
    component: TypeLinePage
  },

  { 
    path: '/type/polygon',
    name: 'TypePolygon',
    component: TypePolygonPage
  },

  {
    path: '/hybrid',
    name: 'Hybrid',
    component: Hybrid
  },

  {
    path: '/about',
    name: 'About',
    component: About

  },

  { 
    path: '/help',
    name: 'Help',
    component: Help
  },

  // {
  //   path: '/cesium',
  //   name: 'Cesium',
  //   component: () => import('../components/CesiumViewer.vue') // Lazy load Cesium component
  // }




]






const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  // ตรวจสอบว่าผู้ใช้ยังล็อกอินอยู่หรือไม่
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  // หากมี token ให้ตรวจสอบว่าหมดอายุหรือไม่
  if (userStr && token) {
    try {
      const user = JSON.parse(userStr);
      
      // ตรวจสอบ token expiry (ถ้ามี)
      if (token && token !== 'undefined' && token.includes('.')) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (tokenData.exp && tokenData.exp < currentTime) {
            console.log('Token expired, logging out...');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // หากไม่ใช่หน้า login หรือ home ให้ redirect ไป login
            if (to.path !== '/login' && to.path !== '/') {
              alert('เซสชันหมดอายุ กรุณาล็อกอินใหม่');
              next('/login');
              return;
            }
          }
        } catch (tokenError) {
          console.warn('Invalid token format:', tokenError);
        }
      }
    } catch (e) {
      console.error('Invalid user data:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  
  next();
});

export default router





