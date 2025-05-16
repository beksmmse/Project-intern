import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import GoogleLoginPlugin from 'vue3-google-login';
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@geoman-io/leaflet-geoman-free'; 
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'; 




const app = createApp(App)

// app.use(GoogleLoginPlugin, {
//     clientId: '679581127782-bbus0vs640a3a6t3c405kqqmoq43gg9j.apps.googleusercontent.com',
//   });

app.use(router)

app.mount('#app')
