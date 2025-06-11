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



const routes = [

  { path: '/',
    name: 'Home',
    component: HomePage 
    },
  
  { path: '/login',
    name: 'Login',
    component: LoginPage 
    },

  { path: '/register',
    name: 'Register',
    component: RegisterPage 
    },

  { path: '/report',
    name: 'Report',
    component: ReportPage },

  { path: '/contact',
    name: 'Contact',
    component: ContactPage },

  { path: '/request',
    name: 'Request',
    component: RequestPage },

  { path: '/dashboard',
    name: 'dashboard',
    component: DashbordPage },
    
  // { path: '/adddata',
  //   name: 'add',
  //   component:  
  //   },

  { path: '/info',
    name: 'info',
    component: infoPage 
    },

  { path: '/type/point',
    name: 'TypePoint',
    component: TypePointPage },

  { path: '/type/line',
    name: 'TypeLine',
    component: TypeLinePage },

  { path: '/type/polygon',
    name: 'TypePolygon',
    component: TypePolygonPage }

  
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router





